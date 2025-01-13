from uuid import UUID, uuid4

from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException


class UuidValueObject(StringValueObject):
    """A value object that represents a UUID."""

    _value: str

    @classmethod
    def create(cls) -> "UuidValueObject":
        """Create a new UUID value object with a random UUID."""
        return cls(str(uuid4()))

    def __post_init__(self) -> None:
        if not isinstance(self._value, str):
            try:
                object.__setattr__(self, "_value", str(UUID(str(self._value))))
            except ValueError as exc:
                raise InvalidArgumentException(
                    field="uuid",
                    value=self._value,
                    message="Value must be a valid UUID",
                ) from exc

    def to_primitive(self) -> str:
        return str(self._value)
