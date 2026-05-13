from __future__ import annotations

from datetime import datetime, timezone
from firebase_admin import firestore

from app.core.config import Settings
from app.core.models import MensajeChat, SesionUsuario
from app.repositories.firestore_client import get_firestore_client


class SesionRepository:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def _collection(self):
        db = get_firestore_client(self._settings)
        return db.collection("sesiones")

    def guardar_interaccion(
        self,
        sesion_id: str,
        perfil_usuario: dict,
        mensaje_usuario: MensajeChat,
        respuesta_asistente: MensajeChat,
    ) -> SesionUsuario:
        historial = [mensaje_usuario.to_dict(), respuesta_asistente.to_dict()]
        payload = {
            "sesion_id": sesion_id,
            "perfil_usuario": perfil_usuario,
            "historial": firestore.ArrayUnion(historial),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        self._collection.document(sesion_id).set(payload, merge=True)
        return self.obtener_sesion(sesion_id)

    def obtener_sesion(self, sesion_id: str) -> SesionUsuario:
        snapshot = self._collection.document(sesion_id).get()
        data = snapshot.to_dict() if snapshot.exists else None
        if not data:
            return SesionUsuario(sesion_id=sesion_id, perfil_usuario={}, historial=[])
        return SesionUsuario(
            sesion_id=data["sesion_id"],
            perfil_usuario=data.get("perfil_usuario", {}),
            historial=data.get("historial", []),
            updated_at=data.get("updated_at", datetime.now(timezone.utc).isoformat()),
        )
