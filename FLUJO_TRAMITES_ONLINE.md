# 📋 Flujo de Trámites en Línea (Grupo B)

## 🎯 ¿Cómo Funciona?

El sistema ACIPS permite a los usuarios realizar trámites en línea para programas del **Grupo B** (digitales). Aquí te explico paso a paso cómo funciona:

---

## 📝 Paso 1: Seleccionar un Programa

El usuario navega por la página principal y selecciona un programa social del **Grupo B** (en línea), por ejemplo:
- Jóvenes Construyendo el Futuro
- Beca Benito Juárez
- Beca Rita Cetina
- RFC / Constancia Fiscal

**Identificación visual:**
- Badge verde: "Documento digital"
- Modalidad: "en_linea"

---

## 📄 Paso 2: Validar Documentos con IA

Una vez en la página del trámite, el usuario debe validar sus documentos:

### 2.1 Checklist de Documentos
- Se muestra una lista de documentos requeridos
- Cada documento tiene un botón **"Validar IA"** (si es validable por OCR)
- Ejemplo de documentos:
  - INE ✅ validable
  - CURP ✅ validable
  - Comprobante de domicilio ✅ validable
  - Constancia de estudios ✅ validable

### 2.2 Proceso de Validación OCR
1. Usuario hace clic en **"Validar IA"**
2. Se abre un modal para subir el documento (PDF, JPG, PNG)
3. El sistema:
   - Extrae texto con OCR (EasyOCR)
   - Clasifica el tipo de documento (IA)
   - Valida campos requeridos
   - Verifica vigencia
   - Calcula confianza del OCR

4. Resultado:
   - ✅ **Documento válido** → Se marca como completado
   - ❌ **Documento no válido** → Muestra errores y sugerencias

### 2.3 Progreso
- Barra de progreso: `3/4 documentos` (75%)
- Cuando todos están validados: **"¡Tienes todos los documentos listos!"**

---

## 📝 Paso 3: Llenar Formulario (Opcional)

Algunos programas requieren información adicional:

### Campos Comunes:
- Nombre completo
- CURP (18 caracteres)
- Municipio
- CLABE interbancaria (18 dígitos)

### Campos Específicos por Programa:
- **Becas**: Nombre del plantel educativo
- **Jefas de Familia**: Número de hijos menores

**Nota:** Los datos del usuario autenticado se pre-llenan automáticamente.

---

## 🚀 Paso 4: Enviar Solicitud

Una vez completados todos los documentos:

### 4.1 Botón "Enviar Solicitud"
- Aparece un panel verde con el botón
- Mensaje: "¡Todo listo para enviar!"
- Al hacer clic, se envía la solicitud al backend

### 4.2 Proceso de Envío
```javascript
{
  programa_id: 4,
  datos_usuario: {
    nombre: "Juan Pérez",
    curp: "PEPJ900101HDFRXN01",
    municipio: "Xalapa",
    clabe: "012345678901234567"
  },
  documentos_validados: [
    {
      documento_id: 1,
      nombre: "INE",
      tipo: "ine",
      validado: true,
      resultado_ocr: { es_correcto: true, ... }
    },
    ...
  ]
}
```

### 4.3 Backend Guarda en Firebase
El backend crea dos registros:

**1. Trámite Virtual** (colección `tramites_virtuales`):
```javascript
{
  expediente_id: "uuid-123",
  sesion_id: "uid-tramite-4-20260513",
  usuario_uid: "firebase-uid",
  programa_id: 4,
  programa_nombre: "Jóvenes Construyendo el Futuro",
  datos_usuario: {...},
  documentos_validados: [...],
  estado: "pendiente",  // pendiente → en_revision → aprobado/rechazado
  fecha_creacion: "2026-05-13T10:30:00",
  tipo_tramite: "virtual",
  grupo: "B"
}
```

**2. Validaciones** (colección `validaciones`):
- Un documento por cada documento validado
- Incluye resultado del OCR
- Vinculado al trámite por `tramite_id`

---

## ✅ Paso 5: Confirmación

### 5.1 Modal de Éxito
Se muestra un modal animado con:
- ✅ Icono de éxito (verde, animado)
- Mensaje: "¡Solicitud Enviada!"
- Información: "Recibirás una notificación cuando sea revisada"
- Botón: "Ver Mis Solicitudes"

### 5.2 Redirección Automática
Después de 3 segundos, redirige a `/mis-solicitudes`

---

## 📊 Paso 6: Ver Estado de Solicitud

En la página **"Mis Solicitudes"** (`/mis-solicitudes`):

### Estados Posibles:
- 🟡 **Pendiente**: Esperando revisión del administrador
- 🔵 **En Revisión**: Un administrador está revisando
- ✅ **Aprobado**: Solicitud aprobada
- ❌ **Rechazado**: Solicitud rechazada (con comentarios)

### Información Mostrada:
- Nombre del programa
- Fecha de envío
- Estado actual
- Comentarios del administrador (si hay)
- Botón para ver detalles

---

## 🔐 Seguridad y Autenticación

### Requisitos:
- Usuario debe estar **autenticado** con Firebase Auth
- Token JWT se envía en header: `Authorization: Bearer <token>`
- Backend verifica el token antes de guardar

### Validaciones:
- Programa debe existir en Firebase
- Programa debe ser del Grupo B (en línea)
- Usuario debe tener permisos

---

## 🎨 Experiencia de Usuario

### Indicadores Visuales:
- ✅ **Verde**: Documento validado correctamente
- ❌ **Rojo**: Documento no válido
- 🔵 **Azul**: Documento marcado manualmente
- ⚪ **Gris**: Documento pendiente

### Animaciones:
- Barra de progreso animada
- Modal de validación con spinner
- Modal de éxito con bounce
- Transiciones suaves

### Mensajes Claros:
- Instrucciones paso a paso
- Errores específicos con soluciones
- Confirmaciones visuales
- Próximos pasos

---

## 📱 Flujo Completo Resumido

```
1. Usuario selecciona programa (Grupo B)
   ↓
2. Valida documentos con IA (OCR)
   ↓
3. Llena formulario (si aplica)
   ↓
4. Hace clic en "Enviar Solicitud"
   ↓
5. Backend guarda en Firebase
   ↓
6. Modal de éxito
   ↓
7. Redirección a "Mis Solicitudes"
   ↓
8. Usuario ve estado: "Pendiente"
   ↓
9. Admin revisa y aprueba/rechaza
   ↓
10. Usuario recibe notificación
```

---

## 🔧 Endpoints del Backend

### 1. Validar Documento (OCR)
```
POST /api/v1/validar-documento
Body: {
  sesion_id, requisito_id, tipo_esperado,
  archivo_base64, mime_type
}
Response: { es_correcto, legible, vigente, ... }
```

### 2. Enviar Trámite Online
```
POST /api/v1/tramites-virtuales/enviar
Headers: Authorization: Bearer <token>
Body: {
  programa_id, datos_usuario, documentos_validados
}
Response: {
  success: true,
  tramite_id, expediente_id, estado
}
```

### 3. Obtener Mis Solicitudes
```
GET /api/v1/tramites-virtuales/mis-solicitudes
Headers: Authorization: Bearer <token>
Response: {
  tramites_virtuales: [...]
}
```

---

## 📦 Colecciones de Firebase

### `programas`
- Información de todos los programas sociales
- Campo `grupo`: "A" (presencial) o "B" (en línea)
- Campo `tipo_documento_generado`: tipo de PDF a generar

### `tramites_virtuales`
- Solicitudes enviadas por usuarios
- Estado: pendiente, en_revision, aprobado, rechazado
- Vinculado a usuario por `usuario_uid`

### `validaciones`
- Resultados de validación OCR
- Vinculado a trámite por `tramite_id`
- Incluye confianza del OCR y tipo detectado

### `usuarios`
- Información de usuarios registrados
- Perfil sociodemográfico
- Rol: usuario, admin

---

## 🎯 Ventajas del Sistema

1. **Automatización**: OCR valida documentos automáticamente
2. **Rapidez**: Usuario completa trámite en minutos
3. **Transparencia**: Usuario ve estado en tiempo real
4. **Seguridad**: Autenticación con Firebase
5. **Trazabilidad**: Historial completo en Firebase
6. **Escalabilidad**: Soporta múltiples programas
7. **UX Moderna**: Interfaz intuitiva y animada

---

## 🚀 Para Probar el Flujo

1. **Inicia sesión** en la aplicación
2. Ve a la página principal
3. Busca un programa del **Grupo B** (badge verde)
4. Haz clic en **"Ver detalles"**
5. Valida tus documentos con **"Validar IA"**
6. Llena el formulario (si aplica)
7. Haz clic en **"Enviar Solicitud"**
8. Ve a **"Mis Solicitudes"** para ver el estado

---

## 📞 Soporte

Si tienes dudas o problemas:
- Revisa la consola del navegador (F12)
- Revisa los logs del backend
- Verifica que Firebase esté configurado
- Asegúrate de estar autenticado

---

**¡Listo!** Ahora tienes un sistema completo de trámites en línea funcionando. 🎉
