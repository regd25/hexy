"""Filter Operator Value Object Module."""

from enum import Enum

from src.shared.domain.criteria.invalid_criteria_exception import (
    InvalidCriteriaException,
)
from src.shared.domain.value_object.primitive import EnumValueObject


class Operator(str, Enum):
    """Filter Operator Enum."""

    EQUAL = "="
    NOT_EQUAL = "!="
    GT = ">"
    LT = "<"
    LIKE = "LIKE"
    LLU = "LLU"  # lower and unaccent case
    IN = "IN"
    GTE = ">="
    LTE = "<="
    ARR_IN = "&&"


class FilterOperator(EnumValueObject):
    """Filter Operator Value Object."""

    @staticmethod
    def create(value: str) -> "FilterOperator":
        """Create a new FilterOperator."""
        if value not in [e.value for e in Operator]:
            raise InvalidCriteriaException.create_invalid_field(
                field=value,
                valid_fields=[e.value for e in Operator],
            )
        return FilterOperator(_value=value)

    def is_positive(self) -> bool:
        """Check if the operator is positive."""
        return self._value != Operator.NOT_EQUAL.value

    @classmethod
    def not_equal(cls) -> "FilterOperator":
        """Create a NOT_EQUAL operator."""
        return cls.create(Operator.NOT_EQUAL.value)

    @classmethod
    def equal(cls) -> "FilterOperator":
        """Create an EQUAL operator."""
        return cls.create(Operator.EQUAL.value)

    @classmethod
    def like(cls) -> "FilterOperator":
        """Create a LIKE operator."""
        return cls.create(Operator.LIKE.value)

    @classmethod
    def llu(cls) -> "FilterOperator":
        """Create a LLU operator."""
        return cls.create(Operator.LLU.value)

    @classmethod
    def in_(cls) -> "FilterOperator":
        """Create an IN operator."""
        return cls.create(Operator.IN.value)

    @classmethod
    def gte(cls) -> "FilterOperator":
        """Create a GTE operator."""
        return cls.create(Operator.GTE.value)

    @classmethod
    def lte(cls) -> "FilterOperator":
        """Create a LTE operator."""
        return cls.create(Operator.LTE.value)

    @classmethod
    def arr_in(cls) -> "FilterOperator":
        """Create an ARR_IN operator."""
        return cls.create(Operator.ARR_IN.value)
