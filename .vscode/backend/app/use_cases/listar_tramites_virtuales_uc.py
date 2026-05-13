from __future__ import annotations

from app.repositories import TramiteVirtualRepository
from app.use_cases import DataAccessError


class ListarTramitesVirtualesUC:
    def __init__(self, tramite_virtual_repository: TramiteVirtualRepository) -> None:
        self._tramite_virtual_repository = tramite_virtual_repository

    def listar_mios(self, usuario_uid: str) -> dict:
        try:
            tramites = self._tramite_virtual_repository.listar_por_usuario(usuario_uid)
        except Exception as exc:
            raise DataAccessError(
                "No fue posible consultar los tramites virtuales del usuario."
            ) from exc
        return {"tramites_virtuales": [tramite.to_dict() for tramite in tramites]}

    def listar_para_admin(self, estado: str | None = None) -> dict:
        try:
            tramites = self._tramite_virtual_repository.listar_por_estado(estado)
        except Exception as exc:
            raise DataAccessError(
                "No fue posible consultar los tramites virtuales para administracion."
            ) from exc
        return {"tramites_virtuales": [tramite.to_dict() for tramite in tramites]}
