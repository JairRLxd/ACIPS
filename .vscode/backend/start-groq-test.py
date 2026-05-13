"""
Script para probar Groq directamente con historial de conversación persistente en Firebase
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from groq import Groq
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configurar CORS correctamente
CORS(app, 
     resources={r"/api/*": {
         "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
         "methods": ["GET", "POST", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": False
     }})

# Inicializar cliente de Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Inicializar Firebase (si existe el archivo de credenciales)
db = None
try:
    firebase_key_path = os.getenv("FIREBASE_KEY_PATH", "./firebase-key.json")
    if os.path.exists(firebase_key_path):
        if not firebase_admin._apps:
            cred = credentials.Certificate(firebase_key_path)
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase Firestore conectado")
    else:
        print("⚠️ Firebase no configurado - usando memoria temporal")
except Exception as e:
    print(f"⚠️ Firebase no disponible: {e}")
    print("   Usando memoria temporal")

# Almacenar historial de conversaciones en memoria (fallback)
conversaciones_memoria = {}

@app.route('/api/v1/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "1.0.0", "ai": "Groq"}), 200

@app.route('/api/v1/tramites', methods=['GET'])
def tramites():
    programas = [
        {
            "id": 1,
            "nombre": "Pensión para el Bienestar de las Personas Adultas Mayores",
            "descripcion": "Programa federal dirigido a personas adultas mayores de 65 años",
            "monto": "$6,000 MXN",
            "periodicidad": "bimestral"
        },
        {
            "id": 2,
            "nombre": "Beca Benito Juárez",
            "descripcion": "Apoyo económico para estudiantes de nivel medio superior",
            "monto": "$1,840 MXN",
            "periodicidad": "bimestral"
        },
        {
            "id": 3,
            "nombre": "Sembrando Vida",
            "descripcion": "Programa para agricultores en zonas rurales",
            "monto": "$6,250 MXN",
            "periodicidad": "mensual"
        }
    ]
    return jsonify({"programas": programas}), 200

@app.route('/api/v1/tramites/<int:programa_id>', methods=['GET'])
def obtener_tramite(programa_id):
    """Obtener detalles completos de un programa específico"""
    
    # Base de datos de programas con información completa
    programas_detalle = {
        1: {
            "id": 1,
            "nombre": "Pensión para el Bienestar de las Personas Adultas Mayores",
            "descripcion": "Programa federal dirigido a personas adultas mayores de 65 años que no reciben pensión contributiva superior a $1,092 pesos mensuales.",
            "monto": "$6,000 MXN",
            "periodicidad": "bimestral",
            "telefono_informes": "800-639-4264",
            "oficina_tramite": "Oficinas de Bienestar en tu municipio",
            "documentos": [
                "Identificación oficial vigente (INE/IFE)",
                "CURP",
                "Comprobante de domicilio (no mayor a 3 meses)",
                "Acta de nacimiento",
                "Estado de cuenta bancario o CLABE interbancaria"
            ],
            "pasos": [
                "Acude a la oficina de Bienestar más cercana con tus documentos",
                "Llena el formato de registro que te proporcionarán",
                "Entrega tus documentos originales y copias",
                "Espera la validación de tu información (2-4 semanas)",
                "Recibirás una tarjeta bancaria donde se depositará tu apoyo",
                "El primer pago llegará en el siguiente bimestre"
            ]
        },
        2: {
            "id": 2,
            "nombre": "Beca Benito Juárez",
            "descripcion": "Apoyo económico para estudiantes de educación media superior (preparatoria, bachillerato, profesional técnico) de escuelas públicas.",
            "monto": "$1,840 MXN",
            "periodicidad": "bimestral",
            "telefono_informes": "800-624-9996",
            "oficina_tramite": "Coordinación Nacional de Becas para el Bienestar Benito Juárez",
            "documentos": [
                "CURP del estudiante",
                "Comprobante de inscripción o constancia escolar",
                "Identificación oficial del padre/madre/tutor",
                "Comprobante de domicilio",
                "Formato de registro (se descarga en línea)"
            ],
            "pasos": [
                "Ingresa al portal oficial: becasbenitojuarez.gob.mx",
                "Registra tus datos personales y escolares",
                "Sube los documentos digitalizados (PDF o imagen)",
                "Imprime tu comprobante de registro",
                "Espera la validación (4-6 semanas)",
                "Recibirás notificación por correo electrónico",
                "El apoyo se deposita en tarjeta bancaria"
            ]
        },
        3: {
            "id": 3,
            "nombre": "Sembrando Vida",
            "descripcion": "Programa para pequeños productores rurales que siembran árboles frutales y maderables en sus parcelas.",
            "monto": "$6,250 MXN",
            "periodicidad": "mensual",
            "telefono_informes": "800-900-2000",
            "oficina_tramite": "Oficinas de Sembrando Vida en tu región",
            "documentos": [
                "Identificación oficial vigente",
                "CURP",
                "Comprobante de domicilio",
                "Documentos que acrediten la propiedad o posesión de la tierra",
                "Croquis de ubicación de la parcela",
                "Formato de inscripción"
            ],
            "pasos": [
                "Verifica que tu comunidad esté en la zona de atención del programa",
                "Acude a la oficina regional de Sembrando Vida",
                "Presenta tus documentos y el croquis de tu parcela",
                "Recibe capacitación sobre el programa y técnicas de siembra",
                "Firma el convenio de participación",
                "Inicia la siembra de árboles en tu parcela",
                "Recibe el apoyo mensual durante 5 años"
            ]
        }
    }
    
    # Buscar el programa
    programa = programas_detalle.get(programa_id)
    
    if not programa:
        return jsonify({
            "success": False,
            "error": "Programa no encontrado"
        }), 404
    
    # Crear checklist de documentos
    checklist = {
        "requeridos": [
            {"nombre": doc, "estado": "FALTA"} 
            for doc in programa["documentos"]
        ],
        "porcentaje": 0
    }
    
    return jsonify({
        "success": True,
        "programa": programa,
        "documentos": programa["documentos"],
        "pasos": programa["pasos"],
        "checklist": checklist
    }), 200

@app.route('/api/v1/tramites/<int:programa_id>/documento', methods=['POST'])
def actualizar_documento(programa_id):
    """Actualizar el estado de un documento en el checklist"""
    try:
        data = request.get_json()
        documento = data.get('documento')
        estado = data.get('estado')
        
        if not documento or not estado:
            return jsonify({
                "success": False,
                "error": "Faltan parámetros: documento y estado"
            }), 400
        
        # En una implementación real, esto se guardaría en base de datos
        # Por ahora, solo calculamos el porcentaje basado en el estado
        
        # Obtener el programa para saber cuántos documentos tiene
        programas_detalle = {
            1: 5,  # Pensión tiene 5 documentos
            2: 5,  # Beca tiene 5 documentos
            3: 6   # Sembrando Vida tiene 6 documentos
        }
        
        total_docs = programas_detalle.get(programa_id, 5)
        
        # Simular que se actualizó correctamente
        # En producción, aquí se guardaría en la base de datos
        
        return jsonify({
            "success": True,
            "porcentaje": 0,  # Se calcularía basado en los documentos marcados
            "mensaje": "Documento actualizado correctamente"
        }), 200
        
    except Exception as e:
        print(f"❌ Error al actualizar documento: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/v1/chat', methods=['POST', 'OPTIONS'])
def chat():
    # Manejar preflight CORS
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        return response, 200
    
    try:
        # Verificar si hay archivos
        archivos = request.files.getlist('archivos')
        mensaje = request.form.get('mensaje', '') if archivos else request.get_json().get('mensaje', '')
        sesion_id = request.form.get('sesion_id', '') if archivos else request.get_json().get('sesion_id', '')
        user_id = request.form.get('user_id', '') if archivos else request.get_json().get('user_id', '')
        
        # Crear nueva sesión si no existe
        if not sesion_id:
            sesion_id = str(uuid.uuid4())
            print(f"🆕 Nueva sesión creada: {sesion_id}")
        else:
            print(f"♻️ Usando sesión existente: {sesion_id}")
        
        # Cargar conversación desde Firebase o memoria
        conversacion = cargar_conversacion(sesion_id, user_id)
        
        if not mensaje and not archivos:
            return jsonify({
                "respuesta": "Por favor envía un mensaje o adjunta un documento.",
                "sesion_id": sesion_id
            }), 400
        
        print(f"📨 Mensaje recibido: {mensaje}")
        print(f"📎 Archivos recibidos: {len(archivos)}")
        if user_id:
            print(f"👤 Usuario: {user_id}")
        
        # Procesar archivos si los hay
        textos_extraidos = []
        if archivos:
            for archivo in archivos:
                print(f"📄 Procesando: {archivo.filename}")
                
                # Leer el contenido del archivo
                contenido = archivo.read()
                
                # Determinar el tipo de archivo
                if archivo.filename.lower().endswith('.pdf'):
                    # Extraer texto de PDF
                    texto = extraer_texto_pdf(contenido)
                elif archivo.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    # Extraer texto de imagen con OCR
                    texto = extraer_texto_imagen(contenido)
                else:
                    texto = f"[Archivo {archivo.filename} - tipo no soportado]"
                
                textos_extraidos.append({
                    "nombre": archivo.filename,
                    "texto": texto
                })
                
                # Guardar documento en el historial de la sesión
                conversacion["documentos"].append({
                    "nombre": archivo.filename,
                    "texto": texto,
                    "fecha": datetime.now().isoformat()
                })
                
                print(f"✅ Texto extraído de {archivo.filename}: {texto[:100]}...")
        
        # Construir contexto de documentos previos
        contexto_documentos_previos = ""
        if conversacion["documentos"]:
            contexto_documentos_previos = "\n\n📚 DOCUMENTOS PREVIAMENTE ANALIZADOS EN ESTA CONVERSACIÓN:\n"
            for doc in conversacion["documentos"]:
                contexto_documentos_previos += f"\n--- {doc['nombre']} ---\n{doc['texto'][:500]}...\n"
        
        # Construir el prompt para Groq con historial
        prompt_completo = mensaje
        if textos_extraidos:
            prompt_completo += "\n\n📄 NUEVOS DOCUMENTOS ADJUNTOS:\n"
            for doc in textos_extraidos:
                prompt_completo += f"\n--- {doc['nombre']} ---\n{doc['texto']}\n"
        
        # Construir mensajes para Groq con historial
        mensajes_groq = [
            {
                "role": "system",
                "content": f"""Eres ACIPS, un asistente experto en programas sociales de México. 
                Puedes analizar documentos como CURP, comprobantes de domicilio, actas de nacimiento, INE, etc.
                Extraes información relevante como edad, ubicación, situación familiar y recomiendas programas sociales específicos.
                Respondes de manera clara, amigable y precisa en español.
                
                IMPORTANTE: Mantén el contexto de toda la conversación. Si el usuario ya te envió documentos anteriormente,
                recuérdalos y úsalos para dar respuestas más precisas.
                
                {contexto_documentos_previos}"""
            }
        ]
        
        # Agregar historial de conversación
        for msg in conversacion["historial"]:
            mensajes_groq.append(msg)
        
        # Agregar mensaje actual
        mensajes_groq.append({
            "role": "user",
            "content": prompt_completo.strip()
        })
        
        # Llamar a Groq
        chat_completion = groq_client.chat.completions.create(
            messages=mensajes_groq,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=2048,
        )
        
        respuesta = chat_completion.choices[0].message.content
        
        # Guardar en historial
        conversacion["historial"].append({
            "role": "user",
            "content": prompt_completo.strip()
        })
        conversacion["historial"].append({
            "role": "assistant",
            "content": respuesta
        })
        
        # Limitar historial a últimos 20 mensajes para no exceder límites
        if len(conversacion["historial"]) > 20:
            conversacion["historial"] = conversacion["historial"][-20:]
        
        # Actualizar última actividad
        conversacion["ultima_actividad"] = datetime.now().isoformat()
        
        # Guardar conversación en Firebase o memoria
        guardar_conversacion(sesion_id, user_id, conversacion)
        
        print(f"✅ Respuesta generada: {respuesta[:100]}...")
        print(f"📊 Historial: {len(conversacion['historial'])} mensajes")
        print(f"📄 Documentos en sesión: {len(conversacion['documentos'])}")
        
        return jsonify({
            "respuesta": respuesta,
            "sesion_id": sesion_id,
            "modelo": "Groq - Llama 3.3 70B",
            "documentos_procesados": len(textos_extraidos),
            "total_documentos_sesion": len(conversacion["documentos"]),
            "mensajes_en_historial": len(conversacion["historial"]),
            "guardado_en_firebase": db is not None
        }), 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "respuesta": f"Lo siento, hubo un error al procesar tu mensaje: {str(e)}",
            "sesion_id": sesion_id if 'sesion_id' in locals() else "error"
        }), 500


@app.route('/api/v1/chat/conversaciones', methods=['GET', 'OPTIONS'])
def listar_conversaciones():
    """Endpoint para listar todas las conversaciones de un usuario"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        user_id = request.args.get('user_id', '')
        
        if not user_id:
            return jsonify({"error": "user_id requerido"}), 400
        
        conversaciones = []
        
        if db:
            # Obtener de Firebase
            docs = db.collection('conversaciones').where('user_id', '==', user_id).order_by('ultima_actividad', direction=firestore.Query.DESCENDING).limit(50).stream()
            
            for doc in docs:
                data = doc.to_dict()
                conversaciones.append({
                    "sesion_id": doc.id,
                    "creada": data.get('creada'),
                    "ultima_actividad": data.get('ultima_actividad'),
                    "num_mensajes": len(data.get('historial', [])),
                    "num_documentos": len(data.get('documentos', []))
                })
        else:
            # Obtener de memoria
            for sesion_id, conv in conversaciones_memoria.items():
                if conv.get('user_id') == user_id:
                    conversaciones.append({
                        "sesion_id": sesion_id,
                        "creada": conv.get('creada'),
                        "ultima_actividad": conv.get('ultima_actividad'),
                        "num_mensajes": len(conv.get('historial', [])),
                        "num_documentos": len(conv.get('documentos', []))
                    })
        
        return jsonify({"conversaciones": conversaciones}), 200
        
    except Exception as e:
        print(f"❌ Error al listar conversaciones: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/v1/chat/limpiar', methods=['POST', 'OPTIONS'])
def limpiar_chat():
    """Endpoint para limpiar el historial de una sesión"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        data = request.get_json()
        sesion_id = data.get('sesion_id', '')
        user_id = data.get('user_id', '')
        
        if sesion_id:
            # Limpiar sesión específica
            if db and user_id:
                # Eliminar de Firebase
                db.collection('conversaciones').document(sesion_id).delete()
                print(f"🧹 Sesión eliminada de Firebase: {sesion_id}")
            elif sesion_id in conversaciones_memoria:
                # Eliminar de memoria
                del conversaciones_memoria[sesion_id]
                print(f"🧹 Sesión eliminada de memoria: {sesion_id}")
            
            return jsonify({
                "mensaje": "Conversación eliminada exitosamente"
            }), 200
        else:
            # Crear nueva sesión
            nuevo_id = str(uuid.uuid4())
            return jsonify({
                "mensaje": "Nueva sesión creada",
                "sesion_id": nuevo_id
            }), 200
            
    except Exception as e:
        print(f"❌ Error al limpiar: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/v1/transcribe', methods=['POST', 'OPTIONS'])
def transcribe_audio():
    """Endpoint para transcribir audio usando Groq Whisper"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        # Verificar si hay archivo de audio
        if 'audio' not in request.files:
            return jsonify({"error": "No se envió archivo de audio"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({"error": "Archivo vacío"}), 400
        
        print(f"🎤 Transcribiendo audio: {audio_file.filename}")
        
        # Leer el contenido del archivo
        audio_content = audio_file.read()
        print(f"📊 Tamaño del audio: {len(audio_content)} bytes")
        
        # Verificar que el audio tenga contenido
        if len(audio_content) < 1000:
            return jsonify({"error": "Audio muy corto o vacío"}), 400
        
        # Guardar temporalmente el archivo (Groq necesita un archivo)
        import tempfile
        import os
        
        # Determinar extensión según el tipo de contenido
        extension = '.webm'
        if audio_file.content_type:
            if 'mp4' in audio_file.content_type:
                extension = '.mp4'
            elif 'mpeg' in audio_file.content_type:
                extension = '.mp3'
            elif 'wav' in audio_file.content_type:
                extension = '.wav'
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
            temp_file.write(audio_content)
            temp_path = temp_file.name
        
        print(f"💾 Audio guardado temporalmente: {temp_path}")
        
        try:
            # Transcribir con Groq Whisper
            with open(temp_path, 'rb') as audio:
                print("🔄 Enviando a Groq Whisper...")
                transcription = groq_client.audio.transcriptions.create(
                    file=(os.path.basename(temp_path), audio, audio_file.content_type or 'audio/webm'),
                    model="whisper-large-v3-turbo",
                    language="es",
                    response_format="json",
                    temperature=0.0  # Más determinista
                )
            
            texto = transcription.text.strip()
            print(f"✅ Transcripción exitosa: '{texto}'")
            
            if not texto:
                return jsonify({
                    "error": "No se detectó voz en el audio. Intenta hablar más cerca del micrófono."
                }), 400
            
            return jsonify({
                "texto": texto,
                "modelo": "Groq Whisper Large V3 Turbo",
                "duracion_audio": len(audio_content)
            }), 200
            
        finally:
            # Eliminar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)
                print(f"🗑️ Archivo temporal eliminado")
        
    except Exception as e:
        print(f"❌ Error al transcribir: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Error al transcribir audio: {str(e)}"
        }), 500


def cargar_conversacion(sesion_id, user_id=None):
    """Carga una conversación desde Firebase o memoria"""
    try:
        if db and user_id:
            # Intentar cargar desde Firebase
            doc_ref = db.collection('conversaciones').document(sesion_id)
            doc = doc_ref.get()
            
            if doc.exists:
                print(f"📥 Conversación cargada desde Firebase: {sesion_id}")
                return doc.to_dict()
        
        # Cargar desde memoria o crear nueva
        if sesion_id in conversaciones_memoria:
            print(f"📥 Conversación cargada desde memoria: {sesion_id}")
            return conversaciones_memoria[sesion_id]
        
        # Crear nueva conversación
        nueva_conversacion = {
            "historial": [],
            "documentos": [],
            "creada": datetime.now().isoformat(),
            "ultima_actividad": datetime.now().isoformat(),
            "user_id": user_id or "anonimo"
        }
        
        conversaciones_memoria[sesion_id] = nueva_conversacion
        return nueva_conversacion
        
    except Exception as e:
        print(f"⚠️ Error al cargar conversación: {e}")
        # Fallback a memoria
        if sesion_id not in conversaciones_memoria:
            conversaciones_memoria[sesion_id] = {
                "historial": [],
                "documentos": [],
                "creada": datetime.now().isoformat(),
                "ultima_actividad": datetime.now().isoformat(),
                "user_id": user_id or "anonimo"
            }
        return conversaciones_memoria[sesion_id]


def guardar_conversacion(sesion_id, user_id, conversacion):
    """Guarda una conversación en Firebase o memoria"""
    try:
        if db and user_id:
            # Guardar en Firebase
            doc_ref = db.collection('conversaciones').document(sesion_id)
            doc_ref.set(conversacion)
            print(f"💾 Conversación guardada en Firebase: {sesion_id}")
        else:
            # Guardar en memoria
            conversaciones_memoria[sesion_id] = conversacion
            print(f"💾 Conversación guardada en memoria: {sesion_id}")
            
    except Exception as e:
        print(f"⚠️ Error al guardar conversación: {e}")
        # Fallback a memoria
        conversaciones_memoria[sesion_id] = conversacion


def extraer_texto_pdf(contenido_bytes):
    """Extrae texto de un PDF usando PyMuPDF"""
    try:
        import fitz  # PyMuPDF
        import io
        
        # Abrir el PDF desde bytes
        pdf_stream = io.BytesIO(contenido_bytes)
        doc = fitz.open(stream=pdf_stream, filetype="pdf")
        
        texto_completo = ""
        for pagina in doc:
            texto_completo += pagina.get_text()
        
        doc.close()
        return texto_completo.strip() or "[No se pudo extraer texto del PDF]"
    except Exception as e:
        print(f"Error al extraer texto de PDF: {e}")
        return f"[Error al procesar PDF: {str(e)}]"


def extraer_texto_imagen(contenido_bytes):
    """Extrae texto de una imagen usando EasyOCR"""
    try:
        import easyocr
        import numpy as np
        from PIL import Image
        import io
        
        # Convertir bytes a imagen
        imagen = Image.open(io.BytesIO(contenido_bytes))
        imagen_array = np.array(imagen)
        
        # Inicializar EasyOCR (español)
        reader = easyocr.Reader(['es', 'en'], gpu=False)
        
        # Extraer texto
        resultados = reader.readtext(imagen_array)
        
        # Concatenar todo el texto
        texto = " ".join([resultado[1] for resultado in resultados])
        
        return texto.strip() or "[No se detectó texto en la imagen]"
    except Exception as e:
        print(f"Error al extraer texto de imagen: {e}")
        return f"[Error al procesar imagen: {str(e)}]"

@app.route('/api/v1/auth/me', methods=['GET', 'OPTIONS'])
def auth_me():
    """Endpoint para sincronizar usuario con el backend"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        # En una implementación completa, aquí verificarías el token de Firebase
        # Por ahora, retornamos un usuario de ejemplo
        return jsonify({
            "success": True,
            "user": {
                "uid": "demo-user",
                "email": "demo@acips.com",
                "displayName": "Usuario Demo"
            }
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("  BACKEND ACIPS - CON GROQ AI + FIREBASE + WHISPER")
    print("=" * 60)
    print()
    print("  Backend corriendo en: http://localhost:5000")
    print("  Health check: http://localhost:5000/api/v1/health")
    print()
    print("  ✨ Usando Groq AI (Llama 3.3 70B)")
    print("  🎤 Whisper para transcripción de voz")
    print("  🚀 Respuestas ultra rápidas")
    print("  🧠 Memoria de conversación activada")
    print("  📄 Recuerda documentos enviados")
    if db:
        print("  💾 Persistencia en Firebase Firestore")
    else:
        print("  ⚠️  Usando memoria temporal (sin Firebase)")
    print()
    print("=" * 60)
    print()
    
    app.run(host='0.0.0.0', port=5000, debug=True)
