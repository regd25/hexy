import json
from typing import Any, Dict, List
from src.shared.infrastructure.datasource.datasource import DataSource
import redis


class RedisDataSource(DataSource):
    """
    Redis DataSource implementation
    """

    def __init__(self, host: str, port: int, db: int):
        self._redis = redis.Redis(host=host, port=port, db=db)

    async def execute(self, query: str, *args: Any) -> None:
        """
        Execute a Redis operation
        """
        parts = query.split()
        command = parts[0].upper()  # e.g. 'SET' or 'GET'

        if command == "SET":
            key = parts[1]
            value = json.dumps(parts[2])
            self._redis.set(key, value)
        elif command == "GET":
            key = parts[1]
            return self._redis.get(key)
        else:
            raise ValueError(f"Invalid command: {command}")

    async def fetch_one(self, query: str, *args: Any) -> Dict[str, Any]:
        """
        Fetch a single document from Redis
        """
        parts = query.split()
        command = parts[0].upper()  # 'GET'
        if command == "GET":
            key = parts[1]
            return self._redis.get(key)
        else:
            raise ValueError(f"Invalid command: {command}")

    async def fetch(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        """
        Fetch all documents from Redis
        """
        parts = query.split()
        command = parts[0].upper()  # 'SEARCH'
        if command == "SEARCH":
            return self._redis.keys(parts[1])
        raise ValueError(f"Invalid command: {command}")
