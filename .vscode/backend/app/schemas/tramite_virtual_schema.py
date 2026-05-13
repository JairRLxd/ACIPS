from __future__ import annotations

from marshmallow import Schema, fields, validate


class DocumentoEvaluadoSchema(Schema):
    requisito_id = fields.Int(required=True, strict=True)
    tipo_esperado = fields.Str(required=False, allow_none=True)
    tipo_detectado = fields.Str(required=False, allow_none=True)
    es_correcto = fields.Bool(required=True)
    observacion = fields.Str(required=True)


class CrearTramiteVirtualSchema(Schema):
    programa_id = fields.Int(required=True, strict=True)
    perfil_usuario = fields.Dict(required=True)
    documentos = fields.List(
        fields.Nested(DocumentoEvaluadoSchema),
        required=True,
        validate=validate.Length(min=1),
    )
    evaluacion_previa = fields.Dict(required=True)
    observaciones_usuario = fields.Str(required=False, allow_none=True)


class RevisarTramiteVirtualSchema(Schema):
    decision = fields.Str(
        required=True,
        validate=validate.OneOf(["aprobado", "rechazado", "constancia_emitida"]),
    )
    observaciones_admin = fields.Str(required=True, validate=validate.Length(min=3))
    constancia_url = fields.Str(required=False, allow_none=True)


class ChecklistItemSchema(Schema):
    requisito_id = fields.Int(required=True)
    nombre = fields.Str(required=True)
    estado = fields.Str(required=True)
    observacion = fields.Str(required=True)


class TramiteVirtualResponseSchema(Schema):
    expediente_id = fields.Str(required=True)
    usuario_uid = fields.Str(required=True)
    programa_id = fields.Int(required=True)
    programa_nombre = fields.Str(required=True)
    modalidad = fields.Str(required=True)
    estado = fields.Str(required=True)
    perfil_usuario = fields.Dict(required=True)
    documentos = fields.List(fields.Dict(), required=True)
    checklist = fields.List(fields.Nested(ChecklistItemSchema), required=True)
    evaluacion_previa = fields.Dict(required=True)
    observaciones_usuario = fields.Str(required=False, allow_none=True)
    observaciones_admin = fields.Str(required=False, allow_none=True)
    revisado_por_uid = fields.Str(required=False, allow_none=True)
    constancia_url = fields.Str(required=False, allow_none=True)
    created_at = fields.Str(required=True)
    updated_at = fields.Str(required=True)


class TramitesVirtualesResponseSchema(Schema):
    tramites_virtuales = fields.List(
        fields.Nested(TramiteVirtualResponseSchema),
        required=True,
    )
