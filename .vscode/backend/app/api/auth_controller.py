from __future__ import annotations

from flask import Blueprint, g, jsonify

from app.api.auth_guard import require_auth
from app.schemas import UsuarioResponseSchema
from app.use_cases import UseCaseError
from app.use_cases.sincronizar_usuario_uc import SincronizarUsuarioUC


def create_auth_blueprint(sincronizar_usuario_uc: SincronizarUsuarioUC) -> Blueprint:
    blueprint = Blueprint("auth", __name__)
    response_schema = UsuarioResponseSchema()

    @blueprint.get("/auth/me")
    @require_auth
    def me():
        try:
            result = sincronizar_usuario_uc.ejecutar(g.current_user)
            return jsonify(response_schema.dump(result)), 200
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al sincronizar el usuario."}), 500

    return blueprint
