from __future__ import annotations

from app.repositories import ProgramaRepository
from app.use_cases import DataAccessError, ValidationErrorUC


class ObtenerTramitesUC:
    def __init__(self, programa_repository: ProgramaRepository) -> None:
        self._programa_repository = programa_repository

    def ejecutar(
        self,
        tipo: str | None = None,
        estado: str | None = None,
        situacion: str | None = None,
    ) -> dict[str, list[dict]]:
        try:
            programas = self._programa_repository.filtrar_tramites(
                tipo=tipo,
                estado=estado,
                situacion=situacion,
            )
        except Exception as exc:
            raise DataAccessError("No fue posible consultar los tramites.") from exc

        tramites = [
            {
                "id": programa.id,
                "nombre": programa.nombre,
                "requisitos": programa.requisitos_elegibilidad,
                "documentos_requeridos": programa.documentos_requeridos,
                "monto": programa.monto,
                "dependencia": programa.dependencia,
                "modalidad": getattr(programa, "modalidad", "presencial"),
                "permite_envio_virtual": bool(
                    getattr(programa, "permite_envio_virtual", False)
                ),
                "emite_constancia": bool(getattr(programa, "emite_constancia", False)),
            }
            for programa in programas
        ]
        return {"tramites": tramites}

    def obtener_por_id(self, programa_id: int) -> dict:
        try:
            programa = self._programa_repository.obtener_programa_por_id(programa_id)
        except KeyError as exc:
            raise ValidationErrorUC(str(exc)) from exc
        except Exception as exc:
            raise DataAccessError("No fue posible consultar el tramite solicitado.") from exc

        return {
            "id": programa.id,
            "nombre": programa.nombre,
            "descripcion": programa.descripcion,
            "monto": programa.monto,
            "periodicidad": programa.periodicidad,
            "dependencia": programa.dependencia,
            "url_oficial": programa.url_oficial,
            "requisitos": programa.requisitos_elegibilidad,
            "documentos_requeridos": programa.documentos_requeridos,
            "modalidad": getattr(programa, "modalidad", "presencial"),
            "permite_envio_virtual": bool(
                getattr(programa, "permite_envio_virtual", False)
            ),
            "emite_constancia": bool(getattr(programa, "emite_constancia", False)),
        }
