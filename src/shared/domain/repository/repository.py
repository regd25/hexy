"""
Abstract base class for repositories following Domain-Driven Design principles.

This module defines the base interface for all repositories in the system,
implementing the Repository pattern for data access abstraction.
"""

from abc import ABC, abstractmethod
from ctypes import Union
from typing import Generic, TypeVar, Optional, List
from dataclasses import dataclass

from ..value_object import UuidValueObject, NumberIdValueObject
from ..aggregate.aggregate_root import AggregateRoot
from ..criteria.criteria import Criteria

T = TypeVar("T", bound=AggregateRoot)


@dataclass
class Repository(Generic[T], ABC):
    """
    Abstract base repository for handling domain entities persistence.

    Generic Parameters:
        T: Type of the AggregateRoot this repository manages
    """

    @abstractmethod
    async def save(self, aggregate: T) -> None:
        """
        Persist an aggregate to the storage.

        Args:
            aggregate: AggregateRoot instance to save
        """
        pass

    @abstractmethod
    async def search_by_id(self, id: Union[UuidValueObject, NumberIdValueObject]) -> Optional[T]:
        """
        Find an aggregate by its identifier.

        Args:
            id: Unique identifier of the aggregate

        Returns:
            Optional[T]: The found aggregate or None
        """
        pass

    @abstractmethod
    async def search_all(self) -> List[T]:
        """
        Retrieve all aggregates.

        Returns:
            List[T]: List of all aggregates
        """
        pass

    @abstractmethod
    async def matching(self, criteria: Criteria) -> List[T]:
        """
        Find aggregates matching the given criteria.

        Args:
            criteria: Search criteria to apply

        Returns:
            List[T]: List of matching aggregates
        """
        pass

    @abstractmethod
    async def delete(self, id: Union[UuidValueObject, NumberIdValueObject, List[Union[UuidValueObject, NumberIdValueObject]]]) -> None:
        """
        Remove an aggregate from storage.

        Args:
            id: Identifier of the aggregate to delete
        """
        pass
