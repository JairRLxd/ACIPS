from __future__ import annotations

from app.core.models import Validacion
from app.repositories import ValidacionRepository
from app.services import (
    DocumentClassificationService,
    DocumentExtractionService,
    DocumentRulesService,
)
from app.use_cases import (
    ConfigurationError,
    DataAccessError,
    DocumentNotIdentifiedError,
    ExternalServiceError,
    UseCaseError,
)


class ValidarDocumentoUC:
    def __init__(
        self,
        document_classification_service: DocumentClassificationService,
        document_extraction_service: DocumentExtractionService,
        document_rules_service: DocumentRulesService,
        validacion_repository: ValidacionRepository,
    ) -> None:
        self._document_classification_service = document_classification_service
        self._document_extraction_service = document_extraction_service
        self._document_rules_service = document_rules_service
        self._validacion_repository = validacion_repository

    def ejecutar(
        self,
        sesion_id: str,
        requisito_id: int,
        tipo_esperado: str,
        archivo_base64: str,
        mime_type: str | None = None,
    ) -> dict:
        try:
            extracted_document = self._document_extraction_service.extraer_desde_base64(
                archivo_base64=archivo_base64,
                mime_type=mime_type,
            )
            classification = self._document_classification_service.clasificar(
                extracted_document.text
            )
            if classification.detected_type == "desconocido":
                raise DocumentNotIdentifiedError(
                    "No fue posible identificar si el archivo corresponde a INE, CURP, acta, comprobante o constancia fiscal."
                )
            resultado = self._document_rules_service.validar_documento(
                tipo_esperado=tipo_esperado,
                tipo_detectado=classification.detected_type,
                texto_extraido=extracted_document.text,
                legible=extracted_document.legible,
                medio_extraccion=extracted_document.extraction_method,
                tipo_archivo=extracted_document.source_type,
                metadatos_extraccion={
                    "has_embedded_text": extracted_document.has_embedded_text,
                    "pages_with_text": extracted_document.pages_with_text,
                    "ocr_confidence_avg": extracted_document.ocr_confidence_avg,
                    "ocr_lines_count": extracted_document.ocr_lines_count,
                    "text_length": extracted_document.text_length,
                    "classification_confidence": classification.confidence_score,
                },
            )
        except ValueError as exc:
            raise ConfigurationError(str(exc)) from exc
        except UseCaseError:
            raise
        except Exception as exc:
            raise ExternalServiceError(
                "No fue posible extraer o validar el documento con el stack OCR configurado."
            ) from exc

        validacion = Validacion(
            sesion_id=sesion_id,
            requisito_id=requisito_id,
            tipo_esperado=tipo_esperado,
            tipo_detectado=str(resultado["tipo_detectado"]),
            tipo_archivo=extracted_document.source_type,
            es_correcto=bool(resultado["es_correcto"]),
            legible=bool(resultado["legible"]),
            vigente=bool(resultado["vigente"]),
            requiere_revision=bool(resultado["requiere_revision"]),
            observacion=str(resultado["observacion"]),
            errores_detectados=list(resultado["errores_detectados"]),
            medio_extraccion=extracted_document.extraction_method,
            archivo_base64=archivo_base64,
            texto_extraido=extracted_document.text[:5000],
            has_embedded_text=extracted_document.has_embedded_text,
            pages_with_text=extracted_document.pages_with_text,
            ocr_confidence_avg=extracted_document.ocr_confidence_avg,
            ocr_lines_count=extracted_document.ocr_lines_count,
            text_length=extracted_document.text_length,
        )

        try:
            self._validacion_repository.guardar_validacion(validacion)
        except Exception as exc:
            raise DataAccessError(
                "No fue posible guardar la validacion del documento."
            ) from exc

        return {
            "es_correcto": validacion.es_correcto,
            "legible": validacion.legible,
            "vigente": validacion.vigente,
            "requiere_revision": validacion.requiere_revision,
            "tipo_detectado": validacion.tipo_detectado,
            "medio_extraccion": validacion.medio_extraccion,
            "observacion": validacion.observacion,
            "errores_detectados": validacion.errores_detectados,
            "campos_esperados": resultado["campos_esperados"],
            "campos_faltantes": resultado["campos_faltantes"],
            "senales_detectadas": resultado["senales_detectadas"],
            "causas_rechazo": resultado["causas_rechazo"],
            "causas_revision_manual": resultado["causas_revision_manual"],
            "mensaje_correccion": resultado["mensaje_correccion"],
            "has_embedded_text": validacion.has_embedded_text,
            "pages_with_text": validacion.pages_with_text,
            "ocr_confidence_avg": validacion.ocr_confidence_avg,
            "ocr_lines_count": validacion.ocr_lines_count,
            "text_length": validacion.text_length,
            "classification_confidence": classification.confidence_score,
            "classification_signals": classification.matched_signals,
            "classification_candidates": classification.candidate_scores,
        }
