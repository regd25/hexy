import re
from ..invalid_argument_exception import InvalidArgumentException
from .string_value_object import StringValueObject


class PhoneNumberValueObject(StringValueObject):
    def __init__(self, value: str):
        cleaned_value = re.sub(r"[\s\-\(\)]", "", value)
        super().__init__(cleaned_value)
        self._ensure_is_valid_phone()

    def _ensure_is_valid_phone(self) -> None:
        pattern = r"^\+?[1-9]\d{1,14}$"
        if not re.match(pattern, self._value):
            raise InvalidArgumentException(
                field="phone_number",
                value=self._value,
                message="Invalid phone number format",
            )
