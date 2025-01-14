"""Filter Value Value Object Module."""

from typing import Union

from src.shared.domain.value_object import StringValueObject


class FilterValue(StringValueObject):
    """Filter Value Value Object."""

    @staticmethod
    def create(value: Union[str, int, float, bool, list, None]) -> "FilterValue":
        """Create a new FilterValue."""
        if value is None:
            return FilterValue(_value="null")
        if isinstance(value, (list, tuple)):
            return FilterValue(_value=",".join(map(str, value)))
        return FilterValue(_value=str(value))
