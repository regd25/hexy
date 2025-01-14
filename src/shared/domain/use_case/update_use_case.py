from typing import TypeVar, Generic
from .use_case import UseCase

T = TypeVar("T")


class UpdateUseCase(UseCase[T], Generic[T]):
    """Base abstract class for updating entities"""

    pass
