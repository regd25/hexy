"""Filepath Value Object Module."""

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Union

from ..invalid_argument_exception import InvalidArgumentException
from ..value_object import ValueObject


@dataclass(frozen=True)
class FilepathValueObject(ValueObject):
    """Filepath Value Object."""

    _value: Path

    def __post_init__(self) -> None:
        """Post init validation."""
        if not isinstance(self._value, Path):
            raise InvalidArgumentException("Filepath must be a Path object")

    @staticmethod
    def create(value: Union[str, Path]) -> "FilepathValueObject":
        """Create a new FilepathValueObject."""
        if isinstance(value, str):
            path = Path(value)
        else:
            path = value
        return FilepathValueObject(path)

    def __str__(self) -> str:
        """String representation."""
        return str(self._value)

    def __eq__(self, other: Any) -> bool:
        """Compare with another value object."""
        if not isinstance(other, FilepathValueObject):
            return False
        return os.path.normpath(str(self._value)) == os.path.normpath(str(other._value))

    def to_primitive(self) -> str:
        """Convert to primitive type."""
        return str(self._value)


    def exists(self) -> bool:
        """Check if the file exists."""
        return self._value.exists()

    def is_file(self) -> bool:
        """Check if the path is a file."""
        return self._value.is_file()

    def is_dir(self) -> bool:
        """Check if the path is a directory."""
        return self._value.is_dir()

    def extension(self) -> str:
        """Get the file extension."""
        return self._value.suffix

    def name(self) -> str:
        """Get the file name without extension."""
        return self._value.stem

    def parent(self) -> "FilepathValueObject":
        """Get the parent directory."""
        return FilepathValueObject.create(self._value.parent)
