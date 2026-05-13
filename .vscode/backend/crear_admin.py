"""
Script para crear usuario administrador en Firestore
"""
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Inicializar Firebase
cred = credentials.Certificate('./firebase-key.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Datos del administrador
admin_data = {
    "uid": "JWoD8eeSfGba31JSutLeywDyIin2",
    "email": "axelromero471@gmail.com",
    "nombre": "Jordan Axel Acosta Romero",
    "rol": "admin",
    "activo": True,
    "created_at": datetime.now().isoformat(),
    "last_login_at": datetime.now().isoformat()
}

# Crear o actualizar el documento
doc_ref = db.collection('usuarios').document(admin_data['uid'])
doc_ref.set(admin_data, merge=True)

print("=" * 60)
print("✅ Usuario administrador creado/actualizado exitosamente")
print("=" * 60)
print(f"UID: {admin_data['uid']}")
print(f"Email: {admin_data['email']}")
print(f"Nombre: {admin_data['nombre']}")
print(f"Rol: {admin_data['rol']}")
print(f"Activo: {admin_data['activo']}")
print("=" * 60)
print("\n🎉 Ahora puedes iniciar sesión como administrador!")
print("   1. Cierra sesión en la aplicación")
print("   2. Vuelve a iniciar sesión con Google")
print("   3. Serás redirigido a /admin")
print()
