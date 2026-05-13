import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { obtenerMisSolicitudes } from '../api/client'
import { useNavigate } from 'react-router-dom'

export default function MisSolicitudes() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    cargarSolicitudes()
  }, [currentUser, navigate])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      const response = await obtenerMisSolicitudes()
      
      if (response.data && response.data.tramites_virtuales) {
        setSolicitudes(response.data.tramites_virtuales)
      }
    } catch (err) {
      console.error('Error al cargar solicitudes:', err)
      setError(err.response?.data?.error || 'Error al cargar tus solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pendiente de revisión'
      },
      aprobado: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Aprobado'
      },
      rechazado: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Rechazado'
      }
    }
    
    const badge = badges[estado] || badges.pendiente
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: '#410016' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-semibold">Cargando tus solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-3"
          style={{ 
            background: 'linear-gradient(to right, #410016, #7a0028)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Mis Solicitudes
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Revisa el estado de tus trámites virtuales
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Lista de solicitudes */}
        {solicitudes.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No tienes solicitudes</h3>
            <p className="text-gray-500 mb-6">Aún no has enviado ningún trámite virtual</p>
            <button
              onClick={() => navigate('/tramite')}
              className="px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
            >
              Crear mi primera solicitud
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {solicitudes.map((solicitud, index) => (
              <div
                key={solicitud.expediente_id || index}
                className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {solicitud.programa_nombre || 'Programa Social'}
                      </h3>
                      {getEstadoBadge(solicitud.estado)}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Expediente:</span> {solicitud.expediente_id}
                      </p>
                      <p>
                        <span className="font-semibold">Fecha de solicitud:</span>{' '}
                        {new Date(solicitud.fecha_creacion).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {solicitud.documentos_validados && (
                        <p>
                          <span className="font-semibold">Documentos adjuntos:</span>{' '}
                          {solicitud.documentos_validados.length}
                        </p>
                      )}
                    </div>

                    {/* Comentarios de revisión */}
                    {solicitud.comentarios_revision && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Comentarios del revisor:</p>
                        <p className="text-sm text-gray-600">{solicitud.comentarios_revision}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {solicitud.pdf_acuse_url && (
                      <a
                        href={solicitud.pdf_acuse_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
                      >
                        Ver acuse
                      </a>
                    )}
                    {solicitud.pdf_constancia_url && solicitud.estado === 'aprobado' && (
                      <a
                        href={solicitud.pdf_constancia_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-center"
                      >
                        Descargar constancia
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón para crear nueva solicitud */}
        {solicitudes.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/tramite')}
              className="px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:shadow-xl inline-flex items-center gap-2"
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
