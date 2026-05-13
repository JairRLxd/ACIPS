from __future__ import annotations

import firebase_admin
from firebase_admin import auth

from app.core.config import Settings
from app.repositories.firestore_client import get_firestore_client


class FirebaseAuthService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def verify_id_token(self, token: str) -> dict:
        get_firestore_client(self._settings)
        if not firebase_admin._apps:
            raise ValueError("Firebase Admin no esta inicializado.")
        return auth.verify_id_token(token)
