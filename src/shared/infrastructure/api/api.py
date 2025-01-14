from typing import Dict, Any, Optional
import requests
from dataclasses import dataclass

@dataclass
class ApiAuth:
    username: str
    password: str

class Api:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def _request(self, config: Dict[str, Any]) -> Any:
        try:
            response = requests.request(**config)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            if error.response:
                raise error.response.json()
            raise error

    def get(self, path: str, headers: Dict[str, str] = None, auth: Optional[ApiAuth] = None) -> Any:
        config = {
            'method': 'GET',
            'url': f"{self.base_url}{path}",
            'headers': headers or {},
        }
        if auth:
            config['auth'] = (auth.username, auth.password)
        return self._request(config)

    def post(self, path: str, body: Dict[str, Any], headers: Dict[str, str] = None, auth: Optional[ApiAuth] = None) -> Any:
        config = {
            'method': 'POST',
            'url': f"{self.base_url}{path}",
            'json': body,
            'headers': headers or {},
        }
        if auth:
            config['auth'] = (auth.username, auth.password)
        return self._request(config)
