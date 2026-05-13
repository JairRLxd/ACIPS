import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useEffect } from 'react'

export default function Resultados() {
  const navigate = useNavigate()
  const { resultados, perfilUsuario } = useApp()

  useEffect(() => {
    if (!resultados || resultados.length === 0) {
      navigate('/diagnostico')
    }
  }, [resultados, navigate])

  if (!resultados || resultados.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-8 fade-in">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          ✅ Tus Resultados
        </h1>
        <p className="text-xl text-gray-700">
          Basado en tu perfil, estos son los programas sociales para ti
        </p>
      </div>

      {/* Resumen del perfil */}
      {perfilUsuario && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            👤 Tu Perfil
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
            <div>
              <span className="font-semibold">Edad:</span> {perfilUsuario.edad} años
            </div>
            <div>
              <span className="font-semibold">Municipio:</span> {perfilUsuario.municipio}
            </div>
            <div>
              <span className="font-semibold">Ingresos:</span> {perfilUsuario.nivel_ingresos}
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 ? (
        <>
          <div className="bg-green-100 border-2 border-green-400 text-green-800 px-6 py-4 rounded-lg mb-8 fade-in">
            <p className="text-lg font-semibold">
              ✅ ¡Buenas noticias! Encontramos {resultados.length} programa(s) para ti.
            </p>
          </div>

          <div className="space-y-6">
            {resultados.map((resultado, index) => (
              <ResultadoCard key={index} resultado={resultado} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg mb-8">
          <p className="text-lg font-semibold">
            ⚠️ No encontramos programas compatibles con tu perfil actual.
          </p>
          <p className="mt-2">
            Te recomendamos hablar con nuestro asistente para explorar otras opciones.
          </p>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link
          to="/diagnostico"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-center font-semibold hover:bg-gray-300 transition-all"
        >
          ← Hacer Nuevo Diagnóstico
        </Link>
        <Link
          to="/chat"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-all"
        >
          💬 Consultar con Asistente
        </Link>
      </div>
    </div>
  )
}

function ResultadoCard({ resultado }) {
  const getProbabilidadColor = (probabilidad) => {
    switch (probabilidad) {
      case 'Muy Alta':
        return 'bg-green-500'
      case 'Alta':
        return 'bg-blue-500'
      case 'Media':
        return 'bg-yellow-500'
      case 'Baja':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden fade-in hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
            {resultado.nombre}
          </h3>
          <span
            className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${getProbabilidadColor(
              resultado.probabilidad
            )}`}
          >
            Probabilidad: {resultado.probabilidad}
          </span>
        </div>

        <p className="text-gray-700 text-lg mb-4">{resultado.descripcion}</p>

        {/* Monto */}
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 mb-4">
          <p className="text-green-800 font-semibold text-lg">
            💰 Monto: {resultado.monto} {resultado.periodicidad}
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Compatibilidad:</span>
            <span className="font-bold text-gray-800">{resultado.score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full ${getProbabilidadColor(
                resultado.probabilidad
              )} transition-all duration-1000 ease-out flex items-center justify-center text-white text-sm font-semibold`}
              style={{ width: `${resultado.score}%` }}
            >
              {resultado.score}%
            </div>
          </div>
        </div>

        {/* Razones */}
        {resultado.razones && resultado.razones.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              ✅ Por qué calificas:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {resultado.razones.map((razon, idx) => (
                <li key={idx}>{razon}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Contacto */}
        {resultado.telefono && (
          <div className="mb-4 text-gray-700">
            <span className="font-semibold">📞 Teléfono:</span> {resultado.telefono}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/tramite/${resultado.id}`}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-all"
          >
            📄 Ver Guía de Trámite
          </Link>
          <Link
            to="/chat"
            className="flex-1 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg text-center font-semibold hover:bg-blue-50 transition-all"
          >
            💬 Preguntar al Asistente
          </Link>
        </div>
      </div>
    </div>
  )
}
