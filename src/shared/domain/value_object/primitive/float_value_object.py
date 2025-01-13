from ..invalid_argument_exception import InvalidArgumentException
from ..value_object import ValueObject


class FloatValueObject(ValueObject):
    """A value object that represents a float value."""

    _value: float

    def __post_init__(self) -> None:
        if not isinstance(self._value, float):
            raise InvalidArgumentException(
                field="float",
                value=self._value,
                message="Value must be a number",
            )

    def to_primitive(self) -> float:
        return self._value
