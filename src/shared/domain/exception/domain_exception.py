from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class DomainException(Exception):
    """Base exception for all domain exceptions in the application.

    Provides common functionality for all domain exceptions including:
    - Timestamp tracking
    - Error codes
    - Serialization to dict
    - Standardized message handling
    """

    message: str
    code: str
    timestamp: datetime = datetime.now()
    value: Any

    def __post_init__(self) -> None:
        """Initialize the base Exception with the message."""
        super().__init__(self.message)

    def to_dict(self) -> dict[str, Any]:
        """Convert the exception to a dictionary representation.

        Returns:
            dict with the basic exception information
        """
        return {
            "message": self.message,
            "code": self.code,
            "timestamp": self.timestamp.isoformat(),
            "value": self.value,
        }
