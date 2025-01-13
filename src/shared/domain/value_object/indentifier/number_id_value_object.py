from ..primitive import IntegerValueObject
from ..invalid_argument_exception import InvalidArgumentException


class NumberIdValueObject(IntegerValueObject):
    def __init__(self, value: int):
        super().__init__(value)
        self._ensure_is_valid_id()

    def _ensure_is_valid_id(self) -> None:
        if self._value <= 0:
            raise InvalidArgumentException(
                field="id",
                value=self._value,
                message="ID must be a positive number",
            )
