"""
Endpoint para enviar trámites en línea (Grupo B)
Este endpoint guarda la solicitud del usuario en Firebase
"""
from flask import jsonify, request
from datetime import datetime
import uuid

def crear_endpoint_tramite_online(app, db):
    """
    Crea el endpoint para enviar trámites en línea
    """
    
    @app.route('/api/v1/tramites-virtuales/enviar', methods=['POST', 'OPTIONS'])
    def enviar_tramite_virtual():
        """
        Endpoint para que un usuario envíe su trámite virtual (Grupo B)
        
        Body esperado:
        {
            "programa_id": 4,
            "datos_usuario": {
                "nombre": "Juan Pérez",
                "curp": "PEPJ900101HDFRXN01",
                "municipio": "Xalapa",
                "clabe": "012345678901234567",
                ...campos extra según el programa
            },
            "documentos_validados": [
                {
                    "documento_id": 1,
                    "nombre": "INE",
                    "tipo": "ine",
                    "validado": true,
                    "resultado_ocr": {...}
                },
                ...
            ]
        }
        """
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200
        
        try:
            # Verificar autenticación
            auth_header = request.headers.get('Authorization', '')
            
            if not auth_header.startswith('Bearer '):
                return jsonify({
                    "success": False,
                    "error": "Token no proporcionado"
                }), 401
            
            id_token = auth_header.split('Bearer ')[1]
            
            if not db:
                return jsonify({
                    "success": False,
                    "error": "Firebase no configurado"
                }), 500
            
            # Verificar el token de Firebase
            from firebase_admin import auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            
            # Obtener datos del request
            data = request.get_json()
            programa_id = data.get('programa_id')
            datos_usuario = data.get('datos_usuario', {})
            documentos_validados = data.get('documentos_validados', [])
            
            if not programa_id:
                return jsonify({
                    "success": False,
                    "error": "programa_id es requerido"
                }), 400
            
            # Obtener información del programa
            programa_ref = db.collection('programas').document(str(programa_id))
            programa_doc = programa_ref.get()
            
            if not programa_doc.exists:
                return jsonify({
                    "success": False,
                    "error": "Programa no encontrado"
                }), 404
            
            programa_data = programa_doc.to_dict()
            
            # Verificar que sea un programa del Grupo B (en línea)
            if programa_data.get('grupo') != 'B':
                return jsonify({
                    "success": False,
                    "error": "Este programa no permite trámites en línea"
                }), 400
            
            # Crear ID único para el trámite
            tramite_id = str(uuid.uuid4())
            sesion_id = f"{uid}-tramite-{programa_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Crear documento del trámite virtual
            tramite_data = {
                "expediente_id": tramite_id,
                "sesion_id": sesion_id,
                "usuario_uid": uid,
                "usuario_email": email,
                "programa_id": programa_id,
                "programa_nombre": programa_data.get('nombre'),
                "datos_usuario": datos_usuario,
                "documentos_validados": documentos_validados,
                "estado": "pendiente",  # pendiente, en_revision, aprobado, rechazado
                "fecha_creacion": datetime.now().isoformat(),
                "fecha_actualizacion": datetime.now().isoformat(),
                "tipo_tramite": "virtual",
                "grupo": "B",
                "comentarios_admin": [],
                "historial_estados": [
                    {
                        "estado": "pendiente",
                        "fecha": datetime.now().isoformat(),
                        "comentario": "Trámite enviado por el usuario"
                    }
                ]
            }
            
            # Guardar en Firebase
            tramites_ref = db.collection('tramites_virtuales')
            tramites_ref.document(tramite_id).set(tramite_data)
            
            print(f"✅ Trámite virtual creado: {tramite_id} para usuario {uid}")
            
            # También guardar las validaciones de documentos en la colección 'validaciones'
            for doc_validado in documentos_validados:
                if doc_validado.get('validado') and doc_validado.get('resultado_ocr'):
                    validacion_id = str(uuid.uuid4())
                    validacion_data = {
                        "usuario_uid": uid,
                        "sesion_id": sesion_id,
                        "programa_id": programa_id,
                        "tramite_id": tramite_id,
                        "documento_id": doc_validado.get('documento_id'),
                        "nombre_archivo": doc_validado.get('nombre'),
                        "tipo_esperado": doc_validado.get('tipo'),
                        "tipo_detectado": doc_validado.get('resultado_ocr', {}).get('tipo_detectado'),
                        "es_correcto": doc_validado.get('resultado_ocr', {}).get('es_correcto', False),
                        "legible": doc_validado.get('resultado_ocr', {}).get('legible', False),
                        "vigente": doc_validado.get('resultado_ocr', {}).get('vigente', False),
                        "ocr_confidence_avg": doc_validado.get('resultado_ocr', {}).get('ocr_confidence_avg', 0),
                        "classification_confidence": doc_validado.get('resultado_ocr', {}).get('classification_confidence', 0),
                        "created_at": datetime.now().isoformat(),
                        "estado": "validado"
                    }
                    
                    db.collection('validaciones').document(validacion_id).set(validacion_data)
            
            return jsonify({
                "success": True,
                "message": "Trámite enviado exitosamente",
                "data": {
                    "tramite_id": tramite_id,
                    "expediente_id": tramite_id,
                    "sesion_id": sesion_id,
                    "estado": "pendiente",
                    "fecha_creacion": tramite_data["fecha_creacion"],
                    "programa_nombre": programa_data.get('nombre')
                }
            }), 201
            
        except Exception as e:
            print(f"❌ Error en enviar_tramite_virtual: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    return app
