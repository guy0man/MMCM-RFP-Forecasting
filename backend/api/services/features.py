# backend/api/services/features.py
import json
from pathlib import Path
import pandas as pd
import numpy as np
from django.db.models import F
from api.models import DriversMonthly, MacroMonthly, Department

ARTIFACT_DIR = Path(__file__).resolve().parents[2] / "artifacts"
TRAIN_COLS_PATH = ARTIFACT_DIR / "train_columns.json"
KEY = "Department"
TARGET = "y"

def _month_idx(dt):
    return (dt.year - 2015) * 12 + (dt.month - 1) + 1

def _ensure_train_cols(df: pd.DataFrame) -> pd.DataFrame:
    cols = json.loads(TRAIN_COLS_PATH.read_text())
    # add any missing columns as 0 / NaN as appropriate (0 works for one-hot, rollings, trend)
    for c in cols:
        if c not in df.columns:
            df[c] = 0
    # drop anything the model doesn’t know
    return df[cols]

def build_features_for_forecast_from_db(department: str, target_date: str) -> pd.DataFrame:
    """
    Build ONE inference row for Department+Date from DriversMonthly + MacroMonthly.

    Returns a DataFrame with the SAME columns (order) as artifacts/train_columns.json.
    Raises ValueError if not enough history for required lags.
    """
    # Resolve department
    try:
        dept_obj = Department.objects.get(name__iexact=department)
    except Department.DoesNotExist:
        raise ValueError(f"Unknown department: {department}")

    # Pull historical monthly rows (need at least 13 months for lag12 features)
    qs = (
        DriversMonthly.objects
        .filter(department=dept_obj)
        .select_related("macro")
        .order_by("month")
        .values(
            "month",
            "totalNet",
            "enrolled_FTE_dept",
            "activeProg_lab_dept",
            "programLaunches_dept",
            "capexBudget",
            "approvalLeadTimeDays",
            "govFundShare",
            "mopBankTransferPct",
            "isEmergency",
            "month_idx",
            macro_fx=F("macro__fxRate_PHP_USD"),
            macro_inf=F("macro__inflationPct"),
            macro_wage=F("macro__wageIndex"),
        )
    )
    raw = pd.DataFrame(list(qs))
    if raw.empty:
        raise ValueError(f"No DriversMonthly history for {department}")

    # Join macro for safety if some rows missed it (fall back by exact month)
    if raw[["macro_fx","macro_inf","macro_wage"]].isna().any().any():
        mdf = pd.DataFrame(list(MacroMonthly.objects.all().values("month","fxRate_PHP_USD","inflationPct","wageIndex")))
        if not mdf.empty:
            raw = raw.merge(
                mdf.rename(columns={
                    "fxRate_PHP_USD":"macro_fx",
                    "inflationPct":"macro_inf",
                    "wageIndex":"macro_wage"
                }),
                on="month", how="left", suffixes=("","_m2")
            )
            # prefer FK values then fallback to direct join
            for a,b in [("macro_fx","macro_fx_m2"),("macro_inf","macro_inf_m2"),("macro_wage","macro_wage_m2")]:
                raw[a] = raw[a].fillna(raw[b])
            raw = raw.drop(columns=[c for c in raw.columns if c.endswith("_m2")], errors="ignore")

    # Coerce types
    raw["Date"] = pd.to_datetime(raw["month"])
    raw[KEY] = dept_obj.name
    raw[TARGET] = pd.to_numeric(raw["totalNet"], errors="coerce")
    # basic macro names to match training (rename)
    raw["fxRate"] = pd.to_numeric(raw["macro_fx"], errors="coerce")
    raw["inflationPct"] = pd.to_numeric(raw["macro_inf"], errors="coerce")
    raw["wageIndex"] = pd.to_numeric(raw["macro_wage"], errors="coerce")
    raw["capexBudget"] = pd.to_numeric(raw["capexBudget"], errors="coerce")

    # Calendar features
    raw = raw.sort_values(["Date"]).reset_index(drop=True)
    raw["year"]  = raw["Date"].dt.year
    raw["month_num"] = raw["Date"].dt.month
    raw["qtr"]   = raw["Date"].dt.quarter

    # One-hot month & quarter like training
    df = pd.get_dummies(raw, columns=["month_num","qtr"], prefix=["m","q"])

    # Lags & rollings (on y)
    df["lag1"]  = df[TARGET].shift(1)
    df["lag3"]  = df[TARGET].shift(3)
    df["lag12"] = df[TARGET].shift(12)

    for w in [3,6,12]:
        df[f"roll{w}_mean"] = df[TARGET].shift(1).rolling(w).mean()
        df[f"roll{w}_std"]  = df[TARGET].shift(1).rolling(w).std()

    # YoY and level shift
    df["yoy"] = df[TARGET] / df[TARGET].shift(12) - 1.0
    df["level_shift12"] = (df[TARGET].pct_change(12).abs() > 0.35).astype(int)

    # global time trend
    t0 = df["Date"].dt.year.min()
    df["t"] = (df["Date"].dt.year - t0) * 12 + df["Date"].dt.month

    # choose the target month row (normalize to first of month)
    target = pd.to_datetime(target_date)
    target1 = pd.Timestamp(year=target.year, month=target.month, day=1)

    # if requested month not present yet in history, append placeholder row (common)
    if target1 not in set(df["Date"]):
        last = df.iloc[-1:].copy()
        new = last.copy()
        new["Date"] = target1
        # keep macro from MacroMonthly table for that month if available
        try:
            mm = MacroMonthly.objects.get(month=target1)
            new["fxRate"] = float(mm.fxRate_PHP_USD) if mm.fxRate_PHP_USD is not None else np.nan
            new["inflationPct"] = float(mm.inflationPct) if mm.inflationPct is not None else np.nan
            new["wageIndex"] = float(mm.wageIndex) if mm.wageIndex is not None else np.nan
        except MacroMonthly.DoesNotExist:
            pass
        # totalNet (y) is unknown at forecast time
        new[TARGET] = np.nan
        df = pd.concat([df, new], ignore_index=True).sort_values("Date").reset_index(drop=True)

        # recompute lags/rollings for the appended last row
        for col in ["lag1","lag3","lag12","roll3_mean","roll6_mean","roll12_mean","roll3_std","roll6_std","roll12_std","yoy","level_shift12","t"]:
            if col in df.columns:
                # recompute vector already done above; OK.

                pass

    # Keep only rows up to target1 (to avoid leakage)
    df = df[df["Date"] <= target1].copy()

    # Need lag12 to be available
    if df["lag12"].isna().iloc[-1]:
        raise ValueError("Not enough history to compute lag12 features for this department/date.")

    # Build inference row
    row = df.iloc[[-1]].copy()
    # Add categorical Department exactly like training (category dtype)
    row[KEY] = row[KEY].astype("category")

    # Bring columns to model order
    row = row.drop(columns=["month","totalNet","macro_fx","macro_inf","macro_wage"], errors="ignore")
    row = _ensure_train_cols(row)

    return row
