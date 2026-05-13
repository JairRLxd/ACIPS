from __future__ import annotations

from datetime import datetime, timezone

from app.core.config import Settings
from app.core.models import Usuario
from app.repositories.firestore_client import get_firestore_client


class UsuarioRepository:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def _collection(self):
        db = get_firestore_client(self._settings)
        return db.collection("usuarios")

    def upsert_usuario(self, usuario: Usuario) -> Usuario:
        payload = usuario.to_dict()
        self._collection.document(usuario.uid).set(payload, merge=True)
        return self.obtener_usuario(usuario.uid)

    def obtener_usuario(self, uid: str) -> Usuario | None:
        snapshot = self._collection.document(uid).get()
        if not snapshot.exists:
            return None
        data = snapshot.to_dict() or {}
        return Usuario(
            uid=data["uid"],
            email=data.get("email"),
            nombre=data.get("nombre"),
            rol=data.get("rol", "ciudadano"),
            activo=bool(data.get("activo", True)),
            created_at=data.get(
                "created_at", datetime.now(timezone.utc).isoformat()
            ),
            last_login_at=data.get(
                "last_login_at", datetime.now(timezone.utc).isoformat()
            ),
        )

    def actualizar_ultimo_acceso(self, uid: str) -> None:
        self._collection.document(uid).set(
            {"last_login_at": datetime.now(timezone.utc).isoformat()},
            merge=True,
        )
