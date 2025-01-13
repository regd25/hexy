from dataclasses import dataclass
from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class CurrencyValueObject(StringValueObject):
    """A value object that represents an ISO 4217 currency code."""

    _value: str

    # ISO 4217 currency codes (common ones)
    VALID_CURRENCIES = {
        "EUR": "Euro",
        "USD": "US Dollar",
        "CAD": "Canadian Dollar",
        "MXN": "Mexican Peso",
        "ARS": "Argentine Peso",
        "BOB": "Bolivian Boliviano",
        "BRL": "Brazilian Real",
        "CLP": "Chilean Peso",
        "COP": "Colombian Peso",
        "CRC": "Costa Rican Colón",
        "CUP": "Cuban Peso",
        "DOP": "Dominican Peso",
        "GTQ": "Guatemalan Quetzal",
        "HNL": "Honduran Lempira",
        "NIO": "Nicaraguan Córdoba",
        "PAB": "Panamanian Balboa",
        "PEN": "Peruvian Sol",
        "PYG": "Paraguayan Guaraní",
        "SVC": "Salvadoran Colón",
        "UYU": "Uruguayan Peso",
        "VES": "Venezuelan Bolívar",
        "GBP": "British Pound",
        "JPY": "Japanese Yen",
        "CHF": "Swiss Franc",
        "AUD": "Australian Dollar",
        "CNY": "Chinese Yuan",
        "INR": "Indian Rupee",
        "NZD": "New Zealand Dollar",
        "ZAR": "South African Rand",
        "BTC": "Bitcoin",
        "ETH": "Ethereum",
        "XRP": "Ripple",
        "LTC": "Litecoin",
        "BCH": "Bitcoin Cash"
    }

    def __post_init__(self) -> None:
        normalized = self._value.upper()
        if normalized not in self.VALID_CURRENCIES:
            raise InvalidArgumentException(
                field="currency",
                value=self._value,
                message="Invalid ISO 4217 currency code",
            )
        object.__setattr__(self, "_value", normalized)

    @property
    def name(self) -> str:
        """Get the currency name."""
        return self.VALID_CURRENCIES[self._value]

    def to_primitive(self) -> str:
        return self._value
