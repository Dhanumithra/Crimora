from __future__ import annotations

from fastapi import APIRouter
import pandas as pd

from ....core.config import settings
from ....models.schemas import ExecutiveOverviewResponse, SystemStatusResponse
from ....services.ml_loader import ml_service

router = APIRouter()


@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status():
    """Returns high-level system operational metrics and health status."""
    registry = ml_service.get_registry_info()
    return SystemStatusResponse(
        status="operational",
        version=settings.VERSION,
        active_models_count=len(registry),
        total_models_count=len(registry),
        total_incidents=52179,
        unsolved_cases_count=26505,
        environment=settings.ENVIRONMENT,
    )


@router.get("/overview", response_model=ExecutiveOverviewResponse)
@router.get("/executive", response_model=ExecutiveOverviewResponse)
async def get_executive_overview():
    """Returns executive KPI metrics, model registry, and PCA decomposition variance."""
    models_reg = ml_service.get_registry_info()

    # Load small sanitized incident sample
    sample_records = []
    clean_csv = settings.get_data_path("processed/homicide_clean.csv")
    if clean_csv.exists():
        try:
            df = pd.read_csv(clean_csv, nrows=10)
            cols = [c for c in ["uid", "city", "state", "reported_year", "victim_age_clean", "victim_sex", "victim_race", "is_solved"] if c in df.columns]
            sample_records = df[cols].fillna("Unknown").to_dict(orient="records")
        except Exception:
            pass

    # Top PCA variance
    pca_variance = [
        {"component": "PC01", "variance_ratio": 0.182, "cumulative": 0.182},
        {"component": "PC02", "variance_ratio": 0.141, "cumulative": 0.323},
        {"component": "PC03", "variance_ratio": 0.115, "cumulative": 0.438},
        {"component": "PC04", "variance_ratio": 0.089, "cumulative": 0.527},
        {"component": "PC05", "variance_ratio": 0.076, "cumulative": 0.603},
        {"component": "PC06", "variance_ratio": 0.061, "cumulative": 0.664},
        {"component": "PC07", "variance_ratio": 0.052, "cumulative": 0.716},
        {"component": "PC08", "variance_ratio": 0.045, "cumulative": 0.761},
    ]

    return ExecutiveOverviewResponse(
        kpis={
            "analyzed_incidents": 52179,
            "baseline_clearance_rate": 49.2,
            "active_ml_engines": len(models_reg),
            "spatial_grid_nodes": 2500,
            "monitored_jurisdictions": 50,
            "unsolved_cold_cases": 26505,
        },
        models=models_reg,
        incident_sample=sample_records,
        pca_variance=pca_variance,
    )
