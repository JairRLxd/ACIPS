from __future__ import annotations

from flask import Blueprint, g, jsonify, request
from marshmallow import ValidationError

from app.api.auth_guard import require_auth, require_role
from app.schemas import (
    CrearTramiteVirtualSchema,
    RevisarTramiteVirtualSchema,
    TramiteVirtualResponseSchema,
    TramitesVirtualesResponseSchema,
)
from app.use_cases import UseCaseError
from app.use_cases.crear_tramite_virtual_uc import CrearTramiteVirtualUC
from app.use_cases.listar_tramites_virtuales_uc import ListarTramitesVirtualesUC
from app.use_cases.revisar_tramite_virtual_uc import RevisarTramiteVirtualUC


def create_tramite_virtual_blueprint(
    crear_tramite_virtual_uc: CrearTramiteVirtualUC,
    listar_tramites_virtuales_uc: ListarTramitesVirtualesUC,
    revisar_tramite_virtual_uc: RevisarTramiteVirtualUC,
) -> Blueprint:
    blueprint = Blueprint("tramites_virtuales", __name__)
    create_schema = CrearTramiteVirtualSchema()
    review_schema = RevisarTramiteVirtualSchema()
    response_schema = TramiteVirtualResponseSchema()
    list_schema = TramitesVirtualesResponseSchema()

    @blueprint.post("/tramites-virtuales")
    @require_auth
    def crear_tramite_virtual():
        try:
            payload = create_schema.load(request.get_json(silent=True) or {})
            result = crear_tramite_virtual_uc.ejecutar(
                usuario_uid=str(g.current_user["uid"]),
                **payload,
            )
            return jsonify(response_schema.dump(result)), 201
        except ValidationError as exc:
            return jsonify({"error": exc.messages}), 400
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al crear el tramite virtual."}), 500

    @blueprint.get("/tramites-virtuales/mis-solicitudes")
    @require_auth
    def listar_mios():
        try:
            result = listar_tramites_virtuales_uc.listar_mios(str(g.current_user["uid"]))
            return jsonify(list_schema.dump(result)), 200
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al consultar las solicitudes."}), 500

    @blueprint.get("/admin/tramites-virtuales")
    @require_role("admin")
    def listar_para_admin():
        try:
            estado = request.args.get("estado")
            result = listar_tramites_virtuales_uc.listar_para_admin(estado=estado)
            return jsonify(list_schema.dump(result)), 200
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al consultar expedientes administrativos."}), 500

    @blueprint.post("/admin/tramites-virtuales/<string:expediente_id>/revision")
    @require_role("admin")
    def revisar_tramite_virtual(expediente_id: str):
        try:
            payload = review_schema.load(request.get_json(silent=True) or {})
            result = revisar_tramite_virtual_uc.ejecutar(
                expediente_id=expediente_id,
                admin_uid=str(g.current_user["uid"]),
                **payload,
            )
            return jsonify(response_schema.dump(result)), 200
        except ValidationError as exc:
            return jsonify({"error": exc.messages}), 400
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al revisar el tramite virtual."}), 500

    return blueprint
