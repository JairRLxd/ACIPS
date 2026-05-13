from __future__ import annotations

from groq import Groq

from app.core.config import Settings


class GroqService:
    def __init__(self, settings: Settings) -> None:
        self._api_key = settings.groq_api_key
        self._model_name = settings.groq_model
        self._client: Groq | None = None

    @property
    def _groq_client(self) -> Groq:
        if not self._api_key:
            raise ValueError("La variable GROQ_API_KEY no esta configurada.")
        if self._client is None:
            self._client = Groq(api_key=self._api_key)
        return self._client

    def responder_pregunta(
        self, mensaje: str, perfil_usuario: dict, contexto_programas: str
    ) -> str:
        prompt = f"""
        Eres ACIPS, un asistente que explica programas sociales en Mexico con lenguaje claro,
        inclusivo y practico. Responde en español. Si no sabes algo con el contexto dado,
        dilo con honestidad y sugiere consultar la fuente oficial.

        Perfil del usuario:
        {perfil_usuario}

        Contexto recuperado:
        {contexto_programas}

        Pregunta del usuario:
        {mensaje}
        """
        
        chat_completion = self._groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Eres ACIPS, un asistente experto en programas sociales de México. Respondes de manera clara, amigable y precisa."
                },
                {
                    "role": "user",
                    "content": prompt.strip()
                }
            ],
            model=self._model_name,
            temperature=0.7,
            max_tokens=1024,
        )
        
        if not chat_completion.choices:
            raise ValueError("Groq no devolvio respuesta.")
        
        response_text = chat_completion.choices[0].message.content
        if not response_text:
            raise ValueError("Groq no devolvio texto en la respuesta.")
        
        return response_text.strip()
