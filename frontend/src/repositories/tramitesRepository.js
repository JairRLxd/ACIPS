import httpClient from '../infrastructure/httpClient'

// --- Trámites (públicos) ---

export const obtenerTramites = (params = {}) =>
  httpClient.get('/api/v1/tramites', { params })

export const obtenerTramite = (programaId) =>
  httpClient.get(`/api/v1/tramites/${programaId}`)

// --- Validación de documentos ---

export const validarDocumento = ({ sesionId, requisitoId, tipoEsperado, archivoBase64, mimeType }) =>
  httpClient.post('/api/v1/validar-documento', {
    sesion_id: sesionId,
    requisito_id: requisitoId,
    tipo_esperado: tipoEsperado,
    archivo_base64: archivoBase64,
    mime_type: mimeType,
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

// --- Admin ---

export const listarExpedientesAdmin = (estado = null) => {
  const params = estado ? { estado } : {}
  return httpClient.get('/api/v1/admin/tramites-virtuales', { params })
}

export const revisarExpediente = (expedienteId, decision, observacionesAdmin = '', constanciaUrl = null) =>
  httpClient.post(`/api/v1/admin/tramites-virtuales/${expedienteId}/revision`, {
    decision,
    observaciones_admin: observacionesAdmin,
    constancia_url: constanciaUrl,
  })
