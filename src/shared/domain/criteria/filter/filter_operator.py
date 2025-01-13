from enum import Enum
from src.shared.domain.criteria.exception.invalid_criteria_exception import InvalidCriteriaException
from src.shared.domain.value_object import EnumValueObject

class Operator(str, Enum):
    EQUAL = '='
    NOT_EQUAL = '!='
    GT = '>'
    LT = '<'
    LIKE = 'LIKE'
    LLU = 'LLU'  # lower and unaccent case
    IN = 'IN'
    GTE = '>='
    LTE = '<='
    ARR_IN = '&&'

class FilterOperator(EnumValueObject):
    def __init__(self, value: Operator):
        super().__init__(value, [e.value for e in Operator])

    @classmethod
    def from_value(cls, value: str) -> 'FilterOperator':
        if value not in [e.value for e in Operator]:
            raise Inval

    def is_positive(self) -> bool:
        return self.value != Operator.NOT_EQUAL

    def _throw_error_for_invalid_value(self, value: str) -> None:
        raise InvalidCriteriaException(f"El operador de filtro {value} es inválido")

    @classmethod
    def not_equal(cls) -> 'FilterOperator':
        return cls.from_value(Operator.NOT_EQUAL)

    @classmethod
    def equal(cls) -> 'FilterOperator':
        return cls.from_value(Operator.EQUAL)

    @classmethod
    def like(cls) -> 'FilterOperator':
        return cls.from_value(Operator.LIKE)

    @classmethod
    def llu(cls) -> 'FilterOperator':
        return cls.from_value(Operator.LLU)

    @classmethod
    def in_(cls) -> 'FilterOperator':
        return cls.from_value(Operator.IN)

    @classmethod
    def gte(cls) -> 'FilterOperator':
        return cls.from_value(Operator.GTE)

    @classmethod
    def lte(cls) -> 'FilterOperator':
        return cls.from_value(Operator.LTE)

    @classmethod
    def arr_in(cls) -> 'FilterOperator':
        return cls.from_value(Operator.ARR_IN) 