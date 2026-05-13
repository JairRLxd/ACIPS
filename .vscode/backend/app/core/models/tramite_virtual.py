from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone


@dataclass(slots=True)
class TramiteVirtual:
    expediente_id: str
    usuario_uid: str
    programa_id: int
    programa_nombre: str
    modalidad: str
    estado: str
    perfil_usuario: dict
    documentos: list[dict]
    checklist: list[dict]
    evaluacion_previa: dict
    observaciones_usuario: str | None = None
    observaciones_admin: str | None = None
    revisado_por_uid: str | None = None
    constancia_url: str | None = None
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> dict:
        return asdict(self)
