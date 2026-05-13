import httpClient from '../infrastructure/httpClient'

export const obtenerMiWallet = () =>
  httpClient.get('/api/v1/wallet-documentos')

export const obtenerWalletParaPrograma = (programaId) =>
  httpClient.get(`/api/v1/wallet-documentos/programas/${programaId}`)
