from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(slots=True)
class ProgramaSocial:
    id: int
    nombre: str
    descripcion: str
    monto: str
    periodicidad: str
    dependencia: str
    url_oficial: str
    requisitos_elegibilidad: dict[str, Any]
    documentos_requeridos: list[dict[str, Any]]
    modalidad: str = "presencial"
    permite_envio_virtual: bool = False
    emite_constancia: bool = False
    tags: list[str] = field(default_factory=list)
    cobertura: str = "nacional"
    estados: list[str] = field(default_factory=list)
    situaciones: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)
