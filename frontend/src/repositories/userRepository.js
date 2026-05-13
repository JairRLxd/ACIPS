import httpClient from '../infrastructure/httpClient'

export const sincronizarUsuario = () => httpClient.get('/api/v1/auth/me')

export const healthcheck = () => httpClient.get('/api/v1/health')
