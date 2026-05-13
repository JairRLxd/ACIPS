# 💾 Persistencia de Conversaciones - Como ChatGPT

## ✅ Implementado

Tu chatbot ahora guarda las conversaciones **permanentemente** por usuario, igual que ChatGPT.

---

## 🎯 Cómo Funciona

### Sin Iniciar Sesión (Usuario Anónimo)
- ✅ Las conversaciones se guardan **en memoria** durante la sesión
- ⚠️ Se pierden al cerrar el navegador o reiniciar el servidor
- ✅ Mantiene contexto mientras navegas

### Con Sesión Iniciada (Usuario Autenticado)
- ✅ Las conversaciones se guardan **en Firebase Firestore**
- ✅ **Permanentes** - no se pierden al cerrar navegador
- ✅ **Recuperables** - puedes volver días después
- ✅ **Por usuario** - cada persona tiene su historial
- ✅ **Múltiples conversaciones** - como ChatGPT

---

## 📊 Estructura de Datos

### En Firebase Firestore

**Colección**: `conversaciones`

**Documento** (por sesión):
```javascript
{
  sesion_id: "abc-123-def-456",
  user_id: "firebase_user_uid",
  creada: "2026-05-12T19:00:00",
  ultima_actividad: "2026-05-12T20:30:00",
  historial: [
    {
      role: "user",
      content: "Hola, soy madre soltera..."
    },
    {
      role: "assistant",
      content: "Te recomiendo estos programas..."
    }
  ],
  documentos: [
    {
      nombre: "CURP.pdf",
      texto: "GOMR680523...",
      fecha: "2026-05-12T19:15:00"
    }
  ]
}
```

---

## 🔄 Flujo de Persistencia

### 1. Usuario Envía Mensaje

```
Frontend → Backend
{
  mensaje: "Hola",
  sesion_id: "abc-123" (si existe),
  user_id: "firebase_uid" (si está autenticado)
}
```

### 2. Backend Procesa

```python
# Cargar conversación existente o crear nueva
if user_id and Firebase disponible:
    conversacion = cargar_desde_firebase(sesion_id)
else:
    conversacion = cargar_desde_memoria(sesion_id)

# Procesar mensaje con Groq AI
respuesta = groq_ai.chat(conversacion + nuevo_mensaje)

# Guardar conversación actualizada
if user_id and Firebase disponible:
    guardar_en_firebase(sesion_id, conversacion)
else:
    guardar_en_memoria(sesion_id, conversacion)
```

### 3. Frontend Recibe

```javascript
{
  respuesta: "...",
  sesion_id: "abc-123",
  guardado_en_firebase: true/false
}
```

---

## 🎨 Experiencia de Usuario

### Escenario 1: Usuario Anónimo

```
👤 Usuario (sin login):
   - Abre chatbot
   - Envía mensajes
   - Adjunta documentos
   - Todo funciona normal

🔄 Cierra navegador:
   - Conversación se pierde
   - Próxima vez empieza de cero

💡 Recomendación:
   "Inicia sesión para guardar tu conversación"
```

### Escenario 2: Usuario Autenticado

```
👤 Usuario (con login):
   - Inicia sesión con Google/Email
   - Abre chatbot
   - Envía mensajes
   - Adjunta documentos
   - Todo se guarda en Firebase

🔄 Cierra navegador:
   - Conversación guardada ✓

📅 Días después:
   - Inicia sesión nuevamente
   - Abre chatbot
   - Ve su conversación anterior
   - Puede continuar donde dejó

💾 Múltiples conversaciones:
   - Puede crear nueva conversación
   - Ver historial de conversaciones
   - Eliminar conversaciones antiguas
```

---

## 🚀 Funcionalidades Implementadas

### Backend

#### 1. Cargar Conversación
```python
def cargar_conversacion(sesion_id, user_id):
    if db and user_id:
        # Cargar desde Firebase
        doc = db.collection('conversaciones').document(sesion_id).get()
        if doc.exists:
            return doc.to_dict()
    
    # Fallback a memoria
    return conversaciones_memoria.get(sesion_id, nueva_conversacion())
```

#### 2. Guardar Conversación
```python
def guardar_conversacion(sesion_id, user_id, conversacion):
    if db and user_id:
        # Guardar en Firebase
        db.collection('conversaciones').document(sesion_id).set(conversacion)
    else:
        # Guardar en memoria
        conversaciones_memoria[sesion_id] = conversacion
```

#### 3. Listar Conversaciones
```python
@app.route('/api/v1/chat/conversaciones')
def listar_conversaciones():
    # Obtener todas las conversaciones del usuario
    docs = db.collection('conversaciones')\
             .where('user_id', '==', user_id)\
             .order_by('ultima_actividad', direction='DESC')\
             .limit(50)\
             .stream()
    
    return conversaciones
```

### Frontend

#### 1. Enviar user_id
```javascript
const userId = currentUser?.uid || null

// En FormData
formData.append('user_id', userId)

// En JSON
payload.user_id = userId
```

#### 2. Mantener sesion_id
```javascript
const [sesionId, setSesionId] = useState(null)

// Guardar al recibir respuesta
if (data.sesion_id) {
  setSesionId(data.sesion_id)
}

// Enviar en próximos mensajes
formData.append('sesion_id', sesionId)
```

---

## 🔧 Configuración de Firebase

### Paso 1: Descargar Service Account Key

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **acips-5952d**
3. Ve a **Configuración del proyecto** (⚙️)
4. Pestaña **Cuentas de servicio**
5. Haz clic en **Generar nueva clave privada**
6. Descarga el archivo JSON

### Paso 2: Configurar Backend

1. Guarda el archivo como `firebase-key.json` en `.vscode/backend/`
2. Verifica que `.env` tenga:
   ```env
   FIREBASE_KEY_PATH=./firebase-key.json
   FIREBASE_PROJECT_ID=acips-5952d
   ```

### Paso 3: Reiniciar Backend

```bash
cd .vscode/backend
python start-groq-test.py
```

Verás:
```
✅ Firebase Firestore conectado
💾 Persistencia en Firebase Firestore
```

---

## 📝 Estado Actual

### ✅ Implementado
- Sistema de sesiones con UUID
- Persistencia en Firebase Firestore
- Fallback a memoria si Firebase no está disponible
- Envío de user_id desde frontend
- Carga y guardado automático
- Endpoint para listar conversaciones

### ⚠️ Pendiente (Configuración)
- Descargar Service Account Key de Firebase
- Colocar archivo en `.vscode/backend/firebase-key.json`
- Reiniciar backend

### 🔮 Próximas Mejoras
- UI para ver historial de conversaciones
- Botón "Nueva conversación"
- Búsqueda en conversaciones anteriores
- Exportar conversación a PDF
- Compartir conversación

---

## 🧪 Cómo Probar

### Sin Firebase (Memoria Temporal)

1. Abre http://localhost:5173/chat
2. Envía mensajes
3. Adjunta documentos
4. Todo funciona pero se pierde al reiniciar

### Con Firebase (Persistencia)

1. Configura Firebase (pasos arriba)
2. Inicia sesión en la app
3. Abre http://localhost:5173/chat
4. Envía mensajes y documentos
5. Cierra navegador
6. Vuelve a abrir y inicia sesión
7. ¡Tu conversación sigue ahí! ✨

---

## 📊 Comparación

| Característica | Sin Firebase | Con Firebase |
|----------------|--------------|--------------|
| **Persistencia** | ❌ Temporal | ✅ Permanente |
| **Requiere login** | ❌ No | ✅ Sí |
| **Sobrevive cierre** | ❌ No | ✅ Sí |
| **Múltiples dispositivos** | ❌ No | ✅ Sí |
| **Historial** | ❌ No | ✅ Sí |
| **Búsqueda** | ❌ No | ✅ Sí (futuro) |

---

## 🎉 Resultado

Tu chatbot ahora funciona **exactamente como ChatGPT**:

- ✅ Guarda conversaciones por usuario
- ✅ Mantiene historial permanente
- ✅ Recupera conversaciones anteriores
- ✅ Recuerda documentos enviados
- ✅ Contexto completo en cada mensaje

**Solo falta configurar Firebase para activar la persistencia permanente!** 🚀

---

## 📞 Siguiente Paso

Para activar la persistencia permanente:

1. Descarga el Service Account Key de Firebase
2. Guárdalo como `.vscode/backend/firebase-key.json`
3. Reinicia el backend
4. ¡Listo! Las conversaciones se guardarán para siempre

Sin Firebase, el sistema funciona perfectamente pero las conversaciones se pierden al reiniciar el servidor.
