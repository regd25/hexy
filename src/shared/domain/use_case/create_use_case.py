from typing import TypeVar, Generic
from .use_case import UseCase

T = TypeVar("T")


class CreateUseCase(UseCase[T], Generic[T]):
    """Base abstract class for creating entities"""

    pass
