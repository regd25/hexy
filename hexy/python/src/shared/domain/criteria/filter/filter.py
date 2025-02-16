"""Filter Value Object Module."""

from dataclasses import dataclass
from typing import Any, Union

from ...value_object.invalid_argument_exception import InvalidArgumentException
from .filter_field import FilterField
from .filter_operator import FilterOperator
from .filter_value import FilterValue


@dataclass(frozen=True)
class Filter:
    """Filter Value Object."""

    _field: FilterField
    _operator: FilterOperator
    _value: FilterValue

    def __post_init__(self) -> None:
        """Post init validation."""
        if not isinstance(self._field, FilterField):
            raise InvalidArgumentException("Field must be a FilterField")
        if not isinstance(self._operator, FilterOperator):
            raise InvalidArgumentException("Operator must be a FilterOperator")
        if not isinstance(self._value, FilterValue):
            raise InvalidArgumentException("Value must be a FilterValue")

    @staticmethod
    def create(
        field: Union[str, FilterField],
        operator: Union[str, FilterOperator],
        value: Union[str, int, float, bool, list, None, FilterValue],
    ) -> "Filter":
        """Create a new Filter."""
        if isinstance(field, str):
            field = FilterField.create(field)
        if isinstance(operator, str):
            operator = FilterOperator.create(operator)
        if not isinstance(value, FilterValue):
            value = FilterValue.create(value)

        return Filter(field, operator, value)

    def __str__(self) -> str:
        """String representation."""
        return f"{self._field} {self._operator} {self._value}"

    def to_primitive(self) -> dict[str, Any]:
        """Convert to primitive type."""
        return {
            "field": self._field.to_primitive(),
            "operator": self._operator.to_primitive(),
            "value": self._value.to_primitive(),
        }

    def equals(self, other: Any) -> bool:
        """Compare with another value object."""
        if not isinstance(other, Filter):
            return False
        return self._value == str(other)
