import httpClient from '../infrastructure/httpClient'

// --- Trámites (públicos) ---

export const obtenerTramites = (params = {}) =>
  httpClient.get('/api/v1/tramites', { params })

export const obtenerTramite = (programaId) =>
  httpClient.get(`/api/v1/tramites/${programaId}`)

// --- Validación de documentos ---

export const validarDocumento = ({
  sesionId,
  requisitoId,
  tipoEsperado,
  archivoBase64,
  mimeType,
  usuarioUid,
  textoExtraido,
}) =>
  httpClient.post('/api/v1/validar-documento', {
    sesion_id: sesionId,
    requisito_id: requisitoId,
    tipo_esperado: tipoEsperado,
    archivo_base64: archivoBase64,
    mime_type: mimeType,
    ...(usuarioUid ? { usuario_uid: usuarioUid } : {}),
    ...(textoExtraido ? { texto_extraido: textoExtraido } : {}),
  })

// --- Trámites Virtuales ---

export const crearTramiteVirtual = ({ programaId, perfilUsuario, documentos, evaluacionPrevia = {}, observacionesUsuario = null }) =>
  httpClient.post('/api/v1/tramites-virtuales', {
    programa_id: programaId,
    perfil_usuario: perfilUsuario,
    documentos,
    evaluacion_previa: evaluacionPrevia,
    observaciones_usuario: observacionesUsuario,
  })

export const obtenerMisSolicitudes = () =>
  httpClient.get('/api/v1/tramites-virtuales/mis-solicitudes')

// --- Generación de documentos (Grupo B) ---

export const generarDocumento = (tipoDocumento, datos) =>
  httpClient.post('/api/v1/documentos/generar', { tipo_documento: tipoDocumento, ...datos })

export const descargarDocumento = (fileName) =>
  httpClient.get(`/api/v1/documentos/${fileName}`, { responseType: 'blob' })

export const obtenerTiposDocumento = () =>
  httpClient.get('/api/v1/documentos/tipos')

// --- Admin ---

export const listarExpedientesAdmin = (estado = null) => {
  const params = estado ? { estado } : {}
  return httpClient.get('/api/v1/admin/tramites-virtuales', { params })
}

export const obtenerExpedienteAdmin = (expedienteId) =>
  httpClient.get(`/api/v1/admin/tramites-virtuales/${expedienteId}`)

export const revisarExpediente = (expedienteId, decision, observacionesAdmin = '', constanciaUrl = null) =>
  httpClient.post(`/api/v1/admin/tramites-virtuales/${expedienteId}/revision`, {
    decision,
    observaciones_admin: observacionesAdmin,
    constancia_url: constanciaUrl,
  })
