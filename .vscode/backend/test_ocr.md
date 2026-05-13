# Prueba de OCR - ACIPS

## Estado Actual

✅ **Backend corriendo**: http://localhost:5000
✅ **Frontend corriendo**: http://localhost:5173
✅ **Groq AI configurado**: Llama 3.3 70B
✅ **Dependencias OCR instaladas**:
   - PyMuPDF (1.27.2.3) - Para PDFs
   - Pillow (12.2.0) - Para imágenes
   - EasyOCR (1.7.2) - Para reconocimiento de texto
   - Torch (2.11.0) - Para procesamiento

## Funcionalidad Implementada

El chatbot ahora puede:

1. **Recibir archivos adjuntos** (PDF e imágenes)
2. **Extraer texto automáticamente**:
   - PDFs: Usa PyMuPDF para extraer texto
   - Imágenes (PNG, JPG, JPEG): Usa EasyOCR para reconocimiento óptico de caracteres
3. **Analizar documentos** como:
   - CURP
   - Comprobante de domicilio
   - Acta de nacimiento
   - INE/IFE
   - Comprobantes de ingresos
4. **Proporcionar recomendaciones** basadas en la información extraída

## Cómo Probar

### Opción 1: Desde el navegador
1. Abre http://localhost:5173/chat
2. Haz clic en el botón de clip 📎 para adjuntar archivos
3. Selecciona un documento (PDF o imagen)
4. Escribe un mensaje opcional o deja que el sistema analice automáticamente
5. Haz clic en "Enviar"

### Opción 2: Usando curl (línea de comandos)

```bash
# Probar con un archivo PDF
curl -X POST http://localhost:5000/api/v1/chat \
  -F "mensaje=Analiza este documento" \
  -F "archivos=@ruta/al/documento.pdf"

# Probar con una imagen
curl -X POST http://localhost:5000/api/v1/chat \
  -F "mensaje=¿Qué programas puedo solicitar?" \
  -F "archivos=@ruta/a/imagen.jpg"
```

## Ejemplo de Uso

**Usuario adjunta**: CURP.pdf
**Sistema extrae**: 
- Nombre completo
- Fecha de nacimiento
- Edad
- Estado de nacimiento
- Sexo

**Groq AI analiza y recomienda**:
- "Según tu CURP, tienes 68 años. Calificas para la Pensión para el Bienestar de las Personas Adultas Mayores..."
- "Necesitarás también: comprobante de domicilio, identificación oficial..."

## Notas Técnicas

- **Tamaño máximo**: 10MB por archivo
- **Formatos soportados**: PDF, PNG, JPG, JPEG
- **Idiomas OCR**: Español e Inglés
- **Procesamiento**: EasyOCR usa CPU (no requiere GPU)
- **Primera ejecución**: EasyOCR descargará modelos (~100MB) la primera vez

## Próximos Pasos

Para mejorar aún más:
1. Agregar validación de documentos oficiales
2. Extraer campos específicos (CURP, RFC, etc.)
3. Guardar documentos procesados en Firebase Storage
4. Crear historial de documentos por usuario
5. Agregar soporte para más formatos (DOCX, etc.)
