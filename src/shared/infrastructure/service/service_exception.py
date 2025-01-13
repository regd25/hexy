from abc import ABC
from datetime import datetime
from dataclasses import dataclass


@dataclass
class ServiceException(ABC, Exception):
    """Abstract base exception for all service-related errors.

    All service exceptions must inherit from this class and implement
    its abstract properties.
    """

    message: str
    status: int
    timestamp: datetime = datetime.now()

    def __post_init__(self) -> None:
        super().__init__(self.message)
