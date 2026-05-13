from __future__ import annotations

from datetime import datetime, timezone

from app.core.config import Settings
from app.core.models import TramiteVirtual
from app.repositories.firestore_client import get_firestore_client


class TramiteVirtualRepository:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def _collection(self):
        db = get_firestore_client(self._settings)
        return db.collection("tramites_virtuales")

    def guardar(self, tramite: TramiteVirtual) -> TramiteVirtual:
        payload = tramite.to_dict()
        self._collection.document(tramite.expediente_id).set(payload, merge=True)
        return self.obtener_por_id(tramite.expediente_id)

    def obtener_por_id(self, expediente_id: str) -> TramiteVirtual:
        snapshot = self._collection.document(expediente_id).get()
        if not snapshot.exists:
            raise KeyError(f"No existe el expediente virtual '{expediente_id}'.")
        data = snapshot.to_dict() or {}
        return TramiteVirtual(**data)

    def listar_por_usuario(self, usuario_uid: str) -> list[TramiteVirtual]:
        documentos = self._collection.where("usuario_uid", "==", usuario_uid).stream()
        return [TramiteVirtual(**(doc.to_dict() or {})) for doc in documentos]

    def listar_por_estado(self, estado: str | None = None) -> list[TramiteVirtual]:
        if estado:
            documentos = self._collection.where("estado", "==", estado).stream()
        else:
            documentos = self._collection.stream()
        return [TramiteVirtual(**(doc.to_dict() or {})) for doc in documentos]

    def actualizar_revision(
        self,
        expediente_id: str,
        estado: str,
        observaciones_admin: str,
        revisado_por_uid: str,
        constancia_url: str | None = None,
    ) -> TramiteVirtual:
        self._collection.document(expediente_id).set(
            {
                "estado": estado,
                "observaciones_admin": observaciones_admin,
                "revisado_por_uid": revisado_por_uid,
                "constancia_url": constancia_url,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            merge=True,
        )
        return self.obtener_por_id(expediente_id)
