
import re
from .value_object import ValueObject
from .invalid_argument_exception import InvalidArgumentException

class EmailValueObject(ValueObject):
    """A value object that represents an email address."""

    _value: str

    def __post_init__(self) -> None:
        if not self._is_valid_email(self._value):
            raise InvalidArgumentException(
                field="email",
                value=self._value,
                message="Invalid email format",
            )

    def _is_valid_email(self, email: str) -> bool:
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email))

    def to_primitive(self) -> str:
        return self._value
