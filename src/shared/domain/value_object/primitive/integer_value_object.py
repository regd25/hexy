from ..invalid_argument_exception import InvalidArgumentException
from ..value_object import ValueObject


class IntegerValueObject(ValueObject):
    """A value object that represents an integer value."""

    _value: int

    def __post_init__(self) -> None:
        if not isinstance(self._value, int):
            raise InvalidArgumentException(
                field="integer", value=self._value, message="Value must be an integer"
            )

    def to_primitive(self) -> int:
        return self._value
