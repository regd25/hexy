from typing import Any, Union

from .respose import ErrorResponse, SuccessResponse


class ResponseMapper:
    """Class to convert domain objects into HTTP responses"""

    def to_http_response(
        self, domain_object: Any
    ) -> Union[SuccessResponse, ErrorResponse]:
        """Convert a domain object into an HTTP response

        Args:
            domain_object: The domain object to convert

        Returns:
            A dictionary representing the HTTP response
        """
        return SuccessResponse(body=domain_object, status=200)
