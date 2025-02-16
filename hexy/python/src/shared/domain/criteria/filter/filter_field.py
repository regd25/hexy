"""Filter Field Value Object Module."""

from src.shared.domain.value_object.primitive import StringValueObject
from src.shared.domain.value_object.invalid_argument_exception import (
    InvalidArgumentException,
)


class FilterField(StringValueObject):
    """Filter Field Value Object."""

    def __post_init__(self) -> None:
        """Post init validation."""
        super().__post_init__()
        if not self._value.strip():
            raise InvalidArgumentException("Filter field cannot be empty")

    @staticmethod
    def create(value: str) -> "FilterField":
        """Create a new FilterField."""
        return FilterField(_value=value)
