# 🎤 Consejos para Mejor Reconocimiento de Voz

## ✅ Mejoras Implementadas

He mejorado la calidad de grabación y transcripción:

### 1. **Mejor Calidad de Audio**
- ✅ Cancelación de eco activada
- ✅ Supresión de ruido activada
- ✅ Control automático de ganancia
- ✅ Sample rate: 48kHz
- ✅ Bitrate: 128kbps

### 2. **Mejor Captura**
- ✅ Grabación en chunks de 100ms
- ✅ Validación de tamaño mínimo
- ✅ Detección de audio vacío

### 3. **Mejor Feedback**
- ✅ Temporizador visual (segundos)
- ✅ Mensajes de error específicos
- ✅ Logs detallados en consola

---

## 🎯 Consejos para Mejor Reconocimiento

### 1. **Habla Claro y Despacio**
- ❌ Mal: "Soymadresolteraconhijos"
- ✅ Bien: "Soy madre soltera con dos hijos"
- **Pausa** entre palabras
- **Pronuncia** claramente

### 2. **Habla Cerca del Micrófono**
- **Distancia ideal**: 15-30 cm
- ❌ Muy lejos: Audio débil
- ❌ Muy cerca: Distorsión
- ✅ Distancia media: Perfecto

### 3. **Ambiente Silencioso**
- ❌ Con música de fondo
- ❌ Con TV encendida
- ❌ Con ruido de calle
- ✅ En lugar tranquilo

### 4. **Graba Suficiente Tiempo**
- ❌ Muy corto: < 1 segundo
- ⚠️ Corto: 1-2 segundos
- ✅ Ideal: 3-10 segundos
- ⚠️ Muy largo: > 30 segundos

### 5. **Usa Frases Completas**
- ❌ Mal: "madre hijos apoyo"
- ✅ Bien: "Soy madre soltera con dos hijos, ¿qué apoyos puedo pedir?"

### 6. **Evita Ruidos**
- ❌ Toser mientras grabas
- ❌ Mover papeles
- ❌ Teclear
- ✅ Solo tu voz

---

## 🔧 Configuración del Micrófono

### Windows

#### 1. Verifica el Micrófono
```
1. Clic derecho en el icono de volumen
2. "Configuración de sonido"
3. "Entrada" → Selecciona tu micrófono
4. Habla y verifica la barra de nivel
```

#### 2. Ajusta el Nivel
```
1. "Propiedades del dispositivo"
2. Ajusta el volumen al 80-90%
3. No al 100% (puede distorsionar)
```

#### 3. Mejoras de Audio
```
1. "Propiedades adicionales del dispositivo"
2. Pestaña "Mejoras"
3. Activa:
   - Cancelación de eco acústico
   - Supresión de ruido
```

### Chrome

#### 1. Permisos
```
1. Clic en el candado 🔒
2. "Configuración del sitio"
3. Micrófono → Permitir
```

#### 2. Selecciona el Micrófono Correcto
```
1. En la página del chatbot
2. Clic en micrófono
3. Selecciona el micrófono correcto
4. No uses "Predeterminado"
```

---

## 📊 Diagnóstico de Problemas

### Problema 1: "Solo detecta algunas palabras"

**Causas posibles:**
- Hablas muy rápido
- Hablas muy bajo
- Mucho ruido de fondo
- Micrófono muy lejos

**Soluciones:**
1. Habla más despacio
2. Aumenta el volumen del micrófono
3. Busca lugar más silencioso
4. Acércate al micrófono

### Problema 2: "No detecta nada"

**Causas posibles:**
- Micrófono desconectado
- Permisos denegados
- Micrófono en mute
- Audio muy corto

**Soluciones:**
1. Verifica que el micrófono esté conectado
2. Permite el acceso en el navegador
3. Verifica que no esté en mute
4. Graba al menos 2-3 segundos

### Problema 3: "Detecta palabras incorrectas"

**Causas posibles:**
- Pronunciación poco clara
- Acento muy marcado
- Palabras técnicas o nombres propios
- Ruido de fondo

**Soluciones:**
1. Pronuncia más claramente
2. Habla más despacio
3. Deletrea nombres propios
4. Reduce ruido de fondo

---

## 🎯 Ejemplos de Uso Correcto

### Ejemplo 1: Consulta Simple

**❌ Mal:**
```
[Clic] "apoyomadresoltera" [Clic rápido]
Resultado: "apoyo madre"
```

**✅ Bien:**
```
[Clic] 
[Pausa 0.5s]
"Soy madre soltera con dos hijos"
[Pausa 0.5s]
"¿Qué apoyos puedo pedir?"
[Pausa 0.5s]
[Clic]

Resultado: "Soy madre soltera con dos hijos, ¿qué apoyos puedo pedir?"
```

### Ejemplo 2: Pregunta Larga

**❌ Mal:**
```
[Clic] "tengosesenta y cinco años vivo en pachuca hidalgo necesito saber que documentos necesito para la pension" [Clic]
Resultado: Palabras cortadas
```

**✅ Bien:**
```
[Clic]
[Pausa]
"Tengo sesenta y cinco años"
[Pausa breve]
"Vivo en Pachuca, Hidalgo"
[Pausa breve]
"Necesito saber qué documentos necesito"
[Pausa breve]
"Para la pensión de adultos mayores"
[Pausa]
[Clic]

Resultado: Transcripción completa y correcta
```

---

## 🔍 Cómo Verificar la Calidad

### 1. Prueba el Micrófono

**En Windows:**
```
1. Configuración → Sistema → Sonido
2. Entrada → Prueba el micrófono
3. Habla y verifica la barra
4. Debe llegar al 50-80%
```

**En el Navegador:**
```
1. Abre la consola (F12)
2. Haz clic en el micrófono
3. Verifica los logs:
   - "🎤 Grabación iniciada"
   - "📊 Tamaño del audio: X bytes"
   - "✅ Transcripción: ..."
```

### 2. Verifica el Tamaño del Audio

**Tamaños esperados:**
- 1 segundo: ~10-20 KB
- 3 segundos: ~30-60 KB
- 5 segundos: ~50-100 KB

**Si es muy pequeño (<5 KB):**
- El micrófono no está capturando bien
- Verifica permisos y configuración

---

## 💡 Tips Avanzados

### 1. Usa Auriculares con Micrófono
- Mejor calidad que micrófono de laptop
- Menos ruido de fondo
- Distancia constante

### 2. Posición del Micrófono
- **Laptop**: Habla hacia la pantalla
- **Auriculares**: Micrófono cerca de la boca
- **Externo**: 15-30 cm de distancia

### 3. Prueba Antes de Usar
- Haz una prueba rápida
- Di "Hola, esto es una prueba"
- Verifica que se transcriba bien

### 4. Divide Preguntas Largas
- En lugar de una pregunta de 30 segundos
- Haz 2-3 preguntas más cortas
- Mejor precisión

---

## 📈 Mejoras Técnicas Implementadas

### Frontend
```javascript
// Configuración mejorada de audio
audio: {
  echoCancellation: true,      // Cancela eco
  noiseSuppression: true,       // Reduce ruido
  autoGainControl: true,        // Ajusta volumen
  sampleRate: 48000,            // Alta calidad
  channelCount: 1               // Mono (suficiente)
}

// Mejor bitrate
audioBitsPerSecond: 128000      // 128 kbps
```

### Backend
```python
# Configuración de Whisper
transcription = groq_client.audio.transcriptions.create(
    file=audio,
    model="whisper-large-v3-turbo",  # Modelo más preciso
    language="es",                    # Español
    temperature=0.0                   # Más determinista
)
```

---

## 🎉 Resultado

Con estas mejoras, el reconocimiento de voz ahora:

- ✅ **Mejor calidad** de audio
- ✅ **Menos ruido** de fondo
- ✅ **Más preciso** en transcripción
- ✅ **Feedback visual** (temporizador)
- ✅ **Validaciones** de audio
- ✅ **Mensajes claros** de error

---

## 📝 Checklist de Uso

Antes de grabar, verifica:

- [ ] Micrófono conectado y funcionando
- [ ] Permisos otorgados en el navegador
- [ ] Ambiente silencioso
- [ ] Distancia adecuada (15-30 cm)
- [ ] Hablarás claro y despacio
- [ ] Grabarás al menos 3 segundos

**¡Ahora prueba de nuevo con estos consejos!** 🎤
