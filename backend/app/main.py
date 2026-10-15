from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from .api.v1.api import api_router
from .core.config import settings
from .core.security import setup_security_and_cors
from .services.ml_loader import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes and verifies models and data artifacts on startup."""
    print("=" * 60)
    print("  [CRIMORA] INTELLIGENCE PLATFORM -- FASTAPI BACKEND")
    print(f"  Version: {settings.VERSION} | Environment: {settings.ENVIRONMENT}")
    print(f"  Artifacts directory: {settings.ARTIFACTS_DIR}")
    print("=" * 60)
    yield
    print("CRIMORA Backend shutting down gracefully.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance async REST API serving pre-trained Deep Learning (ANN), Classical ML, Bayesian Causal (BBN), K-Means Clustering, and LWR Spatial Hotspot models.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Apply CORS & Security headers
setup_security_and_cors(app)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    """Root platform metadata endpoint."""
    return {
        "platform": "CRIMORA Production Intelligence Platform",
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "api_v1": f"{settings.API_V1_STR}/overview/status",
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """Container health check endpoint for Render/Railway/Hugging Face Spaces."""
    return {"status": "healthy", "service": "crimora-api"}
