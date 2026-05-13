import axios from 'axios';
import { auth } from '../config/firebase';

// URL del backend - Cambiar según el entorno
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Cliente API configurado
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: false, // Cambiado a false para evitar problemas de CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('No se pudo obtener el token de autenticación:', error);
      // Continuar sin token en modo de prueba
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error API:', error);
    if (error.response?.status === 401) {
      // Token inválido o expirado
      console.error('No autorizado - verifica tu sesión');
    }
    return Promise.reject(error);
  }
);

// ============================================
// FUNCIONES DE API - NUEVOS ENDPOINTS
// ============================================

// --- AUTENTICACIÓN ---
export const sincronizarUsuario = () => {
  return apiClient.get('/api/v1/auth/me');
};

// --- HEALTH CHECK ---
export const healthcheck = () => {
  return apiClient.get('/api/v1/health');
};

// --- CHATBOT ---
export const enviarMensajeChat = (mensaje, sesionId = null) => {
  return apiClient.post('/api/v1/chat', {
    mensaje,
    sesion_id: sesionId,
  });
};

// --- TRÁMITES / PROGRAMAS SOCIALES ---
export const obtenerTramites = (params = {}) => {
  return apiClient.get('/api/v1/tramites', { params });
};

export const obtenerTramite = (programaId) => {
  return apiClient.get(`/api/v1/tramites/${programaId}`);
};

// --- VALIDACIÓN DE DOCUMENTOS ---
export const validarDocumento = (archivoBase64, nombreArchivo) => {
  return apiClient.post('/api/v1/validar-documento', {
    archivo_base64: archivoBase64,
    nombre_archivo: nombreArchivo,
  });
};

// --- TRÁMITES VIRTUALES (EXPEDIENTES) ---
export const crearTramiteVirtual = (programaId, documentosValidados) => {
  return apiClient.post('/api/v1/tramites-virtuales', {
    programa_id: programaId,
    documentos_validados: documentosValidados,
  });
};

export const obtenerMisSolicitudes = () => {
  return apiClient.get('/api/v1/tramites-virtuales/mis-solicitudes');
};

// --- ADMIN: GESTIÓN DE EXPEDIENTES ---
export const listarExpedientesAdmin = (estado = null) => {
  const params = estado ? { estado } : {};
  return apiClient.get('/api/v1/admin/tramites-virtuales', { params });
};

export const revisarExpediente = (expedienteId, aprobado, comentarios = '') => {
  return apiClient.post(`/api/v1/admin/tramites-virtuales/${expedienteId}/revision`, {
    aprobado,
    comentarios,
  });
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Convertir archivo a Base64
export const archivoABase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remover el prefijo "data:...;base64,"
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// ============================================
// FUNCIONES LEGACY (mantener compatibilidad)
// ============================================

export const enviarDiagnostico = (perfil) => {
  // Esta función ahora usa el chatbot para calcular elegibilidad
  const mensaje = `Quiero saber qué programas me corresponden. Tengo ${perfil.edad} años, vivo en ${perfil.municipio}, ${perfil.tiene_hijos ? 'tengo hijos' : 'no tengo hijos'}, mis ingresos son ${perfil.nivel_ingresos}, ${perfil.estudia ? 'estoy estudiando' : 'no estudio'}, y ${perfil.tiene_discapacidad ? 'tengo discapacidad' : 'no tengo discapacidad'}.`;
  return enviarMensajeChat(mensaje);
};

export const limpiarChat = () => {
  // El backend maneja sesiones automáticamente
  return Promise.resolve({ data: { success: true } });
};

export const obtenerProgramas = () => {
  return obtenerTramites();
};

export const actualizarDocumento = (programaId, documento, estado) => {
  // Actualizar el estado de un documento en el checklist
  return apiClient.post(`/api/v1/tramites/${programaId}/documento`, {
    documento,
    estado,
  });
};

export const guardarPerfil = (perfil) => {
  // El perfil se sincroniza automáticamente con Firebase
  return sincronizarUsuario();
};

export const obtenerPerfil = () => {
  return sincronizarUsuario();
};

export default apiClient;
