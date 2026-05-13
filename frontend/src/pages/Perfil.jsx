import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Perfil() {
  const { currentUser, backendUser, logout } = useAuth()
  const { perfilUsuario, setPerfilUsuario } = useApp()
  const navigate = useNavigate()
  
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  
  // Formulario de perfil
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    genero: '',
    estado_civil: '',
    municipio: '',
    telefono: '',
    ocupacion: '',
    nivel_estudios: '',
    dependientes_economicos: 0,
    ingreso_mensual: '',
  })

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    // Cargar datos del perfil
    if (perfilUsuario) {
      setFormData({
        nombre: perfilUsuario.nombre || currentUser.displayName || '',
        edad: perfilUsuario.edad || '',
        genero: perfilUsuario.genero || '',
        estado_civil: perfilUsuario.estado_civil || '',
        municipio: perfilUsuario.municipio || '',
        telefono: perfilUsuario.telefono || '',
        ocupacion: perfilUsuario.ocupacion || '',
        nivel_estudios: perfilUsuario.nivel_estudios || '',
        dependientes_economicos: perfilUsuario.dependientes_economicos || 0,
        ingreso_mensual: perfilUsuario.ingreso_mensual || '',
      })
    } else if (currentUser) {
      setFormData(prev => ({
        ...prev,
        nombre: currentUser.displayName || '',
      }))
    }
  }, [currentUser, perfilUsuario, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)

    try {
      // Guardar en el contexto local
      setPerfilUsuario(formData)
      
      // Aquí podrías agregar una llamada al backend para guardar el perfil
      // await actualizarPerfil(formData)
      
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente' })
      setEditando(false)
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(null), 3000)
    } catch (err) {
      console.error('Error al guardar perfil:', err)
      setMensaje({ tipo: 'error', texto: 'Error al guardar el perfil' })
    } finally {
      setGuardando(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await logout()
      navigate('/')
    }
  }

  const calcularCompletitud = () => {
    const campos = Object.values(formData)
    const completados = campos.filter(campo => campo !== '' && campo !== 0).length
    return Math.round((completados / campos.length) * 100)
  }

  const completitud = calcularCompletitud()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-3"
            style={{ 
              background: 'linear-gradient(to right, #410016, #7a0028)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
            Mi Perfil
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Administra tu información personal
          </p>
        </div>

        {/* Mensaje de éxito/error */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-2xl border-2 flex items-center gap-3 animate-fade-in ${
            mensaje.tipo === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {mensaje.tipo === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            <span className="font-semibold">{mensaje.texto}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Información de cuenta */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card de usuario */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-gray-200">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}>
                  {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {currentUser?.displayName || 'Usuario'}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{currentUser?.email}</p>
                
                {/* Rol */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ 
                    backgroundColor: backendUser?.rol === 'admin' ? '#fef3c7' : '#dbeafe',
                    color: backendUser?.rol === 'admin' ? '#92400e' : '#1e40af'
                  }}>
                  {backendUser?.rol === 'admin' ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Administrador
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Ciudadano
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Completitud del perfil */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Completitud del Perfil</h3>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-rose-600 bg-rose-200">
                      Progreso
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-rose-600">
                      {completitud}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-rose-200">
                  <div 
                    style={{ width: `${completitud}%`, background: 'linear-gradient(to right, #410016, #7a0028)' }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                  ></div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {completitud === 100 
                  ? '¡Perfil completo! 🎉' 
                  : 'Completa tu perfil para obtener mejores recomendaciones'}
              </p>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-gray-200 space-y-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              
              <button
                onClick={() => navigate('/mis-solicitudes')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold text-gray-700">Mis Solicitudes</span>
              </button>

              <button
                onClick={() => navigate('/diagnostico')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-semibold text-gray-700">Hacer Diagnóstico</span>
              </button>

              {backendUser?.rol === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold text-yellow-700">Panel Admin</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold text-red-700">Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Formulario de perfil */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">Información Personal</h2>
                {!editando && (
                  <button
                    onClick={() => setEditando(true)}
                    className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
                  >
                    Editar Perfil
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={!editando}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Tu nombre completo"
                  />
                </div>

                {/* Edad y Género */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Edad
                    </label>
                    <input
                      type="number"
                      name="edad"
                      value={formData.edad}
                      onChange={handleChange}
                      disabled={!editando}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Tu edad"
                      min="0"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Género
                    </label>
                    <select
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      disabled={!editando}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Selecciona...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                  </div>
                </div>

                {/* Estado Civil y Municipio */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Estado Civil
                    </label>
                    <select
                      name="estado_civil"
                      value={formData.estado_civil}
                      onChange={handleChange}
                      disabled={!editando}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Selecciona...</option>
                      <option value="soltero">Soltero(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viudo">Viudo(a)</option>
                      <option value="union_libre">Unión Libre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Municipio
                    </label>
                    <input
                      type="text"
                      name="municipio"
                      value={formData.municipio}
                      onChange={handleChange}
                      disabled={!editando}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Tu municipio"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={!editando}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="10 dígitos"
                  />
                </div>

                {/* Ocupación y Nivel de Estudios */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ocupación
                    </label>
                    <input
                      type="text"
                      name="ocupacion"
                      value={formData.ocupacion}
                      onChange={handleChange}
                      disabled={!editando}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Tu ocupación"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nivel de Estudios
                    </label>
                    <select
                      name="nivel_estudios"
                      value={formData.nivel_estudios}
                      onChange={handleChange}
                      disabled={!editando}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Selecciona...</option>
                      <option value="sin_estudios">Sin estudios</option>
                      <option value="primaria">Primaria</option>
                      <option value="secundaria">Secundaria</option>
                      <option value="preparatoria">Preparatoria</option>
                      <option value="universidad">Universidad</option>
                      <option value="posgrado">Posgrado</option>
                    </select>
                  </div>
                </div>

                {/* Dependientes e Ingreso */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Dependientes Económicos
                    </label>
                    <input
                      type="number"
                      name="dependientes_economicos"
                      value={formData.dependientes_economicos}
                      onChange={handleChange}
                      disabled={!editando}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Número de dependientes"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ingreso Mensual
                    </label>
                    <select
                      name="ingreso_mensual"
                      value={formData.ingreso_mensual}
                      onChange={handleChange}
                      disabled={!editando}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Selecciona...</option>
                      <option value="menos_3000">Menos de $3,000</option>
                      <option value="3000_6000">$3,000 - $6,000</option>
                      <option value="6000_10000">$6,000 - $10,000</option>
                      <option value="10000_15000">$10,000 - $15,000</option>
                      <option value="mas_15000">Más de $15,000</option>
                    </select>
                  </div>
                </div>

                {/* Botones */}
                {editando && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #410016, #7a0028)' }}
                    >
                      {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(false)
                        // Restaurar datos originales
                        if (perfilUsuario) {
                          setFormData({
                            nombre: perfilUsuario.nombre || currentUser.displayName || '',
                            edad: perfilUsuario.edad || '',
                            genero: perfilUsuario.genero || '',
                            estado_civil: perfilUsuario.estado_civil || '',
                            municipio: perfilUsuario.municipio || '',
                            telefono: perfilUsuario.telefono || '',
                            ocupacion: perfilUsuario.ocupacion || '',
                            nivel_estudios: perfilUsuario.nivel_estudios || '',
                            dependientes_economicos: perfilUsuario.dependientes_economicos || 0,
                            ingreso_mensual: perfilUsuario.ingreso_mensual || '',
                          })
                        }
                      }}
                      className="px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
