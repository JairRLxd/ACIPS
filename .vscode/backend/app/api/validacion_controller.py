from __future__ import annotations

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.api.auth_guard import require_auth
from app.schemas import ValidacionDocumentoSchema, ValidacionRespuestaSchema
from app.use_cases import (
    CorruptedPdfError,
    DocumentNotIdentifiedError,
    InvalidFileError,
    OCRNoTextError,
    ServiceTimeoutError,
    UseCaseError,
)
from app.use_cases.validar_documento_uc import ValidarDocumentoUC


def create_validacion_blueprint(validar_documento_uc: ValidarDocumentoUC) -> Blueprint:
    blueprint = Blueprint("validacion", __name__)
    request_schema = ValidacionDocumentoSchema()
    response_schema = ValidacionRespuestaSchema()

    @blueprint.post("/validar-documento")
    @require_auth
    def validar_documento():
        try:
            payload = request_schema.load(request.get_json(silent=True) or {})
            result = validar_documento_uc.ejecutar(**payload)
            return jsonify(response_schema.dump(result)), 200
        except ValidationError as exc:
            return jsonify({"error": exc.messages}), 400
        except InvalidFileError as exc:
            return jsonify({"error": str(exc)}), 400
        except CorruptedPdfError as exc:
            return jsonify({"error": str(exc)}), 422
        except OCRNoTextError as exc:
            return jsonify({"error": str(exc)}), 422
        except DocumentNotIdentifiedError as exc:
            return jsonify({"error": str(exc)}), 422
        except ServiceTimeoutError as exc:
            return jsonify({"error": str(exc)}), 504
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al validar el documento."}), 500

    return blueprint
