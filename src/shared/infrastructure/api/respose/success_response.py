from typing import Any, Union
from attr import dataclass


@dataclass(frozen=True)
class SuccessResponse:
    body: Any
    status: int = Union[200, 201]
    message: str = "Success"
