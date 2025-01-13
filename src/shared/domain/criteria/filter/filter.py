from dataclasses import dataclass
from typing import Dict
from ..value_object import InvalidArgumentError
from .filter_field import FilterField
from .filter_operator import FilterOperator
from .filter_value import FilterValue


@dataclass
class Filter:
    field: FilterField
    operator: FilterOperator
    value: FilterValue

    @classmethod
    def from_values(cls, values: Dict[str, str]) -> "Filter":
        field = values.get("field")
        operator = values.get("operator")
        value = values.get("value")

        if not all([field, operator, value]):
            raise InvalidArgumentError("El filtro es inválido")

        return cls(
            FilterField(field), FilterOperator.from_value(operator), FilterValue(value)
        )

    def get_value(self) -> str:
        return self.value.value
