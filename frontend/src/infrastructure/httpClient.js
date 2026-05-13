import axios from 'axios'
import { auth } from '../config/firebase'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use(async (config) => {
  try {
    const user = auth?.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // continuar sin token
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('No autorizado - verifica tu sesión')
    }
    return Promise.reject(error)
  }
)

export default httpClient
