from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class DocumentRuleProfile:
    document_type: str
    expected_fields: tuple[str, ...]
    textual_signals: tuple[str, ...]
    rejection_rules: tuple[str, ...]
    manual_review_rules: tuple[str, ...]
    correction_hints: tuple[str, ...]


class DocumentRulesService:
    CURP_PATTERN = re.compile(
        r"\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b"
    )
    RFC_PATTERN = re.compile(r"\b[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}\b")
    DATE_PATTERN = re.compile(r"\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})\b")
    YEAR_PATTERN = re.compile(r"\b(20\d{2})\b")
    ZIP_PATTERN = re.compile(r"\b\d{5}\b")

    def __init__(self) -> None:
        self._profiles: dict[str, DocumentRuleProfile] = {
            "ine": DocumentRuleProfile(
                document_type="ine",
                expected_fields=("nombre", "curp", "clave_elector", "vigencia"),
                textual_signals=(
                    "instituto nacional electoral",
                    "credencial para votar",
                    "clave de elector",
                    "vigencia",
                ),
                rejection_rules=(
                    "No coincide con una credencial INE.",
                    "La vigencia detectada ya expiro.",
                    "No se detecto la CURP ni la clave de elector.",
                ),
                manual_review_rules=(
                    "Falta alguno de los campos minimos.",
                    "La vigencia no pudo leerse con claridad.",
                    "La captura parece incompleta o con OCR insuficiente.",
                ),
                correction_hints=(
                    "Sube una foto frontal completa de la INE.",
                    "Asegurate de que se vea la vigencia y la clave de elector.",
                    "Evita sombras, recortes y desenfoque.",
                ),
            ),
            "curp": DocumentRuleProfile(
                document_type="curp",
                expected_fields=("curp", "nombre", "fecha_nacimiento", "sexo"),
                textual_signals=(
                    "clave unica de registro de poblacion",
                    "curp",
                    "fecha de nacimiento",
                    "sexo",
                ),
                rejection_rules=(
                    "No se detecto una CURP en formato valido.",
                    "No coincide con el formato oficial esperado.",
                ),
                manual_review_rules=(
                    "No se pudo leer nombre o fecha de nacimiento.",
                    "El OCR recupero texto insuficiente.",
                ),
                correction_hints=(
                    "Descarga o imprime nuevamente la CURP oficial.",
                    "Sube el documento completo y con buena resolucion.",
                ),
            ),
            "acta_certificada": DocumentRuleProfile(
                document_type="acta_certificada",
                expected_fields=("nombre", "fecha_registro", "folio", "certificacion"),
                textual_signals=(
                    "acta de nacimiento",
                    "registro civil",
                    "copia certificada",
                    "folio",
                    "cadena digital",
                ),
                rejection_rules=(
                    "No parece un acta de nacimiento.",
                    "No se detectaron senales suficientes de certificacion.",
                ),
                manual_review_rules=(
                    "No se leyo folio o cadena digital.",
                    "El OCR no permite confirmar si es certificada.",
                ),
                correction_hints=(
                    "Sube una copia certificada donde se vea folio o cadena digital.",
                    "Asegurate de capturar el documento completo, incluyendo sellos o QR.",
                ),
            ),
            "comprobante_domicilio": DocumentRuleProfile(
                document_type="comprobante_domicilio",
                expected_fields=("domicilio", "fecha", "emisor"),
                textual_signals=(
                    "domicilio",
                    "direccion",
                    "total a pagar",
                    "servicio",
                    "comision federal de electricidad",
                    "agua",
                    "predial",
                ),
                rejection_rules=(
                    "No parece un comprobante de domicilio.",
                    "No se detecto una fecha utilizable.",
                ),
                manual_review_rules=(
                    "No se pudo confirmar el domicilio.",
                    "No es posible verificar si el comprobante esta reciente.",
                ),
                correction_hints=(
                    "Sube un recibo reciente y completamente visible.",
                    "Asegurate de que se vea la direccion y la fecha de emision.",
                ),
            ),
            "constancia_situacion_fiscal": DocumentRuleProfile(
                document_type="constancia_situacion_fiscal",
                expected_fields=("rfc", "nombre", "sat", "cedula_fiscal"),
                textual_signals=(
                    "constancia de situacion fiscal",
                    "cedula de identificacion fiscal",
                    "registro federal de contribuyentes",
                    "sat",
                ),
                rejection_rules=(
                    "No parece una constancia de situacion fiscal.",
                    "No se detecto RFC en formato valido.",
                ),
                manual_review_rules=(
                    "No se pudo leer el nombre o el RFC con claridad.",
                    "Faltan referencias claras al SAT.",
                ),
                correction_hints=(
                    "Descarga la constancia actual desde el portal del SAT.",
                    "Sube el PDF original o una imagen donde se vea el RFC completo.",
                ),
            ),
        }

    def validar_documento(
        self,
        tipo_esperado: str,
        tipo_detectado: str,
        texto_extraido: str,
        legible: bool,
        medio_extraccion: str,
        tipo_archivo: str,
        metadatos_extraccion: dict | None = None,
    ) -> dict:
        texto = self._normalize_text(texto_extraido)
        tipo_esperado_normalizado = self._normalize_document_type(tipo_esperado)
        tipo_detectado_normalizado = self._normalize_document_type(tipo_detectado)
        profile = self._profiles.get(tipo_esperado_normalizado)
        extraction_metadata = metadatos_extraccion or {}

        rejection_reasons: list[str] = []
        manual_review_reasons: list[str] = []
        missing_fields: list[str] = []
        detected_signals: list[str] = []
        error_messages: list[str] = []
        correction_message = "Se requiere una nueva revision del documento."
        vigente = True

        if profile is None:
            error_messages.append(
                "No existen reglas especificas para este tipo; se requiere revision manual."
            )
            return {
                "tipo_detectado": tipo_detectado_normalizado,
                "es_correcto": False,
                "legible": legible,
                "vigente": True,
                "requiere_revision": True,
                "observacion": self._build_observation(
                    tipo_detectado=tipo_detectado_normalizado,
                    medio_extraccion=medio_extraccion,
                    tipo_archivo=tipo_archivo,
                    errores=error_messages,
                ),
                "errores_detectados": error_messages,
                "campos_esperados": [],
                "campos_faltantes": [],
                "senales_detectadas": [],
                "causas_rechazo": [],
                "causas_revision_manual": error_messages,
                "mensaje_correccion": correction_message,
            }

        if not legible or len(texto) < 20:
            manual_review_reasons.append("No se pudo extraer suficiente texto del archivo.")
        if extraction_metadata.get("ocr_confidence_avg") is not None and float(
            extraction_metadata["ocr_confidence_avg"]
        ) < 0.6:
            manual_review_reasons.append(
                "La confianza promedio del OCR es baja para una validacion automatica confiable."
            )
        if int(extraction_metadata.get("pages_with_text", 0)) == 0:
            manual_review_reasons.append(
                "No se detectaron paginas con texto utilizable en el archivo."
            )

        if tipo_detectado_normalizado != tipo_esperado_normalizado:
            rejection_reasons.append(
                f"El documento detectado parece ser '{tipo_detectado_normalizado}' y no '{tipo_esperado_normalizado}'."
            )

        field_validation = self._validate_fields(tipo_esperado_normalizado, texto)
        missing_fields.extend(field_validation["missing_fields"])
        detected_signals.extend(self._collect_detected_signals(profile, texto))
        rejection_reasons.extend(field_validation["rejection_reasons"])
        manual_review_reasons.extend(field_validation["manual_review_reasons"])
        vigente = bool(field_validation["vigente"])

        if missing_fields:
            manual_review_reasons.append(
                f"Faltan campos esperados: {', '.join(sorted(set(missing_fields)))}."
            )

        if not vigente:
            rejection_reasons.append("El documento no parece vigente segun las reglas configuradas.")

        correction_message = self._build_correction_message(
            profile=profile,
            rejection_reasons=rejection_reasons,
            manual_review_reasons=manual_review_reasons,
            missing_fields=missing_fields,
        )

        error_messages.extend(rejection_reasons)
        error_messages.extend(reason for reason in manual_review_reasons if reason not in error_messages)

        requires_review = bool(manual_review_reasons) or not legible
        is_correct = (
            tipo_detectado_normalizado == tipo_esperado_normalizado
            and legible
            and vigente
            and not rejection_reasons
        )

        return {
            "tipo_detectado": tipo_detectado_normalizado,
            "es_correcto": is_correct,
            "legible": legible,
            "vigente": vigente,
            "requiere_revision": requires_review or not is_correct,
            "observacion": self._build_observation(
                tipo_detectado=tipo_detectado_normalizado,
                medio_extraccion=medio_extraccion,
                tipo_archivo=tipo_archivo,
                errores=error_messages,
            ),
            "errores_detectados": error_messages,
            "campos_esperados": list(profile.expected_fields),
            "campos_faltantes": sorted(set(missing_fields)),
            "senales_detectadas": sorted(set(detected_signals)),
            "causas_rechazo": sorted(set(rejection_reasons)),
            "causas_revision_manual": sorted(set(manual_review_reasons)),
            "mensaje_correccion": correction_message,
        }

    def _validate_fields(self, document_type: str, text: str) -> dict:
        return {
            "ine": self._validate_ine_fields,
            "curp": self._validate_curp_fields,
            "acta_certificada": self._validate_acta_fields,
            "comprobante_domicilio": self._validate_comprobante_fields,
            "constancia_situacion_fiscal": self._validate_constancia_fiscal_fields,
        }[document_type](text)

    def _validate_ine_fields(self, text: str) -> dict:
        missing_fields: list[str] = []
        rejection_reasons: list[str] = []
        manual_review_reasons: list[str] = []

        if self.CURP_PATTERN.search(text.upper()) is None:
            missing_fields.append("curp")
        if "clave de elector" not in text:
            missing_fields.append("clave_elector")
        if "vigencia" not in text:
            missing_fields.append("vigencia")

        vigencia_year = self._extract_vigencia_year(text)
        vigente = True
        if vigencia_year is not None:
            vigente = vigencia_year >= datetime.now().year
        else:
            manual_review_reasons.append("No se pudo leer con claridad la vigencia de la INE.")

        if "instituto nacional electoral" not in text and "credencial para votar" not in text:
            rejection_reasons.append("No se detectaron encabezados propios de una INE oficial.")

        return {
            "missing_fields": missing_fields,
            "rejection_reasons": rejection_reasons,
            "manual_review_reasons": manual_review_reasons,
            "vigente": vigente,
        }

    def _validate_curp_fields(self, text: str) -> dict:
        missing_fields: list[str] = []
        rejection_reasons: list[str] = []
        manual_review_reasons: list[str] = []

        if self.CURP_PATTERN.search(text.upper()) is None:
            rejection_reasons.append("No se detecto una CURP en formato oficial.")
            missing_fields.append("curp")
        if "fecha de nacimiento" not in text:
            missing_fields.append("fecha_nacimiento")
        if "sexo" not in text:
            missing_fields.append("sexo")
        if "nombre" not in text:
            manual_review_reasons.append("No se pudo confirmar el nombre completo en la CURP.")

        return {
            "missing_fields": missing_fields,
            "rejection_reasons": rejection_reasons,
            "manual_review_reasons": manual_review_reasons,
            "vigente": True,
        }

    def _validate_acta_fields(self, text: str) -> dict:
        missing_fields: list[str] = []
        rejection_reasons: list[str] = []
        manual_review_reasons: list[str] = []

        certification_signals = ("copia certificada", "cadena digital", "codigo qr", "folio")
        if not any(signal in text for signal in certification_signals):
            rejection_reasons.append(
                "No se encontraron senales suficientes de certificacion en el acta."
            )
            missing_fields.append("certificacion")
        if "folio" not in text:
            missing_fields.append("folio")
        if "registro civil" not in text:
            missing_fields.append("fecha_registro")
            manual_review_reasons.append(
                "No se pudo confirmar con claridad el registro civil o la fecha de registro."
            )

        return {
            "missing_fields": missing_fields,
            "rejection_reasons": rejection_reasons,
            "manual_review_reasons": manual_review_reasons,
            "vigente": True,
        }

    def _validate_comprobante_fields(self, text: str) -> dict:
        missing_fields: list[str] = []
        rejection_reasons: list[str] = []
        manual_review_reasons: list[str] = []

        has_emitter = any(
            emitter in text
            for emitter in (
                "comision federal de electricidad",
                "cfe",
                "agua",
                "predial",
                "telmex",
                "servicio",
            )
        )
        if not has_emitter:
            rejection_reasons.append("No se detecto un emisor comun de comprobante de domicilio.")
            missing_fields.append("emisor")

        if self.DATE_PATTERN.search(text) is None:
            rejection_reasons.append("No se detecto una fecha utilizable en el comprobante.")
            missing_fields.append("fecha")

        if "domicilio" not in text and "direccion" not in text and self.ZIP_PATTERN.search(text) is None:
            manual_review_reasons.append("No se pudo confirmar el domicilio completo del comprobante.")
            missing_fields.append("domicilio")

        return {
            "missing_fields": missing_fields,
            "rejection_reasons": rejection_reasons,
            "manual_review_reasons": manual_review_reasons,
            "vigente": True,
        }

    def _validate_constancia_fiscal_fields(self, text: str) -> dict:
        missing_fields: list[str] = []
        rejection_reasons: list[str] = []
        manual_review_reasons: list[str] = []

        if (
            "constancia de situacion fiscal" not in text
            and "cedula de identificacion fiscal" not in text
        ):
            rejection_reasons.append(
                "No se detecto el encabezado esperado de constancia de situacion fiscal."
            )
            missing_fields.append("cedula_fiscal")
        if self.RFC_PATTERN.search(text.upper()) is None:
            rejection_reasons.append("No se detecto un RFC con formato valido.")
            missing_fields.append("rfc")
        if "sat" not in text and "servicio de administracion tributaria" not in text:
            manual_review_reasons.append("Faltan referencias claras al SAT en el documento.")
            missing_fields.append("sat")
        if "nombre" not in text and "denominacion" not in text:
            manual_review_reasons.append("No se pudo confirmar el nombre o denominacion fiscal.")
            missing_fields.append("nombre")

        return {
            "missing_fields": missing_fields,
            "rejection_reasons": rejection_reasons,
            "manual_review_reasons": manual_review_reasons,
            "vigente": True,
        }

    @staticmethod
    def _normalize_text(value: str) -> str:
        return value.lower().strip()

    @staticmethod
    def _normalize_document_type(value: str) -> str:
        normalized = value.lower().strip()
        aliases = {
            "desconocido": "desconocido",
            "otro": "desconocido",
            "otro/no identificado": "desconocido",
            "ine vigente mexicana": "ine",
            "credencial para votar": "ine",
            "curp": "curp",
            "curp impresa": "curp",
            "acta de nacimiento certificada": "acta_certificada",
            "acta certificada": "acta_certificada",
            "comprobante de domicilio": "comprobante_domicilio",
            "rfc": "constancia_situacion_fiscal",
            "constancia fiscal": "constancia_situacion_fiscal",
            "constancia de situacion fiscal": "constancia_situacion_fiscal",
        }
        return aliases.get(normalized, normalized.replace(" ", "_"))

    @staticmethod
    def _collect_detected_signals(profile: DocumentRuleProfile, text: str) -> list[str]:
        return [signal for signal in profile.textual_signals if signal in text]

    @staticmethod
    def _extract_vigencia_year(text: str) -> int | None:
        if "vigencia" not in text:
            return None
        match = re.search(r"vigencia\D{0,8}(20\d{2})", text)
        if match:
            return int(match.group(1))
        years = [int(item) for item in re.findall(r"\b20\d{2}\b", text)]
        return max(years) if years else None

    @staticmethod
    def _build_correction_message(
        profile: DocumentRuleProfile,
        rejection_reasons: list[str],
        manual_review_reasons: list[str],
        missing_fields: list[str],
    ) -> str:
        if rejection_reasons:
            return f"{profile.correction_hints[0]} Motivo principal: {rejection_reasons[0]}"
        if missing_fields:
            return (
                f"Completa o mejora la captura de estos campos: {', '.join(sorted(set(missing_fields)))}. "
                f"{profile.correction_hints[0]}"
            )
        if manual_review_reasons:
            return f"{profile.correction_hints[-1]} Observacion: {manual_review_reasons[0]}"
        return profile.correction_hints[0]

    @staticmethod
    def _build_observation(
        tipo_detectado: str,
        medio_extraccion: str,
        tipo_archivo: str,
        errores: list[str],
    ) -> str:
        if not errores:
            return (
                f"Documento validado correctamente como '{tipo_detectado}' "
                f"usando {medio_extraccion} sobre archivo {tipo_archivo}."
            )
        motivos = "; ".join(errores[:3])
        return (
            f"Resultado preliminar para '{tipo_detectado}' usando {medio_extraccion}: "
            f"{motivos}"
        )
