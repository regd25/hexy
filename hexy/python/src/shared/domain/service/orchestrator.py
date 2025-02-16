from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, TypeVar
from ..dependency.container import Container

T = TypeVar("T")  # Handler return type
R = TypeVar("R")  # Request type


@dataclass(frozen=True)
class Orchestrator(ABC):
    """Base abstract class for orchestrators

    Implements the Mediator pattern to coordinate communication
    between different components.
    """

    _container: Container
    _handlers: Dict[str, Any] = None

    def __post_init__(self):
        # Initialize handlers dictionary in post_init since the class is frozen
        object.__setattr__(self, "_handlers", {})

    def coordinate(self, request_type: str, request: R) -> T:
        """Coordinate the handling of a request

        Args:
            request_type: Type identifier for the request
            request: The request data to be handled

        Returns:
            Result from the appropriate handler

        Raises:
            KeyError: If no handler is registered for the request_type
        """
        if request_type not in self._handlers:
            raise KeyError(f"No handler registered for request type: {request_type}")
        return self._handlers[request_type](request)

    def register_handler(self, request_type: str, handler: Any) -> None:
        """Register a new handler for a specific request type

        Args:
            request_type: Type identifier for the request
            handler: Function or method to handle the request
        """
        self._handlers[request_type] = handler

    @abstractmethod
    def handle(self, request_type: str, request: R) -> T:
        """Handle a specific request type

        Args:
            request_type: Type identifier for the request
            request: The request data to be handled

        Returns:
            Result of handling the request
        """
        pass
