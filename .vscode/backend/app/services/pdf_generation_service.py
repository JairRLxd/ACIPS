from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable
from uuid import uuid4

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas

from app.core.config import Settings


@dataclass(frozen=True, slots=True)
class GeneratedPdf:
    document_type: str
    file_name: str
    absolute_path: str
    relative_path: str
    created_at: str


class PDFGenerationService:
    def __init__(self, settings: Settings) -> None:
        self._output_dir = Path(settings.generated_files_path).resolve()
        self._output_dir.mkdir(parents=True, exist_ok=True)
        self._builders: dict[str, Callable[[canvas.Canvas, dict], None]] = {
            "constancia": self._build_constancia,
            "acuse_recepcion": self._build_acuse_recepcion,
            "expediente_resumen": self._build_expediente_resumen,
        }

    def generate_pdf(
        self,
        document_type: str,
        payload: dict,
        file_name: str | None = None,
    ) -> GeneratedPdf:
        normalized_type = self._normalize_document_type(document_type)
        builder = self._builders.get(normalized_type)
        if builder is None:
            raise ValueError(
                f"Tipo de PDF no soportado: '{document_type}'. "
                f"Disponibles: {', '.join(sorted(self._builders))}."
            )

        final_name = file_name or self._build_file_name(normalized_type, payload)
        output_path = self._output_dir / final_name
        pdf_canvas = canvas.Canvas(str(output_path), pagesize=LETTER)
        builder(pdf_canvas, payload)
        pdf_canvas.save()

        return GeneratedPdf(
            document_type=normalized_type,
            file_name=final_name,
            absolute_path=str(output_path),
            relative_path=str(output_path.relative_to(self._output_dir.parent)),
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    def supported_document_types(self) -> list[str]:
        return sorted(self._builders.keys())

    @staticmethod
    def _normalize_document_type(document_type: str) -> str:
        normalized = document_type.strip().lower()
        aliases = {
            "constancia_pdf": "constancia",
            "acuse": "acuse_recepcion",
            "acuse de recepcion": "acuse_recepcion",
            "expediente": "expediente_resumen",
            "resumen_expediente": "expediente_resumen",
        }
        return aliases.get(normalized, normalized.replace(" ", "_"))

    def _build_file_name(self, document_type: str, payload: dict) -> str:
        reference = payload.get("folio") or payload.get("expediente_id") or uuid4().hex[:10]
        safe_reference = re.sub(r"[^a-zA-Z0-9_-]+", "-", str(reference)).strip("-")
        return f"{document_type}_{safe_reference}.pdf"

    def _write_header(self, pdf: canvas.Canvas, title: str, subtitle: str | None = None) -> float:
        y = 26.5 * cm
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(2 * cm, y, title)
        y -= 0.8 * cm
        pdf.setFont("Helvetica", 10)
        pdf.drawString(
            2 * cm,
            y,
            f"Generado el {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        )
        if subtitle:
            y -= 0.6 * cm
            pdf.drawString(2 * cm, y, subtitle)
        return y - 1.0 * cm

    def _write_section(self, pdf: canvas.Canvas, y: float, title: str, lines: list[str]) -> float:
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(2 * cm, y, title)
        y -= 0.6 * cm
        pdf.setFont("Helvetica", 10)
        for line in lines:
            y = self._write_wrapped_line(pdf, 2.2 * cm, y, line)
            y -= 0.15 * cm
            if y < 3 * cm:
                pdf.showPage()
                y = 26 * cm
                pdf.setFont("Helvetica", 10)
        return y - 0.4 * cm

    def _write_wrapped_line(self, pdf: canvas.Canvas, x: float, y: float, text: str) -> float:
        max_chars = 95
        normalized = text.strip() or "-"
        chunks = [
            normalized[index : index + max_chars]
            for index in range(0, len(normalized), max_chars)
        ] or ["-"]
        for chunk in chunks:
            pdf.drawString(x, y, chunk)
            y -= 0.45 * cm
        return y

    def _build_constancia(self, pdf: canvas.Canvas, payload: dict) -> None:
        y = self._write_header(
            pdf,
            "Constancia Administrativa",
            "Documento generado tras revision administrativa del expediente.",
        )
        ciudadano = payload.get("ciudadano_nombre", "No especificado")
        folio = payload.get("folio", payload.get("expediente_id", "Sin folio"))
        tramite = payload.get("tramite_nombre", "Tramite no especificado")
        dependencia = payload.get("dependencia", "Dependencia no especificada")
        observaciones = payload.get("observaciones", "Sin observaciones.")

        y = self._write_section(
            pdf,
            y,
            "Datos principales",
            [
                f"Folio: {folio}",
                f"Ciudadano: {ciudadano}",
                f"Tramite: {tramite}",
                f"Dependencia: {dependencia}",
                f"Emitido por: {payload.get('emitido_por', 'Administrador ACIPS')}",
            ],
        )
        self._write_section(
            pdf,
            y,
            "Texto de constancia",
            [
                f"Se hace constar que el expediente asociado al folio {folio} "
                f"fue revisado administrativamente para el tramite '{tramite}'.",
                f"Observaciones: {observaciones}",
            ],
        )

    def _build_acuse_recepcion(self, pdf: canvas.Canvas, payload: dict) -> None:
        y = self._write_header(
            pdf,
            "Acuse de Recepcion",
            "Comprobante de recepcion de documentos enviados en linea.",
        )
        documentos = payload.get("documentos", [])
        lines = [
            f"Folio: {payload.get('folio', payload.get('expediente_id', 'Sin folio'))}",
            f"Ciudadano: {payload.get('ciudadano_nombre', 'No especificado')}",
            f"Tramite: {payload.get('tramite_nombre', 'Tramite no especificado')}",
            f"Fecha de recepcion: {payload.get('fecha_recepcion', datetime.now(timezone.utc).strftime('%Y-%m-%d'))}",
            f"Total de documentos recibidos: {len(documentos)}",
        ]
        y = self._write_section(pdf, y, "Resumen de recepcion", lines)
        document_lines = [
            f"{index + 1}. {item.get('nombre', 'Documento')} - estado: {item.get('estado', 'recibido')}"
            for index, item in enumerate(documentos)
        ] or ["No se reportaron documentos en el payload."]
        self._write_section(pdf, y, "Documentos recibidos", document_lines)

    def _build_expediente_resumen(self, pdf: canvas.Canvas, payload: dict) -> None:
        y = self._write_header(
            pdf,
            "Resumen de Expediente",
            "Compendio del expediente previo a revision o archivo.",
        )
        checklist = payload.get("checklist", [])
        evaluacion = payload.get("evaluacion_previa", {})
        y = self._write_section(
            pdf,
            y,
            "Resumen general",
            [
                f"Expediente: {payload.get('expediente_id', 'Sin expediente')}",
                f"Ciudadano: {payload.get('ciudadano_nombre', 'No especificado')}",
                f"Programa o tramite: {payload.get('tramite_nombre', 'No especificado')}",
                f"Estado actual: {payload.get('estado', 'sin estado')}",
            ],
        )
        y = self._write_section(
            pdf,
            y,
            "Checklist documental",
            [
                f"{item.get('nombre', 'Documento')} - {item.get('estado', 'pendiente')} - {item.get('observacion', '-')}"
                for item in checklist
            ]
            or ["Sin checklist disponible."],
        )
        self._write_section(
            pdf,
            y,
            "Evaluacion previa",
            [f"{key}: {value}" for key, value in evaluacion.items()]
            or ["Sin datos de evaluacion previa."],
        )
