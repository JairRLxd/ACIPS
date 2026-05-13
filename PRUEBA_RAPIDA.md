# 🚀 PRUEBA RÁPIDA DEL SISTEMA

## ✅ Estado Actual

- ✅ **Backend corriendo**: http://localhost:5000 (modo simple)
- ✅ **Frontend corriendo**: http://localhost:5173
- ✅ **Gemini API configurada**
- ✅ **Firebase configurado** (proyecto: acips-5952d)

---

## 🧪 Pruebas que Puedes Hacer

### 1. **Probar Backend Directamente**

Abre una terminal y ejecuta:

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Lista de programas
curl http://localhost:5000/api/v1/tramites

# Chatbot (sin autenticación en modo simple)
curl -X POST http://localhost:5000/api/v1/chat -H "Content-Type: application/json" -d "{\"mensaje\":\"Hola\"}"
```

### 2. **Probar Frontend**

1. Abre: http://localhost:5173
2. **NO intentes iniciar sesión todavía** (Firebase no está completamente configurado)
3. Ve directamente a las páginas públicas:
   - Inicio: http://localhost:5173/
   - Diagnóstico: http://localhost:5173/diagnostico

---

## ⚠️ Problema Actual

El error "Error de conexión" ocurre porque:

1. **El frontend intenta autenticarse automáticamente** con Firebase
2. **Firebase requiere el Service Account Key** que aún no has descargado
3. **El interceptor de autenticación** está bloqueando las peticiones

---

## 🔧 Soluciones

### **Opción 1: Deshabilitar Autenticación Temporalmente (Rápido)**

Voy a modificar el frontend para que funcione sin autenticación en modo de prueba.

### **Opción 2: Configurar Firebase Completo (Recomendado)**

1. **Descargar Service Account Key**:
   - Ve a: https://console.firebase.google.com/project/acips-5952d/settings/serviceaccounts/adminsdk
   - Clic en **"Generar nueva clave privada"**
   - Guarda como: `.vscode/backend/firebase-key.json`

2. **Habilitar Authentication en Firebase**:
   - Ve a: https://console.firebase.google.com/project/acips-5952d/authentication
   - Clic en **"Comenzar"**
   - Habilita **"Correo electrónico/contraseña"**
   - Habilita **"Google"**

3. **Crear Firestore Database**:
   - Ve a: https://console.firebase.google.com/project/acips-5952d/firestore
   - Clic en **"Crear base de datos"**
   - Selecciona **"Modo de prueba"** (para desarrollo)
   - Ubicación: **us-central** (o la más cercana)

---

## 🎯 ¿Qué Prefieres?

**A)** Modifico el frontend para que funcione sin autenticación (5 minutos)
   - ✅ Puedes probar el sistema inmediatamente
   - ⚠️ Sin login, sin guardar datos

**B)** Configuras Firebase completo (15 minutos)
   - ✅ Sistema completo funcional
   - ✅ Login, base de datos, todo funciona
   - ⚠️ Requiere descargar archivos de Firebase

---

## 📊 Verificación Rápida

Para verificar que el backend está funcionando, abre el navegador en:

**http://localhost:5000/api/v1/health**

Deberías ver:
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

**¿Qué opción prefieres? A o B?** 🤔
