from dataclasses import dataclass
from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException

@dataclass(frozen=True)
class StateValueObject(StringValueObject):
    """A value object that represents a state/province name."""

    _value: str
    _country_code: str

    def __post_init__(self) -> None:
        if not self._value.strip():
            raise InvalidArgumentException(
                field="state", value=self._value, message="State name cannot be empty"
            )

        object.__setattr__(self, "_value", self._value.upper())

    def __str__(self) -> str:
        return f"{self._value}, {self._country_code}"

    def to_primitive(self) -> dict[str, str]:
        return {"name": self._value, "country_code": self._country_code}

    def upper(self) -> str:
        """Return state name in uppercase."""
        return f"{self._value.upper()}"
