from __future__ import annotations

from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

from app.core.config import Settings


def get_firestore_client(settings: Settings):
    if not firebase_admin._apps:
        key_path = Path(settings.firebase_key_path)
        if key_path.exists():
            credential = credentials.Certificate(str(key_path))
            firebase_admin.initialize_app(
                credential,
                {"projectId": settings.firebase_project_id}
                if settings.firebase_project_id
                else None,
            )
        else:
            firebase_admin.initialize_app(
                options={"projectId": settings.firebase_project_id}
                if settings.firebase_project_id
                else None
            )
    return firestore.client()
