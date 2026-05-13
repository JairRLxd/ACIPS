# 🚀 Guía Rápida - Chatbot con OCR

## ✅ Todo Está Listo

Tu chatbot puede analizar documentos como CURP, INE, comprobantes de domicilio, etc.

---

## 🎯 Cómo Usar (3 Pasos)

### 1️⃣ Abre el Chatbot
```
http://localhost:5173/chat
```

### 2️⃣ Adjunta Documentos
- Haz clic en el botón **📎** (clip)
- Selecciona PDF o imágenes (PNG, JPG)
- Máximo 10MB por archivo

### 3️⃣ Envía y Recibe Recomendaciones
- Escribe un mensaje opcional
- Haz clic en "Enviar"
- El sistema extraerá el texto y te dará recomendaciones

---

## 📄 Documentos Que Puedes Subir

✅ CURP
✅ INE/IFE
✅ Acta de Nacimiento
✅ Comprobante de Domicilio
✅ Comprobantes de Ingresos
✅ Cualquier documento con texto

---

## 💬 Ejemplos de Preguntas

Después de adjuntar documentos, pregunta:

- "¿Qué programas puedo solicitar?"
- "Analiza estos documentos"
- "¿Qué información encuentras?"
- "¿Qué documentos me faltan?"

O simplemente envía sin mensaje y el sistema analizará automáticamente.

---

## 🔧 Servicios Activos

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend | http://localhost:5173 | ✅ Corriendo |
| Backend | http://localhost:5000 | ✅ Corriendo |
| Chatbot | http://localhost:5173/chat | ✅ Listo |

---

## 🛠️ Comandos Útiles

### Reiniciar Backend
```bash
cd .vscode/backend
python start-groq-test.py
```

### Reiniciar Frontend
```bash
cd frontend
npm run dev
```

### Ver Estado de Servicios
- Backend: http://localhost:5000/api/v1/health
- Frontend: http://localhost:5173

---

## 🎨 Tecnología

- **Groq AI** (Llama 3.3 70B) - Análisis inteligente
- **PyMuPDF** - Extracción de texto de PDFs
- **EasyOCR** - Reconocimiento de texto en imágenes
- **React + Vite** - Interfaz moderna

---

## 📝 Nota Importante

**Primera vez usando OCR**: EasyOCR descargará modelos automáticamente (~100MB). Esto solo sucede una vez y puede tomar unos minutos.

---

## 🎉 ¡Listo!

Abre **http://localhost:5173/chat** y comienza a subir documentos.

El chatbot extraerá la información y te recomendará programas sociales específicos para ti.
