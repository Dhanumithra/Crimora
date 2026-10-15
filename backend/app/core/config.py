from __future__ import annotations

import os
from pathlib import Path
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

# Load local environment if exists
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings(BaseModel):
    PROJECT_NAME: str = "CRIMORA Intelligence API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", 8000))
    
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://crimora.vercel.app"
        ).split(",")
        if origin.strip()
    ]
    
    # Path resolution: check backend/artifacts, or fallback to root models
    ARTIFACTS_DIR: Path = Path(os.getenv("MODEL_ARTIFACTS_DIR", str(BASE_DIR / "artifacts"))).resolve()
    DATA_DIR: Path = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data"))).resolve()

    def get_model_path(self, filename: str) -> Path:
        primary = self.ARTIFACTS_DIR / filename
        if primary.exists():
            return primary
        fallback = BASE_DIR.parent / "models" / filename
        return fallback

    def get_data_path(self, filename: str) -> Path:
        primary = self.DATA_DIR / filename
        if primary.exists():
            return primary
        fallback = BASE_DIR.parent / "data" / filename
        return fallback


settings = Settings()
