from datetime import datetime
from typing import Dict, Any
from ..value_object import UuidValueObject, RoutingKey


class DomainEvent:
    ROUTING_KEY: RoutingKey = None

    def __init__(
        self,
        routing_key: RoutingKey,
        body: Dict[str, Any],
        event_id: str = None,
        occurred_on: datetime = None,
    ):
        self.routing_key = routing_key
        self.event_id = event_id or str(UuidValueObject.create())
        self.occurred_on = occurred_on or datetime.now()
        self.body = body

    @classmethod
    def get_routing_key(cls) -> str:
        return cls.ROUTING_KEY.value if cls.ROUTING_KEY else None

    def to_primitives(self) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement to_primitives()")
