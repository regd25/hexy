from dataclasses import dataclass
from datetime import datetime
from ..value_object import ValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class DateTimeValueObject(ValueObject):
    """A value object that represents a datetime with timezone awareness."""

    _value: datetime

    def __post_init__(self) -> None:
        if not isinstance(self._value, datetime):
            try:
                if isinstance(self._value, str):
                    object.__setattr__(
                        self, "_value", datetime.fromisoformat(self._value)
                    )
                else:
                    raise InvalidArgumentException(
                        field="datetime",
                        value=self._value,
                        message="Value must be a datetime or ISO format string",
                    )
            except ValueError as e:
                raise InvalidArgumentException(
                    field="datetime",
                    value=self._value,
                    message=f"Invalid datetime format: {str(e)}",
                ) from e

    def __str__(self) -> str:
        """Return the datetime as an ISO format string."""
        return self._value.isoformat()

    def __format__(self, format_spec: str) -> str:
        """Format the datetime according to the specified format."""
        return self._value.strftime(format_spec)

    @classmethod
    def now(cls) -> "DateTimeValueObject":
        """Create a new DateTimeValueObject with current datetime."""
        return cls(datetime.now())

    @classmethod
    def from_string(cls, value: str) -> "DateTimeValueObject":
        """Create from ISO format string."""
        return cls(value)

    def to_primitive(self) -> str:
        """Convert to ISO format string."""
        return self._value.isoformat()

    def is_future(self) -> bool:
        """Check if datetime is in the future."""
        return self._value > datetime.now()

    def is_past(self) -> bool:
        """Check if datetime is in the past."""
        return self._value < datetime.now()
