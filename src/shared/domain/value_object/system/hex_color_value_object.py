"""Hex Color Value Object Module."""

import re
from dataclasses import dataclass
from typing import Any

from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class HexColorValueObject(StringValueObject):
    """Hex Color Value Object."""

    def __post_init__(self) -> None:
        """Post init validation."""
        if not isinstance(self._value, str):
            raise InvalidArgumentException("Hex color must be a string")

        color = self._value.lstrip("#").upper()

        if not re.match(r"^[0-9A-F]{3}([0-9A-F]{3})?$", color):
            raise InvalidArgumentException("Invalid hex color format")

    @staticmethod
    def create(value: str) -> "HexColorValueObject":
        """Create a new HexColorValueObject."""
        return HexColorValueObject(value)

    def __str__(self) -> str:
        """String representation."""
        color = self._value.lstrip("#").upper()
        return f"#{color}"

    def to_primitive(self) -> str:
        """Convert to primitive type."""
        return str(self)

    def __eq__(self, other: Any) -> bool:
        """Compare with another value object."""
        if not isinstance(other, HexColorValueObject):
            return False
        return self.upper() == other.upper()

    def to_rgb(self) -> tuple[int, int, int]:
        """Convert hex color to RGB tuple."""
        color = self._value.lstrip("#")
        if len(color) == 3:
            color = "".join(c * 2 for c in color)
        return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore
