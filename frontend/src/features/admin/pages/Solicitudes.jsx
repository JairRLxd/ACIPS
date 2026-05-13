import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { listarExpedientesAdmin } from '../../../repositories/tramitesRepository'

const BRAND = '#410016'

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700 bg-amber-100 border-amber-200' },
  aprobado: { label: 'Aprobado', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
  rechazado: { label: 'Rechazado', color: 'text-red-700 bg-red-100 border-red-200' },
  constancia_emitida: { label: 'Constancia emitida', color: 'text-blue-700 bg-blue-100 border-blue-200' },
}

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  const cargarSolicitudes = async () => {
    try {
      const res = await listarExpedientesAdmin()
      setSolicitudes(res.data?.tramites_virtuales || [])
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
      setSolicitudes([])
    } finally {
      setLoading(false)
    }
  }

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const cumpleFiltro = filtro === 'todas' || s.estado === filtro
    const cumpleBusqueda = busqueda === '' || 
      s.programa_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.usuario_uid?.toLowerCase().includes(busqueda.toLowerCase())
    return cumpleFiltro && cumpleBusqueda
  })

  const stats = {
    todas: solicitudes.length,
    pendiente: solicitudes.filter(s => s.estado === 'pendiente').length,
    aprobado: solicitudes.filter(s => s.estado === 'aprobado').length,
    rechazado: solicitudes.filter(s => s.estado === 'rechazado').length,
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Gestión de Solicitudes</h2>
        <p className="text-gray-600">Revisa, aprueba o rechaza las solicitudes de programas sociales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={stats.todas} color="#410016" active={filtro === 'todas'} onClick={() => setFiltro('todas')} />
        <StatCard label="Pendientes" value={stats.pendiente} color="#d97706" active={filtro === 'pendiente'} onClick={() => setFiltro('pendiente')} />
        <StatCard label="Aprobadas" value={stats.aprobado} color="#059669" active={filtro === 'aprobado'} onClick={() => setFiltro('aprobado')} />
        <StatCard label="Rechazadas" value={stats.rechazado} color="#dc2626" active={filtro === 'rechazado'} onClick={() => setFiltro('rechazado')} />
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por programa o usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={cargarSolicitudes}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p>Cargando solicitudes...</p>
            </div>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-semibold mb-1">No hay solicitudes</p>
            <p className="text-sm">Intenta cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Programa</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {solicitudesFiltradas.map((solicitud) => (
                  <SolicitudRow key={solicitud.id} solicitud={solicitud} onUpdate={cargarSolicitudes} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 transition-all text-left ${
        active 
          ? 'border-rose-300 bg-rose-50 shadow-lg scale-105' 
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
      }`}
    >
      <p className="text-3xl font-black mb-1" style={{ color }}>{value}</p>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
    </button>
  )
}

function SolicitudRow({ solicitud, onUpdate }) {
  const [procesando, setProcesando] = useState(false)
  const cfg = ESTADO_CONFIG[solicitud.estado] || { label: solicitud.estado, color: 'text-gray-600 bg-gray-100' }
  const fecha = solicitud.created_at
    ? new Date(solicitud.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  const handleAccion = async (accion) => {
    if (procesando) return
    setProcesando(true)
    
    // Aquí iría la lógica para aprobar/rechazar
    console.log(`${accion} solicitud:`, solicitud.id)
    
    setTimeout(() => {
      setProcesando(false)
      onUpdate()
    }, 1000)
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}>
            {(solicitud.usuario_uid || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{solicitud.usuario_uid || 'Usuario anónimo'}</p>
            <p className="text-xs text-gray-400">ID: {solicitud.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-gray-900">{solicitud.programa_nombre || `Programa #${solicitud.programa_id}`}</p>
        <p className="text-xs text-gray-400">Programa ID: {solicitud.programa_id}</p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600">{fecha}</p>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.color}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {cfg.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          {solicitud.estado === 'pendiente' && (
            <>
              <button
                onClick={() => handleAccion('aprobar')}
                disabled={procesando}
                className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                title="Aprobar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => handleAccion('rechazar')}
                disabled={procesando}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Rechazar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
          <button
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Ver detalles"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
