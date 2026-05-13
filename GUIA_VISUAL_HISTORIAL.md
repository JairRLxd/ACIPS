# 🎨 Guía Visual del Historial de Conversaciones

## 📍 Ubicación de los Botones

En la **parte inferior del chat**, encontrarás 3 botones nuevos:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Historial (5)]  [Nueva Conversación]  [Limpiar] │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔘 Botones Disponibles

### 1. **Historial (X)** 🕐
- Muestra el número de conversaciones guardadas
- Click para abrir/cerrar el panel de historial
- Color: Gris → Negro al hover

### 2. **Nueva Conversación** ➕
- Inicia un chat completamente nuevo
- Guarda la conversación actual automáticamente
- Color: Azul

### 3. **Limpiar** 🗑️
- Limpia la conversación actual
- Pide confirmación antes de borrar
- Color: Rojo

---

## 📋 Panel de Historial

Cuando haces clic en **"Historial"**, se abre un panel elegante:

```
╔═══════════════════════════════════════════════════╗
║  🕐 Historial de Conversaciones            [X]   ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ Soy madre soltera con dos hijos, ¿qué...   │ ║
║  │ 💬 12 mensajes  🕐 12 may, 20:30      [🗑️] │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ ¿Qué documentos necesito para la pensión?  │ ║
║  │ 💬 8 mensajes   🕐 12 may, 19:15      [🗑️] │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ ¿Dónde tramito la beca Benito Juárez?      │ ║
║  │ 💬 15 mensajes  🕐 11 may, 18:45      [🗑️] │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

## 🎯 Interacciones

### ✅ Cargar Conversación
```
1. Abre el historial
2. Click en cualquier conversación
   ↓
   Se carga completa con todos los mensajes
   ↓
   El panel se cierra automáticamente
```

### ➕ Nueva Conversación
```
1. Click en "Nueva Conversación"
   ↓
   Conversación actual se guarda en historial
   ↓
   Chat se limpia para empezar de nuevo
```

### 🗑️ Eliminar Conversación
```
1. Abre el historial
2. Click en el ícono de basura [🗑️]
   ↓
   Aparece confirmación: "¿Eliminar esta conversación?"
   ↓
   Click en "Aceptar"
   ↓
   Conversación eliminada del historial
```

### 🧹 Limpiar Actual
```
1. Click en "Limpiar"
   ↓
   Aparece confirmación: "¿Estás seguro...?"
   ↓
   Click en "Aceptar"
   ↓
   Chat actual se limpia
   ↓
   Se crea nueva conversación vacía
```

---

## 🎨 Indicadores Visuales

### Conversación Actual
La conversación que estás viendo actualmente se resalta en **rosa**:
```
┌─────────────────────────────────────────────┐
│ 🌸 Soy madre soltera con dos hijos...      │  ← Rosa (actual)
│ 💬 12 mensajes  🕐 12 may, 20:30      [🗑️] │
└─────────────────────────────────────────────┘
```

### Otras Conversaciones
Las demás conversaciones tienen fondo blanco:
```
┌─────────────────────────────────────────────┐
│ ⬜ ¿Qué documentos necesito para...        │  ← Blanco
│ 💬 8 mensajes   🕐 12 may, 19:15      [🗑️] │
└─────────────────────────────────────────────┘
```

### Hover (al pasar el mouse)
```
┌─────────────────────────────────────────────┐
│ ✨ ¿Dónde tramito la beca...               │  ← Sombra + borde
│ 💬 15 mensajes  🕐 11 may, 18:45      [🗑️] │
└─────────────────────────────────────────────┘
```

---

## 📊 Información Mostrada

Cada conversación muestra:

1. **Título** 📝
   - Primeras 50 caracteres del primer mensaje del usuario
   - Si es más largo, se agrega "..."

2. **Número de Mensajes** 💬
   - Cuenta total de mensajes (usuario + asistente)

3. **Fecha y Hora** 🕐
   - Formato: "12 may, 20:30"
   - Última actividad en esa conversación

4. **Botón Eliminar** 🗑️
   - Ícono de basura en la esquina derecha
   - Hover cambia a rojo

---

## 🔄 Flujo de Trabajo Típico

### Escenario 1: Usuario Nuevo
```
1. Entra al chatbot
2. Hace preguntas
3. Cierra la página
   ↓
4. Vuelve a entrar
5. La conversación sigue ahí ✅
```

### Escenario 2: Múltiples Temas
```
1. Pregunta sobre becas
2. Click en "Nueva Conversación"
3. Pregunta sobre pensiones
4. Click en "Nueva Conversación"
5. Pregunta sobre apoyos
   ↓
6. Click en "Historial"
7. Ve las 3 conversaciones guardadas
8. Puede volver a cualquiera
```

### Escenario 3: Limpieza
```
1. Tiene 20 conversaciones guardadas
2. Abre historial
3. Elimina las que ya no necesita
4. Mantiene solo las importantes
```

---

## 💡 Tips de Uso

### ✅ Buenas Prácticas
- Usa "Nueva Conversación" para temas diferentes
- Revisa el historial para recordar información anterior
- Elimina conversaciones antiguas para mantener orden
- El título te ayuda a identificar cada conversación

### ⚠️ Consideraciones
- Máximo 50 conversaciones guardadas
- Si llegas al límite, las más antiguas se eliminan automáticamente
- Los datos están en tu navegador (localStorage)
- Si limpias el navegador, se pierden las conversaciones

---

## 🎉 Ejemplo de Uso Real

```
Usuario entra al chatbot:
├─ Ve su última conversación cargada automáticamente
├─ Continúa donde se quedó
├─ Hace más preguntas
├─ Cierra la página
│
Usuario vuelve al día siguiente:
├─ La conversación sigue ahí
├─ Click en "Historial"
├─ Ve todas sus conversaciones anteriores
├─ Click en una conversación de hace 2 días
├─ Se carga completa
├─ Puede continuar o iniciar nueva
```

---

## 🚀 ¡Disfruta tu Chatbot con Memoria!

Ahora tu chatbot **recuerda todo** y puedes:
- ✅ Volver a conversaciones anteriores
- ✅ Organizar por temas
- ✅ No perder información importante
- ✅ Trabajar en múltiples consultas

**¡Todo guardado automáticamente!** 🎊
