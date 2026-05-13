# 🚀 Inicio Rápido - Firebase en ACIPS

## ⚡ 3 Pasos para Activar Firebase

### 1️⃣ Crear Proyecto Firebase (5 minutos)

1. Ve a: https://console.firebase.google.com/
2. Clic en "Agregar proyecto"
3. Nombre: **ACIPS**
4. Clic en "Crear proyecto"

### 2️⃣ Configurar Autenticación (3 minutos)

1. En el menú lateral: **Authentication**
2. Clic en **"Comenzar"** o **"Get Started"**
3. Pestaña **"Sign-in method"**
4. Habilitar:
   - ✅ **Email/Password** (toggle ON)
   - ✅ **Google** (toggle ON, selecciona email de soporte)

### 3️⃣ Obtener Credenciales (2 minutos)

1. En Firebase Console, clic en el ícono **⚙️ Settings**
2. Scroll hasta **"Your apps"**
3. Clic en el ícono **Web** `</>`
4. Nombre: **ACIPS Web**
5. **Copiar** el objeto `firebaseConfig`

---

## 📝 Configurar Variables de Entorno

### En tu proyecto:

1. Ve a la carpeta `frontend/`
2. Crea un archivo llamado `.env` (sin extensión)
3. Pega esto y reemplaza con tus valores:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=acips-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=acips-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=acips-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

**💡 Tip:** Los valores los encuentras en el `firebaseConfig` que copiaste

---

## 🎯 Probar que Funciona

### 1. Inicia el servidor:
```bash
cd frontend
npm run dev
```

### 2. Abre el navegador:
```
http://localhost:5173/registro
```

### 3. Prueba registrarte:
- Con email y contraseña
- O con el botón de Google

### 4. Si funciona:
- ✅ Te redirige a la página principal
- ✅ Ves tu nombre en el navbar
- ✅ Puedes hacer clic y ver el menú de usuario

---

## 🆘 Si Algo No Funciona

### Error: "Firebase: Error (auth/configuration-not-found)"
**Solución:** 
- Verifica que el archivo `.env` existe en `frontend/`
- Verifica que las variables empiezan con `VITE_`
- Reinicia el servidor (`Ctrl+C` y `npm run dev` de nuevo)

### Error: "Firebase: Error (auth/api-key-not-valid)"
**Solución:**
- Copia de nuevo el `apiKey` desde Firebase Console
- Asegúrate de no tener espacios extras

### Error: Popup bloqueado (Google/Facebook)
**Solución:**
- Permite popups en tu navegador para `localhost`
- O usa email/password en su lugar

### No veo el botón de login
**Solución:**
- Verifica que el servidor esté corriendo
- Refresca la página (`F5`)
- Abre la consola del navegador (`F12`) y busca errores

---

## 📚 Documentación Completa

- **Configuración detallada:** `frontend/FIREBASE_SETUP.md`
- **Resumen de integración:** `FIREBASE_INTEGRATION_SUMMARY.md`
- **Documentación Firebase:** https://firebase.google.com/docs/auth

---

## ✅ Checklist

- [ ] Proyecto creado en Firebase Console
- [ ] Email/Password habilitado
- [ ] Google Sign-In habilitado
- [ ] Credenciales copiadas
- [ ] Archivo `.env` creado en `frontend/`
- [ ] Variables de entorno configuradas
- [ ] Servidor reiniciado
- [ ] Registro probado exitosamente
- [ ] Login probado exitosamente
- [ ] Menú de usuario funciona
- [ ] Logout funciona

---

## 🎉 ¡Listo!

Una vez completado el checklist, tu sistema de autenticación está **100% funcional**.

Los usuarios pueden:
- ✅ Registrarse con email
- ✅ Iniciar sesión con email
- ✅ Iniciar sesión con Google
- ✅ Ver su perfil en el navbar
- ✅ Cerrar sesión

---

**¿Necesitas ayuda?** Revisa `FIREBASE_SETUP.md` para instrucciones más detalladas.
