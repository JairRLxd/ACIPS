from __future__ import annotations

from datetime import datetime, timezone

from app.core.models import Usuario
from app.repositories import UsuarioRepository
from app.use_cases import DataAccessError


class SincronizarUsuarioUC:
    def __init__(self, usuario_repository: UsuarioRepository) -> None:
        self._usuario_repository = usuario_repository

    def ejecutar(self, auth_payload: dict) -> dict:
        uid = str(auth_payload["uid"])
        try:
            existente = self._usuario_repository.obtener_usuario(uid)
            rol = str(
                auth_payload.get("role")
                or auth_payload.get("rol")
                or (existente.rol if existente else "ciudadano")
            ).lower()
            usuario = Usuario(
                uid=uid,
                email=auth_payload.get("email"),
                nombre=auth_payload.get("name"),
                rol=rol,
                activo=True,
                created_at=(
                    existente.created_at
                    if existente
                    else datetime.now(timezone.utc).isoformat()
                ),
            )
            persisted = self._usuario_repository.upsert_usuario(usuario)
            self._usuario_repository.actualizar_ultimo_acceso(uid)
        except Exception as exc:
            raise DataAccessError("No fue posible sincronizar el usuario autenticado.") from exc

        return persisted.to_dict()
