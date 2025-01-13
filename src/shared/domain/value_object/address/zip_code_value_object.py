from dataclasses import dataclass
import re
from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException

@dataclass(frozen=True)
class ZipCodeValueObject(StringValueObject):
    """A value object that represents a ZIP/Postal code."""

    _value: str
    _country_code: str = "ES"  # Default to Spain

    def __post_init__(self) -> None:
        if not self._is_valid_zip_code():
            raise InvalidArgumentException(
                field="zip_code",
                value=self._value,
                message=f"Invalid ZIP code format for country {self._country_code}",
            )

    def _is_valid_zip_code(self) -> bool:
        patterns = {
            "ES": r"^\d{5}$",
            "US": r"^\d{5}(-\d{4})?$",
            "UK": r"^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$",
            "DE": r"^\d{5}$",
            "FR": r"^\d{5}$",
            "IT": r"^\d{5}$",
            "PT": r"^\d{5}$",
            "MEX": r"^\d{5}$",
            "CA": r"^[A-Z]\d[A-Z] ?\d[A-Z]\d$",
            "AU": r"^\d{4}$",
            "NZ": r"^\d{4}$",
            "ZA": r"^\d{4}$",
            "BR": r"^\d{5}-\d{3}$",
        }
        pattern = patterns.get(self._country_code, r"^\d{5}$")
        return bool(re.match(pattern, self._value))

    def to_primitive(self) -> str:
        return self._value
