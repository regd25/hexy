from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from .filters import Filters
from .filter import Filter
from .order import Order
from .order_by import OrderBy
from .order_type import OrderType, OrderTypes


@dataclass
class Criteria:
    filters: Filters
    order: Order
    limit: Optional[int] = None
    offset: Optional[int] = None
    or_criteria: List["Criteria"] = None

    def __post_init__(self):
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
        return cls(
            filters=Filters.from_values(filters or [], valid_fields),
            order=Order.from_values(order_by, order_type, valid_fields),
            limit=limit,
            offset=offset,
        )

    def has_filters(self) -> bool:
        return self.filters.has_filters()

    def remove_filter(self, filter_name: str) -> None:
        self.filters = self.filters.exclude(filter_name)
        for criteria in self.or_criteria:
            criteria.remove_filter(filter_name)

    def add_filter(self, filter_obj: Filter) -> None:
        self.filters = self.filters.push(filter_obj)

    def get_filter_value(self, filter_name: str) -> Optional[str]:
        filter_obj = self.filters.get(filter_name)
        return filter_obj.value.value if filter_obj else None

    def has_filter(self, filter_name: str) -> bool:
        return self.filters.has(filter_name)

    def add_or_criteria(self, criteria: "Criteria") -> None:
        if self.or_criteria is None:
            self.or_criteria = []
        self.or_criteria.append(criteria)

    def rename_filters(self, filter_mapping: Dict[str, str]) -> None:
        for old_name, new_name in filter_mapping.items():
            if self.has_filter(old_name):
                self._rename_filter(old_name, new_name)

    def _rename_filter(self, old_name: str, new_name: str) -> None:
        filter_obj = self.filters.get(old_name)
        if filter_obj:
            self.remove_filter(old_name)
            new_filter = Filter(
                field=filter_obj.field.__class__(new_name),
                operator=filter_obj.operator,
                value=filter_obj.value,
            )
            self.add_filter(new_filter)

    def clone(self, **kwargs) -> "Criteria":
        return Criteria(
            filters=kwargs.get("filters", self.filters),
            order=kwargs.get("order", self.order),
            limit=kwargs.get("limit", self.limit),
            offset=kwargs.get("offset", self.offset),
            or_criteria=[c.clone() for c in (self.or_criteria or [])],
        )

    def to_primitives(self) -> Dict[str, Any]:
        return {
            "filters": [f.__dict__ for f in self.filters.filters],
            "order": {
                "order_by": self.order.order_by.value,
                "order_type": self.order.order_type.value,
            },
            "limit": self.limit,
            "offset": self.offset,
            "or_criteria": [c.to_primitives() for c in (self.or_criteria or [])],
        }
