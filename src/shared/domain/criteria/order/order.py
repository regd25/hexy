from dataclasses import dataclass
from typing import Optional, List
from ..value_object import InvalidArgumentError
from .order_by import OrderBy
from .order_type import OrderType, OrderTypes


@dataclass
class Order:
    order_by: OrderBy
    order_type: OrderType

    def __init__(
        self,
        order_by: OrderBy,
        order_type: OrderType,
        valid_order_by_fields: Optional[List[str]] = None,
    ):
        self.order_by = order_by
        self.order_type = order_type

        if valid_order_by_fields:
            self._validate_order_by(valid_order_by_fields)

    def _validate_order_by(self, valid_order_by_fields: List[str]) -> None:
        order_by_values = self.order_by.value.split(",")
        if not all(field in valid_order_by_fields for field in order_by_values):
            raise InvalidArgumentError(
                f"Campo de ordenamiento inválido: {self.order_by.value}"
            )

    @classmethod
    def from_values(
        cls,
        order_by: Optional[str] = None,
        order_type: Optional[str] = None,
        valid_order_by_fields: Optional[List[str]] = None,
    ) -> "Order":
        if not order_by:
            return cls.none()

        return cls(
            OrderBy(order_by),
            OrderType.from_value(order_type or OrderTypes.ASC.value),
            valid_order_by_fields,
        )

    @classmethod
    def none(cls) -> "Order":
        return cls(OrderBy(""), OrderType(OrderTypes.NONE))

    @classmethod
    def desc(cls, order_by: str) -> "Order":
        return cls(OrderBy(order_by), OrderType(OrderTypes.DESC))

    @classmethod
    def asc(cls, order_by: str) -> "Order":
        return cls(OrderBy(order_by), OrderType(OrderTypes.ASC))

    def has_order(self) -> bool:
        return not self.order_type.is_none()
