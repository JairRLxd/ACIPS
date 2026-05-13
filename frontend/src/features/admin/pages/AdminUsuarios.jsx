import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useAuth } from '../../../context/AuthContext'
import { listarUsuariosAdmin, cambiarRolUsuario } from '../../../repositories/adminRepository'

const BRAND = '#410016'
const BRAND_MID = '#7a0028'

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-10 w-10" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  )
}

function RolBadge({ rol }) {
  if (rol === 'admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: BRAND }}>
        Admin
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
      Ciudadano
    </span>
  )
}

function AvatarInicial({ nombre, email }) {
  const letra = (nombre?.[0] || email?.[0] || '?').toUpperCase()
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}
    >
      {letra}
    </div>
  )
}

export default function AdminUsuarios() {
  const { currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modal, setModal] = useState(null) // { uid, nombre, rolActual, nuevoRol }
  const [cambiando, setCambiando] = useState(false)
  const [mensajeModal, setMensajeModal] = useState(null)

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listarUsuariosAdmin()
      setUsuarios(res.data?.usuarios || res.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const abrirModal = (usuario) => {
    const nuevoRol = usuario.rol === 'admin' ? 'ciudadano' : 'admin'
    setModal({
      uid: usuario.uid,
      nombre: usuario.displayName || usuario.email,
      rolActual: usuario.rol,
      nuevoRol,
    })
    setMensajeModal(null)
  }

  const confirmarCambio = async () => {
    if (!modal) return
    setCambiando(true)
    setMensajeModal(null)
    try {
      await cambiarRolUsuario(modal.uid, modal.nuevoRol)
      setUsuarios((prev) =>
        prev.map((u) => (u.uid === modal.uid ? { ...u, rol: modal.nuevoRol } : u))
      )
      setModal(null)
    } catch (err) {
      setMensajeModal(err.response?.data?.error || 'Error al cambiar el rol')
    } finally {
      setCambiando(false)
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    try {
      return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return '—'
    }
  }

  return (
    <AdminLayout>
      {/* Modal de confirmación */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-gray-900 text-center mb-2">Cambiar rol</h3>
            <p className="text-sm text-gray-600 text-center mb-5 leading-relaxed">
              ¿Cambiar el rol de{' '}
              <span className="font-bold text-gray-900">{modal.nombre}</span>{' '}
              a{' '}
              <span className="font-bold" style={{ color: BRAND }}>{modal.nuevoRol}</span>?
            </p>

            {mensajeModal && (
              <div className="mb-4 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                {mensajeModal}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={cambiando}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambio}
                disabled={cambiando}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})` }}
              >
                {cambiando ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Usuarios</h2>
          {!loading && (
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={cargar}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-14 h-14 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-sm font-semibold">No hay usuarios registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-6 py-3">Usuario</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Rol</th>
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map((u) => {
                const esMismoUsuario = currentUser?.uid === u.uid
                return (
                  <tr key={u.uid} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarInicial nombre={u.displayName} email={u.email} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {u.displayName || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-gray-400 font-mono truncate max-w-[140px]">{u.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">{u.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <RolBadge rol={u.rol} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-500">{formatFecha(u.created_at)}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => abrirModal(u)}
                        disabled={esMismoUsuario}
                        title={esMismoUsuario ? 'No puedes cambiar tu propio rol' : `Cambiar rol de ${u.displayName || u.email}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={
                          esMismoUsuario
                            ? {}
                            : { borderColor: BRAND, color: BRAND }
                        }
                      >
                        Cambiar rol
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
