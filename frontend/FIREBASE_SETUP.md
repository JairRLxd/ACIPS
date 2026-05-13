# Configuración de Firebase para ACIPS

## Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Ingresa el nombre del proyecto: **ACIPS**
4. (Opcional) Habilita Google Analytics
5. Haz clic en "Crear proyecto"

## Paso 2: Registrar tu App Web

1. En la página principal del proyecto, haz clic en el ícono **Web** (`</>`)
2. Ingresa un nombre para tu app: **ACIPS Web**
3. (Opcional) Marca "También configurar Firebase Hosting"
4. Haz clic en "Registrar app"
5. **Copia los valores de configuración** que aparecen

## Paso 3: Configurar Variables de Entorno

1. En la carpeta `frontend/`, copia el archivo `.env.example` y renómbralo a `.env`
2. Pega los valores de configuración de Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=acips-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=acips-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=acips-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Paso 4: Habilitar Métodos de Autenticación

### Email/Password

1. En Firebase Console, ve a **Authentication** en el menú lateral
2. Haz clic en la pestaña **Sign-in method**
3. Haz clic en **Email/Password**
4. Habilita el toggle de **Email/Password**
5. Haz clic en **Guardar**

### Google Sign-In

1. En la misma pestaña **Sign-in method**
2. Haz clic en **Google**
3. Habilita el toggle
4. Selecciona un email de soporte del proyecto
5. Haz clic en **Guardar**

### Facebook Sign-In (Opcional)

1. Crea una app en [Facebook Developers](https://developers.facebook.com/)
2. Obtén el **App ID** y **App Secret**
3. En Firebase Console, haz clic en **Facebook**
4. Habilita el toggle
5. Pega el **App ID** y **App Secret**
6. Copia la **OAuth redirect URI** que te proporciona Firebase
7. Ve a tu app de Facebook > Settings > Basic
8. Agrega la **OAuth redirect URI** en "Valid OAuth Redirect URIs"
9. Haz clic en **Guardar** en Firebase

## Paso 5: Configurar Dominios Autorizados

1. En Firebase Console, ve a **Authentication** > **Settings**
2. En la pestaña **Authorized domains**
3. Agrega los dominios donde se ejecutará tu app:
   - `localhost` (ya está por defecto)
   - Tu dominio de producción (ej: `acips.com`)

## Paso 6: Probar la Autenticación

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:5173/registro`

3. Prueba registrarte con:
   - Email y contraseña
   - Google Sign-In
   - Facebook Sign-In (si lo configuraste)

## Estructura de Archivos Creados

```
frontend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Configuración de Firebase
│   ├── services/
│   │   └── authService.js       # Servicios de autenticación
│   ├── context/
│   │   └── AuthContext.jsx      # Contexto de autenticación
│   └── pages/
│       ├── Login.jsx            # Página de login
│       └── Registro.jsx         # Página de registro
├── .env                         # Variables de entorno (NO subir a Git)
└── .env.example                 # Ejemplo de variables de entorno
```

## Funcionalidades Implementadas

✅ Registro con email y contraseña  
✅ Login con email y contraseña  
✅ Login con Google  
✅ Login con Facebook  
✅ Cerrar sesión  
✅ Recuperar contraseña  
✅ Persistencia de sesión  
✅ Protección de rutas  
✅ Menú de usuario en Navbar  
✅ Mensajes de error en español  

## Seguridad

- Las credenciales de Firebase están en variables de entorno
- El archivo `.env` está en `.gitignore` (no se sube a Git)
- Firebase maneja la seguridad de las contraseñas
- Los tokens de autenticación se manejan automáticamente

## Próximos Pasos

1. Configurar reglas de seguridad en Firestore (si usas base de datos)
2. Agregar página de perfil de usuario
3. Implementar recuperación de contraseña
4. Agregar verificación de email
5. Configurar límites de tasa (rate limiting)

## Soporte

Si tienes problemas:
1. Verifica que las variables de entorno estén correctas
2. Revisa la consola del navegador para errores
3. Verifica que los métodos de autenticación estén habilitados en Firebase
4. Consulta la [documentación de Firebase](https://firebase.google.com/docs/auth)
