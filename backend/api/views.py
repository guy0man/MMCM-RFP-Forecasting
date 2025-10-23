#views.py
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status, permissions
from .serializers import UserSerializer, NoteSerializer, RequestForPaymentSerializer, RequestForPaymentsSerializer, DepartmentSerializer, SourceOfFundSerializer, TransactionTypeSerializer, TypeOfBusinessSerializer, ModeOfPaymentSerializer, TaxRegistrationSerializer, DriversMonthlySerializer, MacroMonthlySerializer, ScenarioSerializer, ScenarioDeptFactorSerializer, ScenarioTxnFactorSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Note, RequestForPayment, Department, SourceOfFund, TransactionType, TypeOfBusiness, ModeOfPayment, TaxRegistration, DriversMonthly, MacroMonthly, Scenario, ScenarioDeptFactor, ScenarioTxnFactor
from .services.forecasting_service import load_models
from .services.features import build_features_for_forecast_from_db
from dateutil.relativedelta import relativedelta
import pandas as pd
import numpy as np
from pathlib import Path
import logging
import json
from datetime import date
import lightgbm as lgb

logger = logging.getLogger(__name__)

ARTIFACT_DIR   = Path(__file__).resolve().parents[1] / "artifacts"
TRAIN_COLS_PATH = ARTIFACT_DIR / "train_columns.json"       # written by model_training.py
EXOG_ELAS_PATH  = ARTIFACT_DIR / "exog_elasticities.json"   # optional (for instant UI overlay)

try:
    _EXOG_ELAS = json.loads(EXOG_ELAS_PATH.read_text())
except Exception:
    _EXOG_ELAS = None

KEY    = "Department"
TARGET = "y"
ALPHAS = [0.10, 0.50, 0.90]

# --------------------------
# Model cache & loader
# --------------------------
_LGB_MODELS = None

def load_models():
    """Load and cache LightGBM quantile models."""
    global _LGB_MODELS
    if _LGB_MODELS is not None:
        return _LGB_MODELS

    models = {}
    try:
        for a in ALPHAS:
            path = ARTIFACT_DIR / f"lgb_quantile_{a}.txt"
            booster = lgb.Booster(model_file=str(path))
            models[a] = booster
    except Exception as e:
        logger.exception("Failed loading LightGBM models")
        raise RuntimeError(f"LightGBM artifact missing or unreadable: {e}")

    _LGB_MODELS = models
    return _LGB_MODELS

# --------------------------
# Helpers
# --------------------------
def _ensure_train_cols(df_feat: pd.DataFrame, train_cols: list[str]) -> pd.DataFrame:
    """Align features to training schema; create missing as 0; drop extras; cast categoricals."""
    X = df_feat.drop(columns=[TARGET, "Date"], errors="ignore").copy()

    # Ensure categorical key is category
    if KEY in X.columns:
        X[KEY] = X[KEY].astype("category")

    # Add any missing columns
    missing = [c for c in train_cols if c not in X.columns]
    for c in missing:
        X[c] = 0

    # Warn & drop extras
    extras = [c for c in X.columns if c not in train_cols]
    if extras:
        logger.warning("Dropping %d extra feature(s) at inference: %s", len(extras), extras[:15])
        X = X.drop(columns=extras, errors="ignore")

    # Reorder
    X = X[train_cols]

    # Safety: ensure column count matches
    if X.shape[1] != len(train_cols):
        raise ValueError("Alignment failure: columns still mismatched after alignment")

    # LightGBM will accept numeric + categorical dtype('category')
    return X

EXOG_KEYS = ["fxRate", "inflationPct", "wageIndex", "enrolled_FTE_dept", "programLaunches_dept"]

def _predict_quantile_linear(exog_vec: dict, q: float) -> float:
    if not _EXOG_ELAS:
        return np.nan
    try:
        # keys are strings like "0.1"
        key = None
        for k in _EXOG_ELAS.keys():
            if abs(float(k) - float(q)) < 1e-12:
                key = k; break
        if key is None:
            return np.nan
        model = _EXOG_ELAS[key]
        beta0 = float(model.get("intercept", 0.0))
        coefs = model.get("coef", {}) or {}
        yhat = beta0
        for name in EXOG_KEYS:
            v = exog_vec.get(name, 0.0)
            v = 0.0 if (v is None or (isinstance(v, float) and not np.isfinite(v))) else float(v)
            yhat += float(coefs.get(name, 0.0)) * v
        return float(yhat)
    except Exception:
        return np.nan

def _overlay_ratio(base_exog: dict, scen_exog: dict, q: float) -> float:
    """Return y1/y0 ratio from quantile linear overlay, clipped to sane range."""
    try:
        y0 = _predict_quantile_linear(base_exog, q)
        y1 = _predict_quantile_linear(scen_exog, q)
        if not np.isfinite(y0) or y0 == 0:
            return 1.0
        return float(np.clip(y1 / y0, 0.5, 1.5))
    except Exception:
        return 1.0

def _last_non_nan_col(df: pd.DataFrame, col: str) -> float:
    if col not in df.columns:
        return np.nan
    s = pd.to_numeric(df[col], errors="coerce").dropna()
    return float(s.iloc[-1]) if len(s) else np.nan

# ==========================
# Forecasting endpoint
# ==========================
class ForecastNextYear(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        # --------- Input parsing ---------
        dept = request.data.get("Department") or request.data.get("department")
        if not dept:
            return Response({"detail": "Missing Department"}, status=400)

        # validate department
        try:
            Department.objects.get(name__iexact=dept)
        except Department.DoesNotExist:
            return Response({"detail": f"Unknown department: {dept}"}, status=400)

        # load models
        try:
            lgb_models = load_models()
        except Exception as e:
            return Response({"detail": f"Model load failed: {e}"}, status=503)

        # load training schema
        try:
            train_cols = json.loads(TRAIN_COLS_PATH.read_text())
        except Exception as e:
            return Response({
                "detail": "Missing or unreadable artifacts/train_columns.json. Re-train first.",
                "debug": str(e),
            }, status=503)

        if not isinstance(train_cols, list) or not train_cols:
            return Response({"detail": "Invalid train_columns.json (not a non-empty list). Re-train first."}, status=503)

        # Scenario sliders / deltas
        assumptions = request.data.get("assumptions", {}) or {}
        fx_delta   = float(assumptions.get("fxRate_delta", 0) or 0)
        inf_delta  = float(assumptions.get("inflationPct_delta", 0) or 0)
        wage_delta = float(assumptions.get("wageIndex_delta", 0) or 0)
        dept_pct   = float(assumptions.get("dept_pct", 0) or 0) / 100.0

        drivers_adj = request.data.get("drivers", {}) or {}
        enrolled_delta = int(drivers_adj.get("enrolled_FTE_delta", 0) or 0)
        programs_delta = int(drivers_adj.get("programLaunches_delta", 0) or 0)

        # --------- History (actuals) ---------
        qs = (DriversMonthly.objects
              .select_related("department", "macro")
              .filter(department__name__iexact=dept)
              .order_by("month")
              .values("month", "totalNet", "macro_id"))
        if not qs.exists():
            return Response({"detail": f"No monthly drivers found for {dept}"}, status=400)

        hist = pd.DataFrame(list(qs)).rename(columns={"month": "Date", "totalNet": TARGET})
        hist[KEY] = dept
        hist["Date"] = pd.to_datetime(hist["Date"], errors="coerce")
        hist = hist.dropna(subset=["Date"])
        hist[TARGET] = pd.to_numeric(hist[TARGET], errors="coerce")

        # Latest dept-level baselines to adjust by deltas
        latest_drv = (DriversMonthly.objects
                      .filter(department__name__iexact=dept)
                      .order_by("-month")
                      .values("enrolled_FTE_dept", "programLaunches_dept")
                      .first()) or {}
        base_enrolled = int(latest_drv.get("enrolled_FTE_dept") or 0)
        base_programs = int(latest_drv.get("programLaunches_dept") or 0)

        # --------- Macro lookups (month -> values) ---------
        macro_map = {}
        macro_qs = MacroMonthly.objects.values("id", "month", "fxRate_PHP_USD", "inflationPct", "wageIndex")
        mdf = pd.DataFrame(list(macro_qs))
        if not mdf.empty:
            mdf["Date"] = pd.to_datetime(mdf["month"], errors="coerce").dt.to_period("M").dt.to_timestamp()
            mdf = mdf.dropna(subset=["Date"])
            # Last write wins per month
            mdf = mdf.sort_values(["Date", "id"]).drop_duplicates(subset=["Date"], keep="last")
            macro_map = mdf.set_index("Date")[["fxRate_PHP_USD", "inflationPct", "wageIndex"]].to_dict("index")

        # --------- Horizon (next 12 months) ---------
        today = date.today().replace(day=1)
        start = today + relativedelta(months=1)
        targets = [start + relativedelta(months=i) for i in range(12)]

        # --------- Working panel ---------
        work = hist[["Date", KEY, TARGET]].copy()
        work["Date"] = pd.to_datetime(work["Date"], errors="coerce").dt.to_period("M").dt.to_timestamp()
        if macro_map:
            work["fxRate"]       = work["Date"].map(lambda d: macro_map.get(d, {}).get("fxRate_PHP_USD", np.nan))
            work["inflationPct"] = work["Date"].map(lambda d: macro_map.get(d, {}).get("inflationPct", np.nan))
            work["wageIndex"]    = work["Date"].map(lambda d: macro_map.get(d, {}).get("wageIndex", np.nan))

        results = []
        debug_enabled = bool(request.data.get("debug") or request.query_params.get("debug"))
        last_dbg = None  # capture last-step internals if debug requested

        for tgt in targets:
            tgt_ts = pd.Timestamp(tgt).to_period("M").to_timestamp()

            # include a future row to build calendar dummies
            future_row = pd.DataFrame([{"Date": tgt_ts, KEY: dept, TARGET: np.nan}])
            panel = pd.concat([work, future_row], ignore_index=True)

            # calendar features
            panel["Date"] = pd.to_datetime(panel["Date"], errors="coerce")
            panel = panel.dropna(subset=["Date"])
            panel["Date"] = panel["Date"].dt.to_period("M").dt.to_timestamp()
            panel["year"]  = panel["Date"].dt.year
            panel["month"] = panel["Date"].dt.month
            panel["qtr"]   = panel["Date"].dt.quarter
            panel = pd.get_dummies(panel, columns=["month", "qtr"], prefix=["m", "q"], dtype=int)
            panel["t"] = (panel["Date"].dt.year - panel["Date"].dt.year.min()) * 12 + panel["Date"].dt.month

            # lags / rolls / yoy / regime
            panel[TARGET] = pd.to_numeric(panel[TARGET], errors="coerce")
            panel = panel.sort_values([KEY, "Date"]).copy()
            for L in [1, 3, 12]:
                panel[f"lag{L}"] = panel.groupby(KEY, observed=False)[TARGET].shift(L)
            g = panel.groupby(KEY, observed=False)[TARGET]
            for w in [3, 6, 12]:
                panel[f"roll{w}_mean"] = g.shift(1).rolling(w).mean().reset_index(level=0, drop=True)
                panel[f"roll{w}_std"]  = g.shift(1).rolling(w).std().reset_index(level=0, drop=True)
            denom = panel.groupby(KEY, observed=False)[TARGET].shift(12)
            panel["yoy"] = (panel[TARGET] / denom) - 1.0
            panel["level_shift12"] = (
                panel.groupby(KEY, observed=False)[TARGET]
                .pct_change(12, fill_method=None).abs() > 0.35
            ).astype(int)

            # features row for this target month
            row_feat = panel.loc[panel["Date"] == tgt_ts].copy()

            # macro bases and scenario effective values
            fx_base   = macro_map.get(tgt_ts, {}).get("fxRate_PHP_USD", np.nan) if macro_map else np.nan
            inf_base  = macro_map.get(tgt_ts, {}).get("inflationPct", np.nan)   if macro_map else np.nan
            wage_base = macro_map.get(tgt_ts, {}).get("wageIndex", np.nan)      if macro_map else np.nan
            if pd.isna(fx_base):   fx_base   = _last_non_nan_col(work, "fxRate")
            if pd.isna(inf_base):  inf_base  = _last_non_nan_col(work, "inflationPct")
            if pd.isna(wage_base): wage_base = _last_non_nan_col(work, "wageIndex")

            fx_eff   = (fx_base   + fx_delta)  if pd.notna(fx_base)  else np.nan
            inf_eff  = (inf_base  + inf_delta) if pd.notna(inf_base) else np.nan
            wage_eff = (wage_base + wage_delta) if pd.notna(wage_base) else np.nan

            row_feat["fxRate"]       = fx_eff
            row_feat["inflationPct"] = inf_eff
            row_feat["wageIndex"]    = wage_eff
            row_feat["enrolled_FTE_dept"]    = float(base_enrolled + enrolled_delta)
            row_feat["programLaunches_dept"] = float(base_programs + programs_delta)

            # Align to training columns & predict
            try:
                X = _ensure_train_cols(row_feat, train_cols)
            except Exception as e:
                logger.exception("Feature alignment failure")
                return Response({"detail": f"Feature alignment failed: {e}"}, status=500)

            try:
                p10 = float(lgb_models[0.1].predict(X)[0])
                p50 = float(lgb_models[0.5].predict(X)[0])
                p90 = float(lgb_models[0.9].predict(X)[0])
            except Exception as e:
                logger.exception("Model predict failed")
                return Response({"detail": f"Predict failed: {e}"}, status=500)

            # Elasticity overlay (if available)
            base_exog = {
                "fxRate": fx_base,
                "inflationPct": inf_base,
                "wageIndex": wage_base,
                "enrolled_FTE_dept": float(base_enrolled),
                "programLaunches_dept": float(base_programs),
            }
            scen_exog = {
                "fxRate": fx_eff,
                "inflationPct": inf_eff,
                "wageIndex": wage_eff,
                "enrolled_FTE_dept": float(base_enrolled + enrolled_delta),
                "programLaunches_dept": float(base_programs + programs_delta),
            }
            if _EXOG_ELAS:
                r10 = _overlay_ratio(base_exog, scen_exog, 0.10)
                r50 = _overlay_ratio(base_exog, scen_exog, 0.50)
                r90 = _overlay_ratio(base_exog, scen_exog, 0.90)
                p10 *= r10; p50 *= r50; p90 *= r90

            # Department uplift AFTER overlay
            scale = 1.0 + (dept_pct or 0.0)
            p10 *= scale; p50 *= scale; p90 *= scale

            # Non-crossing safety
            p10, p50, p90 = sorted([p10, p50, p90])

            results.append({"date": f"{tgt_ts:%Y-%m}", "p10": p10, "p50": p50, "p90": p90})

            # Recursive rollout: feed median back into work with effective exog
            new_row = {"Date": tgt_ts, KEY: dept, TARGET: p50}
            if macro_map:
                new_row.update({"fxRate": fx_eff, "inflationPct": inf_eff, "wageIndex": wage_eff})
            work = pd.concat([work, pd.DataFrame([new_row])], ignore_index=True)

            if debug_enabled:
                last_dbg = {
                    "exog_elas_loaded": bool(_EXOG_ELAS),
                    "used_macro_map": bool(macro_map),
                    "sliders": {
                        "fx_delta": fx_delta, "inf_delta": inf_delta, "wage_delta": wage_delta,
                        "dept_pct": dept_pct, "enrolled_delta": enrolled_delta, "programs_delta": programs_delta,
                    },
                    "base_exog": base_exog,
                    "scen_exog": scen_exog,
                    "ratios": {
                        "r10": float(r10) if _EXOG_ELAS else None,
                        "r50": float(r50) if _EXOG_ELAS else None,
                        "r90": float(r90) if _EXOG_ELAS else None,
                    },
                }

        return Response(
            {
                "Department": dept,
                "Horizon": 12,
                "Forecast": results,  # [{date:'YYYY-MM', p10,p50,p90}, ...]
                "note": "p10=lower, p50=median, p90=upper. Forecast starts next month for 12 months.",
                "debug": last_dbg if debug_enabled else None,
            },
            status=200
        )
    
class DriversMonthlyListCreateView(generics.ListCreateAPIView):
    queryset = DriversMonthly.objects.select_related("department").all()
    serializer_class = DriversMonthlySerializer
    permission_classes = (permissions.AllowAny,)
    def get_queryset(self):
        qs = super().get_queryset()
        dept = self.request.query_params.get("department")
        if dept:
            qs = qs.filter(department__name__iexact=dept)
        return qs

class MacroMonthlyListCreateView(generics.ListCreateAPIView):
    queryset = MacroMonthly.objects.all()
    serializer_class = MacroMonthlySerializer
    permission_classes = (permissions.AllowAny,)

class ScenarioListCreateView(generics.ListCreateAPIView):
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer
    permission_classes = (permissions.AllowAny,)

class ScenarioDeptFactorListCreateView(generics.ListCreateAPIView):
    queryset = ScenarioDeptFactor.objects.select_related("scenario","department").all()
    serializer_class = ScenarioDeptFactorSerializer
    permission_classes = (permissions.AllowAny,)

class ScenarioTxnFactorListCreateView(generics.ListCreateAPIView):
    queryset = ScenarioTxnFactor.objects.select_related("scenario","transactionType").all()
    serializer_class = ScenarioTxnFactorSerializer
    permission_classes = (permissions.AllowAny,)

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)  # Allow anyone to register

class RequestForPaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = RequestForPaymentSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # 👇 Print to console
            print("❌ Validation failed:")
            for field, msgs in serializer.errors.items():
                print(f"   {field}: {msgs}")
            # 👇 Return JSON response with the same details
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RequestForPaymentListView(generics.ListCreateAPIView):
    serializer_class = RequestForPaymentsSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return RequestForPayment.objects.all()
    

class DepartmentListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return Department.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class SourceOfFundListCreateView(generics.ListCreateAPIView):
    serializer_class = SourceOfFundSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return SourceOfFund.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class TransactionTypeListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionTypeSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return TransactionType.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class TypeOfBusinessListCreateView(generics.ListCreateAPIView):
    serializer_class = TypeOfBusinessSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return TypeOfBusiness.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class ModeOfPaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = ModeOfPaymentSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return ModeOfPayment.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class TaxRegistrationListCreateView(generics.ListCreateAPIView):
    serializer_class = TaxRegistrationSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return TaxRegistration.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

