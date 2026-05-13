import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import AdminLayout from '../components/AdminLayout'
import { listarExpedientesAdmin } from '../../../repositories/tramitesRepository'

const BRAND = '#410016'
const BRAND_MID = '#7a0028'

export default function AdminHome() {
  const { currentUser } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await listarExpedientesAdmin()
        setSolicitudes(res.data?.tramites_virtuales || [])
      } catch {
        setSolicitudes([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const pendientes = solicitudes.filter((s) => s.estado === 'enviado').length
  const aprobadas = solicitudes.filter((s) => s.estado === 'aprobado').length
  const rechazadas = solicitudes.filter((s) => s.estado === 'rechazado').length
  const recientes = [...solicitudes]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'
  const nombre = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Administrador'

  return (
    <AdminLayout>
      {/* Header con decoración */}
      <div className="relative rounded-3xl overflow-hidden mb-8 p-8"
        style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}>
        {/* Blobs decorativos */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: '#ffc9d6', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 blur-2xl"
          style={{ backgroundColor: '#ff9db8', transform: 'translateY(40%)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">{saludo},</p>
            <h2 className="text-3xl font-black text-white mb-2">{nombre}</h2>
            <p className="text-white/70 text-sm">
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/solicitudes"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Ver solicitudes
            </Link>
            <Link
              to="/admin/reportes"
              className="flex items-center gap-2 bg-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg"
              style={{ color: BRAND }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar reporte
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Total solicitudes"
          value={loading ? '—' : solicitudes.length}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
          color={BRAND}
          bg="from-rose-50 to-pink-50"
          border="border-rose-100"
        />
        <KpiCard
          label="Pendientes"
          value={loading ? '—' : pendientes}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
          color="#d97706"
          bg="from-amber-50 to-yellow-50"
          border="border-amber-100"
          badge={pendientes > 0 ? 'Requieren atención' : null}
        />
        <KpiCard
          label="Aprobadas"
          value={loading ? '—' : aprobadas}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
          color="#059669"
          bg="from-emerald-50 to-green-50"
          border="border-emerald-100"
        />
        <KpiCard
          label="Rechazadas"
          value={loading ? '—' : rechazadas}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
          color="#dc2626"
          bg="from-red-50 to-rose-50"
          border="border-red-100"
        />
      </div>

      {/* Grid principal */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Solicitudes recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Solicitudes recientes</h3>
            <Link to="/admin/solicitudes"
              className="text-sm font-semibold hover:underline"
              style={{ color: BRAND }}>
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Cargando solicitudes…
            </div>
          ) : recientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
              <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Sin solicitudes aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recientes.map((s) => (
                <SolicitudRow key={s.id} solicitud={s} />
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-6">
          {/* Acciones rápidas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Acciones rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-rose-200 hover:bg-rose-50 transition-all group text-center"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {action.icon}
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Estado del sistema</h3>
            <div className="space-y-3">
              <StatusRow label="API Backend" status="online" detail="localhost:8080" />
              <StatusRow label="Firebase Auth" status="online" detail="Autenticado" />
              <StatusRow label="Groq AI" status="online" detail="llama-3.3-70b" />
              <StatusRow label="Base de datos" status="online" detail="Firestore" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color, bg, border, badge }) {
  return (
    <div className={`bg-gradient-to-br ${bg} rounded-2xl border ${border} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: color + '20' }}>
          <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        {badge && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            {badge}
          </span>
        )}
      </div>
      <p className="text-3xl font-black mb-1" style={{ color }}>{value}</p>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  )
}

const ESTADO_CONFIG = {
  enviado: { label: 'Pendiente de revisar', color: 'text-amber-700 bg-amber-100' },
  aprobado: { label: 'Aprobado sin constancia', color: 'text-emerald-700 bg-emerald-100' },
  rechazado: { label: 'Expediente rechazado', color: 'text-red-700 bg-red-100' },
  constancia_emitida: { label: 'Constancia emitida', color: 'text-blue-700 bg-blue-100' },
}

function SolicitudRow({ solicitud }) {
  const cfg = ESTADO_CONFIG[solicitud.estado] || { label: solicitud.estado, color: 'text-gray-600 bg-gray-100' }
  const fecha = solicitud.created_at
    ? new Date(solicitud.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
    : '—'

  return (
    <div className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ background: `linear-gradient(135deg, #410016, #7a0028)` }}>
        {(solicitud.usuario_uid || 'U')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {solicitud.programa_nombre || `Programa #${solicitud.programa_id}`}
        </p>
        <p className="text-xs text-gray-400 truncate">{solicitud.usuario_uid || 'Usuario anónimo'}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
          {cfg.label}
        </span>
        <span className="text-xs text-gray-400">{fecha}</span>
      </div>
    </div>
  )
}

function StatusRow({ label, status, detail }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <span className="text-xs text-gray-400">{detail}</span>
    </div>
  )
}

const QUICK_ACTIONS = [
  {
    label: 'Solicitudes',
    path: '/admin/solicitudes',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  },
  {
    label: 'Usuarios',
    path: '/admin/usuarios',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
  {
    label: 'Programas',
    path: '/admin/programas',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
  },
  {
    label: 'Constancias',
    path: '/admin/constancias',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    label: 'Incidencias',
    path: '/admin/incidencias',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  },
  {
    label: 'Reportes',
    path: '/admin/reportes',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  },
]
