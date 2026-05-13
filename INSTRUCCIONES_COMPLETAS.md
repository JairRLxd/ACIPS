# 🚀 ACIPS - INSTRUCCIONES COMPLETAS
## Backend Flask + Frontend React

---

## 📦 ESTRUCTURA GENERADA

```
acips/
├── backend/
│   ├── app.py                    ✅ Generado
│   ├── config.py                 ✅ Generado
│   ├── models.py                 ✅ Generado
│   ├── chatbot.py                ✅ Generado
│   ├── eligibility.py            ✅ Generado
│   ├── seed_db.py                ✅ Generado
│   ├── requirements.txt          ✅ Generado
│   ├── .env.example              ✅ Generado
│   └── routes/
│       ├── diagnostico.py        ✅ Generado
│       ├── chatbot_routes.py     ✅ Generado
│       └── tramites.py           ✅ Generado
│
└── frontend/
    ├── package.json              ✅ Generado
    ├── vite.config.js            ✅ Generado
    ├── tailwind.config.js        ✅ Generado
    ├── postcss.config.js         ✅ Generado
    ├── index.html                ✅ Generado
    └── src/
        ├── api/
        │   └── client.js         ✅ Generado
        ├── context/              📝 Pendiente (ver abajo)
        ├── pages/                📝 Pendiente (ver abajo)
        ├── components/           📝 Pendiente (ver abajo)
        └── styles/               📝 Pendiente (ver abajo)
```

---

## 🔧 INSTALACIÓN Y EJECUCIÓN

### PASO 1: Configurar Backend

```bash
# Ir a carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate

# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Editar .env y agregar tu ANTHROPIC_API_KEY

# Inicializar base de datos
python seed_db.py

# Ejecutar servidor
python app.py
```

**El backend estará en:** http://localhost:5000

---

### PASO 2: Configurar Frontend

```bash
# Abrir NUEVA terminal
# Ir a carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

**El frontend estará en:** http://localhost:5173

---

## 📝 ARCHIVOS FRONTEND PENDIENTES

Debido a la extensión, aquí están los archivos que debes crear manualmente:

### 1. `frontend/src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2. `frontend/src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Diagnostico from './pages/Diagnostico'
import Resultados from './pages/Resultados'
import Chatbot from './pages/Chatbot'
import Tramite from './pages/Tramite'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/diagnostico" element={<Diagnostico />} />
              <Route path="/resultados" element={<Resultados />} />
              <Route path="/chat" element={<Chatbot />} />
              <Route path="/tramite/:id" element={<Tramite />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
```

### 3. `frontend/src/styles/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tipografía base */
body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

/* Modo adulto mayor */
body.modo-adulto-mayor {
  font-size: 22px;
}

body.modo-adulto-mayor h1 {
  font-size: 3.5rem;
}

body.modo-adulto-mayor h2 {
  font-size: 2.5rem;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease;
}
```

### 4. `frontend/src/context/AppContext.jsx`

```jsx
import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [perfilUsuario, setPerfilUsuario] = useState(null)
  const [resultados, setResultados] = useState([])
  const [modoAdultoMayor, setModoAdultoMayor] = useState(false)

  const toggleModoAdultoMayor = () => {
    setModoAdultoMayor(!modoAdultoMayor)
    if (!modoAdultoMayor) {
      document.body.classList.add('modo-adulto-mayor')
    } else {
      document.body.classList.remove('modo-adulto-mayor')
    }
  }

  const value = {
    perfilUsuario,
    setPerfilUsuario,
    resultados,
    setResultados,
    modoAdultoMayor,
    toggleModoAdultoMayor,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
```

---

## 🧪 PRUEBAS DE API CON POSTMAN/CURL

### 1. Healthcheck
```bash
curl http://localhost:5000/healthcheck
```

### 2. Diagnóstico
```bash
curl -X POST http://localhost:5000/api/diagnostico \
  -H "Content-Type: application/json" \
  -d '{
    "edad": 67,
    "municipio": "CDMX",
    "tiene_hijos": false,
    "nivel_ingresos": "bajo",
    "estudia": false,
    "tiene_discapacidad": false
  }'
```

### 3. Chat
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "mensaje": "Tengo 70 años, ¿qué apoyo me corresponde?"
  }'
```

### 4. Listar Programas
```bash
curl http://localhost:5000/api/programas
```

### 5. Obtener Trámite
```bash
curl http://localhost:5000/api/tramite/1
```

---

## 📋 ENDPOINTS DISPONIBLES

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/healthcheck` | Verificar estado del servidor |
| POST | `/api/diagnostico` | Calcular elegibilidad |
| POST | `/api/chat` | Enviar mensaje al chatbot |
| POST | `/api/chat/limpiar` | Limpiar historial |
| GET | `/api/programas` | Listar todos los programas |
| GET | `/api/tramite/:id` | Obtener info de trámite |
| POST | `/api/tramite/:id/documento` | Actualizar documento |
| POST | `/api/session/perfil` | Guardar perfil en sesión |
| GET | `/api/session/perfil` | Obtener perfil de sesión |

---

## ✅ VERIFICACIÓN

### Backend funcionando:
1. ✅ `python app.py` sin errores
2. ✅ http://localhost:5000/healthcheck retorna `{"status": "ok"}`
3. ✅ Base de datos `acips.db` creada
4. ✅ 5 programas sociales cargados

### Frontend funcionando:
1. ✅ `npm run dev` sin errores
2. ✅ http://localhost:5173 carga la aplicación
3. ✅ Navegación entre páginas funciona
4. ✅ Llamadas a API funcionan

---

## 🎯 PRÓXIMOS PASOS

1. **Crear componentes React faltantes:**
   - `Navbar.jsx`
   - `Home.jsx`
   - `Diagnostico.jsx`
   - `Resultados.jsx`
   - `Chatbot.jsx`
   - `Tramite.jsx`
   - Componentes auxiliares

2. **Probar flujo completo:**
   - Hacer diagnóstico
   - Ver resultados
   - Chatear con asistente
   - Ver guía de trámite

3. **Ajustar estilos con Tailwind**

4. **Agregar validaciones**

5. **Optimizar rendimiento**

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Backend no inicia
- Verifica que el entorno virtual esté activado
- Verifica que todas las dependencias estén instaladas
- Revisa que `.env` exista y tenga las variables correctas

### Frontend no conecta con Backend
- Verifica que ambos servidores estén corriendo
- Revisa la configuración de proxy en `vite.config.js`
- Verifica CORS en `backend/config.py`

### Chatbot no responde
- Verifica que `ANTHROPIC_API_KEY` esté configurada
- Verifica conexión a internet
- Revisa logs del backend

---

## 📞 SOPORTE

- Backend: Revisa logs en la terminal donde corre `python app.py`
- Frontend: Revisa consola del navegador (F12)
- Base de datos: Usa SQLite Browser para inspeccionar `acips.db`

---

**¡El proyecto ACIPS está listo para desarrollarse!** 🚀

Los archivos principales del backend están completos y funcionales.
El frontend requiere crear los componentes React siguiendo los ejemplos arriba.
