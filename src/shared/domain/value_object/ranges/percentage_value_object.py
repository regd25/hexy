"""Percentage Value Object Module."""

from dataclasses import dataclass
from typing import Any, Union

from ..primitive import FloatValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class PercentageValueObject(FloatValueObject):
    """Percentage Value Object."""

    def __post_init__(self) -> None:
        """Post init validation."""
        if not isinstance(self._value, (int, float)):
            raise InvalidArgumentException("Percentage must be a number")
        if self._value < 0 or self._value > 100:
            raise InvalidArgumentException("Percentage must be between 0 and 100")

    @staticmethod
    def create(value: Union[int, float, str]) -> "PercentageValueObject":
        """Create a new PercentageValueObject."""
        if isinstance(value, str):
            try:
                # Remove % symbol if present
                value = float(value.strip().rstrip("%"))
            except ValueError as e:
                raise InvalidArgumentException("Invalid percentage format") from e
        return PercentageValueObject(float(value))

    def __str__(self) -> str:
        """String representation."""
        return f"{self._value}%"

    def to_primitive(self) -> float:
        """Convert to primitive type."""
        return self._value

    def __eq__(self, other: Any) -> bool:
        """Compare with another value object."""
        if not isinstance(other, PercentageValueObject):
            return False
        return self.to_primitive() == other.to_primitive()
