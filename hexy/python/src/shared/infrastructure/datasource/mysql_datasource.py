import aiomysql
from typing import Any, Dict, List
from src.shared.infrastructure.datasource.datasource import DataSource


class MySQLDataSource(DataSource):
    """
    MySQLDataSource implementation
    """

    def __init__(self, host: str, user: str, password: str, db: str):
        self._host = host
        self._user = user
        self._password = password
        self._db = db
        self._conn = None

    async def _ensure_connection(self):
        if not self._conn:
            self._conn = await aiomysql.connect(
                host=self._host, user=self._user, password=self._password, db=self._db
            )

    async def execute(self, query: str, *args: Any) -> None:
        await self._ensure_connection()
        async with self._conn.cursor() as cur:
            await cur.execute(query, args)
            await self._conn.commit()

    async def fetchrow(self, query: str, *args: Any) -> Dict[str, Any]:
        await self._ensure_connection()
        async with self._conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(query, args)
            return await cur.fetchone()

    async def fetch(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        await self._ensure_connection()
        async with self._conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(query, args)
            return await cur.fetchall()
