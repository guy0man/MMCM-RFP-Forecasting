# backend/api/services/forecasting_service.py
import lightgbm as lgb
from pathlib import Path

# services/ -> api/ -> backend/  (we want backend/artifacts)
ARTIFACT_DIR = Path(__file__).resolve().parents[2] / "artifacts"

FILENAMES = {
    0.1: "lgb_quantile_0.1.txt",
    0.5: "lgb_quantile_0.5.txt",
    0.9: "lgb_quantile_0.9.txt",
}

def load_models(artifact_dir: Path | str | None = None):
    """Load pre-trained quantile LightGBM models (.txt)."""
    base = Path(artifact_dir) if artifact_dir else ARTIFACT_DIR

    # Helpful check: fail fast with a clear message if missing
    missing = [fn for fn in FILENAMES.values() if not (base / fn).exists()]
    if missing:
        tried = str(base)
        raise FileNotFoundError(
            f"Missing model files under {tried}: {', '.join(missing)}"
        )

    return {
        alpha: lgb.Booster(model_file=str(base / fname))
        for alpha, fname in FILENAMES.items()
    }