import httpClient from '../infrastructure/httpClient'

export const evaluarElegibilidad = (payload) =>
  httpClient.post('/api/v1/elegibilidad', payload)
