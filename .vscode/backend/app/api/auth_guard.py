from __future__ import annotations

from functools import wraps

from flask import current_app, g, jsonify, request

from app.use_cases import AuthenticationError, AuthorizationError


def _extract_bearer_token() -> str:
    auth_header = request.headers.get("Authorization", "").strip()
    if not auth_header.startswith("Bearer "):
        raise AuthenticationError("Token Bearer no proporcionado.")
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        raise AuthenticationError("Token Bearer vacio.")
    return token


def require_auth(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        try:
            token = _extract_bearer_token()
            decoded = current_app.extensions["firebase_auth_service"].verify_id_token(
                token
            )
            g.current_user = decoded
            user_repository = current_app.extensions.get("usuario_repository")
            g.current_user_profile = (
                user_repository.obtener_usuario(str(decoded["uid"]))
                if user_repository
                else None
            )
            return view_func(*args, **kwargs)
        except (AuthenticationError, AuthorizationError) as exc:
            return jsonify({"error": str(exc)}), 401
        except Exception:
            return jsonify({"error": "No fue posible autenticar al usuario."}), 401

    return wrapper


def require_role(*roles: str):
    normalized_roles = {rol.lower() for rol in roles}

    def decorator(view_func):
        @wraps(view_func)
        @require_auth
        def wrapper(*args, **kwargs):
            role = str(
                getattr(getattr(g, "current_user_profile", None), "rol", None)
                or g.current_user.get("role")
                or "ciudadano"
            ).lower()
            if role not in normalized_roles:
                return jsonify({"error": "No cuentas con permisos suficientes."}), 403
            return view_func(*args, **kwargs)

        return wrapper

    return decorator
