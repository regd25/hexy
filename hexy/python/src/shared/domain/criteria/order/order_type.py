from enum import Enum
from ..invalid_criteria_exception import InvalidCriteriaException
from src.shared.domain.value_object import EnumValueObject


class OrderTypes(str, Enum):
    ASC = "ASC"
    DESC = "DESC"
    NONE = "NONE"


class OrderType(EnumValueObject):
    def __init__(self, value: OrderTypes):
        super().__init__(value, [e.value for e in OrderTypes])

    @classmethod
    def from_value(cls, value: str) -> "OrderType":
        if value == OrderTypes.ASC:
            return cls(OrderTypes.ASC)
        elif value == OrderTypes.DESC:
            return cls(OrderTypes.DESC)
        else:
            raise InvalidCriteriaException(
                message="Invalid order type",
                parameter="order_type",
                value=value,
            )

    def is_none(self) -> bool:
        return str(self) == OrderTypes.NONE.value

    def is_asc(self) -> bool:
        return str(self) == OrderTypes.ASC

    def _throw_error_for_invalid_value(self, value: str) -> None:
        raise InvalidCriteriaException()(
            message="Invalid order type",
            parameter="order_type",
            value=value,
        )
