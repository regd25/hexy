from typing import Union, List
from src.shared.domain.value_object import StringValueObject



class FilterValue(StringValueObject):
    def __init__(self, value: Union[None, str, bool, List[str]]):
        if isinstance(value, bool):
            value = str(value)
        if isinstance(value, list):
            value = ",".join(value)
        if value is None:
            value = "NULL"

        super().__init__(value)

    @classmethod
    def null(cls) -> "FilterValue":
        return cls("NULL")
