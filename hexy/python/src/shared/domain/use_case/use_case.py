from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import TypeVar, Generic, Optional

from ..service.command import Command
from ..dependency.container import Container

T = TypeVar("T")


@dataclass
class UseCaseResponse(Generic[T], Command):
    """Standard response format for use cases"""

    data: Optional[T] = None
    error: Optional[str] = None
    success: bool = True


@dataclass(frozen=True)
class UseCase(ABC, Generic[T]):
    """Base abstract class for all use cases"""

    container: Container

    @abstractmethod
    def execute(self) -> UseCaseResponse[T]:
        """Execute the use case logic

        Args:
            container: Dependency container with required services

        Returns:
            UseCaseResponse with the result or error information
        """
        pass
