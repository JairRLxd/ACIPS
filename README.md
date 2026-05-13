# 🏛️ ACIPS - Asistente Ciudadano Inteligente para Programas Sociales

Sistema web completo para ayudar a ciudadanos mexicanos a descubrir, solicitar y gestionar programas sociales gubernamentales mediante inteligencia artificial.

![ACIPS Banner](frontend/public/images/logo.png)

## 🌟 Características Principales

### Para Ciudadanos
- 🤖 **Chatbot Inteligente con IA**: Conversación natural usando Google Gemini para descubrir programas
- 📋 **Diagnóstico de Elegibilidad**: Cuestionario que calcula automáticamente qué programas te corresponden
- 📄 **Validación de Documentos con OCR**: Sube tus documentos y el sistema los valida automáticamente
- 📨 **Trámites Virtuales**: Envía solicitudes digitales sin ir a oficinas
- 📊 **Seguimiento de Solicitudes**: Revisa el estado de tus trámites en tiempo real
- 🔐 **Autenticación Segura**: Login con email/contraseña o Google

### Para Administradores
- 👥 **Panel de Gestión**: Revisa y aprueba/rechaza solicitudes
- 📑 **Generación de PDFs**: Acuses de recibo y constancias automáticas
- 🔍 **Auditoría Completa**: Historial de todas las acciones

### Programas Sociales Incluidos
1. **Pensión para el Bienestar de las Personas Adultas Mayores** (65+ años)
2. **Beca Benito Juárez** (estudiantes de nivel medio superior)
3. **Sembrando Vida** (agricultores en zonas rurales)

## 🏗️ Arquitectura

```
ACIPS/
├── frontend/              # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── api/          # Cliente API con Axios
│   │   ├── components/   # Componentes reutilizables
│   │   ├── context/      # Context API (Auth, App)
│   │   ├── pages/        # Páginas de la aplicación
│   │   └── services/     # Servicios (Firebase Auth)
│   └── public/           # Imágenes y assets
│
├── .vscode/backend/      # Flask + Python (Clean Architecture)
│   ├── app/
│   │   ├── api/         # Controladores (endpoints)
│   │   ├── core/        # Configuración y modelos
│   │   ├── repositories/# Acceso a datos (Firestore)
│   │   ├── schemas/     # Validación (Marshmallow)
│   │   ├── services/    # Servicios externos (Firebase, Gemini, OCR)
│   │   ├── use_cases/   # Lógica de negocio
│   │   └── templates/   # Plantillas HTML para PDFs
│   ├── data/            # programas.json
│   └── generated/       # PDFs generados
│
└── docs/                # Documentación
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ y npm
- **Python** 3.9+
- **Firebase** proyecto configurado
- **Google Gemini API** key

### Instalación Automática (Recomendado)

#### Windows:
```bash
start-dev.bat
```

#### Linux/Mac:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Instalación Manual

#### 1. Configurar Backend

```bash
# Ir a la carpeta del backend
cd .vscode/backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Crear carpetas necesarias
mkdir -p generated data

# Iniciar servidor
python app/main.py
```

El backend estará en: http://localhost:5000

#### 2. Configurar Frontend

```bash
# Ir a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Firebase

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en: http://localhost:5173

## 🔧 Configuración

### Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Authentication** (Email/Password y Google)
3. Crea una base de datos **Firestore**
4. Descarga las credenciales:
   - **Frontend**: Configuración web (apiKey, authDomain, etc.)
   - **Backend**: Service Account JSON

### Google Gemini AI

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una API key
3. Agrégala al `.env` del backend

### Variables de Entorno

#### Backend (`.vscode/backend/.env`)
```env
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_KEY_PATH=./firebase-key.json
GEMINI_API_KEY=tu_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
PORT=5000
```

#### Frontend (`frontend/.env`)
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_BACKEND_URL=http://localhost:5000
```

## 📚 Documentación

- [Integración Backend-Frontend](INTEGRACION_BACKEND_FRONTEND.md)
- [Configuración de Firebase](CONFIGURAR_FIREBASE_AHORA.md)
- [Chatbot con Archivos](CHATBOT_CON_ARCHIVOS.md)

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Firebase Auth** - Autenticación

### Backend
- **Flask** - Framework web
- **Firebase Admin** - Autenticación y Firestore
- **Google Gemini AI** - Chatbot inteligente
- **EasyOCR** - Reconocimiento de texto
- **PyMuPDF** - Procesamiento de PDFs
- **ReportLab** - Generación de PDFs
- **Marshmallow** - Validación de datos

## 📡 API Endpoints

### Públicos
- `GET /api/v1/health` - Estado del servidor
- `GET /api/v1/tramites` - Lista de programas

### Autenticados
- `GET /api/v1/auth/me` - Datos del usuario
- `POST /api/v1/chat` - Chatbot
- `POST /api/v1/validar-documento` - Validar documento
- `POST /api/v1/tramites-virtuales` - Crear solicitud
- `GET /api/v1/tramites-virtuales/mis-solicitudes` - Mis solicitudes

### Admin
- `GET /api/v1/admin/tramites-virtuales` - Lista de expedientes
- `POST /api/v1/admin/tramites-virtuales/:id/revision` - Aprobar/rechazar

## 🧪 Testing

```bash
# Backend
cd .vscode/backend
pytest

# Frontend
cd frontend
npm test
```

## 📦 Producción

### Backend
```bash
cd .vscode/backend
gunicorn -w 4 -b 0.0.0.0:5000 app.main:app
```

### Frontend
```bash
cd frontend
npm run build
# Los archivos estarán en frontend/dist/
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Equipo ACIPS** - *Desarrollo inicial*

## 🙏 Agradecimientos

- Secretaría de Bienestar de México por la información de programas sociales
- Google por Gemini AI
- Firebase por la infraestructura
- Comunidad open source

## 📞 Soporte

¿Tienes problemas? Abre un [issue](https://github.com/tu-usuario/acips/issues) o contacta al equipo.

---

**Hecho con ❤️ para ayudar a los ciudadanos mexicanos a acceder a sus derechos**
