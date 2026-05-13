import httpClient from '../infrastructure/httpClient'

// --- Documentos para validación (Admin) ---

export const obtenerDocumentosPendientes = () =>
  httpClient.get('/api/v1/admin/documentos/pendientes')

export const obtenerDocumentos = (filtro = null) => {
  const params = filtro ? { estado: filtro } : {}
  return httpClient.get('/api/v1/admin/documentos', { params })
}

export const obtenerDocumento = (documentoId) =>
  httpClient.get(`/api/v1/admin/documentos/${documentoId}`)

export const validarDocumentoAdmin = (documentoId, decision, comentario = '') =>
  httpClient.post(`/api/v1/admin/documentos/${documentoId}/validar`, {
    decision,
    comentario,
  })

export const obtenerEstadisticasDocumentos = () =>
  httpClient.get('/api/v1/admin/documentos/estadisticas')
