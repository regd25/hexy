from dataclasses import dataclass
from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class StreetValueObject(StringValueObject):
    """A value object that represents a street name."""

    _value: str
    _number: str | None = None
    _complement: str | None = None

    def __post_init__(self) -> None:
        if not self._value.strip():
            raise InvalidArgumentException(
                field="street", value=self._value, message="Street name cannot be empty"
            )

    def __str__(self) -> str:
        if self._number:
            return f"{self._value} {self._number}, {self._complement}"
        return f"{self._value}, {self._complement}"

    def to_primitive(self) -> dict[str, str]:
        return {
            "name": self._value,
            "number": self._number if self._number else "",
            "complement": self._complement if self._complement else "",
        }

    def upper(self) -> str:
        """Return street name in uppercase."""
        base = self._value.upper()
        if self._number:
            base = f"{base} {self._number}"
        if self._complement:
            base = f"{base}, {self._complement}"
        return base
