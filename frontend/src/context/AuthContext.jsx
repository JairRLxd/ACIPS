import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import { 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogle, 
  logout as logoutService,
  resetPassword as resetPasswordService
} from '../services/authService'
import { sincronizarUsuario } from '../api/client'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendUser, setBackendUser] = useState(null)

  // Registrar usuario
  const register = async (email, password, displayName) => {
    const user = await registerWithEmail(email, password, displayName)
    // Sincronizar con backend
    await syncWithBackend()
    return user
  }

  // Iniciar sesión
  const login = async (email, password) => {
    const user = await loginWithEmail(email, password)
    // Sincronizar con backend
    await syncWithBackend()
    return user
  }

  // Iniciar sesión con Google
  const loginGoogle = async () => {
    const user = await loginWithGoogle()
    // Sincronizar con backend
    await syncWithBackend()
    return user
  }

  // Cerrar sesión
  const logout = async () => {
    setBackendUser(null)
    return await logoutService()
  }

  // Recuperar contraseña
  const resetPassword = async (email) => {
    return await resetPasswordService(email)
  }

  // Sincronizar usuario con backend
  const syncWithBackend = async () => {
    try {
      const response = await sincronizarUsuario()
      if (response.data) {
        setBackendUser(response.data)
      }
    } catch (error) {
      console.error('Error al sincronizar con backend:', error)
    }
  }

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      
      if (user) {
        // Usuario autenticado, sincronizar con backend
        await syncWithBackend()
      } else {
        // Usuario no autenticado
        setBackendUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    backendUser,
    register,
    login,
    loginGoogle,
    logout,
    resetPassword,
    syncWithBackend,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
