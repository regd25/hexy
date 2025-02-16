from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, TypeVar, Type, Generic

T = TypeVar("T")


class Container(ABC):
    """Abstract base class for dependency containers

    This container manages dependencies for use cases, services, and orchestrators
    following the Dependency Inversion Principle.
    """

    def __init__(self) -> None:
        self._services: Dict[str, Any] = {}

    @abstractmethod
    def init(self) -> None:
        """Initialize all required services

        This method should be implemented by concrete containers to set up
        all necessary dependencies.
        """
        pass

    def get(self, service_key: str) -> Optional[Any]:
        """Get a service by its key

        Args:
            service_key: Unique identifier for the service

        Returns:
            The service instance if found, None otherwise
        """
        return self._services.get(service_key)

    def register(self, service_key: str, service: Any) -> None:
        """Register a new service

        Args:
            service_key: Unique identifier for the service
            service: The service instance to register
        """
        self._services[service_key] = service

    def has(self, service_key: str) -> bool:
        """Check if a service exists

        Args:
            service_key: Unique identifier for the service

        Returns:
            True if service exists, False otherwise
        """
        return service_key in self._services
