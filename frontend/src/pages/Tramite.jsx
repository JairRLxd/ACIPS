import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { obtenerTramite } from '../repositories/tramitesRepository'

export default function Tramite() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tramite, setTramite] = useState(null)
  const [checklist, setChecklist] = useState({})

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        const response = await obtenerTramite(id)
        const data = response.data
        setTramite(data)
        // Inicializar checklist local con los documentos requeridos
        const inicial = {}
        data.documentos_requeridos?.forEach((doc) => {
          inicial[doc.id] = false
        })
        setChecklist(inicial)
      } catch {
        setError('No se pudo cargar el trámite')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  const toggleDoc = (docId) =>
    setChecklist((prev) => ({ ...prev, [docId]: !prev[docId] }))

  const completados = Object.values(checklist).filter(Boolean).length
  const total = tramite?.documentos_requeridos?.length || 0
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-700">Cargando información del trámite...</p>
      </div>
    )
  }

  if (error || !tramite) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-red-600 mb-4">{error || 'Programa no encontrado'}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-gray-600 text-sm">
        <Link to="/" className="hover:text-blue-600">Inicio</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{tramite.nombre}</span>
      </nav>

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tramite.nombre}</h1>
        <p className="text-gray-600">{tramite.descripcion}</p>
      </div>

      {/* Info del programa */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Monto</p>
          <p className="text-2xl font-bold text-green-700">{tramite.monto}</p>
          <p className="text-sm text-gray-500">{tramite.periodicidad}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Dependencia</p>
          <p className="font-semibold text-blue-800 text-sm">{tramite.dependencia}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Modalidad</p>
          <p className="font-semibold text-purple-800 capitalize">{tramite.modalidad}</p>
          {tramite.url_oficial && (
            <a href={tramite.url_oficial} target="_blank" rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:underline">
              Sitio oficial →
            </a>
          )}
        </div>
      </div>

      {/* Checklist de documentos */}
      {tramite.documentos_requeridos?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Documentos requeridos</h2>

          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{completados} de {total} listos</span>
              <span className="font-bold text-gray-800">{porcentaje}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {tramite.documentos_requeridos.map((doc) => (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  checklist[doc.id]
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                }`}
              >
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  checklist[doc.id] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                }`}>
                  {checklist[doc.id] && '✓'}
                </span>
                <div>
                  <p className="font-medium text-gray-800">{doc.nombre}</p>
                  <p className="text-xs text-gray-500 capitalize">{doc.tipo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Requisitos */}
      {tramite.requisitos && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Requisitos de elegibilidad</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {tramite.requisitos.edad_minima && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Edad mínima:</span>
                <span>{tramite.requisitos.edad_minima} años</span>
              </div>
            )}
            {tramite.requisitos.edad_maxima && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Edad máxima:</span>
                <span>{tramite.requisitos.edad_maxima} años</span>
              </div>
            )}
            {tramite.requisitos.nivel_ingreso && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Nivel de ingreso:</span>
                <span className="capitalize">{tramite.requisitos.nivel_ingreso}</span>
              </div>
            )}
            {tramite.requisitos.municipios_rurales && (
              <div className="flex gap-2 text-gray-700">
                <span className="font-semibold">Zona:</span>
                <span>Municipios rurales</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-xl text-center font-semibold hover:bg-gray-200 transition-all"
        >
          ← Volver al inicio
        </Link>
        <Link
          to="/chat"
          className="flex-1 text-white px-6 py-3 rounded-xl text-center font-semibold transition-all"
          style={{ background: 'linear-gradient(to right, #410016, #5a0020)' }}
        >
          Preguntar al asistente
        </Link>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all"
        >
          Imprimir guía
        </button>
      </div>
    </div>
  )
}
