import httpClient from '../infrastructure/httpClient'

export const enviarMensajeChat = (mensaje, sesionId = null, perfilUsuario = null) =>
  httpClient.post('/chat', {
    sesion_id: sesionId,
    mensaje,
    ...(perfilUsuario && { perfil_usuario: perfilUsuario }),
  })
