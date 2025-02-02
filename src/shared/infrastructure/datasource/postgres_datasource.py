import asyncpg
from typing import Any, Dict, List
from src.shared.infrastructure.datasource.datasource import DataSource


class PostgresDataSource(DataSource):
    """
    PostgresDataSource implementation
    """

    def __init__(self, dsn: str):
        self._dsn = dsn
        self._conn = None

    async def _ensure_connection(self):
        if not self._conn:
            self._conn = await asyncpg.connect(self._dsn)

    async def execute(self, query: str, *args: Any) -> None:
        await self._ensure_connection()
        await self._conn.execute(query, *args)

    async def fetchrow(self, query: str, *args: Any) -> Dict[str, Any]:
        await self._ensure_connection()
        row = await self._conn.fetchrow(query, *args)
        return dict(row) if row else {}

    async def fetch(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        await self._ensure_connection()
        rows = await self._conn.fetch(query, *args)
        return [dict(r) for r in rows]
