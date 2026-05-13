from __future__ import annotations

from app.core.config import Settings
from app.core.models import Validacion
from app.repositories.firestore_client import get_firestore_client


class ValidacionRepository:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def _collection(self):
        db = get_firestore_client(self._settings)
        return db.collection("validaciones")

    def guardar_validacion(self, validacion: Validacion) -> Validacion:
        payload = validacion.to_dict()
        document_id = f"{validacion.sesion_id}-{validacion.requisito_id}-{validacion.created_at}"
        self._collection.document(document_id).set(payload)
        return validacion

    def obtener_validaciones_por_sesion(self, sesion_id: str) -> list[dict]:
        documentos = (
            self._collection.where("sesion_id", "==", sesion_id).stream()
        )
        return [documento.to_dict() for documento in documentos]
