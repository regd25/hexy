from typing import Optional, List, TypeVar

from src.shared.domain.repository import RepositoryMapper, Repository
from src.shared.domain.criteria import Criteria
from src.shared.domain.aggregate import AggregateRoot
from src.shared.infrastructure.datasource import DynamoDBDataSource


T = TypeVar("T", bound=AggregateRoot)
C = TypeVar("C", bound=Criteria)


class DynamoDBRepository(Repository[T, C, RepositoryMapper[T], DynamoDBDataSource]):
    """Repository implementation for DynamoDB"""

    async def save(self, aggregate: T) -> None:
        await self._data_source.execute(
            f"INDEX {aggregate.id} {self._mapper.to_dict(aggregate)}"
        )

    async def search_by_id(self, identifier: str) -> Optional[T]:
        result = await self._data_source.fetch_one(f"GET {identifier}")
        return self._mapper.to_aggregate(result) if result else None

    async def search_all(self) -> List[T]:
        result = await self._data_source.fetch("SEARCH *")
        return [self._mapper.to_aggregate(item) for item in result]

    async def matching(self, criteria: C) -> List[T]:
        result = await self._data_source.fetch(f"SEARCH {criteria}")
        return [self._mapper.to_aggregate(item) for item in result]

    async def delete(self, identifier: str) -> None:
        await self._data_source.execute(f"DELETE {identifier}")
