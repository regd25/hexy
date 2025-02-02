from typing import Any, Dict
from jsonschema import validate as json_validate, ValidationError


class RequestHandler:
    """Class to validate and parse incoming requests"""

    def validate(self, request_data: Dict[str, Any], schema: Dict[str, Any]) -> bool:
        """Validate the incoming request data

        Args:
            request_data: The data to validate

        Returns:
            True if the data is valid, False otherwise
        """
        try:
            json_validate(instance=request_data, schema=schema)
            return True
        except ValidationError:
            return False

    def parse(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse the incoming request data

        Args:
            request_data: The data to parse

        Returns:
            Parsed data
        """
        return request_data
