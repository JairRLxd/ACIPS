import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerMiPerfil } from '../repositories/adminRepository'

const BRAND = '#410016'
const BRAND_MID = '#7a0028'

function RolBadge({ rol }) {
  if (rol === 'admin') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Administrador
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
      Ciudadano
    </span>
  )
}

const ACCESOS_RAPIDOS = [
  {
    label: 'Mis Solicitudes',
    desc: 'Revisa el estado de tus trámites',
    path: '/mis-solicitudes',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    label: 'Mi Wallet',
    desc: 'Gestiona tus documentos digitales',
    path: '/mi-wallet',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    ),
  },
  {
    label: 'Diagnóstico',
    desc: 'Descubre a qué programas aplicas',
    path: '/diagnostico',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
]

export default function Perfil() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await obtenerMiPerfil()
        setPerfil(res.data?.usuario || res.data || null)
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar tu perfil')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [currentUser, navigate])

  if (!currentUser) return null

  const nombre = perfil?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario'
  const email = perfil?.email || currentUser.email || '—'
  const rol = perfil?.rol || 'ciudadano'
  const fotoUrl = currentUser.photoURL || null
  const inicial = nombre[0].toUpperCase()

  const formatFecha = (fecha) => {
    if (!fecha) return null
    try {
      return new Date(fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return null
    }
  }

  const miembroDesde = formatFecha(perfil?.created_at || currentUser.metadata?.creationTime)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 font-semibold">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Avatar + nombre */}
      <div className="flex flex-col items-center mb-8">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={nombre}
            className="w-24 h-24 rounded-full object-cover shadow-xl mb-4 ring-4 ring-white"
            style={{ boxShadow: `0 0 0 4px ${BRAND}40` }}
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl mb-4"
            style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}
          >
            {inicial}
          </div>
        )}
        <h1 className="text-3xl font-black text-gray-900 text-center">{nombre}</h1>
        <div className="mt-2">
          <RolBadge rol={rol} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Tarjeta de información */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100"
          style={{ background: `linear-gradient(135deg, ${BRAND}08, ${BRAND_MID}08)` }}>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Información de cuenta</h2>
        </div>

        <div className="divide-y divide-gray-50">
          {/* Nombre */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${BRAND}15` }}>
                <svg className="w-4 h-4" fill="none" stroke={BRAND} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Nombre</p>
                <p className="text-sm font-bold text-gray-900">{nombre}</p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${BRAND}15` }}>
              <svg className="w-4 h-4" fill="none" stroke={BRAND} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Correo electrónico</p>
              <p className="text-sm font-bold text-gray-900">{email}</p>
            </div>
          </div>

          {/* Rol */}
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${BRAND}15` }}>
              <svg className="w-4 h-4" fill="none" stroke={BRAND} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Rol</p>
              <div className="mt-0.5">
                <RolBadge rol={rol} />
              </div>
            </div>
          </div>

          {/* Miembro desde */}
          {miembroDesde && (
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${BRAND}15` }}>
                <svg className="w-4 h-4" fill="none" stroke={BRAND} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Miembro desde</p>
                <p className="text-sm font-bold text-gray-900">{miembroDesde}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"
          style={{ background: `linear-gradient(135deg, ${BRAND}08, ${BRAND_MID}08)` }}>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Accesos rápidos</h2>
        </div>
        <div className="p-4 grid gap-3">
          {ACCESOS_RAPIDOS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
