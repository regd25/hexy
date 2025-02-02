"""
Adapters infrastructure module
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Generic, TypeVar
from ..api import RequestHandler, ResponseMapper, ErrorResponse

T = TypeVar("T")

@dataclass(frozen=True)
class Adapter(Generic[T], ABC):
    request_handler: RequestHandler = RequestHandler()
    response_mapper: ResponseMapper = ResponseMapper()

    @abstractmethod
    def _adapt(self, request: Any) -> Any:
        pass

    def validate(self, request: Any) -> Any:
        if not self.request_handler.validate(request):
            return self.response_mapper.to_http_response(
                ErrorResponse(status=400, message="Bad Request")
            )
        return self.response_mapper.to_http_response(request)
