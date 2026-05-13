from __future__ import annotations

import json
from pathlib import Path

from app.core.config import Settings
from app.core.models import ProgramaSocial


class ProgramaRepository:
    def __init__(self, settings: Settings) -> None:
        self._programas_path = Path(settings.programas_path)

    def _cargar_programas(self) -> list[ProgramaSocial]:
        if not self._programas_path.exists():
            raise FileNotFoundError(
                f"No se encontro el archivo de programas: {self._programas_path}"
            )
        with self._programas_path.open("r", encoding="utf-8") as file:
            raw_items = json.load(file)
        return [ProgramaSocial(**item) for item in raw_items]

    def listar_programas(self) -> list[ProgramaSocial]:
        return self._cargar_programas()

    def obtener_programa_por_id(self, programa_id: int) -> ProgramaSocial:
        for programa in self._cargar_programas():
            if programa.id == programa_id:
                return programa
        raise KeyError(f"No existe el programa con id '{programa_id}'.")

    def buscar_programas_relevantes(
        self, consulta: str, perfil_usuario: dict, limite: int = 3
    ) -> list[ProgramaSocial]:
        consulta_normalizada = consulta.lower()
        programas = self._cargar_programas()
        scored: list[tuple[int, ProgramaSocial]] = []
        for programa in programas:
            puntaje = 0
            bag = " ".join(
                [
                    programa.nombre,
                    programa.descripcion,
                    programa.dependencia,
                    " ".join(programa.tags),
                ]
            ).lower()
            for termino in consulta_normalizada.split():
                if termino in bag:
                    puntaje += 2
            if self._perfil_parece_elegible(programa, perfil_usuario):
                puntaje += 3
            if puntaje > 0:
                scored.append((puntaje, programa))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [programa for _, programa in scored[:limite]]

    def filtrar_tramites(
        self,
        tipo: str | None = None,
        estado: str | None = None,
        situacion: str | None = None,
    ) -> list[ProgramaSocial]:
        programas = self._cargar_programas()
        resultados: list[ProgramaSocial] = []
        tipo_lower = tipo.lower() if tipo else None
        estado_lower = estado.lower() if estado else None
        situacion_lower = situacion.lower() if situacion else None

        for programa in programas:
            if tipo_lower and tipo_lower not in [tag.lower() for tag in programa.tags]:
                continue
            if estado_lower:
                estados = [item.lower() for item in programa.estados]
                cobertura = programa.cobertura.lower()
                if cobertura != "nacional" and estado_lower not in estados:
                    continue
            if situacion_lower and situacion_lower not in [
                item.lower() for item in programa.situaciones
            ]:
                continue
            resultados.append(programa)
        return resultados

    @staticmethod
    def _perfil_parece_elegible(
        programa: ProgramaSocial, perfil_usuario: dict
    ) -> bool:
        edad = perfil_usuario.get("edad")
        reglas = programa.requisitos_elegibilidad
        edad_minima = reglas.get("edad_minima")
        edad_maxima = reglas.get("edad_maxima")
        if edad is not None:
            if edad_minima is not None and edad < edad_minima:
                return False
            if edad_maxima is not None and edad > edad_maxima:
                return False
        return True
