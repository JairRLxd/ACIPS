import httpClient from '../infrastructure/httpClient'

export const obtenerExpedienteAdmin = (expedienteId) =>
  httpClient.get(`/api/v1/admin/tramites-virtuales/${expedienteId}`)

export const listarUsuariosAdmin = () =>
  httpClient.get('/api/v1/admin/usuarios')

export const cambiarRolUsuario = (uid, rol) =>
  httpClient.patch(`/api/v1/admin/usuarios/${uid}/rol`, { rol })

export const obtenerMiPerfil = () =>
  httpClient.get('/api/v1/auth/me')
