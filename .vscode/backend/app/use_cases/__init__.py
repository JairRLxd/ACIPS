class UseCaseError(Exception):
    """Base para errores de negocio."""


class ConfigurationError(UseCaseError):
    """Error de configuracion faltante."""


class ExternalServiceError(UseCaseError):
    """Error al consumir un servicio externo."""


class ValidationErrorUC(UseCaseError):
    """Error de validacion de reglas de negocio."""


class DataAccessError(UseCaseError):
    """Error de acceso a datos."""


class AuthenticationError(UseCaseError):
    """Error de autenticacion."""


class AuthorizationError(UseCaseError):
    """Error de autorizacion."""


class InvalidFileError(UseCaseError):
    """El archivo recibido no es valido."""


class CorruptedPdfError(UseCaseError):
    """El PDF recibido esta corrupto o no puede procesarse."""


class OCRNoTextError(UseCaseError):
    """El OCR no pudo extraer texto utilizable."""


class DocumentNotIdentifiedError(UseCaseError):
    """No fue posible identificar el documento."""


class ServiceTimeoutError(UseCaseError):
    """Un servicio excedio el tiempo de espera."""


__all__ = [
    "ConfigurationError",
    "DataAccessError",
    "ExternalServiceError",
    "AuthenticationError",
    "AuthorizationError",
    "CorruptedPdfError",
    "DocumentNotIdentifiedError",
    "InvalidFileError",
    "OCRNoTextError",
    "ServiceTimeoutError",
    "UseCaseError",
    "ValidationErrorUC",
]
