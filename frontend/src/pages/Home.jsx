import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Home() {
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
                to="/programas"
                className="group inline-flex items-center gap-3 bg-white border-2 px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{ color: '#410016', borderColor: '#410016' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <svg className="w-6 h-6 group-hover:rotate-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0l-4-4m4 4l-4 4M5 19h14M5 5h14" />
                </svg>
                Ver todos los programas
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

          {/* Espacio para imagen a la derecha */}
          <div className="hidden lg:flex items-center justify-center animate-fade-in-up animation-delay-300">
            <div className="relative w-full max-w-[600px] h-[600px] flex items-center justify-center">
              {/* Logo de ACIPS */}
              <img 
                src="/images/logo.png" 
                alt="ACIPS Logo" 
                className="w-full h-full object-contain drop-shadow-2xl animate-float"
              />
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
        <div className="relative">
          <div className="flex gap-8 animate-carousel">
            {/* Primera copia de las tarjetas */}
            <ProgramCard
              programaId="1"
              title="Pensión para Adultos Mayores"
              monto="$6,000"
              periodo="bimestrales"
              descripcion="Para personas de 65 años o más"
              color="from-blue-500 to-blue-600"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              image="/images/pension-adultos.png"
            />
            <ProgramCard
              programaId="12"
              title="Becas Benito Juárez"
              monto="$1,840"
              periodo="bimestrales"
              descripcion="Para estudiantes de media superior"
              color="from-purple-500 to-purple-600"
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              image="/images/beca-benito.png"
            />
            <ProgramCard
              programaId="4"
              title="Sembrando Vida"
              monto="$6,250"
              periodo="mensuales"
              descripcion="Para productores rurales con tierra"
              color="from-green-500 to-green-600"
              iconBg="bg-green-100"
              iconColor="text-green-600"
              image="/images/sembrando-vida.png"
            />
            <ProgramCard
              programaId="13"
              title="Jóvenes Construyendo el Futuro"
              monto="$6,310"
              periodo="mensuales"
              descripcion="Para jóvenes de 18-29 años"
              color="from-orange-500 to-orange-600"
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              image="/images/jovenes-futuro.png"
            />
            <ProgramCard
              programaId="15"
              title="Apoyo a Madres Solas"
              monto="Variable"
              periodo="bimestrales"
              descripcion="Para mujeres jefas de hogar con hijos"
              color="from-pink-500 to-pink-600"
              iconBg="bg-pink-100"
              iconColor="text-pink-600"
              image="/images/seguro-jefas.png"
            />
            
            {/* Segunda copia para loop infinito */}
            <ProgramCard
              programaId="1"
              title="Pensión para Adultos Mayores"
              monto="$6,000"
              periodo="bimestrales"
              descripcion="Para personas de 65 años o más"
              color="from-blue-500 to-blue-600"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              image="/images/pension-adultos.png"
            />
            <ProgramCard
              programaId="12"
              title="Becas Benito Juárez"
              monto="$1,840"
              periodo="bimestrales"
              descripcion="Para estudiantes de media superior"
              color="from-purple-500 to-purple-600"
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              image="/images/beca-benito.png"
            />
            <ProgramCard
              programaId="4"
              title="Sembrando Vida"
              monto="$6,250"
              periodo="mensuales"
              descripcion="Para productores rurales con tierra"
              color="from-green-500 to-green-600"
              iconBg="bg-green-100"
              iconColor="text-green-600"
              image="/images/sembrando-vida.png"
            />
          </div>
        </div>
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
              <div className="text-5xl font-black mb-2" style={{ color: '#410016' }}>15+</div>
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
    navigate(`/tramites/${programaId}`)
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
