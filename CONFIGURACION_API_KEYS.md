# 🔑 Configuración de API Keys

## ✅ Resumen

El proyecto ACIPS ya está completamente subido a GitHub en:
**https://github.com/JairRLxd/ACIPS**

### 🔐 Seguridad

- ✅ El archivo `.env` con las API keys **NO se subió** a GitHub
- ✅ Solo se subió `.env.example` con placeholders
- ✅ Tus credenciales están seguras en tu computadora local

---

## 📍 Ubicación de la API Key de Groq

### En tu computadora local:

**Archivo**: `.vscode/backend/.env`

```env
GROQ_API_KEY=tu_api_key_real_aqui
```

### En GitHub:

**Archivo**: `.vscode/backend/.env.example`

```env
GROQ_API_KEY=tu_groq_api_key_aqui
```

---

## 🚀 Para otros desarrolladores que clonen el repositorio

Si alguien clona tu repositorio desde GitHub, necesitará:

### 1. Clonar el repositorio
```bash
git clone https://github.com/JairRLxd/ACIPS.git
cd ACIPS
```

### 2. Configurar el Backend

```bash
cd .vscode/backend

# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env y agregar sus propias API keys
# GROQ_API_KEY=su_propia_api_key_aqui
```

### 3. Obtener su propia API Key de Groq

1. Ir a: https://console.groq.com
2. Crear una cuenta (gratis)
3. Generar una API key
4. Copiarla al archivo `.env`

### 4. Instalar dependencias y ejecutar

```bash
# Instalar dependencias de Python
pip install -r requirements.txt

# Ejecutar el backend
python start-groq-test.py
```

---

## 📁 Estructura de Archivos de Configuración

```
ACIPS/
├── .gitignore                          # Ignora archivos sensibles
│
├── .vscode/backend/
│   ├── .env                           # ❌ NO en GitHub (local)
│   ├── .env.example                   # ✅ SÍ en GitHub (plantilla)
│   └── start-groq-test.py            # ✅ SÍ en GitHub
│
└── frontend/
    ├── .env                           # ❌ NO en GitHub (local)
    └── .env.example                   # ✅ SÍ en GitHub (plantilla)
```

---

## 🔒 Archivos que NO se subieron a GitHub

Por seguridad, estos archivos están en `.gitignore`:

### Backend
- ✅ `.vscode/backend/.env` - Contiene API keys
- ✅ `.vscode/backend/firebase-key.json` - Credenciales de Firebase
- ✅ `.vscode/backend/venv/` - Entorno virtual de Python
- ✅ `.vscode/backend/generated/` - Archivos generados

### Frontend
- ✅ `frontend/.env` - Contiene credenciales de Firebase
- ✅ `frontend/node_modules/` - Dependencias de npm

---

## ✅ Archivos que SÍ se subieron a GitHub

### Backend Completo
- ✅ Todo el código fuente en `.vscode/backend/app/`
- ✅ `start-groq-test.py` - Servidor principal
- ✅ `requirements.txt` - Lista de dependencias
- ✅ `.env.example` - Plantilla de configuración
- ✅ `data/programas.json` - Datos de programas sociales

### Frontend Completo
- ✅ Todo el código fuente en `frontend/src/`
- ✅ `package.json` - Dependencias de npm
- ✅ `.env.example` - Plantilla de configuración
- ✅ Imágenes y assets en `frontend/public/`

### Documentación
- ✅ Todos los archivos `.md` con documentación
- ✅ README.md completo
- ✅ Guías de instalación y uso

---

## 🔄 Actualizar el Repositorio

Si haces cambios locales y quieres subirlos:

```bash
# Ver qué archivos cambiaron
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main
```

**Nota**: El archivo `.env` nunca se subirá porque está en `.gitignore`

---

## 🆘 Solución de Problemas

### "No tengo la API key de Groq"

1. Ve a https://console.groq.com
2. Crea una cuenta gratis
3. Ve a "API Keys"
4. Haz clic en "Create API Key"
5. Copia la key y pégala en `.vscode/backend/.env`

### "El backend no arranca"

Verifica que:
1. Tienes el archivo `.vscode/backend/.env` creado
2. La API key de Groq está correctamente configurada
3. Instalaste las dependencias: `pip install -r requirements.txt`

### "Alguien más necesita configurar el proyecto"

Comparte con ellos:
1. El link del repositorio: https://github.com/JairRLxd/ACIPS
2. Este documento: `CONFIGURACION_API_KEYS.md`
3. Instrucciones para obtener su propia API key de Groq

---

## 📝 Resumen

✅ **Backend subido a GitHub**: Sí, código completo
✅ **API keys en GitHub**: No, están protegidas
✅ **Archivo .env en GitHub**: No, solo .env.example
✅ **Proyecto funcional**: Sí, completamente
✅ **Seguridad**: Máxima, credenciales protegidas

---

## 🎉 ¡Todo Listo!

Tu proyecto está:
- ✅ Completamente subido a GitHub
- ✅ Con todas las funcionalidades
- ✅ Sin exponer credenciales sensibles
- ✅ Listo para que otros lo clonen y usen

**Link del repositorio**: https://github.com/JairRLxd/ACIPS

¡Felicidades! 🎊
