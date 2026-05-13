from __future__ import annotations

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.schemas import TramiteQuerySchema, TramitesResponseSchema
from app.use_cases import UseCaseError
from app.use_cases.obtener_tramites_uc import ObtenerTramitesUC


def create_tramites_blueprint(obtener_tramites_uc: ObtenerTramitesUC) -> Blueprint:
    blueprint = Blueprint("tramites", __name__)
    query_schema = TramiteQuerySchema()
    response_schema = TramitesResponseSchema()

    @blueprint.get("/tramites")
    def obtener_tramites():
        try:
            payload = query_schema.load(request.args.to_dict())
            result = obtener_tramites_uc.ejecutar(**payload)
            return jsonify(response_schema.dump(result)), 200
        except ValidationError as exc:
            return jsonify({"error": exc.messages}), 400
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al consultar tramites."}), 500

    @blueprint.get("/tramites/<int:programa_id>")
    def obtener_tramite(programa_id: int):
        try:
            result = obtener_tramites_uc.obtener_por_id(programa_id)
            return jsonify(result), 200
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al consultar el tramite."}), 500

    return blueprint
