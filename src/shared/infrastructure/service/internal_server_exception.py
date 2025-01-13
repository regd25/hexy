from dataclasses import dataclass
from .service_exception import ServiceException


@dataclass
class InternalServerException(ServiceException):
    """Exception raised when an internal server error occurs."""

    message: str = "Internal server error"
    status: int = 500

    def error_code(self) -> str:
        return "INTERNAL_SERVER_ERROR"

    def error_type(self) -> str:
        return "SERVER_ERROR"
