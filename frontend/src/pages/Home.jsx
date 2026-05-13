import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { obtenerTramites } from '../repositories/tramitesRepository'

export default function Home() {
  const [programas, setProgramas] = useState([])
  const [loadingProgramas, setLoadingProgramas] = useState(true)

  // Cargar programas desde el backend
  useEffect(() => {
    const cargarProgramas = async () => {
      try {
        setLoadingProgramas(true)
        const response = await obtenerTramites()
        setProgramas(response.data.programas || [])
      } catch (error) {
        console.error('Error al cargar programas:', error)
      } finally {
        setLoadingProgramas(false)
      }
    }
    cargarProgramas()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section Mejorado - Con espacio para imagen a la derecha */}
      <div className="min-h-[90vh] flex items-center relative px-4 py-20">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{ backgroundColor: '#ffc9d6' }}></div>
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{ backgroundColor: '#ff9db8' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenido a la izquierda */}
          <div className="text-left">
            {/* Título principal con gradiente */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 animate-fade-in-up leading-tight">
              <span className="text-gray-800">Bienvenido a </span>
              <span className="bg-clip-text text-transparent animate-gradient"
              style={{ backgroundImage: 'linear-gradient(to right, #410016, #7a0028, #410016)', backgroundSize: '200% 200%' }}>
                ACIPS
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-700 font-semibold mb-6 animate-fade-in-up animation-delay-100">
              Asistente Ciudadano Inteligente para Programas Sociales
            </p>

            {/* Subtítulo con efecto typewriter */}
            <div className="text-2xl md:text-3xl text-gray-800 font-bold mb-6 animate-fade-in-up animation-delay-200 min-h-[2.5rem]">
              <TypewriterText />
            </div>

            {/* Descripción */}
            <p className="text-lg md:text-xl text-gray-600 mb-4 leading-relaxed animate-fade-in-up animation-delay-400">
              Te ayudamos a identificar y tramitar los apoyos gubernamentales que te corresponden.
            </p>
            <p className="text-lg md:text-xl font-semibold text-gray-700 mb-10 animate-fade-in-up animation-delay-400">
              De manera simple, rápida y gratuita.
            </p>

            {/* Botones mejorados */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in-up animation-delay-500">
              <Link
                to="/diagnostico"
                className="group relative inline-flex items-center gap-3 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
                style={{ background: 'linear-gradient(to right, #410016, #5a0020)' }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, #5a0020, #7a0028)' }}></span>
                <span className="relative flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Hacer Diagnóstico
                </span>
              </Link>
              
              <Link
                to="/chat"
                className="group inline-flex items-center gap-3 bg-white border-2 px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{ color: '#410016', borderColor: '#410016' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Hablar con Asistente
              </Link>
            </div>
          </div>

          {/* Espacio para imagen a la derecha - Carrusel de imágenes */}
          <div className="hidden lg:flex items-center justify-center animate-fade-in-up animation-delay-300">
            <div className="relative w-full max-w-[600px] h-[600px] flex items-center justify-center">
              <ImageCarousel />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-sm font-medium">Descubre más</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Resto del contenido */}
      <div className="container mx-auto px-4 pb-12">

      {/* Sección de Características */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cuatro pasos simples para acceder a tus beneficios
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          <FeatureCard
            image="/images/diagnostico.png"
            title="Diagnóstico Rápido"
            description="Responde 6 preguntas simples y descubre qué programas te corresponden"
          />
          <FeatureCard
            image="/images/chatbot.png"
            title="Chatbot Inteligente"
            description="Pregunta lo que necesites en lenguaje sencillo"
          />
          <FeatureCard
            image="/images/guia.png"
            title="Guía de Trámites"
            description="Paso a paso de cómo tramitar cada apoyo"
          />
          <FeatureCard
            image="/images/probabilidad.png"
            title="Probabilidad"
            description="Te decimos qué tan probable es que te aprueben"
          />
        </div>
      </div>

      {/* Programas Disponibles - Carrusel Automático */}
      <div className="mb-20 overflow-hidden" id="programas-section">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            Programas Sociales
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre los apoyos gubernamentales disponibles para ti
          </p>
        </div>
        
        {/* Carrusel */}
        {loadingProgramas ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200" style={{ borderTopColor: '#410016' }}></div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-8 animate-carousel">
              {/* Primera copia de las tarjetas */}
              {programas.map((programa) => (
                <ProgramCardDynamic key={`first-${programa.id}`} programa={programa} />
              ))}
              
              {/* Segunda copia para loop infinito */}
              {programas.map((programa) => (
                <ProgramCardDynamic key={`second-${programa.id}`} programa={programa} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sección de Confianza y Beneficios */}
      <div className="mb-20">
        <div className="bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 rounded-[3rem] p-12 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              ¿Por qué elegir ACIPS?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La forma más fácil y segura de acceder a tus beneficios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Beneficio 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Rápido y Simple</h3>
              <p className="text-gray-600 leading-relaxed">
                En menos de 5 minutos sabrás exactamente qué programas te corresponden y cómo solicitarlos.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #5a0020, #8b0030)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">100% Seguro</h3>
              <p className="text-gray-600 leading-relaxed">
                Tus datos están protegidos. No compartimos tu información con terceros ni te pedimos datos bancarios.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #7a0028, #a0003a)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Asistencia IA</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro chatbot inteligente responde todas tus dudas en lenguaje claro y sencillo, 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action - Diseño Elegante */}
      <div className="relative bg-white rounded-[3rem] p-12 md:p-16 text-center overflow-hidden shadow-xl border-2 border-gray-100">
        {/* Decoración de fondo sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: 'linear-gradient(135deg, #7a0028, #410016)' }}></div>
        
        <div className="relative z-10">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-full px-6 py-2 mb-6 border border-rose-200">
            <svg className="w-5 h-5" style={{ color: '#410016' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-sm" style={{ color: '#410016' }}>Proceso Rápido y Sencillo</span>
          </div>

          {/* Título principal */}
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight text-gray-900">
            ¿Listo para descubrir<br />
            <span className="bg-clip-text text-transparent" 
            style={{ backgroundImage: 'linear-gradient(to right, #410016, #7a0028)' }}>
              tus apoyos?
            </span>
          </h3>
          
          <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comienza ahora y en menos de 5 minutos sabrás a qué programas puedes aplicar
          </p>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/diagnostico"
              className="group inline-flex items-center gap-3 text-white px-10 py-5 rounded-full text-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
            >
              <span>Comenzar Diagnóstico</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              to="/chat"
              className="inline-flex items-center gap-3 bg-white border-2 px-10 py-5 rounded-full text-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{ color: '#410016', borderColor: '#410016' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #410016, #7a0028)'
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.borderColor = 'transparent'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = '#410016'
                e.currentTarget.style.borderColor = '#410016'
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Hablar con IA</span>
            </Link>
          </div>

          {/* Estadísticas mejoradas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
              <div className="text-5xl font-black mb-2" style={{ color: '#410016' }}>
                {loadingProgramas ? '...' : `${programas.length}+`}
              </div>
              <div className="text-gray-600 font-semibold">Programas Disponibles</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
              <div className="text-5xl font-black mb-2" style={{ color: '#410016' }}>&lt;5min</div>
              <div className="text-gray-600 font-semibold">Tiempo Promedio</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
              <div className="text-5xl font-black mb-2" style={{ color: '#410016' }}>100%</div>
              <div className="text-gray-600 font-semibold">Gratuito</div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Botón flotante de WhatsApp */}
      <WhatsAppFloatingButton />
    </div>
  )
}

// Botón flotante de WhatsApp
function WhatsAppFloatingButton() {
  const navigate = useNavigate()
  const [mostrarTooltip, setMostrarTooltip] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {mostrarTooltip && (
        <div className="absolute bottom-full right-0 mb-3 animate-fade-in">
          <div className="bg-white px-4 py-3 rounded-xl shadow-2xl border border-gray-200 whitespace-nowrap">
            <p className="text-sm font-bold text-gray-900 mb-1">¿Necesitas ayuda?</p>
            <p className="text-xs text-gray-600">Chatea con nosotros por WhatsApp</p>
          </div>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
        </div>
      )}

      {/* Botón */}
      <button
        onClick={() => navigate('/whatsapp')}
        onMouseEnter={() => setMostrarTooltip(true)}
        onMouseLeave={() => setMostrarTooltip(false)}
        className="group relative w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce-slow"
        style={{ backgroundColor: '#25D366' }}
      >
        {/* Efecto de pulso */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#25D366' }}></div>
        
        {/* Icono de WhatsApp */}
        <svg className="w-9 h-9 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>

        {/* Badge de notificación */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
          <span className="text-xs font-bold text-white">1</span>
        </div>
      </button>
    </div>
  )
}

// Componente TypewriterText con efecto de escritura y borrado
function TypewriterText() {
  const phrases = [
    "Encuentra tus Apoyos Gubernamentales",
    "Trámites Fáciles y Rápidos",
    "Ayuda con Inteligencia Artificial",
    "Tu Guía Personalizada",
    "100% Gratuito y Seguro"
  ]
  
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [delta, setDelta] = useState(150)

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]
    
    const ticker = setInterval(() => {
      if (!isDeleting) {
        // Escribiendo
        setText(currentPhrase.substring(0, text.length + 1))
        setDelta(150)
        
        if (text === currentPhrase) {
          // Pausa al terminar de escribir
          setDelta(2000)
          setIsDeleting(true)
        }
      } else {
        // Borrando
        setText(currentPhrase.substring(0, text.length - 1))
        setDelta(75)
        
        if (text === '') {
          setIsDeleting(false)
          setPhraseIndex((phraseIndex + 1) % phrases.length)
          setDelta(500)
        }
      }
    }, delta)

    return () => clearInterval(ticker)
  }, [text, isDeleting, phraseIndex, delta, phrases])

  return (
    <span className="inline-block">
      {text}
      <span className="animate-pulse" style={{ color: '#410016' }}>|</span>
    </span>
  )
}

// Componente de Carrusel de Imágenes Circular
function ImageCarousel() {
  const images = [
    '/images/hero-1.png',
    '/images/hero-2.png',
    '/images/hero-3.png',
    '/images/hero-4.png'
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 4000) // Cambia cada 4 segundos

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Contenedor circular con borde decorativo */}
      <div className="relative w-[500px] h-[500px]">
        {/* Borde decorativo animado */}
        <div className="absolute inset-0 rounded-full animate-spin-slow" 
          style={{ 
            background: 'linear-gradient(45deg, #410016, #D4AF37, #410016)',
            padding: '4px'
          }}>
          <div className="w-full h-full rounded-full bg-white"></div>
        </div>
        
        {/* Imágenes circulares */}
        <div className="absolute inset-2 rounded-full overflow-hidden shadow-2xl">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`ACIPS Hero ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: index === currentIndex ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 1s ease-in-out, transform 1s ease-in-out'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Indicadores de posición */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 opacity-100' 
                : 'opacity-50 hover:opacity-75'
            }`}
            style={{ 
              backgroundColor: index === currentIndex ? '#410016' : '#D4AF37',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function FeatureCard({ image, title, description }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    // Redirigir según el título de la tarjeta
    switch(title) {
      case 'Diagnóstico Rápido':
        navigate('/diagnostico')
        break
      case 'Chatbot Inteligente':
        navigate('/chat')
        break
      case 'Guía de Trámites':
        // Scroll a la sección de programas
        document.getElementById('programas-section')?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'Probabilidad':
        navigate('/diagnostico')
        break
      default:
        navigate('/diagnostico')
    }
  }

  return (
    <div className="group relative bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-4 border-white">
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
          <img 
            src="/images/logo.png" 
            alt="ACIPS Logo" 
            className="w-8 h-8 object-contain"
          />
        </div>
      </div>

      <div className="p-6 bg-white">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          {title}
        </h3>
        
        <p className="text-gray-500 text-sm mb-4">
          {description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>5 min</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Gratis</span>
          </div>
        </div>

        <button 
          onClick={handleClick}
          className="w-full text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
          style={{ background: 'linear-gradient(to right, #410016, #5a0020)' }}
        >
          Comenzar
        </button>
      </div>
    </div>
  )
}

function ProgramCard({ title, monto, periodo, descripcion, color, iconBg, iconColor, image, programaId }) {
  const navigate = useNavigate()
  
  const handleVerDetalles = () => {
    // Redirigir a la página de trámite del programa específico
    navigate(`/tramite/${programaId}`)
  }

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2 flex-shrink-0 w-[350px]">
      {/* Imagen de fondo cinematográfica con información superpuesta */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Icono */}
          <div className={`${iconBg} ${iconColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Monto y periodo */}
          <div className="text-white">
            <div className="text-4xl font-black mb-1">{monto}</div>
            <div className="text-white/90 text-sm font-semibold uppercase tracking-wide">{periodo}</div>
          </div>
        </div>
      </div>

      {/* Contenido inferior */}
      <div className="p-6 bg-white">
        <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {title}
        </h4>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {descripcion}
        </p>

        <button 
          onClick={handleVerDetalles}
          className="w-full text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3"
          style={{ background: 'linear-gradient(to right, #410016, #5a0020)' }}
        >
          <span>Ver Detalles</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Badge de disponibilidad */}
      <div className="absolute top-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm text-green-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Disponible
        </div>
      </div>
    </div>
  )
}

// Componente dinámico que carga datos desde Firebase
function ProgramCardDynamic({ programa }) {
  const navigate = useNavigate()
  
  // Mapeo de colores según el ID del programa
  const colorMap = {
    1: { color: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    2: { color: 'from-purple-500 to-purple-600', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    3: { color: 'from-green-500 to-green-600', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    4: { color: 'from-orange-500 to-orange-600', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
    5: { color: 'from-pink-500 to-pink-600', iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
    6: { color: 'from-indigo-500 to-indigo-600', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    7: { color: 'from-red-500 to-red-600', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
    8: { color: 'from-yellow-500 to-yellow-600', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    9: { color: 'from-teal-500 to-teal-600', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
    10: { color: 'from-cyan-500 to-cyan-600', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
    11: { color: 'from-lime-500 to-lime-600', iconBg: 'bg-lime-100', iconColor: 'text-lime-600' },
    12: { color: 'from-amber-500 to-amber-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    13: { color: 'from-rose-500 to-rose-600', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
    14: { color: 'from-violet-500 to-violet-600', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
    15: { color: 'from-fuchsia-500 to-fuchsia-600', iconBg: 'bg-fuchsia-100', iconColor: 'text-fuchsia-600' },
    16: { color: 'from-emerald-500 to-emerald-600', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  }
  
  // Mapeo de imágenes según tags o nombre
  const getImage = (programa) => {
    const tags = programa.tags || []
    const nombre = programa.nombre.toLowerCase()
    
    if (tags.includes('pension') || nombre.includes('pension') || nombre.includes('adultos mayores')) return '/images/pension-adultos.png'
    if (tags.includes('beca') || nombre.includes('beca') || nombre.includes('benito')) return '/images/beca-benito.png'
    if (tags.includes('sembrando') || nombre.includes('sembrando')) return '/images/sembrando-vida.png'
    if (tags.includes('jovenes') || nombre.includes('jovenes') || nombre.includes('jóvenes')) return '/images/jovenes-futuro.png'
    if (tags.includes('jefas') || nombre.includes('jefas') || nombre.includes('seguro')) return '/images/seguro-jefas.png'
    
    // Imagen por defecto
    return '/images/hero-1.png'
  }
  
  const colors = colorMap[programa.id] || colorMap[1]
  const image = getImage(programa)
  
  const handleVerDetalles = () => {
    navigate(`/tramite/${programa.id}`)
  }

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2 flex-shrink-0 w-[350px]">
      {/* Imagen de fondo */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={programa.nombre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Icono */}
          <div className={`${colors.iconBg} ${colors.iconColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Monto y periodo */}
          <div className="text-white">
            <div className="text-4xl font-black mb-1">{programa.monto}</div>
            <div className="text-white/90 text-sm font-semibold uppercase tracking-wide">{programa.periodicidad}</div>
          </div>
        </div>
      </div>

      {/* Contenido inferior */}
      <div className="p-6 bg-white">
        <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
          {programa.nombre}
        </h4>
        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">
          {programa.descripcion}
        </p>

        <button 
          onClick={handleVerDetalles}
          className="w-full text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3"
          style={{ background: 'linear-gradient(to right, #410016, #5a0020)' }}
        >
          <span>Ver Detalles</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Badge de disponibilidad */}
      <div className="absolute top-4 right-4">
        <div className={`backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 ${
          programa.grupo === 'B' 
            ? 'bg-emerald-100/90 text-emerald-700' 
            : 'bg-white/90 text-green-600'
        }`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${
            programa.grupo === 'B' ? 'bg-emerald-500' : 'bg-green-500'
          }`}></span>
          {programa.grupo === 'B' ? 'En línea' : 'Disponible'}
        </div>
      </div>
    </div>
  )
}
