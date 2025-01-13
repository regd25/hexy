from dataclasses import dataclass
import re
from .string_value_object import StringValueObject
from .invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class DocumentNumberValueObject(StringValueObject):
    """A value object that represents an identification document number."""

    _value: str
    _type: str = "DNI"  # DNI, NIE, Passport, etc.
    _country: str = "MX"  # ISO country code

    def __post_init__(self) -> None:
        if not self._is_valid_document():
            raise InvalidArgumentException(
                field="document_number",
                value=self._value,
                message=f"Invalid {self._type} format for country {self._country}",
            )
        normalized = self._normalize_document()
        object.__setattr__(self, "_value", normalized)

    def _is_valid_document(self) -> bool:
        """Validate document number based on type and country."""
        patterns = {
            "MX": {
                "RFC": r"^[A-Z]{3}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z0-9]{3}$",
                "CURP": r"^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}[0-1][0-9][0-3][0-9][HM]{1}[A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}[0-9A-Z]{1}[0-9]{1}$",
                "DNI": r"^[0-9]{8}$",
                "INE": r"^[0-9]{10}$",
                "IMSS": r"^[0-9]{11}$",
                "NIE": r"^[0-9]{10}$",
                "PASSPORT": r"^[0-9]{9}$",
            },
            "ES": {
                "DNI": r"^[0-9]{8}[A-Z]$",
                "NIE": r"^[XYZ][0-9]{7}[A-Z]$",
                "PASSPORT": r"^[A-Z]{2}[0-9]{6}$",
            },
            "US": {
                "SSN": r"^\d{3}-\d{2}-\d{4}$",
                "DNI": r"^\d{9}$",
                "NIE": r"^[XYZ][0-9]{7}[A-Z]$",
                "PASSPORT": r"^[A-Z]{2}[0-9]{6}$",
            },
        }

        country_patterns = patterns.get(self._country, {})
        pattern = country_patterns.get(self._type)

        if not pattern:
            raise InvalidArgumentException(
                field="document_type",
                value=f"{self._type}/{self._country}",
                message=f"Unsupported document type for country {self._country}",
            )

        return bool(re.match(pattern, self._value))

    def _normalize_document(self) -> str:
        """Normalize document number format."""
        return self._value.upper()

    def to_primitive(self) -> dict[str, str]:
        return {"number": self._value, "type": self._type, "country": self._country}
