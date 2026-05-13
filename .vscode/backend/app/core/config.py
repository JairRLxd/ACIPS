from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
APP_DIR = BASE_DIR / "app"
DATA_DIR = BASE_DIR / "data"

load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str
    env: str
    debug: bool
    version: str
    port: int
    firebase_project_id: str | None
    firebase_key_path: str
    groq_api_key: str | None
    groq_model: str
    programas_path: str
    paddleocr_language: str
    ocr_timeout_seconds: float
    generated_files_path: str


def _to_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        app_name=os.getenv("APP_NAME", "ACIPS API"),
        env=os.getenv("FLASK_ENV", "development"),
        debug=_to_bool(os.getenv("FLASK_DEBUG"), default=True),
        version=os.getenv("APP_VERSION", "1.0.0"),
        port=int(os.getenv("PORT", "5000")),
        firebase_project_id=os.getenv("FIREBASE_PROJECT_ID"),
        firebase_key_path=os.getenv(
            "FIREBASE_KEY_PATH", str(BASE_DIR / "firebase-key.json")
        ),
        groq_api_key=os.getenv("GROQ_API_KEY"),
        groq_model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        programas_path=os.getenv(
            "PROGRAMAS_JSON_PATH", str(DATA_DIR / "programas.json")
        ),
        paddleocr_language=os.getenv("PADDLEOCR_LANGUAGE", "latin"),
        ocr_timeout_seconds=float(os.getenv("OCR_TIMEOUT_SECONDS", "20")),
        generated_files_path=os.getenv(
            "GENERATED_FILES_PATH", str(BASE_DIR / "generated")
        ),
    )
