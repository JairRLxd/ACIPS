import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

const firebaseNotConfigured = { success: false, error: 'Firebase no configurado. Agrega tus credenciales en el archivo .env' }

// Registro con email y contraseña
export const registerWithEmail = async (email, password, displayName) => {
  if (!auth) return firebaseNotConfigured
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Actualizar el perfil con el nombre
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      })
    }
    
    return {
      success: true,
      user: userCredential.user
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    }
  }
}

// Login con email y contraseña
export const loginWithEmail = async (email, password) => {
  if (!auth) return firebaseNotConfigured
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return {
      success: true,
      user: userCredential.user
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    }
  }
}

// Login con Google
export const loginWithGoogle = async () => {
  if (!auth || !googleProvider) return firebaseNotConfigured
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return {
      success: true,
      user: result.user
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    }
  }
}

// Cerrar sesión
export const logout = async () => {
  if (!auth) return { success: true }
  try {
    await signOut(auth)
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    }
  }
}

// Recuperar contraseña
export const resetPassword = async (email) => {
  if (!auth) return firebaseNotConfigured
  try {
    await sendPasswordResetEmail(auth, email)
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code)
    }
  }
}

// Mensajes de error en español
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Este correo ya está registrado',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
    'auth/cancelled-popup-request': 'Solicitud cancelada',
    'auth/popup-blocked': 'Popup bloqueado por el navegador'
  }
  
  return errorMessages[errorCode] || 'Error al procesar la solicitud'
}
