# ✅ Configuración Final de Firebase - ACIPS

## 🎉 ¡Credenciales Ya Configuradas!

El archivo `.env` ya está creado con tus credenciales de Firebase.

---

## 🔧 Paso Final: Habilitar Métodos de Autenticación

### 1. Ve a Firebase Console
👉 https://console.firebase.google.com/project/acips-5952d/authentication/providers

### 2. Habilitar Email/Password

1. Haz clic en **"Email/Password"**
2. Activa el toggle **"Enable"** (Habilitar)
3. Haz clic en **"Save"** (Guardar)

### 3. Habilitar Google Sign-In

1. Haz clic en **"Google"**
2. Activa el toggle **"Enable"** (Habilitar)
3. Selecciona un **email de soporte** del proyecto (tu email)
4. Haz clic en **"Save"** (Guardar)

### 4. (Opcional) Habilitar Facebook Sign-In

Si quieres login con Facebook:
1. Crea una app en https://developers.facebook.com/
2. Obtén el **App ID** y **App Secret**
3. En Firebase, haz clic en **"Facebook"**
4. Pega las credenciales
5. Copia la **OAuth redirect URI**
6. Agrégala en tu app de Facebook

---

## 🚀 Probar la Aplicación

### 1. Inicia el servidor (si no está corriendo):
```bash
cd frontend
npm run dev
```

### 2. Abre el navegador:
```
http://localhost:5173/registro
```

### 3. Prueba registrarte:
- ✅ Con email y contraseña
- ✅ Con el botón de Google

### 4. Verifica que funciona:
- ✅ Te redirige a la página principal
- ✅ Ves tu nombre en el navbar (arriba a la derecha)
- ✅ Puedes hacer clic en tu nombre y ver el menú
- ✅ Puedes cerrar sesión

---

## 📋 Checklist Rápido

- [x] Proyecto creado en Firebase ✅
- [x] Credenciales copiadas ✅
- [x] Archivo `.env` creado ✅
- [ ] **Email/Password habilitado en Firebase Console** ⬅️ HACER ESTO
- [ ] **Google Sign-In habilitado en Firebase Console** ⬅️ HACER ESTO
- [ ] Servidor reiniciado (si estaba corriendo)
- [ ] Registro probado exitosamente
- [ ] Login probado exitosamente

---

## 🎯 Enlaces Directos

- **Firebase Console:** https://console.firebase.google.com/project/acips-5952d
- **Authentication:** https://console.firebase.google.com/project/acips-5952d/authentication/providers
- **Project Settings:** https://console.firebase.google.com/project/acips-5952d/settings/general

---

## 🐛 Si Algo No Funciona

### El servidor no inicia
```bash
# Detén el servidor (Ctrl+C)
# Reinicia:
npm run dev
```

### Error: "auth/operation-not-allowed"
**Solución:** Habilita Email/Password en Firebase Console (paso 2 arriba)

### Error: "auth/popup-blocked"
**Solución:** Permite popups en tu navegador para localhost

### No veo cambios
**Solución:** 
1. Detén el servidor (Ctrl+C)
2. Reinicia: `npm run dev`
3. Refresca el navegador (F5)

---

## ✨ ¡Ya Casi Está!

Solo necesitas:
1. Habilitar Email/Password en Firebase Console (2 clics)
2. Habilitar Google Sign-In en Firebase Console (3 clics)
3. Probar el registro

**¡En menos de 2 minutos tendrás todo funcionando!** 🚀
