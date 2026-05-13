from __future__ import annotations

from marshmallow import Schema, fields, pre_load, validate


class ValidacionDocumentoSchema(Schema):
    sesion_id = fields.Str(required=True, validate=validate.Length(min=1))
    requisito_id = fields.Int(required=True, strict=True)
    tipo_esperado = fields.Str(required=True, validate=validate.Length(min=3))
    archivo_base64 = fields.Str(required=True, validate=validate.Length(min=20))
    mime_type = fields.Str(required=False, allow_none=True)

    @pre_load
    def map_legacy_field(self, data, **kwargs):
        if "archivo_base64" not in data and "imagen_base64" in data:
            data["archivo_base64"] = data["imagen_base64"]
        return data


class ValidacionRespuestaSchema(Schema):
    es_correcto = fields.Bool(required=True)
    legible = fields.Bool(required=True)
    vigente = fields.Bool(required=True)
    requiere_revision = fields.Bool(required=True)
    tipo_detectado = fields.Str(required=True)
    medio_extraccion = fields.Str(required=True)
    observacion = fields.Str(required=True)
    errores_detectados = fields.List(fields.Str(), required=True)
    campos_esperados = fields.List(fields.Str(), required=True)
    campos_faltantes = fields.List(fields.Str(), required=True)
    senales_detectadas = fields.List(fields.Str(), required=True)
    causas_rechazo = fields.List(fields.Str(), required=True)
    causas_revision_manual = fields.List(fields.Str(), required=True)
    mensaje_correccion = fields.Str(required=True)
    has_embedded_text = fields.Bool(required=True)
    pages_with_text = fields.Int(required=True)
    ocr_confidence_avg = fields.Float(required=False, allow_none=True)
    ocr_lines_count = fields.Int(required=True)
    text_length = fields.Int(required=True)
    classification_confidence = fields.Float(required=True)
    classification_signals = fields.List(fields.Str(), required=True)
    classification_candidates = fields.Dict(
        keys=fields.Str(), values=fields.Float(), required=True
    )
