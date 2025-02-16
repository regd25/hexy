from dataclasses import dataclass
import re
import hashlib
from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException


@dataclass(frozen=True)
class HashValueObject(StringValueObject):
    """A value object that represents a hash value."""

    _value: str
    _algorithm: str = "sha256"

    def __post_init__(self) -> None:
        if not self._is_valid_hash():
            raise InvalidArgumentException(
                field="hash",
                value=self._value,
                message=f"Invalid hash format for algorithm {self._algorithm}",
            )

    def _is_valid_hash(self) -> bool:
        patterns = {
            "md5": r"^[a-f0-9]{32}$",
            "sha1": r"^[a-f0-9]{40}$",
            "sha256": r"^[a-f0-9]{64}$",
            "sha512": r"^[a-f0-9]{128}$",
        }
        pattern = patterns.get(self._algorithm.lower())
        if not pattern:
            raise InvalidArgumentException(
                field="algorithm",
                value=self._algorithm,
                message="Unsupported hash algorithm",
            )
        return bool(re.match(pattern, self._value.lower()))

    @classmethod
    def create(cls, value: str, algorithm: str = "sha256") -> "HashValueObject":
        """Create a hash from a plain text value."""
        if not algorithm in hashlib.algorithms_available:
            raise InvalidArgumentException(
                field="algorithm", value=algorithm, message="Unsupported hash algorithm"
            )
        hashed = hashlib.new(algorithm.lower(), value.encode()).hexdigest()
        return cls(hashed, algorithm)

    def to_primitive(self) -> str:
        return self._value
