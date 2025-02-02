from typing import Any, Dict, List
from src.shared.infrastructure.datasource.datasource import DataSource
import json


class InMemoryDataSource(DataSource):
    """
    InMemoryDataSource implementation
    """

    def __init__(self):
        self._data = {}

    async def execute(self, query: str, *args: Any) -> None:
        """
        Execute an operation
        """

        parts = query.split()
        command = parts[0].upper()  # e.g. 'INDEX' o 'DELETE'

        if command == "INDEX":
            index_name = parts[1]
            doc_id = parts[2]
            doc_body = json.loads(" ".join(parts[3:]))
            self._data[index_name][doc_id] = doc_body

        elif command == "DELETE":
            index_name = parts[1]
            doc_id = parts[2]
            del self._data[index_name][doc_id]

        else:
            raise ValueError(f"Invalid command: {command}")

    async def fetch_one(self, query: str, *args: Any) -> Dict[str, Any]:
        """
        Fetch a single document from InMemory
        query: "GET indexName docId"
        """
        parts = query.split()
        command = parts[0].upper()  # 'GET'
        if command == "GET":
            index_name = parts[1]
            doc_id = parts[2]
            return (
                self._data[index_name][doc_id] if doc_id in self._data[index_name] else {}
            )
        return {}

    async def fetch(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        """
        Fetch multiple documents from InMemory
        """
        parts = query.split()
        command = parts[0].upper()  # 'SEARCH'
        if command == "SEARCH":
            index_name = parts[1]
            return list(self._data[index_name].values())
        return []
