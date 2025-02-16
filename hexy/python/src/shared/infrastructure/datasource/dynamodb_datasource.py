from .datasource import DataSource
from boto3 import Session
from typing import Any, Dict, List


class DynamoDBDataSource(DataSource):
    """
    DynamoDBDataSource implementation
    """

    def __init__(
        self,
        table_name: str,
        region_name: str,
        aws_access_key_id: str,
        aws_secret_access_key: str,
    ):
        self._table_name = table_name
        self._region_name = region_name
        self._aws_access_key_id = aws_access_key_id
        self._aws_secret_access_key = aws_secret_access_key

    async def execute(self, query: str, *args: Any) -> None:
        """
        Execute an operation
        query: "INDEX key value"
        """
        parts = query.split()
        command = parts[0].upper()  # e.g. 'INDEX' o 'DELETE'

        if command == "INDEX":
            key = parts[1]
            value = parts[2]

            item = {"key": key, "value": value}
        elif command == "DELETE":
            key = parts[1]

            item = {"key": key}
        else:
            raise ValueError(f"Invalid command: {command}")

        session = Session(
            aws_access_key_id=self._aws_access_key_id,
            aws_secret_access_key=self._aws_secret_access_key,
            region_name=self._region_name,
        )
        dynamodb = session.resource("dynamodb")
        table = dynamodb.Table(self._table_name)
        table.put_item(Item=item)

    async def fetch_one(self, query: str, *args: Any) -> Dict[str, Any]:
        """
        Fetch a single document from DynamoDB
        query: "GET key"
        """
        parts = query.split()
        key = parts[1]

        session = Session(
            aws_access_key_id=self._aws_access_key_id,
            aws_secret_access_key=self._aws_secret_access_key,
            region_name=self._region_name,
        )
        dynamodb = session.resource("dynamodb")
        table = dynamodb.Table(self._table_name)
        response = table.get_item(Key=key)
        return response["Item"]

    async def fetch(self, query: str, *args: Any) -> List[Dict[str, Any]]:
        """
        Fetch all documents from DynamoDB
        """

        parts = query.split()
        command = parts[0].upper()  # e.g. 'SEARCH'

        if command == "SEARCH":
            criteria = parts[1]
            

        session = Session(
            aws_access_key_id=self._aws_access_key_id,
            aws_secret_access_key=self._aws_secret_access_key,
            region_name=self._region_name,
        )

        dynamodb = session.resource("dynamodb")
        table = dynamodb.Table(self._table_name)
        response = table.scan(
            FilterEx
        )
        return response["Items"]
