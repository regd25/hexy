from ..value_object import ValueObject
from ..invalid_argument_exception import InvalidArgumentException

class BooleanValueObject(ValueObject):
    """A value object that represents a boolean value."""

    _value: bool

    def __post_init__(self) -> None:
        if not isinstance(self._value, bool):
            raise InvalidArgumentException(
                field="boolean",
                value=self._value,
                message="Value must be a boolean",
            )

    def to_primitive(self) -> bool:
        return self._value
