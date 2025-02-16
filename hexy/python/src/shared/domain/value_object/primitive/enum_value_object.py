from enum import Enum
from ..invalid_argument_exception import InvalidArgumentException
from ..value_object import ValueObject


class EnumValueObject(ValueObject):
    _value: Enum

    def __post_init__(self) -> None:
        if not isinstance(self._value, Enum):
            raise InvalidArgumentException(
                field="enum",
                value=self._value,
                message="Value must be an Enum",
            )

    def to_primitive(self) -> Enum:
        return self._value
