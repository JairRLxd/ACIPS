from __future__ import annotations

from app.core.models import ProgramaSocial


class CalcularElegibilidadUC:
    def ejecutar(self, programa: ProgramaSocial, perfil_usuario: dict) -> bool:
        reglas = programa.requisitos_elegibilidad
        edad = perfil_usuario.get("edad")
        edad_minima = reglas.get("edad_minima")
        edad_maxima = reglas.get("edad_maxima")

        if edad is not None:
            if edad_minima is not None and edad < edad_minima:
                return False
            if edad_maxima is not None and edad > edad_maxima:
                return False

        municipio = str(perfil_usuario.get("municipio", "")).strip().lower()
        if reglas.get("municipios_rurales") and not municipio:
            return False

        return True
