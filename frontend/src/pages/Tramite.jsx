import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { obtenerTramite, actualizarDocumento } from '../api/client'

export default function Tramite() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [programa, setPrograma] = useState(null)
  const [documentos, setDocumentos] = useState([])
  const [pasos, setPasos] = useState([])
  const [checklist, setChecklist] = useState(null)

  useEffect(() => {
    cargarTramite()
  }, [id])

  const cargarTramite = async () => {
    try {
      setLoading(true)
      const response = await obtenerTramite(id)

      if (response.data.success) {
        setPrograma(response.data.programa)
        setDocumentos(response.data.documentos)
        setPasos(response.data.pasos)
        setChecklist(response.data.checklist)
      } else {
        setError(response.data.error || 'Error al cargar trámite')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDocumento = async (documento) => {
    const estadoActual = checklist.requeridos.find((d) => d.nombre === documento)?.estado
    const nuevoEstado = estadoActual === 'OK' ? 'FALTA' : 'OK'

    try {
      const response = await actualizarDocumento(id, documento, nuevoEstado)

      if (response.data.success) {
        // Actualizar checklist localmente
        const nuevosRequeridos = checklist.requeridos.map((d) =>
          d.nombre === documento ? { ...d, estado: nuevoEstado } : d
        )

        setChecklist({
          ...checklist,
          requeridos: nuevosRequeridos,
          porcentaje: response.data.porcentaje,
        })
      }
    } catch (err) {
      console.error('Error al actualizar documento:', err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-xl text-gray-700">Cargando información del trámite...</p>
      </div>
    )
  }

  if (error || !programa) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-xl text-red-600 mb-4">{error || 'Programa no encontrado'}</p>
        <Link to="/resultados" className="text-blue-600 hover:underline">
          ← Volver a resultados
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-gray-600">
        <Link to="/" className="hover:text-blue-600">Inicio</Link>
        <span className="mx-2">›</span>
        <Link to="/resultados" className="hover:text-blue-600">Resultados</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">Guía de Trámite</span>
      </nav>

      {/* Encabezado */}
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          📄 {programa.nombre}
        </h1>
        <p className="text-xl text-gray-700">{programa.descripcion}</p>
      </div>

      {/* Info del programa */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-green-800 mb-2">💰 Monto</h3>
          <p className="text-3xl font-bold text-green-600">{programa.monto}</p>
          <p className="text-gray-700">{programa.periodicidad}</p>
        </div>
        <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-blue-800 mb-3">📞 Información</h3>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Teléfono:</span> {programa.telefono_informes}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Oficina:</span> {programa.oficina_tramite}
          </p>
        </div>
      </div>

      {/* Checklist de documentos */}
      {checklist && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 fade-in">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            ✅ Checklist de Documentos
          </h2>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">Progreso:</span>
              <span className="font-bold text-gray-800">{checklist.porcentaje}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500 flex items-center justify-center text-white font-semibold"
                style={{ width: `${checklist.porcentaje}%` }}
              >
                {checklist.porcentaje}%
              </div>
            </div>
          </div>

          {/* Lista de documentos */}
          <div className="space-y-3">
            {checklist.requeridos.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                <span className="text-lg text-gray-800">{doc.nombre}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleDocumento(doc.nombre)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      doc.estado === 'OK'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    {doc.estado === 'OK' ? '✅ Tengo' : '⬜ Marcar'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-gray-700">
              <span className="font-semibold">💡 Tip:</span> Marca los documentos que ya tienes para llevar control de tu progreso.
            </p>
          </div>
        </div>
      )}

      {/* Pasos del trámite */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 fade-in">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          🚶 Pasos para Tramitar
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          Sigue estos pasos en orden para completar tu trámite:
        </p>

        <div className="space-y-4">
          {pasos.map((paso, index) => (
            <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-800">{paso}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consejos */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
        <h3 className="text-2xl font-bold text-yellow-800 mb-4">
          💡 Consejos Importantes
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Lleva copias y originales de todos tus documentos</li>
          <li>• Verifica que tu INE esté vigente</li>
          <li>• El comprobante de domicilio debe ser reciente (máximo 3 meses)</li>
          <li>• Si tienes dudas, llama al teléfono de informes antes de ir</li>
          <li>• Llega temprano a la oficina para evitar filas largas</li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/resultados"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-center font-semibold hover:bg-gray-300 transition-all"
        >
          ← Volver a Resultados
        </Link>
        <Link
          to="/chat"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-all"
        >
          💬 Preguntar al Asistente
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-green-700 transition-all"
        >
          🖨️ Imprimir Guía
        </button>
      </div>
    </div>
  )
}
