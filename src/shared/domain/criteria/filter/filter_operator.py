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
    CONTAINS = "CONTAINS"
    IN = "IN"
    GTE = ">="
    LTE = "<="
    BEGINS_WITH = "BEGINS_WITH"
    LIKE = "LIKE"
    NOT_LIKE = "NOT LIKE"
    NOT_IN = "NOT IN"

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
    def not_like(cls) -> "FilterOperator":
        """Create a NOT LIKE operator."""
        return cls.create(Operator.NOT_LIKE.value)

    @classmethod
    def contains(cls) -> "FilterOperator":
        """Create an IN operator."""
        return cls.create(Operator.CONTAINS.value)

    @classmethod
    def greater_than_or_equal(cls) -> "FilterOperator":
        """Create a GTE operator."""
        return cls.create(Operator.GTE.value)

    @classmethod
    def less_than_or_equal(cls) -> "FilterOperator":
        """Create a LTE operator."""
        return cls.create(Operator.LTE.value)

    @classmethod
    def less_than(cls) -> "FilterOperator":
        """Create a LT operator."""
        return cls.create(Operator.LT.value)

    @classmethod
    def begins_with(cls) -> "FilterOperator":
        """Create a BEGINS_WITH operator."""
        return cls.create(Operator.BEGINS_WITH.value)

    @classmethod
    def greater_than(cls) -> "FilterOperator":
        """Create a GT operator."""
        return cls.create(Operator.GT.value)

    @classmethod
    def includes(cls) -> "FilterOperator":
        """Create an IN operator."""
        return cls.create(Operator.IN.value)

    @classmethod
    def not_includes(cls) -> "FilterOperator":
        """Create a NOT_IN operator."""
        return cls.create(Operator.NOT_IN.value)
