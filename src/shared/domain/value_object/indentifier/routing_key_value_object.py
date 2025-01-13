import re

from ..primitive import StringValueObject
from ..invalid_argument_exception import InvalidArgumentException


class RoutingKeyValueObject(StringValueObject):
    def __init__(self, context: str, aggregate: str, event: str):
        super().__init__(f"{context}_{aggregate}_{event}")
        self.context = context
        self.aggregate = aggregate
        self.event = event
        self._ensure_is_valid()

    def _ensure_is_valid(self) -> None:
        if not all([self.context, self.aggregate, self.event]):
            raise InvalidArgumentException(
                field="routing_key",
                value=self._value,
                message="Routing key is invalid",
            )

        pattern = r"^([a-z]+(-[a-z]+)*)$"
        if not all(
            re.match(pattern, part)
            for part in [self.context, self.aggregate, self.event]
        ):
            raise InvalidArgumentException(
                field="routing_key",
                value=self._value,
                message="Routing key must be lowercase with optional hyphen-separated words",
            )

    @classmethod
    def from_value(cls, value: str) -> "RoutingKeyValueObject":
        context, aggregate, event = value.split("_")
        return cls(context, aggregate, event)
