from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.core.models import TramiteVirtual
from app.repositories import ProgramaRepository, TramiteVirtualRepository
from app.use_cases import DataAccessError, ValidationErrorUC


class CrearTramiteVirtualUC:
    def __init__(
        self,
        programa_repository: ProgramaRepository,
        tramite_virtual_repository: TramiteVirtualRepository,
    ) -> None:
        self._programa_repository = programa_repository
        self._tramite_virtual_repository = tramite_virtual_repository

    def ejecutar(
        self,
        usuario_uid: str,
        programa_id: int,
        perfil_usuario: dict,
        documentos: list[dict],
        evaluacion_previa: dict,
        observaciones_usuario: str | None = None,
    ) -> dict:
        programa = self._programa_repository.obtener_programa_por_id(programa_id)
        modalidad = getattr(programa, "modalidad", "presencial")
        permite_envio_virtual = bool(getattr(programa, "permite_envio_virtual", False))
        if modalidad != "en_linea" and not permite_envio_virtual:
            raise ValidationErrorUC(
                "Este tramite no puede enviarse en linea; sus documentos deben entregarse en persona."
            )

        documentos_requeridos = getattr(programa, "documentos_requeridos", [])
        checklist = self._build_checklist(documentos_requeridos, documentos)
        if any(item["estado"] != "aprobado" for item in checklist):
            raise ValidationErrorUC(
                "El expediente aun no esta listo para enviarse; faltan documentos o validaciones aprobadas."
            )

        expediente = TramiteVirtual(
            expediente_id=f"exp-{uuid.uuid4().hex[:16]}",
            usuario_uid=usuario_uid,
            programa_id=programa.id,
            programa_nombre=programa.nombre,
            modalidad=modalidad,
            estado="enviado",
            perfil_usuario=perfil_usuario,
            documentos=documentos,
            checklist=checklist,
            evaluacion_previa=evaluacion_previa,
            observaciones_usuario=observaciones_usuario,
            updated_at=datetime.now(timezone.utc).isoformat(),
        )
        try:
            persisted = self._tramite_virtual_repository.guardar(expediente)
        except Exception as exc:
            raise DataAccessError(
                "No fue posible guardar el expediente virtual enviado."
            ) from exc
        return persisted.to_dict()

    @staticmethod
    def _build_checklist(documentos_requeridos: list[dict], documentos: list[dict]) -> list[dict]:
        by_requisito = {
            int(documento.get("requisito_id")): documento for documento in documentos
        }
        checklist: list[dict] = []
        for requisito in documentos_requeridos:
            requisito_id = int(requisito["id"])
            doc = by_requisito.get(requisito_id)
            checklist.append(
                {
                    "requisito_id": requisito_id,
                    "nombre": requisito["nombre"],
                    "estado": "aprobado" if doc and doc.get("es_correcto") else "pendiente",
                    "observacion": doc.get("observacion") if doc else "Documento no cargado.",
                }
            )
        return checklist
