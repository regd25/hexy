from enum import Enum
from ..value_object import EnumValueObject, InvalidArgumentError


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
            raise InvalidArgumentError(f"El tipo de orden {value} es inválido")

    def is_none(self) -> bool:
        return self.value == OrderTypes.NONE

    def is_asc(self) -> bool:
        return self.value == OrderTypes.ASC

    def _throw_error_for_invalid_value(self, value: str) -> None:
        raise InvalidArgumentError(f"El tipo de orden {value} es inválido")
