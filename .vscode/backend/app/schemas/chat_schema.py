from __future__ import annotations

from marshmallow import Schema, fields, validate


class PerfilUsuarioSchema(Schema):
    edad = fields.Int(required=False, allow_none=True, strict=True)
    municipio = fields.Str(required=False, allow_none=True)


class ChatRequestSchema(Schema):
    sesion_id = fields.Str(required=True, validate=validate.Length(min=1))
    mensaje = fields.Str(required=True, validate=validate.Length(min=1))
    perfil_usuario = fields.Nested(PerfilUsuarioSchema, required=True)


class ChatResponseSchema(Schema):
    respuesta = fields.Str(required=True)
    programas_relacionados = fields.List(fields.Str(), required=True)
