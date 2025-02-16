from dataclasses import dataclass
from ..string_value_object import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException

@dataclass(frozen=True)
class CityValueObject(StringValueObject):
    """A value object that represents a city name."""

    _value: str

    def __post_init__(self) -> None:
        if not self._value.strip():
            raise InvalidArgumentException(
                field="city", value=self._value, message="City name cannot be empty"
            )
        object.__setattr__(self, "_value", self._value.title())

    def upper(self) -> str:
        """Return city name in uppercase."""
        return self._value.upper()
