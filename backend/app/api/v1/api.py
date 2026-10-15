from __future__ import annotations

from fastapi import APIRouter
from .endpoints import (
    analytics,
    clustering,
    geographic,
    overview,
    profiling,
    solvability,
)

api_router = APIRouter()

api_router.include_router(overview.router, prefix="/overview", tags=["Overview & Status"])
api_router.include_router(solvability.router, prefix="/solvability", tags=["Case Solvability (ANN & Classical ML)"])
api_router.include_router(clustering.router, prefix="/clustering", tags=["Crime Linkage & Cold Cases (K-Means)"])
api_router.include_router(geographic.router, prefix="/geographic", tags=["Geographic Profiling & LWR Hotspots"])
api_router.include_router(profiling.router, prefix="/profiling", tags=["Behavioral Profiling (BBN Causal)"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Regional Analytics (Tamil Nadu IPC)"])
