from __future__ import annotations

from app.repositories import TramiteVirtualRepository
from app.use_cases import DataAccessError, ValidationErrorUC


class RevisarTramiteVirtualUC:
    def __init__(self, tramite_virtual_repository: TramiteVirtualRepository) -> None:
        self._tramite_virtual_repository = tramite_virtual_repository

    def ejecutar(
        self,
        expediente_id: str,
        admin_uid: str,
        decision: str,
        observaciones_admin: str,
        constancia_url: str | None = None,
    ) -> dict:
        decision_normalizada = decision.strip().lower()
        allowed = {"aprobado", "rechazado", "constancia_emitida"}
        if decision_normalizada not in allowed:
            raise ValidationErrorUC(
                f"La decision '{decision}' no es valida. Usa una de: {', '.join(sorted(allowed))}."
            )
        if decision_normalizada == "constancia_emitida" and not constancia_url:
            raise ValidationErrorUC(
                "Para emitir constancia se requiere constancia_url."
            )
        try:
            tramite = self._tramite_virtual_repository.actualizar_revision(
                expediente_id=expediente_id,
                estado=decision_normalizada,
                observaciones_admin=observaciones_admin,
                revisado_por_uid=admin_uid,
                constancia_url=constancia_url,
            )
        except KeyError as exc:
            raise ValidationErrorUC(str(exc)) from exc
        except Exception as exc:
            raise DataAccessError("No fue posible registrar la revision administrativa.") from exc
        return tramite.to_dict()
