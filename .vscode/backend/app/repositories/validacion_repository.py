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

    def obtener_todas_validaciones(self, estado: str | None = None) -> list[dict]:
        """Obtiene todas las validaciones, opcionalmente filtradas por estado"""
        query = self._collection
        
        if estado and estado != "todos":
            query = query.where("estado", "==", estado)
        
        documentos = query.order_by("created_at", direction="DESCENDING").limit(100).stream()
        
        result = []
        for doc in documentos:
            data = doc.to_dict()
            data["id"] = doc.id
            result.append(data)
        
        return result

    def obtener_validacion_por_id(self, documento_id: str) -> dict | None:
        """Obtiene una validación específica por ID"""
        doc = self._collection.document(documento_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    def actualizar_estado_validacion(
        self, 
        documento_id: str, 
        estado: str, 
        validado_por: str,
        comentario: str = ""
    ) -> dict | None:
        """Actualiza el estado de una validación"""
        from datetime import datetime
        
        doc_ref = self._collection.document(documento_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        update_data = {
            "estado": estado,
            "validado_por": validado_por,
            "fecha_validacion": datetime.utcnow().isoformat(),
            "comentario": comentario
        }
        
        doc_ref.update(update_data)
        
        # Retornar el documento actualizado
        updated_doc = doc_ref.get()
        data = updated_doc.to_dict()
        data["id"] = updated_doc.id
        return data

    def obtener_estadisticas(self) -> dict:
        """Obtiene estadísticas de las validaciones"""
        all_docs = self._collection.stream()
        
        total = 0
        pendientes = 0
        aprobados = 0
        rechazados = 0
        
        for doc in all_docs:
            data = doc.to_dict()
            total += 1
            estado = data.get("estado", "pendiente")
            
            if estado == "pendiente":
                pendientes += 1
            elif estado == "aprobado":
                aprobados += 1
            elif estado == "rechazado":
                rechazados += 1
        
        return {
            "total": total,
            "pendientes": pendientes,
            "aprobados": aprobados,
            "rechazados": rechazados
        }
