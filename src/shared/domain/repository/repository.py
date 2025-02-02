"""
Abstract base class for repositories following Domain-Driven Design principles.

This module defines the base interface for all repositories in the system,
implementing the Repository pattern for data access abstraction.
"""

from abc import ABC, abstractmethod
from typing import Generic, List, Optional, TypeVar
from dataclasses import dataclass

from ..criteria.criteria import Criteria

from .repository_mapper import RepositoryMapper

from ...infrastructure.datasource.datasource import DataSource
from ..aggregate.aggregate_root import AggregateRoot

T = TypeVar("T", bound=AggregateRoot)
D = TypeVar("D", bound=DataSource)
M = TypeVar("M", bound=RepositoryMapper)
C = TypeVar("C", bound=Criteria)

@dataclass
class Repository(ABC, Generic[T, C, M, D]):
    """
    Abstract base class for repositories following Domain-Driven Design principles.
    """

    _data_source: D
    _table_name: str
    _mapper: M

    def __init__(
        self,
        data_source: D,
        table_name: str,
        mapper: M,
    ):
        self._data_source = data_source
        self._table_name = table_name
        self._mapper = mapper

    @abstractmethod
    async def save(self, aggregate: T) -> None:
        """
        Save an aggregate to the database
        """
        pass

    @abstractmethod
    async def search_by_id(self, identifier: str) -> Optional[T]:
        """
        Search an aggregate by its identifier
        """
        pass

    @abstractmethod
    async def search_all(self) -> List[T]:
        """
        Search all aggregates
        """
        pass

    @abstractmethod
    async def matching(self, criteria: C) -> List[T]:
        """
        Search aggregates matching a criteria
        """
        pass

    @abstractmethod
    async def delete(self, identifier: str) -> None:
        """
        Delete an aggregate by its identifier
        """
        pass
