# ⚡ INICIO RÁPIDO - ACIPS

## 🚀 Ejecutar en 5 Minutos

### Paso 1: Configurar Variables de Entorno

#### Backend
```bash
cd .vscode/backend
cp .env.example .env
```

Edita `.env` y completa:
```env
FIREBASE_PROJECT_ID=tu-proyecto-id
GEMINI_API_KEY=tu_gemini_api_key
```

#### Frontend
```bash
cd frontend
# Verifica que .env exista con tus credenciales de Firebase
```

### Paso 2: Instalar Dependencias

#### Backend
```bash
cd .vscode/backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### Paso 3: Ejecutar

#### Opción A: Script Automático (Recomendado)

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

#### Opción B: Manual

**Terminal 1 - Backend:**
```bash
cd .vscode/backend
python app/main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Paso 4: Abrir en el Navegador

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🔑 Obtener Credenciales

### Firebase (Requerido)

1. Ve a https://console.firebase.google.com/
2. Crea un proyecto nuevo
3. Habilita **Authentication** → Email/Password y Google
4. Crea una base de datos **Firestore**
5. **Para el Frontend:**
   - Project Settings → General → Your apps → Web app
   - Copia las credenciales a `frontend/.env`
6. **Para el Backend:**
   - Project Settings → Service Accounts
   - Generate new private key
   - Guarda como `.vscode/backend/firebase-key.json`

### Google Gemini AI (Requerido)

1. Ve a https://makersuite.google.com/app/apikey
2. Crea una API key
3. Cópiala a `.vscode/backend/.env` en `GEMINI_API_KEY`

---

## ✅ Verificar que Funciona

### 1. Backend Health Check
```bash
curl http://localhost:5000/api/v1/health
```

Deberías ver:
```json
{"status":"ok","version":"1.0.0"}
```

### 2. Frontend
- Abre http://localhost:5173
- Deberías ver la página de inicio
- Regístrate o inicia sesión
- Prueba el chatbot

---

## 🐛 Problemas Comunes

### "ModuleNotFoundError" en Python
```bash
pip install -r requirements.txt
```

### "Cannot find module" en Node
```bash
cd frontend
npm install
```

### "Firebase error"
- Verifica que las credenciales en `.env` sean correctas
- Verifica que Authentication y Firestore estén habilitados

### "Gemini API error"
- Verifica que `GEMINI_API_KEY` esté configurada
- Verifica que la API key sea válida

---

## 📚 Documentación Completa

- [README.md](README.md) - Documentación principal
- [INTEGRACION_BACKEND_FRONTEND.md](INTEGRACION_BACKEND_FRONTEND.md) - Guía de integración
- [RESUMEN_INTEGRACION.md](RESUMEN_INTEGRACION.md) - Resumen de cambios

---

## 🎯 Funcionalidades Principales

Una vez que el sistema esté corriendo, puedes:

1. **Registrarte** con email o Google
2. **Hacer el diagnóstico** para ver qué programas te corresponden
3. **Chatear con el bot** para hacer preguntas
4. **Ver tus solicitudes** en "Mis Solicitudes"

---

**¡Listo para empezar!** 🎉
