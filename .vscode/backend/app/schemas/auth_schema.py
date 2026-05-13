from __future__ import annotations

from marshmallow import Schema, fields


class UsuarioResponseSchema(Schema):
    uid = fields.Str(required=True)
    email = fields.Str(required=False, allow_none=True)
    nombre = fields.Str(required=False, allow_none=True)
    rol = fields.Str(required=True)
    activo = fields.Bool(required=True)
    created_at = fields.Str(required=True)
    last_login_at = fields.Str(required=True)
