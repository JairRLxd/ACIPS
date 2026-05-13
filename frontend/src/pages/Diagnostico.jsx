import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { enviarDiagnostico } from '../api/client'

export default function Diagnostico() {
  const navigate = useNavigate()
  const { setPerfilUsuario, setResultados } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    edad: '',
    municipio: '',
    tiene_hijos: null,
    nivel_ingresos: '',
    estudia: null,
    tiene_discapacidad: null,
  })

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validar campos
    if (!formData.edad || !formData.municipio || formData.tiene_hijos === null ||
        !formData.nivel_ingresos || formData.estudia === null || formData.tiene_discapacidad === null) {
      setError('Por favor completa todas las preguntas')
      return
    }

    setLoading(true)

    try {
      const perfil = {
        edad: parseInt(formData.edad),
        municipio: formData.municipio,
        tiene_hijos: formData.tiene_hijos,
        nivel_ingresos: formData.nivel_ingresos,
        estudia: formData.estudia,
        tiene_discapacidad: formData.tiene_discapacidad,
      }

      const response = await enviarDiagnostico(perfil)

      if (response.data) {
        setPerfilUsuario(perfil)
        
        // El backend ahora devuelve la respuesta del chatbot
        // Extraer programas elegibles de la respuesta
        const respuesta = response.data.respuesta || response.data.mensaje || ''
        
        // Guardar la respuesta completa como resultados
        setResultados({
          mensaje: respuesta,
          perfil: perfil,
          timestamp: new Date().toISOString()
        })
        
        navigate('/resultados')
      } else {
        setError('Error al procesar diagnóstico')
      }
    } catch (err) {
      console.error('Error:', err)
      const errorMsg = err.response?.data?.error || 'Error de conexión. Verifica que el backend esté corriendo.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header mejorado */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 leading-tight">
            Diagnóstico de Elegibilidad
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Responde estas <span className="font-bold" style={{ color: '#410016' }}>6 preguntas</span> para descubrir qué apoyos te corresponden
          </p>
          
          {/* Barra de progreso */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progreso</span>
              <span>{Object.values(formData).filter(v => v !== '' && v !== null).length}/6</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${(Object.values(formData).filter(v => v !== '' && v !== null).length / 6) * 100}%`,
                  background: 'linear-gradient(to right, #410016, #7a0028)'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Formulario mejorado */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white">
          <form onSubmit={handleSubmit} className="space-y-10">
          {/* Pregunta 1: Edad */}
          <div className="group animate-fade-in-up animation-delay-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                1
              </div>
              <div className="flex-1">
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  ¿Cuántos años tienes?
                </label>
                <p className="text-gray-500 text-sm">Esta información nos ayuda a identificar programas según tu edad</p>
              </div>
            </div>
            <input
              type="number"
              min="0"
              max="120"
              value={formData.edad}
              onChange={(e) => handleChange('edad', e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-[#410016] focus:outline-none transition-all duration-300 hover:border-gray-300"
              placeholder="Ejemplo: 35"
              required
            />
          </div>

          {/* Pregunta 2: Municipio */}
          <div className="group animate-fade-in-up animation-delay-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                2
              </div>
              <div className="flex-1">
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  ¿En qué municipio vives?
                </label>
                <p className="text-gray-500 text-sm">Algunos programas varían según tu ubicación</p>
              </div>
            </div>
            <input
              type="text"
              value={formData.municipio}
              onChange={(e) => handleChange('municipio', e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-[#410016] focus:outline-none transition-all duration-300 hover:border-gray-300"
              placeholder="Ejemplo: Guadalajara"
              required
            />
          </div>

          {/* Pregunta 3: Hijos */}
          <div className="group animate-fade-in-up animation-delay-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                3
              </div>
              <div className="flex-1">
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  ¿Tienes hijos menores de 23 años?
                </label>
                <p className="text-gray-500 text-sm">Hay apoyos especiales para familias con hijos</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChange('tiene_hijos', true)}
                className={`py-5 px-6 text-lg font-bold rounded-2xl border-2 transition-all duration-300 ${
                  formData.tiene_hijos === true
                    ? 'text-white border-[#410016] shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#410016] hover:scale-105'
                }`}
                style={formData.tiene_hijos === true ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sí, tengo hijos
              </button>
              <button
                type="button"
                onClick={() => handleChange('tiene_hijos', false)}
                className={`py-5 px-6 text-lg font-bold rounded-2xl border-2 transition-all duration-300 ${
                  formData.tiene_hijos === false
                    ? 'text-white border-[#410016] shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#410016] hover:scale-105'
                }`}
                style={formData.tiene_hijos === false ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No tengo hijos
              </button>
            </div>
          </div>

          {/* Pregunta 4: Ingresos */}
          <div className="group animate-fade-in-up animation-delay-400">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                4
              </div>
              <div className="flex-1">
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  ¿Cuál es tu nivel de ingresos mensuales?
                </label>
                <p className="text-gray-500 text-sm">Esto determina tu elegibilidad para ciertos programas</p>
              </div>
            </div>
            <select
              value={formData.nivel_ingresos}
              onChange={(e) => handleChange('nivel_ingresos', e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-[#410016] focus:outline-none transition-all duration-300 hover:border-gray-300 bg-white"
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="bajo">Menos de $3,000 al mes</option>
              <option value="medio-bajo">Entre $3,000 y $8,000 al mes</option>
              <option value="medio">Más de $8,000 al mes</option>
            </select>
          </div>

          {/* Pregunta 5: Estudia */}
          <div className="group animate-fade-in-up animation-delay-500">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                5
              </div>
              <div className="flex-1">
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  ¿Estás estudiando actualmente?
                </label>
                <p className="text-gray-500 text-sm">Existen becas y apoyos para estudiantes</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChange('estudia', true)}
                className={`py-5 px-6 text-lg font-bold rounded-2xl border-2 transition-all duration-300 ${
                  formData.estudia === true
                    ? 'text-white border-[#410016] shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#410016] hover:scale-105'
                }`}
                style={formData.estudia === true ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sí, estudio
              </button>
              <button
                type="button"
                onClick={() => handleChange('estudia', false)}
                className={`py-5 px-6 text-lg font-bold rounded-2xl border-2 transition-all duration-300 ${
                  formData.estudia === false
                    ? 'text-white border-[#410016] shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#410016] hover:scale-105'
                }`}
                style={formData.estudia === false ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No estudio
              </button>
            </div>
          </div>

          {/* Pregunta 6: Discapacidad */}
          <div className="group animate-fade-in-up animation-delay-600">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                6
              </div>
              <div className="flex-1">
                <label className="block text-2xl font-bold text-gray-900 mb-2">
                  ¿Tienes alguna discapacidad reconocida?
                </label>
                <p className="text-gray-500 text-sm">Hay programas especiales de apoyo para personas con discapacidad</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChange('tiene_discapacidad', true)}
                className={`py-5 px-6 text-lg font-bold rounded-2xl border-2 transition-all duration-300 ${
                  formData.tiene_discapacidad === true
                    ? 'text-white border-[#410016] shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#410016] hover:scale-105'
                }`}
                style={formData.tiene_discapacidad === true ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sí, tengo
              </button>
              <button
                type="button"
                onClick={() => handleChange('tiene_discapacidad', false)}
                className={`py-5 px-6 text-lg font-bold rounded-2xl border-2 transition-all duration-300 ${
                  formData.tiene_discapacidad === false
                    ? 'text-white border-[#410016] shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#410016] hover:scale-105'
                }`}
                style={formData.tiene_discapacidad === false ? { background: 'linear-gradient(135deg, #410016, #7a0028)' } : {}}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No tengo
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-start gap-3 animate-fade-in">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-6 px-8 rounded-2xl text-xl font-black hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
            style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #410016, #7a0028)' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                Ver Mis Resultados
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Mensaje de privacidad */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-6 flex items-start gap-4">
          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#410016' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-bold text-gray-900 mb-1">Tu información es privada y segura</p>
            <p className="text-gray-600 text-sm">No guardamos tus datos personales. Esta información solo se usa para calcular tu elegibilidad.</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
