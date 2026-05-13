# 🔗 INTEGRACIÓN BACKEND-FRONTEND COMPLETADA

## ✅ Cambios Realizados

### 1. **API Client Actualizado** (`frontend/src/api/client.js`)

#### Nuevas funcionalidades:
- ✅ **Interceptor de autenticación**: Agrega automáticamente el token de Firebase a todas las peticiones
- ✅ **Nuevos endpoints**:
  - `sincronizarUsuario()` - Sincroniza usuario con backend
  - `enviarMensajeChat(mensaje, sesionId)` - Chatbot con IA
  - `obtenerTramites(params)` - Lista programas sociales
  - `obtenerTramite(id)` - Detalle de programa
  - `validarDocumento(base64, nombre)` - Validación con OCR
  - `crearTramiteVirtual(programaId, docs)` - Crear solicitud
  - `obtenerMisSolicitudes()` - Ver mis trámites
  - `listarExpedientesAdmin(estado)` - Panel admin
  - `revisarExpediente(id, aprobado, comentarios)` - Aprobar/rechazar
- ✅ **Función auxiliar**: `archivoABase64(file)` para convertir archivos
- ✅ **Compatibilidad legacy**: Funciones antiguas redirigen a las nuevas

### 2. **AuthContext Mejorado** (`frontend/src/context/AuthContext.jsx`)

- ✅ Sincronización automática con backend al iniciar sesión
- ✅ Nueva propiedad `backendUser` con datos del usuario desde el backend
- ✅ Función `syncWithBackend()` para sincronizar manualmente

### 3. **Páginas Actualizadas**

#### Chatbot (`frontend/src/pages/Chatbot.jsx`)
- ✅ Usa el nuevo endpoint `/api/v1/chat`
- ✅ Manejo mejorado de errores
- ✅ Compatible con respuestas del backend

#### Diagnóstico (`frontend/src/pages/Diagnostico.jsx`)
- ✅ Usa el chatbot para calcular elegibilidad
- ✅ Formato de respuesta adaptado al backend

### 4. **Nueva Página: Mis Solicitudes**

Creada `frontend/src/pages/MisSolicitudes.jsx`:
- ✅ Lista todas las solicitudes del usuario
- ✅ Muestra estado (pendiente/aprobado/rechazado)
- ✅ Descarga de acuses y constancias
- ✅ Comentarios del revisor

### 5. **Configuración del Backend**

Creado `.vscode/backend/.env.example` con:
- Variables de entorno necesarias
- Instrucciones de configuración
- Documentación de cada variable

---

## 🚀 Pasos para Ejecutar

### **Paso 1: Configurar Backend**

1. **Crear archivo .env del backend**:
```bash
cd .vscode/backend
cp .env.example .env
```

2. **Configurar Firebase**:
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Project Settings > Service Accounts
   - Genera una nueva clave privada (JSON)
   - Guárdala como `.vscode/backend/firebase-key.json`
   - Copia el `project_id` al archivo `.env`

3. **Configurar Gemini AI**:
   - Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crea una API key
   - Pégala en `GEMINI_API_KEY` en el `.env`

4. **Instalar dependencias**:
```bash
cd .vscode/backend
pip install -r requirements.txt
```

5. **Crear carpetas necesarias**:
```bash
mkdir -p generated data
```

6. **Verificar que existe** `data/programas.json` (ya existe en tu proyecto)

### **Paso 2: Configurar Frontend**

1. **Verificar archivo .env del frontend**:
```bash
cd frontend
# Asegúrate de que .env existe con las credenciales de Firebase
```

2. **Actualizar variable de backend** (si es necesario):
```env
VITE_BACKEND_URL=http://localhost:5000
```

3. **Instalar dependencias** (si no están instaladas):
```bash
npm install
```

### **Paso 3: Ejecutar Ambos Servicios**

#### Terminal 1 - Backend:
```bash
cd .vscode/backend
python app/main.py
```

Deberías ver:
```
 * Running on http://0.0.0.0:5000
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### **Paso 4: Probar la Integración**

1. **Health Check**:
   - Abre: http://localhost:5000/api/v1/health
   - Deberías ver: `{"status":"ok","version":"1.0.0"}`

2. **Frontend**:
   - Abre: http://localhost:5173
   - Regístrate o inicia sesión
   - Prueba el chatbot
   - Prueba el diagnóstico

---

## 📋 Endpoints Disponibles

### **Públicos**
- `GET /api/v1/health` - Estado del servidor
- `GET /api/v1/tramites` - Lista de programas sociales
- `GET /api/v1/tramites/:id` - Detalle de programa

### **Autenticados** (requieren login)
- `GET /api/v1/auth/me` - Datos del usuario
- `POST /api/v1/chat` - Chatbot con IA
- `POST /api/v1/validar-documento` - Validar documento con OCR
- `POST /api/v1/tramites-virtuales` - Crear solicitud
- `GET /api/v1/tramites-virtuales/mis-solicitudes` - Mis solicitudes

### **Admin** (requieren rol admin)
- `GET /api/v1/admin/tramites-virtuales` - Lista de expedientes
- `POST /api/v1/admin/tramites-virtuales/:id/revision` - Aprobar/rechazar

---

## 🔧 Estructura de Datos

### **Mensaje de Chat**
```json
{
  "mensaje": "¿Qué programas me corresponden?",
  "sesion_id": "opcional-uuid"
}
```

### **Respuesta de Chat**
```json
{
  "respuesta": "Basado en tu perfil...",
  "sesion_id": "uuid",
  "programas_sugeridos": [...]
}
```

### **Validar Documento**
```json
{
  "archivo_base64": "base64_string_aqui",
  "nombre_archivo": "ine.pdf"
}
```

### **Crear Trámite Virtual**
```json
{
  "programa_id": 1,
  "documentos_validados": [
    {
      "tipo_documento": "INE",
      "validacion_id": "uuid"
    }
  ]
}
```

---

## 🎨 Nuevas Rutas del Frontend

Agrega esta ruta en `frontend/src/App.jsx`:

```jsx
import MisSolicitudes from './pages/MisSolicitudes'

// En las rutas:
<Route path="/mis-solicitudes" element={<MisSolicitudes />} />
```

---

## 🔐 Autenticación

El sistema usa **Firebase Authentication** con tokens JWT:

1. Usuario inicia sesión en el frontend
2. Firebase genera un token JWT
3. El interceptor de Axios agrega el token a cada petición: `Authorization: Bearer <token>`
4. El backend valida el token con Firebase Admin SDK
5. Si es válido, procesa la petición

---

## 🐛 Solución de Problemas

### Error: "No autorizado"
- Verifica que el usuario esté autenticado
- Revisa que el token de Firebase sea válido
- Confirma que `FIREBASE_PROJECT_ID` en el backend coincida con tu proyecto

### Error: "CORS"
- El backend ya tiene CORS configurado para `*`
- Si persiste, verifica que el backend esté corriendo en el puerto correcto

### Error: "Gemini API"
- Verifica que `GEMINI_API_KEY` esté configurada
- Confirma que la API key sea válida en Google AI Studio

### Error: "OCR timeout"
- Aumenta `OCR_TIMEOUT_SECONDS` en el `.env`
- Verifica que la imagen/PDF no esté corrupto

---

## 📊 Flujo Completo de Usuario

```
1. Usuario se registra/inicia sesión
   ↓
2. Frontend sincroniza con backend (/api/v1/auth/me)
   ↓
3. Usuario chatea con el bot (/api/v1/chat)
   ↓
4. Bot sugiere programas elegibles
   ↓
5. Usuario sube documentos (/api/v1/validar-documento)
   ↓
6. Sistema valida con OCR
   ↓
7. Usuario crea solicitud (/api/v1/tramites-virtuales)
   ↓
8. Admin revisa y aprueba/rechaza
   ↓
9. Usuario descarga constancia
```

---

## 🎯 Próximos Pasos

1. **Agregar ruta de Mis Solicitudes** al App.jsx
2. **Actualizar Navbar** para incluir enlace a "Mis Solicitudes"
3. **Crear página de Admin** para revisar expedientes
4. **Mejorar página de Trámite** para usar validación de documentos
5. **Agregar notificaciones** cuando cambie el estado de una solicitud

---

## 📝 Notas Importantes

- ✅ El backend usa **Firestore** como base de datos
- ✅ Los archivos generados (PDFs) se guardan en `generated/`
- ✅ El chatbot usa **Google Gemini 1.5 Flash**
- ✅ El OCR usa **EasyOCR** con idioma latino
- ✅ Las sesiones de chat se guardan en Firestore
- ✅ Los documentos validados se guardan para auditoría

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs del backend en la terminal
2. Revisa la consola del navegador (F12)
3. Verifica que todas las variables de entorno estén configuradas
4. Confirma que Firebase esté correctamente configurado

---

**¡La integración está completa y lista para usar!** 🎉
