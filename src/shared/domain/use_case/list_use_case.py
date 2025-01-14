from typing import TypeVar, Generic, List
from .use_case import UseCase

T = TypeVar("T")


class ListUseCase(UseCase[List[T]], Generic[T]):
    """Base abstract class for retrieving multiple entities"""

    pass
