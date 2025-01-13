from .service_exception import ServiceException


class UnauthorizedException(ServiceException):
    """Exception raised when authentication is required but not provided or invalid."""

    message: str = "Unauthorized access"
    status: int = 401

    def error_code(self) -> str:
        return "UNAUTHORIZED"

    def error_type(self) -> str:
        return "AUTHENTICATION_ERROR"
