# 🎉 Chatbot con OCR - Implementación Completa

## ✅ Estado: FUNCIONANDO

Tu chatbot ACIPS ahora puede **analizar documentos** usando OCR (Reconocimiento Óptico de Caracteres).

---

## 🚀 Servicios Activos

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend** | http://localhost:5173 | ✅ Corriendo |
| **Backend** | http://localhost:5000 | ✅ Corriendo |
| **Chatbot** | http://localhost:5173/chat | ✅ Listo para usar |

---

## 📄 Documentos Soportados

El chatbot puede analizar:

### Documentos Oficiales
- ✅ **CURP** (PDF o imagen)
- ✅ **INE/IFE** (PDF o imagen)
- ✅ **Acta de Nacimiento** (PDF o imagen)
- ✅ **Comprobante de Domicilio** (PDF o imagen)
- ✅ **Comprobantes de Ingresos** (PDF o imagen)
- ✅ **Cualquier documento con texto** (PDF o imagen)

### Formatos Aceptados
- 📄 **PDF** - Extracción directa de texto
- 🖼️ **Imágenes** - PNG, JPG, JPEG (con OCR)
- 📏 **Tamaño máximo** - 10MB por archivo

---

## 🎯 Cómo Usar

### Paso 1: Abre el Chatbot
Navega a: **http://localhost:5173/chat**

### Paso 2: Adjunta Documentos
1. Haz clic en el botón de **clip 📎** (al lado del campo de texto)
2. Selecciona uno o varios documentos
3. Verás una vista previa de los archivos adjuntos

### Paso 3: Envía tu Consulta
Puedes escribir algo como:
- "Analiza estos documentos"
- "¿Qué programas puedo solicitar?"
- "¿Qué información encuentras aquí?"
- O simplemente enviar sin mensaje (el sistema analizará automáticamente)

### Paso 4: Recibe Recomendaciones
El chatbot:
1. **Extrae el texto** de tus documentos
2. **Analiza la información** (edad, ubicación, situación familiar, etc.)
3. **Recomienda programas sociales** específicos para ti
4. **Sugiere documentos adicionales** que puedas necesitar

---

## 💡 Ejemplos de Uso

### Ejemplo 1: CURP
**Usuario adjunta**: `CURP.pdf`

**Sistema extrae**:
```
GOMR680523HDFRNN09
Nombre: RAMIREZ GONZALEZ MARIA
Fecha de nacimiento: 23/05/1968
Edad: 58 años
Estado: Hidalgo
```

**Groq AI responde**:
> "Según tu CURP, tienes 58 años y resides en Hidalgo. Te recomiendo:
> 
> 1. **Pensión para el Bienestar de las Personas Adultas Mayores** - Podrás solicitarla cuando cumplas 65 años
> 2. **Programas estatales de Hidalgo** - Consulta apoyos locales
> 
> Documentos que necesitarás:
> - ✅ CURP (ya lo tienes)
> - Comprobante de domicilio
> - Identificación oficial (INE)"

### Ejemplo 2: Comprobante de Domicilio
**Usuario adjunta**: `recibo_luz.jpg`

**Sistema extrae**:
```
CFE - Comisión Federal de Electricidad
Nombre: JUAN PEREZ LOPEZ
Domicilio: CALLE REFORMA 123, COL. CENTRO
Ciudad: PACHUCA, HIDALGO
```

**Groq AI responde**:
> "Según tu comprobante de domicilio, resides en Pachuca, Hidalgo. Los programas disponibles en tu zona son:
> 
> 1. **Sembrando Vida** - Si tienes terreno agrícola
> 2. **Jóvenes Construyendo el Futuro** - Si tienes entre 18-29 años
> 3. **Programas municipales de Pachuca**"

### Ejemplo 3: Múltiples Documentos
**Usuario adjunta**: `CURP.pdf`, `INE.jpg`, `comprobante_domicilio.pdf`

**Groq AI analiza todo y responde**:
> "He analizado tus 3 documentos:
> 
> **Información encontrada**:
> - Nombre: María González Ramírez
> - Edad: 67 años
> - Domicilio: Pachuca, Hidalgo
> - Identificación: Vigente
> 
> **Programas recomendados**:
> 1. ✅ **Pensión para el Bienestar de las Personas Adultas Mayores**
>    - Monto: $6,000 MXN bimestrales
>    - Ya tienes todos los documentos necesarios
>    - Puedes tramitarla en tu Módulo de Bienestar más cercano
> 
> 2. **Seguro de Vida para Jefas de Familia** (si aplica)
> 
> **Próximos pasos**:
> 1. Acude a tu Módulo de Bienestar con tus documentos
> 2. Llena el formato de solicitud
> 3. Espera la validación (2-4 semanas)"

---

## 🔧 Tecnologías Implementadas

### Backend
- **Flask** - Framework web
- **Groq AI** - Inteligencia artificial (Llama 3.3 70B)
- **PyMuPDF** - Extracción de texto de PDFs
- **EasyOCR** - Reconocimiento óptico de caracteres en imágenes
- **Pillow** - Procesamiento de imágenes
- **Torch** - Motor de deep learning para OCR

### Frontend
- **React** - Interfaz de usuario
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **Axios** - Cliente HTTP
- **FormData API** - Envío de archivos

---

## 🎨 Interfaz del Chatbot

El chatbot incluye:

✅ **Botón de adjuntar archivos** (📎)
✅ **Vista previa de archivos** antes de enviar
✅ **Indicador de carga** mientras procesa
✅ **Mensajes con archivos adjuntos** visibles en el historial
✅ **Respuestas formateadas** con recomendaciones claras
✅ **Preguntas rápidas** para comenzar
✅ **Diseño responsive** (funciona en móvil y desktop)

---

## 🧪 Cómo Probar

### Prueba Rápida (Navegador)
1. Abre http://localhost:5173/chat
2. Haz clic en el botón 📎
3. Selecciona cualquier PDF o imagen con texto
4. Haz clic en "Enviar"
5. Espera la respuesta con el análisis

### Prueba Avanzada (Línea de Comandos)

```bash
# Probar con curl (Windows PowerShell)
curl -X POST http://localhost:5000/api/v1/chat `
  -F "mensaje=Analiza este documento" `
  -F "archivos=@C:\ruta\al\documento.pdf"
```

---

## 📊 Flujo de Procesamiento

```
1. Usuario adjunta archivo(s)
   ↓
2. Frontend envía FormData al backend
   ↓
3. Backend detecta tipo de archivo
   ↓
4. Si es PDF → PyMuPDF extrae texto
   Si es imagen → EasyOCR extrae texto
   ↓
5. Texto extraído se envía a Groq AI
   ↓
6. Groq AI analiza y genera recomendaciones
   ↓
7. Respuesta se muestra en el chat
```

---

## ⚙️ Configuración Actual

### Variables de Entorno (.vscode/backend/.env)
```env
# Groq AI
GROQ_API_KEY=tu_groq_api_key_aqui
GROQ_MODEL=llama-3.3-70b-versatile

# Firebase
FIREBASE_PROJECT_ID=acips-5952d

# OCR
PADDLEOCR_LANGUAGE=latin
OCR_TIMEOUT_SECONDS=20
```

### Dependencias Instaladas
```
✅ groq==0.13.1
✅ PyMuPDF==1.27.2.3
✅ Pillow==12.2.0
✅ easyocr==1.7.2
✅ torch==2.11.0
✅ torchvision==0.26.0
✅ scikit-image==0.26.0
```

---

## 🐛 Solución de Problemas

### El backend no inicia
```bash
cd .vscode/backend
python start-groq-test.py
```

### El frontend no inicia
```bash
cd frontend
npm run dev
```

### Error al subir archivos
- Verifica que el archivo sea PDF o imagen
- Verifica que el tamaño sea menor a 10MB
- Revisa la consola del navegador (F12)

### OCR no extrae texto
- **Primera vez**: EasyOCR descargará modelos (~100MB), espera unos minutos
- **Imagen borrosa**: Usa una imagen más clara o con mayor resolución
- **PDF escaneado**: Asegúrate de que el PDF contenga texto real (no solo imágenes)

---

## 🚀 Próximas Mejoras Sugeridas

1. **Validación de documentos oficiales**
   - Verificar formato de CURP
   - Validar estructura de RFC
   - Detectar documentos falsos

2. **Extracción estructurada**
   - Campos específicos (nombre, fecha, etc.)
   - Formato JSON con datos extraídos
   - Base de datos de documentos procesados

3. **Almacenamiento en Firebase**
   - Guardar documentos en Firebase Storage
   - Historial de documentos por usuario
   - Recuperación de análisis previos

4. **Más formatos**
   - DOCX (Word)
   - XLSX (Excel)
   - Imágenes HEIC (iPhone)

5. **Mejoras de UX**
   - Arrastrar y soltar archivos
   - Vista previa de imágenes
   - Progreso de procesamiento
   - Descargar análisis en PDF

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que ambos servicios estén corriendo
2. Revisa los logs del backend (terminal donde corre Python)
3. Revisa la consola del navegador (F12)
4. Verifica que los archivos sean del formato correcto

---

## 🎉 ¡Listo para Usar!

Tu chatbot ACIPS con OCR está **100% funcional**. Puedes:

✅ Subir documentos PDF e imágenes
✅ Extraer texto automáticamente
✅ Recibir recomendaciones personalizadas
✅ Analizar múltiples documentos a la vez
✅ Obtener información sobre programas sociales

**¡Pruébalo ahora en http://localhost:5173/chat!** 🚀
