from typing import Dict, List, Optional

from ..exception.domain_exception import DomainException
from ..value_object import InvalidArgumentException
from .filter.filter import Filter
from .filter.filter_field import FilterField


class Filters:
    def __init__(
        self, filters: List[Filter], valid_filter_fields: Optional[List[str]] = None
    ):
        self._filters = filters
        if valid_filter_fields:
            self._validate_filters(valid_filter_fields)

    def _validate_filters(self, valid_filter_fields: List[str]) -> None:
        for filter_obj in self._filters:
            if filter_obj.field.value not in valid_filter_fields:
                raise DomainException(
                    message=f"Campo de filtro inválido: {filter_obj.field.value}",
                    value=filter_obj.field.value,
                    code="INVALID_FILTER_FIELD",
                )

    @property
    def filters(self) -> List[Filter]:
        return self._filters

    def has_filters(self) -> bool:
        return len(self._filters) > 0

    @classmethod
    def from_values(
        cls,
        filters: List[Dict[str, str]],
        valid_filter_fields: Optional[List[str]] = None,
    ) -> "Filters":
        return cls([Filter.from_values(f) for f in filters], valid_filter_fields)

    @classmethod
    def none(cls) -> "Filters":
        return cls([])

    def has(self, filter_name: str) -> bool:
        return any(f.field.value == filter_name for f in self._filters)

    def exclude(self, filter_name: str) -> "Filters":
        return Filters([f for f in self._filters if f.field.value != filter_name])

    def get(self, filter_name: str) -> Optional[Filter]:
        return next((f for f in self._filters if f.field.value == filter_name), None)

    def push(self, *filters: Filter) -> "Filters":
        return Filters([*self._filters, *filters])
