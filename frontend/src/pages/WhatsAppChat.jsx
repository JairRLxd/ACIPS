import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { enviarMensajeChat } from '../repositories/chatRepository'

const WHATSAPP_GREEN = '#25D366'
const WHATSAPP_DARK = '#075E54'
const WHATSAPP_LIGHT = '#DCF8C6'
const WHATSAPP_BG = '#ECE5DD'

export default function WhatsAppChat() {
  const navigate = useNavigate()
  const [mensajes, setMensajes] = useState([])
  const [inputMensaje, setInputMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [sesionId] = useState(() => crypto.randomUUID())
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([])
  const [previsualizacionArchivo, setPrevisualizacionArchivo] = useState(null)
  const chatContainerRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Mensaje inicial del bot
    setMensajes([
      {
        role: 'assistant',
        content: '¡Hola! 👋 Soy ACIPS, tu asistente para programas sociales.\n\n¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!inputMensaje.trim() && archivosAdjuntos.length === 0) || loading) return

    const mensaje = inputMensaje.trim()
    setInputMensaje('')

    // Agregar mensaje del usuario con archivos si los hay
    const nuevoMensajeUsuario = {
      role: 'user',
      content: mensaje || '📎 Archivo adjunto',
      archivos: archivosAdjuntos.map(f => ({ 
        nombre: f.name, 
        tipo: f.type,
        preview: f.preview 
      })),
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    }
    setMensajes((prev) => [...prev, nuevoMensajeUsuario])
    setLoading(true)

    try {
      // Si hay archivos, enviarlos al backend
      let response
      if (archivosAdjuntos.length > 0) {
        const formData = new FormData()
        formData.append('mensaje', mensaje || 'Analiza este documento')
        formData.append('sesion_id', sesionId)
        archivosAdjuntos.forEach((archivo) => {
          formData.append('archivos', archivo)
        })

        response = await fetch('http://localhost:5000/api/v1/chat', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        
        setMensajes((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.respuesta || 'Sin respuesta',
            programas: data.programas_relacionados || [],
            timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      } else {
        response = await enviarMensajeChat(mensaje, sesionId, {})
        const data = response.data

        setMensajes((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.respuesta || 'Sin respuesta',
            programas: data.programas_relacionados || [],
            timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }
    } catch (err) {
      console.error('Error chat:', err)
      setMensajes((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setLoading(false)
      setArchivosAdjuntos([])
      setPrevisualizacionArchivo(null)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const archivosValidos = []

    files.forEach(file => {
      const tipoValido = file.type === 'application/pdf' || file.type.startsWith('image/')
      const tamañoValido = file.size <= 10 * 1024 * 1024 // 10MB
      
      if (!tipoValido) {
        alert('Solo se permiten archivos PDF e imágenes')
        return
      }
      if (!tamañoValido) {
        alert('El archivo no debe superar 10MB')
        return
      }

      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          file.preview = reader.result
          archivosValidos.push(file)
          if (archivosValidos.length === files.length) {
            setArchivosAdjuntos(prev => [...prev, ...archivosValidos])
            if (archivosValidos.length > 0) {
              setPrevisualizacionArchivo(archivosValidos[0])
            }
          }
        }
        reader.readAsDataURL(file)
      } else {
        archivosValidos.push(file)
        setArchivosAdjuntos(prev => [...prev, file])
      }
    })
  }

  const eliminarArchivo = (index) => {
    setArchivosAdjuntos(prev => {
      const nuevos = prev.filter((_, i) => i !== index)
      if (nuevos.length === 0) {
        setPrevisualizacionArchivo(null)
      } else if (previsualizacionArchivo === prev[index]) {
        setPrevisualizacionArchivo(nuevos[0])
      }
      return nuevos
    })
  }

  const abrirSelectorArchivos = () => {
    fileInputRef.current?.click()
  }

  const preguntasRapidas = [
    '¿Qué programas hay?',
    'Soy adulto mayor',
    'Tengo hijos estudiantes',
    '¿Qué documentos necesito?',
  ]

  const enviarPreguntaRapida = (pregunta) => {
    setInputMensaje(pregunta)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: WHATSAPP_BG }}>
      {/* Header estilo WhatsApp */}
      <div className="flex items-center gap-3 px-4 py-3 shadow-md" style={{ backgroundColor: WHATSAPP_DARK }}>
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar y nombre */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: WHATSAPP_GREEN }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-lg">ACIPS Asistente</h1>
            <p className="text-white/70 text-xs">En línea</p>
          </div>
        </div>

        {/* Menú */}
        <div className="relative">
          <button
            onClick={() => setMostrarMenu(!mostrarMenu)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {mostrarMenu && (
            <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl py-2 w-48 z-10">
              <button
                onClick={() => {
                  navigate('/chat')
                  setMostrarMenu(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-gray-700"
              >
                Ir a Chat Normal
              </button>
              <button
                onClick={() => {
                  navigate('/diagnostico')
                  setMostrarMenu(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-gray-700"
              >
                Hacer Diagnóstico
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fondo de chat con patrón */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
        ref={chatContainerRef}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Fecha */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-1 rounded-lg shadow-sm">
            <p className="text-xs text-gray-600 font-medium">
              {new Date().toLocaleDateString('es-MX', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {mensajes.map((mensaje, index) => (
          <WhatsAppBubble key={index} mensaje={mensaje} />
        ))}

        {loading && <TypingIndicatorWhatsApp />}

        {/* Preguntas rápidas */}
        {mensajes.length === 1 && !loading && (
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-center text-sm text-gray-600 mb-2">Preguntas frecuentes:</p>
            {preguntasRapidas.map((pregunta, index) => (
              <button
                key={index}
                onClick={() => enviarPreguntaRapida(pregunta)}
                className="bg-white px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all text-left text-sm font-medium text-gray-700 border border-gray-200"
              >
                {pregunta}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input estilo WhatsApp */}
      <div className="bg-white border-t border-gray-200">
        {/* Vista previa de archivos adjuntos */}
        {archivosAdjuntos.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 overflow-x-auto">
              {archivosAdjuntos.map((archivo, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {archivo.type.startsWith('image/') ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300">
                      <img 
                        src={archivo.preview} 
                        alt={archivo.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarArchivo(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-20 h-20 rounded-lg border-2 border-gray-300 bg-white flex flex-col items-center justify-center p-2">
                      <svg className="w-8 h-8 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-600 truncate w-full text-center">PDF</span>
                      <button
                        type="button"
                        onClick={() => eliminarArchivo(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {archivosAdjuntos.length} archivo(s) adjunto(s)
            </p>
          </div>
        )}

        <div className="px-4 py-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {/* Input oculto para archivos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Botón adjuntar */}
            <button
              type="button"
              onClick={abrirSelectorArchivos}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Adjuntar imagen o PDF"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* Botón emoji */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Input */}
            <input
              type="text"
              value={inputMensaje}
              onChange={(e) => setInputMensaje(e.target.value)}
              placeholder="Escribe un mensaje"
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none text-sm"
              disabled={loading}
            />

            {/* Botón enviar */}
            {inputMensaje.trim() || archivosAdjuntos.length > 0 ? (
              <button
                type="submit"
                disabled={loading}
                className="p-3 rounded-full transition-all disabled:opacity-50"
                style={{ backgroundColor: WHATSAPP_GREEN }}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

function WhatsAppBubble({ mensaje }) {
  const isUser = mensaje.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${
          isUser
            ? 'rounded-tr-none'
            : 'rounded-tl-none'
        }`}
        style={{
          backgroundColor: isUser ? WHATSAPP_LIGHT : 'white',
        }}
      >
        {/* Archivos adjuntos */}
        {mensaje.archivos && mensaje.archivos.length > 0 && (
          <div className="mb-2 space-y-2">
            {mensaje.archivos.map((archivo, idx) => (
              <div key={idx} className="bg-white/50 rounded-lg overflow-hidden">
                {archivo.tipo.startsWith('image/') && archivo.preview ? (
                  <img 
                    src={archivo.preview} 
                    alt={archivo.nombre}
                    className="max-w-full rounded-lg"
                    style={{ maxHeight: '200px' }}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{archivo.nombre}</p>
                      <p className="text-xs text-gray-500">PDF</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {mensaje.content}
        </p>
        
        {/* Programas relacionados */}
        {mensaje.programas && mensaje.programas.length > 0 && (
          <div className="mt-3 space-y-2">
            {mensaje.programas.map((programa, idx) => (
              <div
                key={idx}
                className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-gray-200"
              >
                <p className="font-semibold text-sm text-gray-900">{programa.nombre}</p>
                <p className="text-xs text-gray-600 mt-1">{programa.descripcion}</p>
              </div>
            ))}
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">{mensaje.timestamp}</span>
          {isUser && (
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

function TypingIndicatorWhatsApp() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
