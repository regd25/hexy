from typing import List, Optional, TypeVar

from src.shared.domain.criteria import Criteria
from src.shared.domain.repository import RepositoryMapper, Repository
from src.shared.infrastructure.datasource import PostgresDataSource
from src.shared.domain.aggregate import AggregateRoot

T = TypeVar("T", bound=AggregateRoot)
C = TypeVar("C", bound=Criteria)


class PostgresRepository(Repository[T, C, RepositoryMapper[T], PostgresDataSource]):
    """
    PostgresRepository implementation
    """

    async def save(self, aggregate: T) -> None:
        """
        Save an aggregate to the database
        """
        data = self._mapper.to_dict(aggregate)
        await self._data_source.execute(
            f"INSERT INTO {self._table_name} ({', '.join(data.keys())}) VALUES ({', '.join(data.values())})"
        )

    async def search_by_id(self, identifier: str) -> Optional[T]:
        """
        Search an aggregate by its identifier
        """
        result = await self._data_source.fetchrow(
            f"SELECT * FROM {self._table_name} WHERE id = $1", identifier
        )
        return self._mapper.to_aggregate()(result) if result else None

    async def matching(self, criteria: C) -> List[T]:
        """
        Search aggregates matching a criteria
        """
        result = await self._data_source.fetch(
            f"SELECT * FROM {self._table_name} WHERE {criteria}"
        )
        return [self._mapper.to_aggregate()(r) for r in result]

    async def search_all(self) -> List[T]:
        """
        Search all aggregates
        """
        result = await self._data_source.fetch(f"SELECT * FROM {self._table_name}")
        return [self._mapper.to_aggregate()(r) for r in result]

    async def delete(self, identifier: str) -> None:
        """
        Delete an aggregate by its identifier
        """
        await self._data_source.execute(
            f"DELETE FROM {self._table_name} WHERE id = $1", identifier
        )
