from __future__ import annotations

import google.generativeai as genai

from app.core.config import Settings


class GeminiService:
    def __init__(self, settings: Settings) -> None:
        self._api_key = settings.gemini_api_key
        self._model_name = settings.gemini_model
        self._model: genai.GenerativeModel | None = None

    @property
    def _gemini_model(self) -> genai.GenerativeModel:
        if not self._api_key:
            raise ValueError("La variable GEMINI_API_KEY no esta configurada.")
        if self._model is None:
            genai.configure(api_key=self._api_key)
            self._model = genai.GenerativeModel(self._model_name)
        return self._model

    def responder_pregunta(
        self, mensaje: str, perfil_usuario: dict, contexto_programas: str
    ) -> str:
        prompt = f"""
        Eres ACIPS, un asistente que explica programas sociales en Mexico con lenguaje claro,
        inclusivo y practico. Responde en espanol. Si no sabes algo con el contexto dado,
        dilo con honestidad y sugiere consultar la fuente oficial.

        Perfil del usuario:
        {perfil_usuario}

        Contexto recuperado:
        {contexto_programas}

        Pregunta del usuario:
        {mensaje}
        """
        response = self._gemini_model.generate_content(prompt.strip())
        if not response.text:
            raise ValueError("Gemini no devolvio texto en la respuesta.")
        return response.text.strip()
