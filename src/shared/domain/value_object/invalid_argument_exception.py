from datetime import datetime
from typing import Any
from ..exception.domain_exception import DomainException


class InvalidArgumentException(DomainException):
    """Exception raised when a value object receives an invalid argument.

    This exception provides detailed information about the validation failure,
    including the field that failed, the invalid value, and a custom message.
    """

    field: str
    value: Any
    message: str
    timestamp: datetime = datetime.now()
    code: str = "INVALID_ARGUMENT"

    def __post_init__(self) -> None:
        super().__init__(
            message=self.message,
            value=self.value,
            code=self.code,
        )

    def to_dict(self) -> dict[str, str]:
        """Convert the exception to a dictionary representation."""
        return {
            "message": self.message,
            "field": self.field,
            "value": str(self.value),
            "timestamp": self.timestamp.isoformat(),
            "code": self.code,
        }
