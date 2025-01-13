from dataclasses import dataclass
from datetime import time, datetime
from .value_object import ValueObject
from .invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class TimeValueObject(ValueObject):
    """A value object that represents a time of day."""

    _value: time

    def __post_init__(self) -> None:
        if not isinstance(self._value, time):
            try:
                if isinstance(self._value, str):
                    object.__setattr__(self, "_value", time.fromisoformat(self._value))
                else:
                    raise InvalidArgumentException(
                        field="time",
                        value=self._value,
                        message="Value must be a time object or ISO format string",
                    )
            except ValueError as e:
                raise InvalidArgumentException(
                    field="time",
                    value=self._value,
                    message=f"Invalid time format: {str(e)}",
                ) from e

    @property
    def hour(self) -> int:
        """Get the hour part of the time."""
        return self._value.hour

    @property
    def minute(self) -> int:
        """Get the minute part of the time."""
        return self._value.minute

    @property
    def second(self) -> int:
        """Get the second part of the time."""
        return self._value.second

    @classmethod
    def now(cls) -> "TimeValueObject":
        """Create a new TimeValueObject with current time."""

        return cls(datetime.now().time())

    @classmethod
    def from_string(cls, value: str) -> "TimeValueObject":
        """Create from string in HH:MM:SS format."""
        return cls(value)

    def to_primitive(self) -> str:
        """Convert to ISO format string."""
        return self._value.isoformat()

    def is_before(self, other: "TimeValueObject") -> bool:
        """Check if this time is before another time."""
        return self < other

    def is_after(self, other: "TimeValueObject") -> bool:
        """Check if this time is after another time."""
        return self > other
