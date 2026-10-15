from __future__ import annotations

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from .config import settings


def setup_security_and_cors(app: FastAPI) -> None:
    """Configures CORS and API middleware."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS if settings.ALLOWED_ORIGINS else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
