from .auth_controller import create_auth_blueprint
from .chatbot_controller import create_chatbot_blueprint
from .documentos_admin_controller import create_documentos_admin_blueprint
from .tramites_controller import create_tramites_blueprint
from .tramite_virtual_controller import create_tramite_virtual_blueprint
from .validacion_controller import create_validacion_blueprint

__all__ = [
    "create_auth_blueprint",
    "create_chatbot_blueprint",
    "create_documentos_admin_blueprint",
    "create_tramites_blueprint",
    "create_tramite_virtual_blueprint",
    "create_validacion_blueprint",
]
