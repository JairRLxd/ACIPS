from __future__ import annotations

from marshmallow import Schema, fields


class TramiteQuerySchema(Schema):
    tipo = fields.Str(required=False, allow_none=True)
    estado = fields.Str(required=False, allow_none=True)
    situacion = fields.Str(required=False, allow_none=True)


class TramiteItemSchema(Schema):
    id = fields.Int(required=True)
    nombre = fields.Str(required=True)
    requisitos = fields.Dict(required=True)
    documentos_requeridos = fields.List(fields.Dict(), required=True)
    monto = fields.Str(required=True)
    dependencia = fields.Str(required=True)


class TramitesResponseSchema(Schema):
    tramites = fields.List(fields.Nested(TramiteItemSchema), required=True)
