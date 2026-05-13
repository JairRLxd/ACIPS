from __future__ import annotations

import base64
import binascii
import io
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from dataclasses import dataclass

import fitz
import easyocr
import numpy as np
from PIL import Image

from app.core.config import Settings
from app.use_cases import CorruptedPdfError, InvalidFileError, OCRNoTextError, ServiceTimeoutError


@dataclass(slots=True)
class ExtractedDocument:
    source_type: str
    extraction_method: str
    text: str
    page_count: int
    legible: bool
    has_embedded_text: bool
    pages_with_text: int
    ocr_confidence_avg: float | None
    ocr_lines_count: int
    text_length: int


class DocumentExtractionService:
    def __init__(self, settings: Settings) -> None:
        self._language = settings.paddleocr_language
        self._ocr_timeout_seconds = settings.ocr_timeout_seconds
        self._ocr_client: easyocr.Reader | None = None

    @staticmethod
    def _map_language(lang: str) -> list[str]:
        if lang == "latin":
            return ["es", "en"]
        return [lang]

    @property
    def _ocr(self) -> easyocr.Reader:
        if self._ocr_client is None:
            self._ocr_client = easyocr.Reader(
                self._map_language(self._language),
                gpu=False,
                verbose=False,
            )
        return self._ocr_client

    def extraer_desde_base64(
        self,
        archivo_base64: str,
        mime_type: str | None = None,
    ) -> ExtractedDocument:
        clean_base64, inferred_mime_type = self._normalizar_base64(
            archivo_base64, mime_type
        )
        try:
            file_bytes = base64.b64decode(clean_base64, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise InvalidFileError(
                "El archivo enviado es invalido o el base64 esta malformado."
            ) from exc
        if not file_bytes:
            raise InvalidFileError("El archivo enviado esta vacio.")
        final_mime_type = mime_type or inferred_mime_type
        if self._es_pdf(file_bytes, final_mime_type):
            return self._extraer_pdf(file_bytes)
        return self._extraer_imagen(file_bytes)

    @staticmethod
    def _normalizar_base64(
        archivo_base64: str, mime_type: str | None
    ) -> tuple[str, str | None]:
        if "," in archivo_base64 and archivo_base64.startswith("data:"):
            header, data = archivo_base64.split(",", 1)
            inferred_mime = header.replace("data:", "").split(";")[0].strip()
            return data.strip(), mime_type or inferred_mime or None
        return archivo_base64.strip(), mime_type

    @staticmethod
    def _es_pdf(file_bytes: bytes, mime_type: str | None) -> bool:
        return (mime_type or "").lower() == "application/pdf" or file_bytes.startswith(
            b"%PDF"
        )

    def _extraer_pdf(self, file_bytes: bytes) -> ExtractedDocument:
        try:
            document = fitz.open(stream=file_bytes, filetype="pdf")
        except (fitz.FileDataError, RuntimeError, ValueError) as exc:
            raise CorruptedPdfError(
                "El PDF esta corrupto, incompleto o no puede abrirse."
            ) from exc
        text_parts: list[str] = []
        pages_with_text = 0
        for page in document:
            page_text = page.get_text("text").strip()
            if page_text:
                text_parts.append(page_text)
                pages_with_text += 1

        joined_text = "\n".join(text_parts).strip()
        if joined_text:
            return ExtractedDocument(
                source_type="pdf",
                extraction_method="pymupdf_text",
                text=joined_text,
                page_count=document.page_count,
                legible=len(joined_text) >= 20,
                has_embedded_text=True,
                pages_with_text=pages_with_text,
                ocr_confidence_avg=None,
                ocr_lines_count=0,
                text_length=len(joined_text),
            )

        ocr_parts: list[str] = []
        confidence_values: list[float] = []
        ocr_lines_count = 0
        pages_with_text = 0
        for page in document:
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image_bytes = pixmap.tobytes("png")
            ocr_result = self._ocr_image_bytes(image_bytes)
            if ocr_result["text"]:
                ocr_parts.append(ocr_result["text"])
                pages_with_text += 1
            confidence_values.extend(ocr_result["confidences"])
            ocr_lines_count += ocr_result["lines_count"]

        joined_ocr = "\n".join(part for part in ocr_parts if part).strip()
        if not joined_ocr:
            raise OCRNoTextError(
                "El OCR no pudo extraer texto del PDF escaneado."
            )
        return ExtractedDocument(
            source_type="pdf",
            extraction_method="easyocr_pdf_scan",
            text=joined_ocr,
            page_count=document.page_count,
            legible=self._is_legible(
                text=joined_ocr,
                confidence_values=confidence_values,
                lines_count=ocr_lines_count,
            ),
            has_embedded_text=False,
            pages_with_text=pages_with_text,
            ocr_confidence_avg=self._average_confidence(confidence_values),
            ocr_lines_count=ocr_lines_count,
            text_length=len(joined_ocr),
        )

    def _extraer_imagen(self, file_bytes: bytes) -> ExtractedDocument:
        ocr_result = self._ocr_image_bytes(file_bytes)
        if not ocr_result["text"]:
            raise OCRNoTextError(
                "El OCR no pudo extraer texto de la imagen proporcionada."
            )
        return ExtractedDocument(
            source_type="image",
            extraction_method="easyocr_image",
            text=ocr_result["text"],
            page_count=1,
            legible=self._is_legible(
                text=ocr_result["text"],
                confidence_values=ocr_result["confidences"],
                lines_count=ocr_result["lines_count"],
            ),
            has_embedded_text=False,
            pages_with_text=1 if ocr_result["text"] else 0,
            ocr_confidence_avg=self._average_confidence(ocr_result["confidences"]),
            ocr_lines_count=ocr_result["lines_count"],
            text_length=len(ocr_result["text"]),
        )

    def _ocr_image_bytes(self, file_bytes: bytes) -> dict:
        try:
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        except Exception as exc:
            raise InvalidFileError(
                "El archivo no pudo interpretarse como imagen valida."
            ) from exc
        img_array = np.array(image)
        try:
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(self._ocr.readtext, img_array)
                result = future.result(timeout=self._ocr_timeout_seconds)
        except FuturesTimeoutError as exc:
            raise ServiceTimeoutError(
                "El servicio OCR excedio el tiempo maximo de procesamiento."
            ) from exc
        lines: list[str] = []
        confidences: list[float] = []
        for item in result:
            text = str(item[1]).strip()
            confidence = float(item[2]) if len(item) > 2 else 0.0
            if text:
                lines.append(text)
                confidences.append(confidence)
        return {
            "text": "\n".join(lines).strip(),
            "confidences": confidences,
            "lines_count": len(lines),
        }

    @staticmethod
    def _average_confidence(confidence_values: list[float]) -> float | None:
        if not confidence_values:
            return None
        return round(sum(confidence_values) / len(confidence_values), 4)

    def _is_legible(
        self,
        text: str,
        confidence_values: list[float],
        lines_count: int,
    ) -> bool:
        if len(text) < 20 or lines_count == 0:
            return False
        average_confidence = self._average_confidence(confidence_values)
        if average_confidence is None:
            return len(text) >= 20
        return average_confidence >= 0.55 and len(text) >= 20
