from dataclasses import dataclass
from src.shared.domain.exception.service_exception import ServiceException


@dataclass
class NotFoundException(ServiceException):
    """Exception raised when a requested resource is not found."""

    message: str = "Resource not found"
    status: int = 404

    def error_code(self) -> str:
        return "NOT_FOUND"

    def error_type(self) -> str:
        return "RESOURCE_ERROR"
