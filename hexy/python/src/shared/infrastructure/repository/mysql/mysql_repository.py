from typing import Optional, List, TypeVar

from src.shared.domain.criteria import Criteria
from src.shared.domain.repository import RepositoryMapper, Repository
from src.shared.infrastructure.datasource import MySQLDataSource
from src.shared.domain.aggregate import AggregateRoot

T = TypeVar("T", bound=AggregateRoot)
C = TypeVar("C", bound=Criteria)


class MySQLRepository(Repository[T, C, RepositoryMapper[T], MySQLDataSource]):
    """Repository implementation for MySQL"""

    async def save(self, aggregate: T) -> None:
        data = self._mapper.to_dict(aggregate)
        await self._data_source.execute(
            f"INSERT INTO {self._table_name} ({', '.join(data.keys())}) VALUES ({', '.join(data.values())})"
        )

    async def search_by_id(self, identifier: str) -> Optional[T]:
        result = await self._data_source.fetchrow(
            f"SELECT * FROM {self._table_name} WHERE id = $1", identifier
        )
        return self._mapper.to_aggregate()(result) if result else None

    async def search_all(self) -> List[T]:
        result = await self._data_source.fetch(f"SELECT * FROM {self._table_name}")
        return [self._mapper.to_aggregate()(r) for r in result]

    async def matching(self, criteria: Criteria) -> List[T]:
        result = await self._data_source.fetch(
            f"SELECT * FROM {self._table_name} WHERE {criteria}"
        )
        return [self._mapper.to_aggregate()(r) for r in result]

    async def delete(self, identifier: str) -> None:
        await self._data_source.execute(
            f"DELETE FROM {self._table_name} WHERE id = $1", identifier
        )
