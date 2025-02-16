"""Coordinates Value Object Module."""

from dataclasses import dataclass
from typing import Any, Union, Tuple

from ..primitive.string_value_object import StringValueObject
from src.shared.domain.value_object.invalid_argument_exception import (
    InvalidArgumentException,
)


@dataclass(frozen=True)
class CoordinatesValueObject(StringValueObject):
    """Coordinates Value Object for geographical coordinates (latitude, longitude)."""

    latitude: float
    longitude: float

    def __post_init__(self) -> None:
        """Post init validation."""
        if not isinstance(self.latitude, (int, float)):
            raise InvalidArgumentException("Latitude must be a number")
        if not isinstance(self.longitude, (int, float)):
            raise InvalidArgumentException("Longitude must be a number")

        if self.latitude < -90 or self.latitude > 90:
            raise InvalidArgumentException(
                "Latitude must be between -90 and 90 degrees"
            )
        if self.longitude < -180 or self.longitude > 180:
            raise InvalidArgumentException(
                "Longitude must be between -180 and 180 degrees"
            )

    @staticmethod
    def create(value: Union[Tuple[float, float], str]) -> "CoordinatesValueObject":
        """Create a new CoordinatesValueObject."""
        if isinstance(value, str):
            try:
                lat, lon = map(float, value.split(","))
            except ValueError as e:
                raise InvalidArgumentException(
                    "Invalid coordinates format. Expected 'latitude,longitude'"
                ) from e
            return CoordinatesValueObject(
                _value=f"{lat},{lon}", latitude=lat, longitude=lon
            )
        elif isinstance(value, tuple) and len(value) == 2:
            return CoordinatesValueObject(
                _value=f"{value[0]},{value[1]}", latitude=value[0], longitude=value[1]
            )
        else:
            raise InvalidArgumentException("Invalid coordinates format")

    def __str__(self) -> str:
        """String representation."""
        return f"{self.latitude},{self.longitude}"

    def to_primitive(self) -> Tuple[float, float]:
        """Convert to primitive type."""
        return (self.latitude, self.longitude)

    def equals(self, other: Any) -> bool:
        """Compare with another value object."""
        if not isinstance(other, CoordinatesValueObject):
            return False
        return self.latitude == other.latitude and self.longitude == other.longitude

    def to_degrees_minutes_seconds(self) -> Tuple[str, str]:
        """Convert decimal coordinates to degrees, minutes, seconds format."""

        def decimal_to_dms(decimal: float, is_latitude: bool) -> str:
            direction = (
                "N"
                if decimal >= 0 and is_latitude
                else "S" if is_latitude else "E" if decimal >= 0 else "W"
            )
            decimal = abs(decimal)
            degrees = int(decimal)
            minutes = int((decimal - degrees) * 60)
            seconds = round(((decimal - degrees) * 60 - minutes) * 60, 2)
            return f"{degrees}°{minutes}'{seconds}\"{direction}"

        return (
            decimal_to_dms(self.latitude, True),
            decimal_to_dms(self.longitude, False),
        )
