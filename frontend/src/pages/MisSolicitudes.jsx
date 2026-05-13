import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { obtenerMisSolicitudes } from '../repositories/tramitesRepository'
import { useNavigate } from 'react-router-dom'

const ESTADO_CONFIG = {
  enviado: {
    bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200',
    label: 'En revisión', icon: '🕐',
    descripcion: 'Tu solicitud fue recibida y está siendo revisada por un administrador.',
  },
  aprobado: {
    bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200',
    label: 'Aprobado', icon: '✅',
    descripcion: 'Tu solicitud fue aprobada. El administrador te notificará cuando el documento esté listo.',
  },
  rechazado: {
    bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200',
    label: 'No aprobado', icon: '❌',
    descripcion: 'Tu solicitud no fue aprobada. Revisa las observaciones para conocer el motivo.',
  },
  constancia_emitida: {
    bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200',
    label: 'Documento listo', icon: '📄',
    descripcion: 'Tu documento fue generado y está disponible para descargar.',
  },
}

function formatFecha(valor) {
  if (!valor) return null
  const d = new Date(valor)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MisSolicitudes() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return }
    cargarSolicitudes()
  }, [currentUser, navigate])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      const response = await obtenerMisSolicitudes()
      setSolicitudes(response.data?.tramites_virtuales || [])
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos cargar tus solicitudes. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: '#410016' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 font-semibold">Cargando tus solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-2"
            style={{ background: 'linear-gradient(to right, #410016, #7a0028)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Mis Solicitudes
          </h1>
          <p className="text-gray-500 text-lg">Aquí puedes ver el estado de tus trámites</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-semibold">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {solicitudes.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aún no tienes solicitudes</h3>
            <p className="text-gray-400 mb-6 text-sm">Cuando envíes un trámite virtual aparecerá aquí</p>
            <button
              onClick={() => navigate('/diagnostico')}
              className="px-8 py-3 rounded-2xl font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
            >
              Iniciar un trámite
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {solicitudes.map((sol, i) => {
              const cfg = ESTADO_CONFIG[sol.estado] || ESTADO_CONFIG.enviado
              const fecha = formatFecha(sol.created_at || sol.fecha_creacion || sol.updated_at)
              const constanciaUrl = sol.constancia_url || sol.pdf_constancia_url
              const observaciones = sol.observaciones_admin || sol.comentarios_revision

              return (
                <div key={sol.expediente_id || i}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

                  {/* Franja de estado */}
                  <div className={`px-5 py-3 flex items-center justify-between ${cfg.bg} ${cfg.border} border-b`}>
                    <span className={`font-bold text-sm flex items-center gap-1.5 ${cfg.text}`}>
                      <span>{cfg.icon}</span> {cfg.label}
                    </span>
                    {fecha && (
                      <span className="text-xs text-gray-500 font-medium">{fecha}</span>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Nombre del programa */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {sol.programa_nombre || 'Programa Social'}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mb-4">ID: {sol.expediente_id}</p>

                    {/* Descripción de estado */}
                    <p className="text-sm text-gray-600 mb-4">{cfg.descripcion}</p>

                    {/* Checklist de documentos */}
                    {sol.checklist && sol.checklist.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                          Documentos presentados ({sol.checklist.length})
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {sol.checklist.map((item, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                              <span className={item.estado === 'aprobado' ? 'text-emerald-600' : 'text-amber-500'}>
                                {item.estado === 'aprobado' ? '✓' : '○'}
                              </span>
                              <span className="font-medium truncate">{item.nombre}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Observaciones del admin */}
                    {observaciones && (
                      <div className={`rounded-xl p-4 mb-4 text-sm border ${
                        sol.estado === 'rechazado'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                        <p className="font-bold mb-1 text-xs uppercase tracking-wide">
                          {sol.estado === 'rechazado' ? 'Motivo del rechazo' : 'Comentarios del administrador'}
                        </p>
                        <p>{observaciones}</p>
                      </div>
                    )}

                    {/* Descarga de constancia */}
                    {constanciaUrl && (
                      <a
                        href={constanciaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 text-sm"
                        style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Descargar mi documento
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {solicitudes.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/diagnostico')}
              className="px-8 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90 inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva solicitud
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
