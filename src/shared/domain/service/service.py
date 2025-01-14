from abc import ABC, abstractmethod
from ..dependency.container import Container


class Service(ABC):
    """Abstract base class for services

    This class provides a base for all services, ensuring they have access
    to a dependency container.
    """

    def __init__(self, container: Container) -> None:
        self._container = container

    @abstractmethod
    def perform(self) -> None:
        """Perform the service's main action

        This method should be implemented by concrete services to define
        their main functionality.
        """
        pass
