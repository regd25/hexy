from dataclasses import dataclass
from urllib.parse import urlparse

from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class UrlValueObject(StringValueObject):
    """A value object that represents a URL."""

    _value: str

    def __post_init__(self) -> None:
        try:
            result = urlparse(self._value)
            if not all([result.scheme, result.netloc]):
                raise ValueError("Invalid URL format")
        except Exception as e:
            raise InvalidArgumentException(
                field="url", value=self._value, message="Invalid URL format"
            ) from e

    @property
    def domain(self) -> str:
        """Get the domain part of the URL."""
        return urlparse(self._value).netloc

    @property
    def scheme(self) -> str:
        """Get the scheme (protocol) of the URL."""
        return urlparse(self._value).scheme

    def to_primitive(self) -> str:
        return self._value
