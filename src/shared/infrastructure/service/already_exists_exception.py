from dataclasses import dataclass
from .service_exception import ServiceException


@dataclass
class AlreadyExistsException(ServiceException):
    """Exception raised when attempting to create a resource that already exists."""

    message: str = "Resource already exists"
    status: int = 409

    def error_code(self) -> str:
        return "RESOURCE_ALREADY_EXISTS"

    def error_type(self) -> str:
        return "RESOURCE_ERROR"
