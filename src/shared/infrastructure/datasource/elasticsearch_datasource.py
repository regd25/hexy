from typing import Any, List, Dict
from elasticsearch import AsyncElasticsearch
from src.shared.infrastructure.datasource.datasource import DataSource
import json


class ElasticsearchDataSource(DataSource):
    """
    Elasticsearch DataSource implementation
    """

    def __init__(self, hosts: List[str], user: str, password: str):
        self._es = AsyncElasticsearch(hosts=hosts, http_auth=(user, password))

    async def execute(self, query: str, *args: Any) -> None:
        """
        Execute an Elasticsearch operation
        query: DSL query "INDEX indexName docId {...json...}"
        """
        parts = query.split()
        command = parts[0].upper()  # e.g. 'INDEX' o 'DELETE'

        if command == "INDEX":
            index_name = parts[1]
            doc_id = parts[2]
            doc_body = json.loads(" ".join(parts[3:]))

            await self._es.index(index=index_name, id=doc_id, document=doc_body)

        elif command == "DELETE":
            index_name = parts[1]
            doc_id = parts[2]
            await self._es.delete(index=index_name, id=doc_id)

    async def fetch_one(self, query: str, *args: Any) -> Dict[str, Any]:
        """
        Fetch a single document from Elasticsearch
        query: "GET indexName docId"
        """
        parts = query.split()
        command = parts[0].upper()  # 'GET'
        if command == "GET":
            index_name = parts[1]
            doc_id = parts[2]
            response = await self._es.get(index=index_name, id=doc_id)
            return (
                response["_source"] if "found" in response and response["found"] else {}
            )
        return {}

    async def fetch(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        """
        Fetch multiple documents from Elasticsearch
        query: "SEARCH indexName {'query': {...}}"
        """
        parts = query.split(maxsplit=2)
        command = parts[0].upper()  # 'SEARCH'
        if command == "SEARCH":
            index_name = parts[1]

            body = json.loads(parts[2])
            response = await self._es.search(index=index_name, body=body)
            hits = response.get("hits", {}).get("hits", [])
            return [hit["_source"] for hit in hits]
        return []
