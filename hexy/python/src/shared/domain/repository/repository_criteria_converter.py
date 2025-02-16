from abc import ABC, abstractmethod
from ..criteria.criteria import Criteria


class RepositoryCriteriaConverter(ABC):

    @abstractmethod
    def convert(self, criteria: Criteria) -> str:
        pass
