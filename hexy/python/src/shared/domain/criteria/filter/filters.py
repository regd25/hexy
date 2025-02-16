"""Filters Collection Value Object Module."""

from dataclasses import dataclass
from typing import Any, Iterator, List, Union

from ..invalid_criteria_exception import InvalidCriteriaException
from .filter import Filter


@dataclass(frozen=True)
class Filters:
    """Collection of Filter Value Objects."""

    filters: List[Filter]

    def __post_init__(self) -> None:
        """Post init validation."""
        if not isinstance(self.filters, list):
            raise InvalidCriteriaException(
                message="Filters must be a list",
                parameter="filters",
                value=self.filters,
            )
        for filter_ in self.filters:
            if not isinstance(filter_, Filter):
                raise InvalidCriteriaException(
                    message="All items must be Filter instances",
                    parameter="filters",
                    value=filter_,
                )

    @staticmethod
    def create(
        filters: Union[List[Filter], List[dict[str, Any]], None] = None
    ) -> "Filters":
        """Create a new Filters collection."""
        if filters is None:
            return Filters(filters=[])

        if not filters:
            return Filters(filters=[])

        if isinstance(filters[0], dict):
            return Filters(
                filters=[
                    Filter.create(
                        field=f["field"], operator=f["operator"], value=f["value"]
                    )
                    for f in filters
                ]
            )

        return Filters(filters=list(filters))

    def add(self, filter_: Filter) -> "Filters":
        """Add a filter to the collection."""
        return Filters(filters=[*self.filters, filter_])

    def __iter__(self) -> Iterator[Filter]:
        """Iterate over filters."""
        return iter(self.filters)

    def __len__(self) -> int:
        """Get number of filters."""
        return len(self.filters)

    def __str__(self) -> str:
        """String representation."""
        return f"[{', '.join(str(f) for f in self.filters)}]"

    def __eq__(self, other: Any) -> bool:
        """Compare with another value object."""
        return self.equals(other)

    def to_primitive(self) -> List[dict[str, Any]]:
        """Convert to primitive type."""
        return [f.to_primitive() for f in self.filters]

    def equals(self, other: Any) -> bool:
        """Compare with another value object."""
        if not isinstance(other, Filters):
            return False
        return len(self.filters) == len(other.filters) and all(
            a.equals(b) for a, b in zip(self.filters, other.filters)
        )

    def remove(self, filter_name: str) -> "Filters":
        """Remove a filter from the collection."""
        return Filters(filters=[f for f in self.filters if f.field != filter_name])

    def exclude(self, filter_name: str) -> "Filters":
        """Exclude a filter from the collection."""
        return Filters(filters=[f for f in self.filters if f.field != filter_name])

    def has_filters(self) -> bool:
        """Check if the collection has filters."""
        return len(self.filters) > 0

    def get(self, filter_name: str) -> Filter:
        """Get a filter from the collection."""
        return next((f for f in self.filters if f.field == filter_name), None)

    def has(self, filter_name: str) -> bool:
        """Check if the collection has a filter."""
        return any(f.field == filter_name for f in self.filters)
