from __future__ import annotations

from flask import Blueprint, g, jsonify, request
from marshmallow import ValidationError, Schema, fields

from app.api.auth_guard import require_role
from app.use_cases import UseCaseError
from app.repositories.validacion_repository import ValidacionRepository


class ValidarDocumentoAdminSchema(Schema):
    decision = fields.Str(required=True)
    comentario = fields.Str(missing="")


def create_documentos_admin_blueprint(
    validacion_repository: ValidacionRepository,
) -> Blueprint:
    blueprint = Blueprint("documentos_admin", __name__)
    validar_schema = ValidarDocumentoAdminSchema()

    @blueprint.get("/admin/documentos")
    @require_role("admin")
    def listar_documentos():
        """Lista todos los documentos con filtro opcional por estado"""
        try:
            estado = request.args.get("estado")
            documentos = validacion_repository.obtener_todas_validaciones(estado=estado)
            return jsonify({"data": documentos}), 200
        except Exception as e:
            print(f"Error al listar documentos: {e}")
            return jsonify({"error": "Error interno al consultar documentos."}), 500

    @blueprint.get("/admin/documentos/<string:documento_id>")
    @require_role("admin")
    def obtener_documento(documento_id: str):
        """Obtiene un documento específico por ID"""
        try:
            documento = validacion_repository.obtener_validacion_por_id(documento_id)
            if not documento:
                return jsonify({"error": "Documento no encontrado"}), 404
            return jsonify({"data": documento}), 200
        except Exception as e:
            print(f"Error al obtener documento: {e}")
            return jsonify({"error": "Error interno al consultar el documento."}), 500

    @blueprint.post("/admin/documentos/<string:documento_id>/validar")
    @require_role("admin")
    def validar_documento(documento_id: str):
        """Valida (aprueba o rechaza) un documento"""
        try:
            payload = validar_schema.load(request.get_json(silent=True) or {})
            decision = payload["decision"]
            comentario = payload.get("comentario", "")
            
            if decision not in ["aprobado", "rechazado"]:
                return jsonify({"error": "Decisión inválida. Debe ser 'aprobado' o 'rechazado'"}), 400
            
            admin_uid = str(g.current_user["uid"])
            resultado = validacion_repository.actualizar_estado_validacion(
                documento_id=documento_id,
                estado=decision,
                validado_por=admin_uid,
                comentario=comentario
            )
            
            if not resultado:
                return jsonify({"error": "Documento no encontrado"}), 404
                
            return jsonify({"data": resultado, "message": f"Documento {decision} exitosamente"}), 200
        except ValidationError as exc:
            return jsonify({"error": exc.messages}), 400
        except Exception as e:
            print(f"Error al validar documento: {e}")
            return jsonify({"error": "Error interno al validar el documento."}), 500

    @blueprint.get("/admin/documentos/estadisticas")
    @require_role("admin")
    def obtener_estadisticas():
        """Obtiene estadísticas de documentos"""
        try:
            stats = validacion_repository.obtener_estadisticas()
            return jsonify({"data": stats}), 200
        except Exception as e:
            print(f"Error al obtener estadísticas: {e}")
            return jsonify({"error": "Error interno al consultar estadísticas."}), 500

    return blueprint
