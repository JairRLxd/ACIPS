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
import { sincronizarUsuario } from '../repositories/userRepository'

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

  const register = async (email, password, displayName) => {
    const result = await registerWithEmail(email, password, displayName)
    if (result.success) await syncWithBackend()
    return result
  }

  const login = async (email, password) => {
    const result = await loginWithEmail(email, password)
    if (result.success) {
      const backendData = await syncWithBackend()
      return { ...result, rol: backendData?.rol || 'ciudadano' }
    }
    return result
  }

  const loginGoogle = async () => {
    const result = await loginWithGoogle()
    if (result.success) {
      const backendData = await syncWithBackend()
      return { 
        ...result, 
        rol: backendData?.rol || 'ciudadano',
        user: result.user 
      }
    }
    return result
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

  // Sincronizar usuario con backend — retorna el usuario para que login pueda leer el rol
  const syncWithBackend = async () => {
    try {
      const response = await sincronizarUsuario()
      console.log('📥 Respuesta del backend:', response.data)
      
      // El backend devuelve { success: true, data: {...} }
      if (response.data && response.data.data) {
        setBackendUser(response.data.data)
        return response.data.data
      } else if (response.data) {
        // Fallback por si la estructura es diferente
        setBackendUser(response.data)
        return response.data
      }
    } catch (error) {
      console.error('Error al sincronizar con backend:', error)
    }
    return null
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user)
        if (user) {
          await syncWithBackend()
        } else {
          setBackendUser(null)
        }
        setLoading(false)
      },
      () => setLoading(false)
    )

    return () => unsubscribe()
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
