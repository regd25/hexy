"""Country Code Value Object Module."""

from typing import Any

from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException


class CountryCodeValueObject(StringValueObject):
    """Country Code Value Object for ISO 3166-1 alpha-2 codes."""

    def __post_init__(self) -> None:
        """Post init validation."""
        super().__post_init__()

        code = self._value.upper()
        if len(code) != 2:
            raise InvalidArgumentException(
                "Country code must be 2 characters long (ISO 3166-1 alpha-2)"
            )

        if not code.isalpha():
            raise InvalidArgumentException("Country code must contain only letters")

    @staticmethod
    def create(value: str) -> "CountryCodeValueObject":
        """Create a new CountryCodeValueObject."""
        return CountryCodeValueObject(_value=value.upper())

    def __str__(self) -> str:
        """String representation."""
        return self._value.upper()

    def to_primitive(self) -> str:
        """Convert to primitive type."""
        return str(self)

    def __eq__(self, other: Any) -> bool:
        """Compare with another value object."""
        if not isinstance(other, CountryCodeValueObject):
            return False
        return self.upper() == other.upper()
