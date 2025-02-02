from abc import ABC, abstractmethod
from typing import Any, List, Dict


class DataSource(ABC):
    """
    Generic interface for connecting to a database.
    """

    @abstractmethod
    async def execute(self, query: str, *args: Any) -> None:
        pass

    @abstractmethod
    async def fetch_one(self, query: str, *args: Any) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def fetch(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        pass
