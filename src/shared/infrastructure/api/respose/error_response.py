from typing import Any, Union

from attr import dataclass


@dataclass(frozen=True)
class ErrorResponse:
    body: Any = None
    status: int = Union[400, 401, 403, 404, 500]
    message: str = "Error"

    def __post_init__(self):
        if self.status not in [400, 401, 403, 404, 500]:
            raise ValueError("Invalid status code")

        if self.status == 500:
            self.message = "Internal Server Error"

        if not self.message:
            self.message = ""
