from decimal import Decimal

from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException
from .currency_value_object import CurrencyValueObject


class MoneyValueObject(StringValueObject):
    """A value object that represents a monetary value with currency."""

    _value: str
    _amount: Decimal
    _currency: CurrencyValueObject = "USD"

    def __post_init__(self) -> None:
        object.__setattr__(
            self, "_amount", Decimal(str(self._amount)).quantize(Decimal("0.01"))
        )
        object.__setattr__(self, "_currency", self._currency.upper())
        object.__setattr__(self, "_value", f"{self._amount} {self._currency}")
        self._ensure_is_valid()

    def _ensure_is_valid(self) -> None:
        if self._amount < 0:
            raise InvalidArgumentException(
                field="amount",
                value=self._amount,
                message="Amount cannot be negative",
            )
        if len(self._currency) != 3:
            raise InvalidArgumentException(
                field="currency",
                value=self._currency,
                message="Currency must be a 3-letter ISO code",
            )

    def to_primitive(self) -> str:
        return self._value

    @property
    def amount(self) -> Decimal:
        return self._amount

    @property
    def currency(self) -> str:
        return self._currency
