from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class DocumentClassification:
    detected_type: str
    confidence_score: float
    matched_signals: list[str]
    candidate_scores: dict[str, float]


class DocumentClassificationService:
    CURP_PATTERN = re.compile(
        r"\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b"
    )
    RFC_PATTERN = re.compile(r"\b[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}\b")

    def __init__(self) -> None:
        self._signal_map: dict[str, tuple[str, ...]] = {
            "ine": (
                "instituto nacional electoral",
                "credencial para votar",
                "clave de elector",
                "vigencia",
            ),
            "curp": (
                "clave unica de registro de poblacion",
                "curp",
                "fecha de nacimiento",
                "sexo",
            ),
            "acta_certificada": (
                "acta de nacimiento",
                "registro civil",
                "copia certificada",
                "folio",
                "cadena digital",
            ),
            "comprobante_domicilio": (
                "domicilio",
                "direccion",
                "total a pagar",
                "servicio",
                "comision federal de electricidad",
                "agua",
                "predial",
                "telmex",
            ),
            "constancia_situacion_fiscal": (
                "constancia de situacion fiscal",
                "cedula de identificacion fiscal",
                "registro federal de contribuyentes",
                "sat",
            ),
        }

    def clasificar(self, texto_extraido: str) -> DocumentClassification:
        text = texto_extraido.lower().strip()
        candidate_scores: dict[str, float] = {}
        matched_by_type: dict[str, list[str]] = {}

        for document_type, signals in self._signal_map.items():
            matched_signals = [signal for signal in signals if signal in text]
            score = float(len(matched_signals))
            if document_type == "curp" and self.CURP_PATTERN.search(text.upper()):
                score += 2.5
                matched_signals.append("regex_curp")
            if document_type == "constancia_situacion_fiscal" and self.RFC_PATTERN.search(
                text.upper()
            ):
                score += 2.0
                matched_signals.append("regex_rfc")
            candidate_scores[document_type] = round(score, 2)
            matched_by_type[document_type] = matched_signals

        best_type = "desconocido"
        best_score = 0.0
        for document_type, score in candidate_scores.items():
            if score > best_score:
                best_type = document_type
                best_score = score

        if best_score <= 0:
            return DocumentClassification(
                detected_type="desconocido",
                confidence_score=0.0,
                matched_signals=[],
                candidate_scores=candidate_scores,
            )

        total_reference = max(len(self._signal_map.get(best_type, ())), 1) + 2.5
        confidence = min(best_score / total_reference, 1.0)
        return DocumentClassification(
            detected_type=best_type,
            confidence_score=round(confidence, 4),
            matched_signals=matched_by_type[best_type],
            candidate_scores=candidate_scores,
        )
