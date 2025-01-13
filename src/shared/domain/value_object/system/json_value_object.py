from dataclasses import dataclass
import json
from typing import Any
from ..value_object import ValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class JsonValueObject(ValueObject):
    """A value object that represents a JSON value."""

    _value: str | dict[str, Any] | list[Any]

    def __post_init__(self) -> None:
        if isinstance(self._value, str):
            try:
                parsed = json.loads(self._value)
                object.__setattr__(self, "_value", parsed)
            except json.JSONDecodeError as e:
                raise InvalidArgumentException(
                    field="json",
                    value=self._value,
                    message=f"Invalid JSON format: {str(e)}",
                ) from e
        elif not isinstance(self._value, (dict, list)):
            raise InvalidArgumentException(
                field="json",
                value=self._value,
                message="Value must be a JSON string, dict or list",
            )

    @property
    def as_dict(self) -> dict[str, Any]:
        """Get the value as a dictionary."""
        if isinstance(self._value, dict):
            return self._value
        raise InvalidArgumentException(
            field="json", value=self._value, message="JSON value is not an object"
        )

    @property
    def as_list(self) -> list[Any]:
        """Get the value as a list."""
        if isinstance(self._value, list):
            return self._value
        raise InvalidArgumentException(
            field="json", value=self._value, message="JSON value is not an array"
        )

    def to_primitive(self) -> str:
        """Convert to JSON string."""
        return json.dumps(self._value)
