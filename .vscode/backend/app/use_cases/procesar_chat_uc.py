from __future__ import annotations

from app.core.models import MensajeChat
from app.repositories import ProgramaRepository, SesionRepository
from app.services import GeminiService
from app.use_cases import ConfigurationError, DataAccessError, ExternalServiceError
from app.use_cases.calcular_elegibilidad_uc import CalcularElegibilidadUC


class ProcesarChatUC:
    def __init__(
        self,
        programa_repository: ProgramaRepository,
        gemini_service: GeminiService,
        sesion_repository: SesionRepository,
        calcular_elegibilidad_uc: CalcularElegibilidadUC,
    ) -> None:
        self._programa_repository = programa_repository
        self._gemini_service = gemini_service
        self._sesion_repository = sesion_repository
        self._calcular_elegibilidad_uc = calcular_elegibilidad_uc

    def ejecutar(
        self, sesion_id: str, mensaje: str, perfil_usuario: dict
    ) -> dict[str, object]:
        try:
            programas = self._programa_repository.buscar_programas_relevantes(
                consulta=mensaje,
                perfil_usuario=perfil_usuario,
            )
        except Exception as exc:
            raise DataAccessError(
                "No fue posible recuperar programas para responder el chat."
            ) from exc

        programas_elegibles = [
            programa
            for programa in programas
            if self._calcular_elegibilidad_uc.ejecutar(programa, perfil_usuario)
        ]
        programas_contexto = programas_elegibles or programas
        contexto = self._construir_contexto(programas_contexto)

        try:
            respuesta = self._gemini_service.responder_pregunta(
                mensaje=mensaje,
                perfil_usuario=perfil_usuario,
                contexto_programas=contexto,
            )
        except ValueError as exc:
            raise ConfigurationError(str(exc)) from exc
        except Exception as exc:
            raise ExternalServiceError(
                "No fue posible generar una respuesta del asistente."
            ) from exc

        mensaje_usuario = MensajeChat(rol="user", contenido=mensaje)
        mensaje_asistente = MensajeChat(rol="assistant", contenido=respuesta)

        try:
            self._sesion_repository.guardar_interaccion(
                sesion_id=sesion_id,
                perfil_usuario=perfil_usuario,
                mensaje_usuario=mensaje_usuario,
                respuesta_asistente=mensaje_asistente,
            )
        except Exception as exc:
            raise DataAccessError(
                "La respuesta se genero, pero no fue posible guardar la sesion."
            ) from exc

        return {
            "respuesta": respuesta,
            "programas_relacionados": [programa.nombre for programa in programas_contexto],
        }

    @staticmethod
    def _construir_contexto(programas) -> str:
        bloques: list[str] = []
        for programa in programas:
            bloques.append(
                (
                    f"Programa: {programa.nombre}\n"
                    f"Descripcion: {programa.descripcion}\n"
                    f"Monto: {programa.monto}\n"
                    f"Periodicidad: {programa.periodicidad}\n"
                    f"Dependencia: {programa.dependencia}\n"
                    f"Requisitos: {programa.requisitos_elegibilidad}\n"
                    f"Documentos: {programa.documentos_requeridos}\n"
                    f"Fuente: {programa.url_oficial}"
                )
            )
        return "\n\n".join(bloques) if bloques else "No se encontraron programas relevantes."
