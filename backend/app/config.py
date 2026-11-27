from functools import lru_cache
import os
from pathlib import Path
from typing import List, Tuple
from dotenv import dotenv_values
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "SkillBridge API"
    DATABASE_URL: str = "sqlite:///./skillbridge.db"
    SECRET_KEY: str = "skillbridge-dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_gemini_config() -> Tuple[str, str]:
    """
    Read GEMINI_API_KEY and GEMINI_MODEL dynamically from backend/.env (with os.environ fallback)
    so updates to backend/.env take effect without stale cache issues.
    """
    file_values = dotenv_values(ENV_FILE_PATH) if ENV_FILE_PATH.exists() else {}
    api_key = (
        file_values.get("GEMINI_API_KEY")
        or os.environ.get("GEMINI_API_KEY")
        or ""
    ).strip()
    model = (
        file_values.get("GEMINI_MODEL")
        or os.environ.get("GEMINI_MODEL")
        or "gemini-3.8-flash"
    ).strip()
    return api_key, model
