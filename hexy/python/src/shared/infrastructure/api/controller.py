from typing import Any, Dict
from src.shared.domain.use_case import UseCase

class Controller:
    """Controller class to handle routes and delegate logic to UseCases"""

    def __init__(self, use_cases: Dict[str, UseCase]) -> None:
        self._use_cases = use_cases

    def handle_request(self, route: str, request_data: Any) -> Any:
        """Handle incoming requests and delegate to the appropriate UseCase

        Args:
            route: The route of the request
            request_data: The data associated with the request

        Returns:
            The response from the UseCase
        """
        if route not in self._use_cases:
            raise ValueError(f"No UseCase registered for route: {route}")
        use_case = self._use_cases[route]
        return use_case.execute(request_data)
