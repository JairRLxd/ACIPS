"""
Script simplificado para iniciar el backend sin Firebase
Solo para pruebas rápidas
"""
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/v1/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "1.0.0"}), 200

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

@app.route('/api/v1/chat', methods=['POST', 'OPTIONS'])
def chat():
    # Manejar preflight CORS
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response, 200
    
    # Obtener datos del request
    data = request.get_json() if request.is_json else {}
    mensaje = data.get('mensaje', '')
    
    return jsonify({
        "respuesta": f"Recibí tu mensaje: '{mensaje}'. El backend está funcionando correctamente. Para usar el chatbot completo con IA, necesitas configurar Firebase y Gemini AI.",
        "sesion_id": "demo-123",
        "mensaje": f"Echo: {mensaje}"
    }), 200

if __name__ == '__main__':
    print("=" * 50)
    print("  BACKEND ACIPS - MODO SIMPLE")
    print("=" * 50)
    print()
    print("  Backend corriendo en: http://localhost:5000")
    print("  Health check: http://localhost:5000/api/v1/health")
    print()
    print("  NOTA: Este es un backend simplificado para pruebas.")
    print("  Para funcionalidad completa, configura Firebase y Gemini.")
    print()
    print("=" * 50)
    print()
    
    app.run(host='0.0.0.0', port=5000, debug=True)
