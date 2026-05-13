import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      setShowUserMenu(false)
      navigate('/')
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-transparent' 
        : 'shadow-xl'
    }`}
    style={!scrolled ? { background: 'linear-gradient(to right, #410016, #5a0020, #410016)' } : {}}>
      <div className="container mx-auto px-6 py-3">
        {/* Contenedor principal con fondo blanco redondeado */}
        <div className={`rounded-full shadow-lg px-6 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled 
            ? 'bg-white/70 backdrop-blur-xl shadow-2xl' 
            : 'bg-white'
        }`}>
          
          {/* Brand/Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 overflow-hidden"
            style={{ background: 'linear-gradient(to bottom right, #f8f7f7ff, #ffffffff)' }}>
              <img 
                src="/images/logo.png" 
                alt="ACIPS Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-gray-800 font-bold text-2xl tracking-tight hidden sm:block">
              ACIPS
            </span>
          </Link>

          {/* Navigation Links - Centrados */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" active={isActive('/')}>
              Inicio
            </NavLink>
            <NavLink to="/diagnostico" active={isActive('/diagnostico')}>
              Diagnóstico
            </NavLink>
            <NavLink to="/chat" active={isActive('/chat')}>
              Chatbot
            </NavLink>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3">
            {/* Si el usuario está logueado, mostrar menú de usuario */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-md text-white"
                  style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="hidden sm:inline">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                  <svg className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Menú desplegable */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{currentUser.displayName || 'Usuario'}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    </div>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Mi Perfil</span>
                    </Link>
                    <Link
                      to="/mis-solicitudes"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Mis Solicitudes</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left border-t border-gray-100 mt-2"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-semibold text-red-600">Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Botón Login si no está logueado */
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-md text-white"
                style={{ background: 'linear-gradient(to right, #410016, #7a0028)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
        active
          ? 'text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      style={active ? { background: 'linear-gradient(to right, #410016, #7a0028)' } : {}}
    >
      {children}
    </Link>
  )
}
