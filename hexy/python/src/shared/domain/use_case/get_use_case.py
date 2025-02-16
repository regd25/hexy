from typing import TypeVar, Generic
from .use_case import UseCase

T = TypeVar("T")


class GetUseCase(UseCase[T], Generic[T]):
    """Base abstract class for retrieving a single entity"""

    pass
