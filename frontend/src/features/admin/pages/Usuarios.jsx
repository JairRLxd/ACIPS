import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import httpClient from '../../../infrastructure/httpClient'

const BRAND = '#410016'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await httpClient.get('/api/v1/admin/usuarios')
      setUsuarios(response.data?.usuarios || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const cumpleFiltro = filtro === 'todos' || u.rol === filtro
    const cumpleBusqueda = busqueda === '' || 
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase())
    return cumpleFiltro && cumpleBusqueda
  })

  const stats = {
    todos: usuarios.length,
    admin: usuarios.filter(u => u.rol === 'admin').length,
    ciudadano: usuarios.filter(u => u.rol === 'ciudadano').length,
    activos: usuarios.filter(u => u.activo).length,
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Gestión de Usuarios</h2>
        <p className="text-gray-600">Administra los usuarios del sistema y sus permisos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total usuarios" value={stats.todos} color="#410016" icon="users" />
        <StatCard label="Administradores" value={stats.admin} color="#7a0028" icon="shield" />
        <StatCard label="Ciudadanos" value={stats.ciudadano} color="#059669" icon="user" />
        <StatCard label="Activos" value={stats.activos} color="#0891b2" icon="check" />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none"
              />
            </div>
          </div>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none font-semibold"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="ciudadano">Ciudadanos</option>
          </select>
          <button
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo usuario
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p>Cargando usuarios...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Último acceso</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuariosFiltrados.map((usuario) => (
                  <UsuarioRow key={usuario.uid} usuario={usuario} onUpdate={cargarUsuarios} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value, color, icon }) {
  const icons = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  }

  return (
    <div className="p-5 rounded-2xl border border-gray-100 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
          <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24">
            {icons[icon]}
          </svg>
        </div>
      </div>
      <p className="text-3xl font-black mb-1" style={{ color }}>{value}</p>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
    </div>
  )
}

function UsuarioRow({ usuario, onUpdate }) {
  const rolConfig = {
    admin: { label: 'Administrador', color: 'text-purple-700 bg-purple-100 border-purple-200' },
    ciudadano: { label: 'Ciudadano', color: 'text-blue-700 bg-blue-100 border-blue-200' },
  }

  const cfg = rolConfig[usuario.rol] || { label: usuario.rol, color: 'text-gray-600 bg-gray-100' }
  const ultimoAcceso = usuario.last_login_at
    ? new Date(usuario.last_login_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Nunca'

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${BRAND}, #7a0028)` }}>
            {usuario.nombre[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{usuario.nombre}</p>
            <p className="text-xs text-gray-400">UID: {usuario.uid.substring(0, 12)}...</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600">{usuario.email}</p>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.color}`}>
          {cfg.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
          usuario.activo ? 'text-emerald-700 bg-emerald-100' : 'text-gray-700 bg-gray-100'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${usuario.activo ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
          {usuario.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600">{ultimoAcceso}</p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Editar usuario"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="Desactivar usuario"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
