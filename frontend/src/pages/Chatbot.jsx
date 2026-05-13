import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { enviarMensajeChat } from '../repositories/chatRepository'

export default function Chatbot() {
  const { perfilUsuario } = useApp()
  const { currentUser } = useAuth() // Obtener usuario autenticado
  const [mensajes, setMensajes] = useState([])
  const [inputMensaje, setInputMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([])
  const [sesionId, setSesionId] = useState(() => crypto.randomUUID())
  const [isRecording, setIsRecording] = useState(false) // Estado de grabación
  const [isSpeaking, setIsSpeaking] = useState(false) // Estado de reproducción de voz
  const [useOfflineRecording, setUseOfflineRecording] = useState(false) // Usar grabación offline
  const [recordingTime, setRecordingTime] = useState(0) // Tiempo de grabación
  const [showHistory, setShowHistory] = useState(false) // Mostrar historial
  const [conversaciones, setConversaciones] = useState([]) // Lista de conversaciones
  const chatContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null) // Referencia para Speech Recognition
  const mediaRecorderRef = useRef(null) // Referencia para grabación offline
  const audioChunksRef = useRef([]) // Chunks de audio
  const recordingTimerRef = useRef(null) // Timer para grabación

  // Cargar conversación actual desde localStorage al iniciar
  useEffect(() => {
    cargarConversacionActual()
    cargarListaConversaciones()
  }, [])

  // Guardar conversación en localStorage cada vez que cambian los mensajes
  useEffect(() => {
    if (mensajes.length > 1 && sesionId) { // Más de 1 mensaje (no solo el inicial)
      guardarConversacion()
    }
  }, [mensajes, sesionId])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Inicializar Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'es-MX'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputMensaje(transcript)
        setIsRecording(false)
        setError(null)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error)
        setIsRecording(false)
        
        // Si es error de red, cambiar a modo offline
        if (event.error === 'network') {
          setUseOfflineRecording(true)
          setError('Modo offline activado. Haz clic en el micrófono de nuevo para grabar.')
        } else if (event.error === 'not-allowed') {
          setError('Permiso de micrófono denegado. Permite el acceso al micrófono.')
        } else if (event.error === 'no-speech') {
          setError('No se detectó voz. Intenta hablar más cerca del micrófono.')
        } else if (event.error === 'audio-capture') {
          setError('No se detectó micrófono. Verifica que esté conectado.')
        } else {
          setError(`Error: ${event.error}. Cambiando a modo offline...`)
          setUseOfflineRecording(true)
        }
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    } else {
      // Si no hay soporte, usar grabación offline directamente
      setUseOfflineRecording(true)
    }
  }, [])

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  // Función para cargar conversación actual desde localStorage
  const cargarConversacionActual = () => {
    try {
      const conversacionActual = localStorage.getItem('acips_conversacion_actual')
      if (conversacionActual) {
        const data = JSON.parse(conversacionActual)
        setMensajes(data.mensajes || getMensajeInicial())
        setSesionId(data.sesionId || null)
      } else {
        setMensajes(getMensajeInicial())
      }
    } catch (err) {
      console.error('Error al cargar conversación:', err)
      setMensajes(getMensajeInicial())
    }
  }

  // Función para obtener mensaje inicial
  const getMensajeInicial = () => {
    return [
      {
        role: 'assistant',
        content: 'Hola, soy ACIPS, tu asistente inteligente para programas sociales.\n\nPuedes preguntarme cosas como:\n• "Soy madre soltera con dos hijos, ¿qué apoyos puedo pedir?"\n• "¿Qué documentos necesito para la pensión de adultos mayores?"\n• "¿Dónde tramito la beca Benito Juárez?"\n\nTambién puedes adjuntar documentos PDF o imágenes para que los analice.\n\n🎤 Puedes hablar usando el botón de micrófono.',
        timestamp: 'Ahora',
      }
    ]
  }

  // Función para guardar conversación en localStorage
  const guardarConversacion = () => {
    try {
      const data = {
        sesionId,
        mensajes,
        ultimaActividad: new Date().toISOString()
      }
      localStorage.setItem('acips_conversacion_actual', JSON.stringify(data))
      
      // También guardar en el historial
      guardarEnHistorial()
    } catch (err) {
      console.error('Error al guardar conversación:', err)
    }
  }

  // Función para guardar en historial
  const guardarEnHistorial = () => {
    try {
      const historial = JSON.parse(localStorage.getItem('acips_historial') || '[]')
      
      // Buscar si ya existe esta sesión
      const index = historial.findIndex(c => c.sesionId === sesionId)
      
      const conversacion = {
        sesionId,
        titulo: generarTitulo(mensajes),
        mensajes,
        ultimaActividad: new Date().toISOString(),
        numMensajes: mensajes.length
      }
      
      if (index >= 0) {
        // Actualizar existente
        historial[index] = conversacion
      } else {
        // Agregar nueva
        historial.unshift(conversacion)
      }
      
      // Limitar a 50 conversaciones
      const historialLimitado = historial.slice(0, 50)
      localStorage.setItem('acips_historial', JSON.stringify(historialLimitado))
      
      // Actualizar lista
      setConversaciones(historialLimitado)
    } catch (err) {
      console.error('Error al guardar en historial:', err)
    }
  }

  // Función para generar título de conversación
  const generarTitulo = (mensajes) => {
    // Buscar el primer mensaje del usuario
    const primerMensajeUsuario = mensajes.find(m => m.role === 'user')
    if (primerMensajeUsuario) {
      const contenido = primerMensajeUsuario.content
      // Tomar primeras 50 caracteres
      return contenido.length > 50 ? contenido.substring(0, 50) + '...' : contenido
    }
    return 'Nueva conversación'
  }

  // Función para cargar lista de conversaciones
  const cargarListaConversaciones = () => {
    try {
      const historial = JSON.parse(localStorage.getItem('acips_historial') || '[]')
      setConversaciones(historial)
    } catch (err) {
      console.error('Error al cargar historial:', err)
      setConversaciones([])
    }
  }

  // Función para cargar una conversación del historial
  const cargarConversacion = (conversacion) => {
    setMensajes(conversacion.mensajes)
    setSesionId(conversacion.sesionId)
    setShowHistory(false)
    
    // Guardar como conversación actual
    localStorage.setItem('acips_conversacion_actual', JSON.stringify({
      sesionId: conversacion.sesionId,
      mensajes: conversacion.mensajes,
      ultimaActividad: new Date().toISOString()
    }))
  }

  // Función para crear nueva conversación
  const nuevaConversacion = () => {
    setMensajes(getMensajeInicial())
    setSesionId(crypto.randomUUID())
    setShowHistory(false)
    localStorage.removeItem('acips_conversacion_actual')
  }

  // Función para eliminar conversación del historial
  const eliminarConversacion = (sesionIdEliminar) => {
    try {
      const historial = JSON.parse(localStorage.getItem('acips_historial') || '[]')
      const nuevoHistorial = historial.filter(c => c.sesionId !== sesionIdEliminar)
      localStorage.setItem('acips_historial', JSON.stringify(nuevoHistorial))
      setConversaciones(nuevoHistorial)
      
      // Si es la conversación actual, crear nueva
      if (sesionId === sesionIdEliminar) {
        nuevaConversacion()
      }
    } catch (err) {
      console.error('Error al eliminar conversación:', err)
    }
  }

  // Función para iniciar/detener grabación de voz
  const toggleVoiceRecording = async () => {
    // Si está en modo offline, usar MediaRecorder
    if (useOfflineRecording) {
      if (isRecording) {
        stopOfflineRecording()
      } else {
        startOfflineRecording()
      }
      return
    }

    // Modo online con Speech Recognition
    if (!recognitionRef.current) {
      setError('Reconocimiento de voz no disponible. Usando modo offline...')
      setUseOfflineRecording(true)
      return
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop()
        setIsRecording(false)
      } catch (err) {
        console.error('Error al detener grabación:', err)
        setIsRecording(false)
      }
    } else {
      try {
        setError(null)
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (err) {
        console.error('Error al iniciar grabación:', err)
        setError('Cambiando a modo offline...')
        setUseOfflineRecording(true)
        setIsRecording(false)
      }
    }
  }

  // Función para iniciar grabación offline
  const startOfflineRecording = async () => {
    try {
      // Solicitar audio con mejor calidad
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      })
      
      audioChunksRef.current = []
      
      // Usar formato compatible con mejor calidad
      const options = { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      }
      
      // Fallback si el formato no es soportado
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm'
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Verificar que el audio tenga contenido
        if (audioBlob.size < 1000) {
          setError('Audio muy corto. Intenta hablar más tiempo.')
          stream.getTracks().forEach(track => track.stop())
          return
        }
        
        await transcribeAudio(audioBlob)
        
        // Detener el stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      // Grabar en chunks de 100ms para mejor captura
      mediaRecorderRef.current.start(100)
      setIsRecording(true)
      setError(null)
      setRecordingTime(0)
      
      // Iniciar temporizador
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      console.log('🎤 Grabación iniciada con configuración mejorada')
    } catch (err) {
      console.error('Error al acceder al micrófono:', err)
      if (err.name === 'NotAllowedError') {
        setError('Permiso de micrófono denegado. Permite el acceso en la configuración del navegador.')
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró micrófono. Verifica que esté conectado.')
      } else {
        setError('No se pudo acceder al micrófono. Verifica los permisos.')
      }
      setIsRecording(false)
    }
  }

  // Función para detener grabación offline
  const stopOfflineRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Detener timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
      setRecordingTime(0)
    }
  }

  // Función para transcribir audio usando el backend
  const transcribeAudio = async (audioBlob) => {
    try {
      setLoading(true)
      setError('Transcribiendo audio...')
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      console.log('📤 Enviando audio al backend:', audioBlob.size, 'bytes')
      
      const response = await fetch('http://localhost:5000/api/v1/transcribe', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (response.ok && data.texto) {
        setInputMensaje(data.texto)
        setError(null)
        console.log('✅ Transcripción recibida:', data.texto)
      } else {
        setError(data.error || 'No se pudo transcribir el audio. Intenta hablar más claro y cerca del micrófono.')
        console.error('❌ Error en transcripción:', data.error)
      }
    } catch (err) {
      console.error('Error al transcribir:', err)
      setError('Error al transcribir audio. Verifica que el backend esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  // Función para leer texto en voz alta
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Detener cualquier reproducción anterior
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-MX'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    } else {
      setError('Tu navegador no soporta síntesis de voz.')
    }
  }

  // Función para detener reproducción de voz
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!inputMensaje.trim() && archivosAdjuntos.length === 0) || loading) return

    const mensaje = inputMensaje.trim()
    setInputMensaje('')
    setError(null)

    // Agregar mensaje del usuario con archivos si los hay
    const nuevoMensajeUsuario = {
      role: 'user',
      content: mensaje || 'Archivo adjunto',
      archivos: archivosAdjuntos.map(f => ({ nombre: f.name, tipo: f.type })),
      timestamp: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    setMensajes((prev) => [...prev, nuevoMensajeUsuario])
    setLoading(true)

    try {
      const perfil = perfilUsuario
        ? { edad: perfilUsuario.edad, municipio: perfilUsuario.municipio }
        : {}

      const response = await enviarMensajeChat(
        mensaje || 'Analiza y dame recomendaciones',
        sesionId,
        perfil
      )

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
    } catch (err) {
      console.error('Error chat:', err)
      const errorMsg = err.response?.data?.error || 'Error de conexión con el servidor.'
      setError(errorMsg)
      setMensajes((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Lo siento, hubo un error: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setLoading(false)
      setArchivosAdjuntos([])
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const archivosValidos = files.filter(file => {
      const tipoValido = file.type === 'application/pdf' || file.type.startsWith('image/')
      const tamañoValido = file.size <= 10 * 1024 * 1024 // 10MB
      
      if (!tipoValido) {
        setError('Solo se permiten archivos PDF e imágenes')
        return false
      }
      if (!tamañoValido) {
        setError('El archivo no debe superar 10MB')
        return false
      }
      return true
    })
    
    setArchivosAdjuntos(prev => [...prev, ...archivosValidos])
    setError(null)
  }

  const eliminarArchivo = (index) => {
    setArchivosAdjuntos(prev => prev.filter((_, i) => i !== index))
  }

  const abrirSelectorArchivos = () => {
    fileInputRef.current?.click()
  }

  const handleLimpiarChat = async () => {
    if (confirm('¿Estás seguro de que quieres limpiar la conversación actual?')) {
      try {
        const userId = currentUser?.uid || null
        
        // Limpiar en el backend
        if (sesionId) {
          const payload = { sesion_id: sesionId }
          if (userId) {
            payload.user_id = userId
          }
          
          await fetch('http://localhost:5000/api/v1/chat/limpiar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })
        }
        
        // Limpiar en el frontend y localStorage
        nuevaConversacion()
      } catch (err) {
        console.error('Error al limpiar chat:', err)
        // Limpiar localmente aunque falle el backend
        nuevaConversacion()
      }
    }
  }

  const preguntasRapidas = [
    '¿Qué programas sociales existen?',
    '¿Qué documentos necesito?',
    'Soy adulto mayor, ¿qué apoyo me corresponde?',
    'Tengo hijos estudiantes, ¿hay becas?',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header mejorado */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-3"
          style={{ 
            background: 'linear-gradient(to right, #410016, #7a0028)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Chatbot Ciudadano
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Pregúntame sobre programas sociales, requisitos y trámites
          </p>
        </div>

        {/* Info del asistente mejorada */}
        <div className="bg-white/80 backdrop-blur-lg border-2 rounded-2xl p-6 mb-6 shadow-lg animate-fade-in-up animation-delay-100"
        style={{ borderColor: '#410016' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900 mb-1">Soy ACIPS, tu asistente inteligente</p>
              <p className="text-gray-600 leading-relaxed">
                Puedo ayudarte con información sobre apoyos gubernamentales, requisitos, documentos y cómo tramitarlos.
              </p>
            </div>
          </div>
        </div>

        {/* Contenedor del chat mejorado */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in-up animation-delay-200">
          <div
            ref={chatContainerRef}
            className="h-[550px] overflow-y-auto p-6 space-y-4"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(65, 0, 22, 0.02) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(65, 0, 22, 0.02) 0%, transparent 50%)'
            }}
          >
            {mensajes.map((mensaje, index) => (
              <ChatBubble 
                key={index} 
                mensaje={mensaje} 
                onSpeak={speakText}
                isSpeaking={isSpeaking}
              />
            ))}
            {loading && <TypingIndicator />}
          </div>

          {/* Error mejorado */}
          {error && (
            <div className="bg-red-50 border-t-2 border-red-400 text-red-700 px-6 py-4 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Formulario mejorado */}
          <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-gray-200">
            {/* Vista previa de archivos adjuntos */}
            {archivosAdjuntos.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {archivosAdjuntos.map((archivo, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                    {archivo.type.startsWith('image/') ? (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                      {archivo.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarArchivo(index)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              {/* Input oculto para archivos */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Botón para adjuntar archivos */}
              <button
                type="button"
                onClick={abrirSelectorArchivos}
                disabled={loading}
                className="flex-shrink-0 p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adjuntar archivo (PDF o imagen)"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Botón de micrófono para voz */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                disabled={loading}
                className={`flex-shrink-0 p-4 rounded-2xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'border-red-500 bg-red-50 animate-pulse' 
                    : useOfflineRecording
                    ? 'border-blue-500 hover:border-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={
                  isRecording 
                    ? "Grabando... (haz clic para detener)" 
                    : useOfflineRecording
                    ? "Modo offline - Grabar audio"
                    : "Hablar (reconocimiento en línea)"
                }
              >
                {isRecording ? (
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                ) : (
                  <svg className={`w-6 h-6 ${useOfflineRecording ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              <input
                type="text"
                value={inputMensaje}
                onChange={(e) => setInputMensaje(e.target.value)}
                placeholder="Escribe tu pregunta aquí..."
                className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none text-base transition-all duration-300"
                style={{ 
                  focusBorderColor: '#410016'
                }}
                onFocus={(e) => e.target.style.borderColor = '#410016'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || (!inputMensaje.trim() && archivosAdjuntos.length === 0)}
                className="px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #410016, #7a0028)' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Enviando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span className="hidden sm:inline">Enviar</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Ayuda sobre archivos y voz */}
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Puedes adjuntar imágenes o PDFs (máx. 10MB por archivo)
              </p>
              {useOfflineRecording && !isRecording && (
                <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Modo offline activado - Audio se transcribe con Groq Whisper
                </p>
              )}
              {isRecording && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-2 animate-pulse">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  {useOfflineRecording 
                    ? `Grabando audio... ${recordingTime}s (Haz clic para detener)` 
                    : 'Grabando... Habla ahora'}
                </p>
              )}
            </div>
          </form>

          {/* Botón limpiar mejorado */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-600 hover:text-gray-900 text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial ({conversaciones.length})
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={nuevaConversacion}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Conversación
              </button>
              
              <button
                onClick={handleLimpiarChat}
                className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Historial */}
        {showHistory && (
          <div className="mt-6 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in-up">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historial de Conversaciones
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {conversaciones.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-semibold">No hay conversaciones guardadas</p>
                  <p className="text-sm mt-2">Tus conversaciones se guardarán automáticamente aquí</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversaciones.map((conv, index) => (
                    <div
                      key={conv.sesionId || index}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                        conv.sesionId === sesionId
                          ? 'border-[#410016] bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => cargarConversacion(conv)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 flex-1 pr-2">
                          {conv.titulo}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('¿Eliminar esta conversación?')) {
                              eliminarConversacion(conv.sesionId)
                            }
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {conv.numMensajes} mensajes
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(conv.ultimaActividad).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preguntas rápidas mejoradas */}
        <div className="mt-8 animate-fade-in-up animation-delay-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: '#410016' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Preguntas frecuentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {preguntasRapidas.map((pregunta, index) => (
              <button
                key={index}
                onClick={() => setInputMensaje(pregunta)}
                className="bg-white border-2 text-left px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ 
                  borderColor: '#410016',
                  color: '#410016'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #410016, #7a0028)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.color = '#410016'
                }}
              >
                {pregunta}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ mensaje, onSpeak, isSpeaking }) {
  const isUser = mensaje.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className="max-w-[80%]">
        <div
          className={`px-5 py-4 rounded-2xl shadow-md ${
            isUser
              ? 'text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
          }`}
          style={isUser ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
        >
          {/* Mostrar archivos adjuntos si los hay */}
          {mensaje.archivos && mensaje.archivos.length > 0 && (
            <div className="mb-3 space-y-2">
              {mensaje.archivos.map((archivo, index) => (
                <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isUser ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {archivo.tipo.startsWith('image/') ? (
                    <svg className={`w-4 h-4 ${isUser ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className={`w-4 h-4 ${isUser ? 'text-white' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className={`text-xs font-medium ${isUser ? 'text-white' : 'text-gray-700'}`}>
                    {archivo.nombre}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="whitespace-pre-wrap leading-relaxed">{mensaje.content}</div>
          
          <div className="flex items-center justify-between mt-2">
            <div
              className={`text-xs font-medium ${
                isUser ? 'text-white/70' : 'text-gray-500'
              }`}
            >
              {mensaje.timestamp}
            </div>
            
            {/* Botón de reproducir voz solo para mensajes del asistente */}
            {!isUser && onSpeak && (
              <button
                onClick={() => onSpeak(mensaje.content)}
                className="ml-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Escuchar respuesta"
              >
                {isSpeaking ? (
                  <svg className="w-4 h-4 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in-up">
      <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-bl-sm shadow-md">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#410016' }}></div>
          <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#410016', animationDelay: '0.2s' }}></div>
          <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#410016', animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}
