"""
Event Bus - Asynchronous communication system
"""

from typing import Callable, Dict, List, Any
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class Event:
    """Event structure"""

    type: str
    data: Dict[str, Any]
    timestamp: datetime
    source: str
    id: str = None

    def __post_init__(self):
        if self.id is None:
            self.id = f"{self.type}_{self.timestamp.timestamp()}"


class EventBus:
    """Event bus for asynchronous communication"""

    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.event_history: List[Event] = []
        self.max_history_size = 1000

    def subscribe(self, event_type: str, handler: Callable):
        """Subscribe to an event type"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []

        if handler not in self.subscribers[event_type]:
            self.subscribers[event_type].append(handler)
            logger.info(f"Handler subscribed to event type: {event_type}")

    def unsubscribe(self, event_type: str, handler: Callable):
        """Unsubscribe from an event type"""
        if event_type in self.subscribers and handler in self.subscribers[event_type]:
            self.subscribers[event_type].remove(handler)
            if not self.subscribers[event_type]:
                del self.subscribers[event_type]
            logger.info(f"Handler unsubscribed from event type: {event_type}")

    def publish(self, event_type: str, data: Dict[str, Any], source: str = "hexy-core"):
        """Publish an event"""
        event = Event(
            type=event_type, data=data, timestamp=datetime.now(), source=source
        )

        self.event_history.append(event)
        if len(self.event_history) > self.max_history_size:
            self.event_history.pop(0)

        if event_type in self.subscribers:
            for handler in self.subscribers[event_type]:
                try:
                    handler(event)
                except Exception as e:
                    logger.error(f"Error in event handler for {event_type}: {str(e)}")

        logger.debug(f"Event published: {event_type} from {source}")

    def get_subscribers(self, event_type: str) -> List[Callable]:
        """Get all subscribers for an event type"""
        return self.subscribers.get(event_type, [])

    def get_event_history(
        self, event_type: str = None, limit: int = 100
    ) -> List[Event]:
        """Get event history"""
        if event_type is None:
            return self.event_history[-limit:]

        filtered_events = [
            event for event in self.event_history if event.type == event_type
        ]
        return filtered_events[-limit:]

    def clear_history(self):
        """Clear event history"""
        self.event_history.clear()
        logger.info("Event history cleared")

    def get_statistics(self) -> Dict[str, Any]:
        """Get event bus statistics"""
        event_counts = {}
        for event in self.event_history:
            event_counts[event.type] = event_counts.get(event.type, 0) + 1

        return {
            "total_events": len(self.event_history),
            "event_types": len(self.subscribers),
            "subscribers": {
                event_type: len(handlers)
                for event_type, handlers in self.subscribers.items()
            },
            "event_counts": event_counts,
        }
