from dataclasses import dataclass
from typing import Optional


@dataclass
class SnsConfig:
    topic_arn: str
    region: str
    access_key_id: Optional[str] = None
    secret_access_key: Optional[str] = None
