import httpClient from '../infrastructure/httpClient'

export const enviarMensajeChat = (mensaje, sesionId = null, perfilUsuario = null) =>
  httpClient.post('/api/v1/chat', {
    sesion_id: sesionId,
    mensaje,
    ...(perfilUsuario && { perfil_usuario: perfilUsuario }),
  })

export const enviarDiagnostico = (perfil) => {
  const mensaje = `Quiero saber qué programas me corresponden. Tengo ${perfil.edad} años, vivo en ${perfil.municipio}, ${perfil.tiene_hijos ? 'tengo hijos' : 'no tengo hijos'}, mis ingresos son ${perfil.nivel_ingresos}, ${perfil.estudia ? 'estoy estudiando' : 'no estudio'}, y ${perfil.tiene_discapacidad ? 'tengo discapacidad' : 'no tengo discapacidad'}.`
  return enviarMensajeChat(mensaje, null, { edad: perfil.edad, municipio: perfil.municipio })
}
