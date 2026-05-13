# 📎 Chatbot con Soporte de Archivos - ACIPS

## ✅ Funcionalidad Implementada

El chatbot ahora puede **recibir y analizar archivos**:
- ✅ **PDFs** - Extrae y lee el texto del documento
- ✅ **Imágenes** (PNG, JPG, JPEG, GIF, WEBP) - Analiza visualmente el contenido
- ✅ **Múltiples archivos** - Puedes enviar varios archivos a la vez
- ✅ **Límite de tamaño** - Máximo 10MB por archivo

---

## 🚀 Instalación de Dependencias

### Backend

Instala la nueva dependencia PyPDF2:

```bash
cd backend
pip install PyPDF2==3.0.1
```

O instala todas las dependencias:

```bash
pip install -r requirements.txt
```

### Frontend

No se requieren nuevas dependencias en el frontend.

---

## 🎯 Cómo Usar

### 1. **Adjuntar Archivos**

En la página del chatbot (`/chat`):

1. Haz clic en el **botón de clip** (📎) a la izquierda del input
2. Selecciona uno o varios archivos (PDF o imágenes)
3. Los archivos aparecerán como chips arriba del input
4. Escribe un mensaje opcional (ej: "¿Qué dice este documento?")
5. Haz clic en **Enviar**

### 2. **Tipos de Archivos Soportados**

**PDFs:**
- Documentos de requisitos
- Formatos de solicitud
- Comprobantes
- Cualquier PDF con texto

**Imágenes:**
- Fotos de documentos
- Capturas de pantalla
- Identificaciones
- Comprobantes escaneados

### 3. **Ejemplos de Uso**

**Ejemplo 1: Analizar requisitos**
```
Usuario: [Adjunta PDF de requisitos]
Usuario: "¿Qué documentos necesito según este PDF?"
ACIPS: "Según el documento, necesitas..."
```

**Ejemplo 2: Verificar comprobante**
```
Usuario: [Adjunta imagen de INE]
Usuario: "¿Esta identificación es válida para el trámite?"
ACIPS: "Veo que es una identificación oficial..."
```

**Ejemplo 3: Múltiples archivos**
```
Usuario: [Adjunta 3 PDFs]
Usuario: "Compara estos documentos"
ACIPS: "He revisado los 3 documentos..."
```

---

## 🔧 Características Técnicas

### Frontend

**Componentes Nuevos:**
- Botón de adjuntar archivos con icono de clip
- Vista previa de archivos adjuntos (chips)
- Validación de tipo y tamaño de archivo
- Indicador de archivos en las burbujas de chat

**Validaciones:**
- Solo PDF e imágenes
- Máximo 10MB por archivo
- Mensajes de error claros

### Backend

**Nuevas Funciones:**

1. **`chat_con_archivos()`** en `chatbot.py`
   - Procesa PDFs extrayendo texto
   - Codifica imágenes en base64
   - Envía a Claude Vision API

2. **Endpoint actualizado** en `chatbot_routes.py`
   - Detecta si hay archivos adjuntos
   - Maneja FormData y JSON
   - Guarda archivos temporalmente
   - Limpia archivos después de procesar

**Procesamiento:**
- **PDFs**: Usa PyPDF2 para extraer texto
- **Imágenes**: Codifica en base64 y usa Claude Vision
- **Límite**: 4000 caracteres de texto PDF, imágenes completas

---

## 📋 API Endpoint Actualizado

### POST `/api/chat`

**Con archivos (FormData):**
```
Content-Type: multipart/form-data

mensaje: "¿Qué dice este documento?"
perfil_usuario: "{...}" (JSON string)
archivos: [File, File, ...]
```

**Sin archivos (JSON):**
```
Content-Type: application/json

{
  "mensaje": "Hola",
  "perfil_usuario": {...}
}
```

**Response:**
```json
{
  "success": true,
  "respuesta": "He analizado el documento...",
  "timestamp": "14:30"
}
```

---

## 🎨 UI/UX

### Botón de Adjuntar
- Icono de clip (📎)
- Tooltip: "Adjuntar archivo (PDF o imagen)"
- Deshabilitado mientras se envía

### Vista Previa de Archivos
- Chips con nombre del archivo
- Icono según tipo (PDF rojo, imagen azul)
- Botón X para eliminar
- Trunca nombres largos

### Burbujas de Chat
- Muestra archivos adjuntos en el mensaje del usuario
- Iconos diferenciados por tipo
- Diseño consistente con el tema rojo vino

---

## 🐛 Manejo de Errores

**Errores Comunes:**

1. **Archivo muy grande**
   ```
   "El archivo supera el tamaño máximo de 10MB"
   ```

2. **Tipo no soportado**
   ```
   "Solo se permiten archivos PDF e imágenes"
   ```

3. **Error al leer PDF**
   ```
   "No se pudo leer el PDF: [error]"
   ```

4. **Error al leer imagen**
   ```
   "No se pudo leer la imagen: [error]"
   ```

---

## 🔒 Seguridad

- ✅ Validación de extensiones de archivo
- ✅ Límite de tamaño (10MB)
- ✅ Nombres de archivo seguros (secure_filename)
- ✅ Archivos temporales eliminados después de procesar
- ✅ No se almacenan archivos permanentemente

---

## 📊 Capacidades de Claude Vision

Claude puede analizar:
- ✅ Texto en imágenes (OCR)
- ✅ Tablas y formularios
- ✅ Firmas y sellos
- ✅ Calidad del documento
- ✅ Información estructurada
- ✅ Comparar múltiples documentos

---

## 🧪 Pruebas

### Prueba 1: PDF Simple
1. Crea un PDF con texto
2. Adjúntalo en el chat
3. Pregunta: "¿Qué dice este documento?"
4. Verifica que Claude extraiga el texto

### Prueba 2: Imagen de Documento
1. Toma foto de una identificación (borrosa)
2. Adjúntala en el chat
3. Pregunta: "¿Puedes leer este documento?"
4. Verifica que Claude analice la imagen

### Prueba 3: Múltiples Archivos
1. Adjunta 2-3 archivos
2. Pregunta: "Compara estos documentos"
3. Verifica que Claude procese todos

---

## 📝 Notas Importantes

1. **Costo de API**: Las imágenes consumen más tokens que el texto
2. **Tiempo de respuesta**: Archivos grandes pueden tardar más
3. **Límites de Claude**: Máximo ~5 imágenes por mensaje
4. **PDFs con imágenes**: Solo extrae texto, no analiza imágenes dentro del PDF

---

## 🚀 Próximas Mejoras Sugeridas

- [ ] Soporte para Word (.docx)
- [ ] Soporte para Excel (.xlsx)
- [ ] Vista previa de imágenes antes de enviar
- [ ] Historial de archivos enviados
- [ ] Descargar respuestas como PDF
- [ ] OCR mejorado para PDFs escaneados

---

**¡El chatbot ahora es mucho más poderoso!** 🎉

Los usuarios pueden enviar documentos y recibir ayuda personalizada basada en su contenido.
