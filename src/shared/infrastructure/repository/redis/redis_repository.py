import json
from typing import List, Optional, TypeVar

from src.shared.domain.criteria import Criteria
from src.shared.domain.repository import RepositoryMapper, Repository
from src.shared.infrastructure.datasource import RedisDataSource
from src.shared.domain.aggregate import AggregateRoot

T = TypeVar("T", bound=AggregateRoot)
C = TypeVar("C", bound=Criteria)


class RedisRepository(Repository[T, C, RepositoryMapper[T], RedisDataSource]):
    """Repository implementation for Redis"""

    async def save(self, aggregate: T) -> None:
        """
        Save an aggregate to Redis
        """

        data = self._mapper.to_dict(aggregate)
        await self._data_source.execute(f"SET {aggregate.id} {json.dumps(data)}")

    async def search_by_id(self, identifier: str) -> Optional[T]:
        """
        Search an aggregate by its identifier
        """
        result = await self._data_source.fetch_one(f"GET {identifier}")
        return self._mapper.to_aggregate(result) if result else None

    async def search_all(self) -> List[T]:
        """
        Search all aggregates
        """
        result = await self._data_source.fetch_all("SEARCH *")
        return [self._mapper.to_aggregate(item) for item in result]

    async def matching(self, criteria) -> List[T]:
        """
        Search aggregates matching a criteria
        """
        result = await self._data_source.fetch_all(f"SEARCH {criteria}")
        return [self._mapper.to_aggregate(item) for item in result]

    async def delete(self, identifier: str) -> None:
        """
        Delete an aggregate by its identifier
        """
        await self._data_source.execute(f"DELETE {identifier}")
