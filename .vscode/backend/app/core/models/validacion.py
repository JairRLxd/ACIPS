from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone


@dataclass(slots=True)
class Validacion:
    sesion_id: str
    requisito_id: int
    tipo_esperado: str
    tipo_detectado: str
    tipo_archivo: str
    es_correcto: bool
    legible: bool
    vigente: bool
    requiere_revision: bool
    observacion: str
    errores_detectados: list[str] = field(default_factory=list)
    medio_extraccion: str = "desconocido"
    archivo_base64: str | None = None
    texto_extraido: str | None = None
    has_embedded_text: bool = False
    pages_with_text: int = 0
    ocr_confidence_avg: float | None = None
    ocr_lines_count: int = 0
    text_length: int = 0
    proveedor_ia: str = "paddleocr+pymupdf"
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> dict:
        return asdict(self)
