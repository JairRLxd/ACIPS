import httpClient from '../infrastructure/httpClient'

// --- Trámites (públicos) ---

export const obtenerTramites = (params = {}) =>
  httpClient.get('/tramites', { params })

export const obtenerTramite = (programaId) =>
  httpClient.get(`/tramites/${programaId}`)

// --- Validación de documentos ---

export const validarDocumento = ({ sesionId, requisitoId, tipoEsperado, archivoBase64, mimeType }) =>
  httpClient.post('/validar-documento', {
    sesion_id: sesionId,
    requisito_id: requisitoId,
    tipo_esperado: tipoEsperado,
    archivo_base64: archivoBase64,
    mime_type: mimeType,
  })

// --- Trámites Virtuales ---

export const crearTramiteVirtual = ({ programaId, perfilUsuario, documentos, evaluacionPrevia = {}, observacionesUsuario = null }) =>
  httpClient.post('/tramites-virtuales', {
    programa_id: programaId,
    perfil_usuario: perfilUsuario,
    documentos,
    evaluacion_previa: evaluacionPrevia,
    observaciones_usuario: observacionesUsuario,
  })

export const obtenerMisSolicitudes = () =>
  httpClient.get('/tramites-virtuales/mis-solicitudes')

// --- Generación de documentos (Grupo B) ---

export const generarDocumento = (tipoDocumento, datos) =>
  httpClient.post('/documentos/generar', { tipo_documento: tipoDocumento, ...datos })

export const descargarDocumento = (fileName) =>
  httpClient.get(`/documentos/${fileName}`, { responseType: 'blob' })

export const obtenerTiposDocumento = () =>
  httpClient.get('/documentos/tipos')

// --- Admin ---

export const listarExpedientesAdmin = (estado = null) => {
  const params = estado ? { estado } : {}
  return httpClient.get('/admin/tramites-virtuales', { params })
}

export const revisarExpediente = (expedienteId, decision, observacionesAdmin = '', constanciaUrl = null) =>
  httpClient.post(`/admin/tramites-virtuales/${expedienteId}/revision`, {
    decision,
    observaciones_admin: observacionesAdmin,
    constancia_url: constanciaUrl,
  })
