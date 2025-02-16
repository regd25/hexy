from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass(frozen=True)
class ValueObject(ABC):
    """Base class for all value objects in the domain.

    Value Objects are immutable objects that represent a descriptive
    aspect of the domain with no conceptual identity.
    """

    _value: object

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, type(self)):
            return NotImplemented
        return self._value == other._value

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, type(self)):
            return NotImplemented
        return self._value < other._value

    def __gt__(self, other: object) -> bool:
        if not isinstance(other, type(self)):
            return NotImplemented
        return self._value > other._value

    def __le__(self, other: object) -> bool:
        if not isinstance(other, type(self)):
            return NotImplemented
        return self._value <= other._value

    def __ge__(self, other: object) -> bool:
        if not isinstance(other, type(self)):
            return NotImplemented
        return self._value >= other._value

    def __ne__(self, other: object) -> bool:
        if not isinstance(other, type(self)):
            return NotImplemented
        return self._value != other._value

    def __repr__(self) -> str:
        """Representation of the value object."""
        return f"{type(self).__name__}({self._value})"

    def __hash__(self) -> int:
        return hash(self._value)

    def __str__(self) -> str:
        """String representation of the value object."""
        return str(self._value)

    @abstractmethod
    def to_primitive(self) -> object:
        """Convert the value object to its primitive representation."""
        pass
