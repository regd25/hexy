from dataclasses import dataclass
from typing import Literal

from ..invalid_argument_exception import InvalidArgumentException
from ..value_object import ValueObject
from .city_value_object import CityValueObject
from .state_value_object import StateValueObject
from .street_value_object import StreetValueObject
from .zip_code_value_object import ZipCodeValueObject


@dataclass(frozen=True)
class AddressValueObject(ValueObject):
    """A value object that represents a complete postal address."""

    street: StreetValueObject
    city: CityValueObject
    state: StateValueObject
    country_code: str
    zip_code: ZipCodeValueObject
    _value: dict[str, str]

    def __post_init__(self) -> None:
        if not self.country_code.strip():
            raise InvalidArgumentException(
                field="country_code",
                value=self.country_code,
                message="Country code cannot be empty",
            )

        address_dict = {
            "street": str(self.street),
            "city": str(self.city),
            "state": str(self.state),
            "country_code": self.country_code.upper(),
            "zip_code": str(self.zip_code),
        }
        object.__setattr__(self, "_value", address_dict)
        object.__setattr__(self, "country_code", self.country_code.upper())

    def __str__(self) -> str:
        """Return formatted address string."""
        return (
            f"{self.street}\n"
            f"{self.city}, {self.state}\n"
            f"{self.zip_code}\n"
            f"{self.country_code}"
        )

    def __repr__(self) -> str:
        return f"AddressValueObject(street={self.street}, city={self.city}, state={self.state}, country_code={self.country_code}, zip_code={self.zip_code})"

    def __format__(
        self, format_spec: Literal["oneline", "multiline", "postal", "html", "json"]
    ) -> str:
        """Format address according to specified format.

        Available formats:
        - 'oneline': Single line format
        - 'multiline': Multiple line format (default)
        - 'postal': Postal service format
        - 'html': HTML format with <br> tags
        - 'json': JSON format
        """
        match format_spec.lower():
            case "oneline":
                return f"{self.street}, {self.city}, {self.state}, {self.zip_code}, {self.country_code}"

            case "postal":
                return (
                    f"{self.street.upper()}\n"
                    f"{self.city.upper()}\n"
                    f"{self.state.upper()} {self.zip_code}\n"
                    f"{self.country_code}"
                )

            case "html":
                return (
                    f"{self.street}<br>"
                    f"{self.city}, {self.state}<br>"
                    f"{self.zip_code}<br>"
                    f"{self.country_code}"
                )

            case "json":
                return str(self.to_primitive())

            case _:  # multiline format by default
                return str(self)

    def to_primitive(self) -> dict[str, str]:
        return {
            "street": self.street.to_primitive(),
            "city": self.city.to_primitive(),
            "state": self.state.to_primitive(),
            "country_code": self.country_code,
            "zip_code": self.zip_code.to_primitive(),
        }
