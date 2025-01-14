"""
Criteria class for handling search, filtering and pagination operations.

This class encapsulates all the search parameters including filters, ordering,
pagination and complex OR conditions for querying domain objects.
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any

from .filter import Filter, Filters, FilterField, FilterOperator, FilterValue
from .order import Order


@dataclass
class Criteria:
    """
    A value object that encapsulates search criteria parameters.

    This class handles all aspects of querying domain objects including:
    - Filtering conditions
    - Sorting/ordering
    - Pagination (limit/offset)
    - Complex OR conditions through nested criteria

    Attributes:
        filters (Filters): Collection of filter conditions
        order (Order): Sorting parameters
        limit (Optional[int]): Maximum number of results to return
        offset (Optional[int]): Number of results to skip
        or_criteria (List[Criteria]): Nested criteria for OR conditions
    """

    filters: Filters
    order: Order
    limit: Optional[int] = None
    offset: Optional[int] = None
    or_criteria: List["Criteria"] = None

    def __post_init__(self):
        """Initialize or_criteria as empty list if None."""
        self.or_criteria = self.or_criteria or []

    @classmethod
    def create(
        cls,
        filters: Optional[List[Dict[str, str]]] = None,
        order_by: Optional[str] = None,
        order_type: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        valid_fields: Optional[List[str]] = None,
    ) -> "Criteria":
        """
        Create a new Criteria instance from primitive types.

        Args:
            filters: List of filter dictionaries
            order_by: Field name to order by
            order_type: Order direction ('asc' or 'desc')
            limit: Maximum number of results
            offset: Number of results to skip
            valid_fields: List of valid field names for ordering

        Returns:
            Criteria: New instance with the specified parameters
        """
        return cls(
            filters=Filters.create(filters or []),
            order=Order.create(order_by, order_type, valid_fields),
            limit=limit,
            offset=offset,
        )

    def has_filters(self) -> bool:
        """Check if criteria has any filters."""
        return self.filters.has_filters()

    def remove_filter(self, filter_name: str) -> None:
        """
        Remove a filter by name from this criteria and all nested or_criteria.

        Args:
            filter_name: Name of the filter to remove
        """
        self.filters = self.filters.exclude(filter_name)
        for criteria in self.or_criteria:
            criteria.remove_filter(filter_name)

    def add_filter(self, filter_obj: Filter) -> None:
        """
        Add a new filter to the criteria.

        Args:
            filter_obj: Filter instance to add
        """
        self.filters = self.filters.add(filter_obj)

    def get_filter_value(self, filter_name: str) -> Optional[str]:
        """
        Get the value of a specific filter.

        Args:
            filter_name: Name of the filter

        Returns:
            Optional[str]: Filter value if exists, None otherwise
        """
        filter_obj = self.filters.get(filter_name)
        return filter_obj.value.value if filter_obj else None

    def has_filter(self, filter_name: str) -> bool:
        """
        Check if a specific filter exists.

        Args:
            filter_name: Name of the filter to check

        Returns:
            bool: True if filter exists, False otherwise
        """
        return self.filters.has(filter_name)

    def add_or_criteria(self, criteria: "Criteria") -> None:
        """
        Add a nested criteria for OR conditions.

        Args:
            criteria: Criteria instance to add as OR condition
        """
        if self.or_criteria is None:
            self.or_criteria = []
        self.or_criteria.append(criteria)

    def rename_filters(self, filter_mapping: Dict[str, str]) -> None:
        """
        Rename multiple filters based on a mapping.

        Args:
            filter_mapping: Dictionary mapping old names to new names
        """
        for old_name, new_name in filter_mapping.items():
            if self.has_filter(old_name):
                self._rename_filter(old_name, new_name)

    def _rename_filter(self, old_name: str, new_name: str) -> None:
        """
        Internal method to rename a single filter.

        Args:
            old_name: Current filter name
            new_name: New filter name
        """
        filter_obj = self.filters.get(old_name)
        if filter_obj:
            self.remove_filter(old_name)
            new_filter = Filter.create(
                field=FilterField(new_name),
                operator=FilterOperator.equal(),
                value=FilterValue(filter_obj.value),
            )
            self.add_filter(new_filter)

    def copy(self, **kwargs) -> "Criteria":
        """
        Create a copy of this criteria with optional overrides.

        Args:
            **kwargs: Attributes to override in the copy

        Returns:
            Criteria: New instance with specified overrides
        """
        return Criteria(
            filters=kwargs.get("filters", self.filters),
            order=kwargs.get("order", self.order),
            limit=kwargs.get("limit", self.limit),
            offset=kwargs.get("offset", self.offset),
            or_criteria=[c.clone() for c in (self.or_criteria or [])],
        )

    def to_primitives(self) -> Dict[str, Any]:
        """
        Convert the criteria to a dictionary of primitive types.

        Returns:
            Dict[str, Any]: Dictionary representation of the criteria
        """
        return {
            "filters": [f.__dict__ for f in self.filters.filters],
            "order": {
                "order_by": self.order.order_by,
                "order_type": self.order.order_type,
            },
            "limit": self.limit,
            "offset": self.offset,
            "or_criteria": [c.to_primitives() for c in (self.or_criteria or [])],
        }
