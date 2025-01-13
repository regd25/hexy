from dataclasses import dataclass
from decimal import Decimal
from ..value_object import ValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class TemperatureValueObject(ValueObject):
    """A value object that represents a temperature value with unit."""

    _value: Decimal
    _unit: str = "C"  # C for Celsius, F for Fahrenheit, K for Kelvin

    def __post_init__(self) -> None:
        if not isinstance(self._value, (int, float, Decimal)):
            try:
                object.__setattr__(self, "_value", Decimal(str(self._value)))
            except (ValueError, TypeError) as e:
                raise InvalidArgumentException(
                    field="temperature",
                    value=self._value,
                    message="Value must be a number",
                ) from e

        if self._unit not in ["C", "F", "K"]:
            raise InvalidArgumentException(
                field="unit", value=self._unit, message="Unit must be C, F, or K"
            )

    @property
    def value(self) -> Decimal:
        """Get the temperature value."""
        return self._value

    def to_celsius(self) -> "TemperatureValueObject":
        """Convert temperature to Celsius."""
        if self._unit == "C":
            return self
        if self._unit == "F":
            celsius = (self._value - Decimal("32")) * Decimal("5") / Decimal("9")
            return TemperatureValueObject(celsius, "C")
        if self._unit == "K":
            celsius = self._value - Decimal("273.15")
            return TemperatureValueObject(celsius, "C")
        return self

    def to_fahrenheit(self) -> "TemperatureValueObject":
        """Convert temperature to Fahrenheit."""
        celsius = self.to_celsius()
        fahrenheit = (celsius * Decimal("9") / Decimal("5")) + Decimal("32")
        return TemperatureValueObject(fahrenheit, "F")

    def to_kelvin(self) -> "TemperatureValueObject":
        """Convert temperature to Kelvin."""
        celsius = self.to_celsius()
        kelvin = celsius + Decimal("273.15")
        return TemperatureValueObject(kelvin, "K")

    def to_primitive(self) -> dict[str, str]:
        """Convert to primitive representation."""
        return {"value": str(self._value), "unit": self._unit}
