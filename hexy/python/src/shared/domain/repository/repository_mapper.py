from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, Generic, TypeVar

T = TypeVar("T")


class RepositoryMapper(Generic[T], ABC):
    def __init__(
        self,
        mapper: Callable[[T], Dict[str, Any]],
        reverse_mapper: Callable[[Dict[str, Any]], T],
    ):
        self._mapper = mapper
        self._reverse_mapper = reverse_mapper

    @abstractmethod
    def to_aggregate(self, data: Dict[str, Any]) -> T:
        pass

    @abstractmethod
    def to_dict(self, aggregate: T) -> Dict[str, Any]:
        pass
