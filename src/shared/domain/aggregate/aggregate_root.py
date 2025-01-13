from abc import ABC
from typing import List
from dataclasses import dataclass, field
from ..event.domain_event import DomainEvent


@dataclass
class AggregateRoot(ABC):
    _domain_events: List[DomainEvent] = field(default_factory=list)

    @property
    def domain_events(self) -> List[DomainEvent]:
        return self._domain_events.copy()

    def get_domain_events(self) -> List[DomainEvent]:
        domain_events = self._domain_events.copy()
        self._domain_events = []
        return domain_events

    def add_domain_event(self, event: DomainEvent) -> None:
        self._domain_events.append(event)

    def clear_domain_events(self) -> None:
        self._domain_events = []

    def to_primitives(self) -> dict:
        raise NotImplementedError("Subclasses must implement to_primitives()")
