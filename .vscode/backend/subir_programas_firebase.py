"""
Script para subir programas sociales a Firebase Firestore
"""
import json
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Cargar variables de entorno
load_dotenv()

def subir_programas():
    """Sube los programas desde el JSON a Firebase Firestore"""
    
    # Inicializar Firebase
    firebase_key_path = os.getenv("FIREBASE_KEY_PATH", "./firebase-key.json")
    
    if not os.path.exists(firebase_key_path):
        print(f"❌ Error: No se encuentra el archivo de credenciales en {firebase_key_path}")
        return
    
    try:
        # Inicializar Firebase si no está inicializado
        if not firebase_admin._apps:
            cred = credentials.Certificate(firebase_key_path)
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        print("✅ Conectado a Firebase Firestore")
        
        # Leer el archivo JSON
        json_path = os.path.join(os.path.dirname(__file__), 'data', 'programas_completos.json')
        
        with open(json_path, 'r', encoding='utf-8') as f:
            programas = json.load(f)
        
        print(f"\n📄 Leyendo {len(programas)} programas del archivo JSON...")
        
        # Subir cada programa a Firestore
        collection_ref = db.collection('programas')
        
        for programa in programas:
            programa_id = str(programa['id'])
            
            # Verificar si el programa ya existe
            doc_ref = collection_ref.document(programa_id)
            doc = doc_ref.get()
            
            if doc.exists:
                print(f"⚠️  Programa {programa_id} ya existe. Actualizando...")
                doc_ref.set(programa)
                print(f"✅ Programa {programa_id} actualizado: {programa['nombre']}")
            else:
                doc_ref.set(programa)
                print(f"✅ Programa {programa_id} creado: {programa['nombre']}")
        
        print(f"\n🎉 ¡Proceso completado! {len(programas)} programas subidos/actualizados en Firebase")
        
        # Verificar que se subieron correctamente
        print("\n🔍 Verificando programas en Firebase...")
        docs = collection_ref.stream()
        count = 0
        for doc in docs:
            count += 1
        
        print(f"✅ Total de programas en Firebase: {count}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("  SUBIR PROGRAMAS SOCIALES A FIREBASE FIRESTORE")
    print("=" * 60)
    print()
    
    subir_programas()
    
    print()
    print("=" * 60)
