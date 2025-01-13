from ..invalid_argument_exception import InvalidArgumentException
from ..value_object import ValueObject


class StringValueObject(ValueObject):
    """A value object that represents a string value."""

    _value: str

    def __post_init__(self) -> None:
        if not isinstance(self._value, str):
            raise InvalidArgumentException(
                field="string", value=self._value, message="Value must be a string"
            )

    def to_primitive(self) -> str:
        return self._value
