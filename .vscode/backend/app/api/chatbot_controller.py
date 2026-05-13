from __future__ import annotations

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.api.auth_guard import require_auth
from app.schemas import ChatRequestSchema, ChatResponseSchema
from app.use_cases import UseCaseError
from app.use_cases.procesar_chat_uc import ProcesarChatUC


def create_chatbot_blueprint(procesar_chat_uc: ProcesarChatUC) -> Blueprint:
    blueprint = Blueprint("chatbot", __name__)
    request_schema = ChatRequestSchema()
    response_schema = ChatResponseSchema()

    @blueprint.post("/chat")
    @require_auth
    def procesar_chat():
        try:
            payload = request_schema.load(request.get_json(silent=True) or {})
            result = procesar_chat_uc.ejecutar(**payload)
            return jsonify(response_schema.dump(result)), 200
        except ValidationError as exc:
            return jsonify({"error": exc.messages}), 400
        except UseCaseError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception:
            return jsonify({"error": "Error interno al procesar el chat."}), 500

    return blueprint
