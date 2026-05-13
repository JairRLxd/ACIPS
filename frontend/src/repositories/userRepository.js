import httpClient from '../infrastructure/httpClient'

export const sincronizarUsuario = () => httpClient.get('/auth/me')

export const healthcheck = () => httpClient.get('/health')
