from __future__ import annotations

from flask import Flask, jsonify
from flask_cors import CORS

from app.api import (
    create_auth_blueprint,
    create_chatbot_blueprint,
    create_documentos_admin_blueprint,
    create_tramites_blueprint,
    create_tramite_virtual_blueprint,
    create_validacion_blueprint,
)
from app.core.config import get_settings
from app.repositories import (
    ProgramaRepository,
    SesionRepository,
    TramiteVirtualRepository,
    UsuarioRepository,
    ValidacionRepository,
)
from app.services import (
    DocumentClassificationService,
    DocumentExtractionService,
    DocumentRulesService,
    FirebaseAuthService,
    GroqService,
)
from app.use_cases.calcular_elegibilidad_uc import CalcularElegibilidadUC
from app.use_cases.crear_tramite_virtual_uc import CrearTramiteVirtualUC
from app.use_cases.listar_tramites_virtuales_uc import ListarTramitesVirtualesUC
from app.use_cases.obtener_tramites_uc import ObtenerTramitesUC
from app.use_cases.procesar_chat_uc import ProcesarChatUC
from app.use_cases.revisar_tramite_virtual_uc import RevisarTramiteVirtualUC
from app.use_cases.sincronizar_usuario_uc import SincronizarUsuarioUC
from app.use_cases.validar_documento_uc import ValidarDocumentoUC


def create_app() -> Flask:
    settings = get_settings()

    app = Flask(__name__)
    app.config["JSON_AS_ASCII"] = False
    app.config["APP_VERSION"] = settings.version
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    programa_repository = ProgramaRepository(settings)
    sesion_repository = SesionRepository(settings)
    tramite_virtual_repository = TramiteVirtualRepository(settings)
    usuario_repository = UsuarioRepository(settings)
    validacion_repository = ValidacionRepository(settings)

    document_classification_service = DocumentClassificationService()
    document_extraction_service = DocumentExtractionService(settings)
    document_rules_service = DocumentRulesService()
    firebase_auth_service = FirebaseAuthService(settings)
    groq_service = GroqService(settings)
    app.extensions["firebase_auth_service"] = firebase_auth_service
    app.extensions["usuario_repository"] = usuario_repository

    calcular_elegibilidad_uc = CalcularElegibilidadUC()
    crear_tramite_virtual_uc = CrearTramiteVirtualUC(
        programa_repository=programa_repository,
        tramite_virtual_repository=tramite_virtual_repository,
    )
    listar_tramites_virtuales_uc = ListarTramitesVirtualesUC(
        tramite_virtual_repository=tramite_virtual_repository
    )
    revisar_tramite_virtual_uc = RevisarTramiteVirtualUC(
        tramite_virtual_repository=tramite_virtual_repository
    )
    sincronizar_usuario_uc = SincronizarUsuarioUC(
        usuario_repository=usuario_repository
    )
    validar_documento_uc = ValidarDocumentoUC(
        document_classification_service=document_classification_service,
        document_extraction_service=document_extraction_service,
        document_rules_service=document_rules_service,
        validacion_repository=validacion_repository,
    )
    procesar_chat_uc = ProcesarChatUC(
        programa_repository=programa_repository,
        gemini_service=groq_service,
        sesion_repository=sesion_repository,
        calcular_elegibilidad_uc=calcular_elegibilidad_uc,
    )
    obtener_tramites_uc = ObtenerTramitesUC(programa_repository=programa_repository)

    app.register_blueprint(
        create_validacion_blueprint(validar_documento_uc),
        url_prefix="/api/v1",
    )
    app.register_blueprint(
        create_documentos_admin_blueprint(validacion_repository),
        url_prefix="/api/v1",
    )
    app.register_blueprint(
        create_auth_blueprint(sincronizar_usuario_uc),
        url_prefix="/api/v1",
    )
    app.register_blueprint(
        create_chatbot_blueprint(procesar_chat_uc),
        url_prefix="/api/v1",
    )
    app.register_blueprint(
        create_tramites_blueprint(obtener_tramites_uc),
        url_prefix="/api/v1",
    )
    app.register_blueprint(
        create_tramite_virtual_blueprint(
            crear_tramite_virtual_uc,
            listar_tramites_virtuales_uc,
            revisar_tramite_virtual_uc,
        ),
        url_prefix="/api/v1",
    )

    @app.get("/api/v1/health")
    def health():
        try:
            return jsonify({"status": "ok", "version": app.config["APP_VERSION"]}), 200
        except Exception:
            return jsonify({"error": "Error interno al consultar el estado."}), 500

    return app
