from datetime import datetime
from .value_object import ValueObject
from .invalid_argument_exception import InvalidArgumentException


class DateValueObject(ValueObject):
    """A value object that represents a date value."""

    _value: datetime

    def __post_init__(self) -> None:
        if isinstance(self._value, str):
            if not self.is_valid_date(self._value):
                raise InvalidArgumentException(
                    field="date",
                    value=self._value,
                    message="Value must be a valid date",
                )
            self._value = datetime.strptime(self._value, "%Y-%m-%d")

    def to_primitive(self) -> datetime:
        return self._value

    @classmethod
    def now(cls) -> "DateValueObject":
        return cls(datetime.now())

    def is_valid_date(self, date: str) -> bool:
        try:
            datetime.strptime(date, "%Y-%m-%d")
            return True
        except ValueError:
            return False
