from typing import Union, List
from src.shared.domain.value_object import StringValueObject


class OrderBy(StringValueObject):
    def __init__(self, value: Union[str, List[str]]):
        if isinstance(value, list):
            value = ",".join(value)
        super().__init__(value)
