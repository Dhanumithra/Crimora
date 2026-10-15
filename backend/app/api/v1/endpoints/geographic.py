from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter

from ....models.schemas import (
    GeographicSummaryResponse,
    HotspotCentroid,
    LWRKernelQuery,
)
from ....services.lwr_engine import (
    CALIBRATED_HOTSPOTS,
    TAMIL_NADU_DISTRICTS,
    compute_lwr_spatial_intensity,
)

router = APIRouter()


@router.get("/summary", response_model=GeographicSummaryResponse)
@router.get("/hotspots", response_model=GeographicSummaryResponse)
@router.get("", response_model=GeographicSummaryResponse)
async def get_geographic_summary():
    """Returns spatial grid configuration, hotspot centroids, and Tamil Nadu regional districts."""
    tn_districts = [
        {"district": d, "latitude": lat, "longitude": lon}
        for d, (lat, lon) in TAMIL_NADU_DISTRICTS.items()
    ]

    hotspots = [
        HotspotCentroid(
            rank=h["rank"],
            latitude=h["latitude"],
            longitude=h["longitude"],
            city=h["city"],
            estimated_intensity=h["estimated_intensity"],
            normalized_intensity=h["normalized_intensity"],
            relative_rank=h["relative_rank"],
            percentile_tier=h["percentile_tier"],
            recommended_patrol=h["recommended_patrol"],
        )
        for h in CALIBRATED_HOTSPOTS
    ]

    return GeographicSummaryResponse(
        focal_region="Tamil Nadu & Benchmark Metropolitan Corridors",
        grid_resolution="50 × 50 Evaluation Nodes (~320m resolution)",
        total_nodes=2500,
        bandwidth_km=0.857,
        hotspots=hotspots,
        tamil_nadu_focus_districts=tn_districts,
    )


@router.post("/intensity")
async def calculate_spatial_intensity(query: LWRKernelQuery):
    """Calculates Locally Weighted Regression (LWR) distance-decay spatial intensity."""
    return compute_lwr_spatial_intensity(
        lat=query.latitude,
        lon=query.longitude,
        bandwidth_km=query.bandwidth,
    )
