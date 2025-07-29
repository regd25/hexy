"""
Unit tests for event bus
"""
import pytest
from datetime import datetime

from src.events.event_bus import EventBus, Event


class TestEvent:
    """Test Event class"""
    
    def test_event_creation(self):
        """Test creating an event"""
        data = {"test": "data"}
        event = Event(
            type="test.event",
            data=data,
            timestamp=datetime.now(),
            source="test"
        )
        
        assert event.type == "test.event"
        assert event.data == data
        assert event.source == "test"
        assert event.id is not None
    
    def test_event_auto_id_generation(self):
        """Test automatic ID generation"""
        event = Event(
            type="test.event",
            data={},
            timestamp=datetime.now(),
            source="test"
        )
        
        assert event.id is not None
        assert event.id.startswith("test.event_")


class TestEventBus:
    """Test EventBus class"""
    
    def setup_method(self):
        """Setup method for each test"""
        self.event_bus = EventBus()
    
    def test_event_bus_initialization(self):
        """Test event bus initialization"""
        assert self.event_bus.subscribers == {}
        assert self.event_bus.event_history == []
        assert self.event_bus.max_history_size == 1000
    
    def test_subscribe_to_event(self):
        """Test subscribing to an event type"""
        handler = lambda event: None
        
        self.event_bus.subscribe("test.event", handler)
        
        assert "test.event" in self.event_bus.subscribers
        assert handler in self.event_bus.subscribers["test.event"]
    
    def test_subscribe_duplicate_handler(self):
        """Test subscribing the same handler multiple times"""
        handler = lambda event: None
        
        self.event_bus.subscribe("test.event", handler)
        self.event_bus.subscribe("test.event", handler)
        
        assert len(self.event_bus.subscribers["test.event"]) == 1
    
    def test_unsubscribe_from_event(self):
        """Test unsubscribing from an event type"""
        handler = lambda event: None
        
        self.event_bus.subscribe("test.event", handler)
        self.event_bus.unsubscribe("test.event", handler)
        
        assert "test.event" not in self.event_bus.subscribers
    
    def test_publish_event(self):
        """Test publishing an event"""
        received_events = []
        
        def handler(event):
            received_events.append(event)
        
        self.event_bus.subscribe("test.event", handler)
        self.event_bus.publish("test.event", {"test": "data"})
        
        assert len(received_events) == 1
        assert received_events[0].type == "test.event"
        assert received_events[0].data == {"test": "data"}
    
    def test_publish_event_no_subscribers(self):
        """Test publishing an event with no subscribers"""
        self.event_bus.publish("test.event", {"test": "data"})
        
        assert len(self.event_bus.event_history) == 1
    
    def test_event_history_management(self):
        """Test event history management"""
        for i in range(1005):
            self.event_bus.publish("test.event", {"index": i})
        
        assert len(self.event_bus.event_history) == 1000
        assert self.event_bus.event_history[0].data["index"] == 5
    
    def test_get_subscribers(self):
        """Test getting subscribers for an event type"""
        handler1 = lambda event: None
        handler2 = lambda event: None
        
        self.event_bus.subscribe("test.event", handler1)
        self.event_bus.subscribe("test.event", handler2)
        
        subscribers = self.event_bus.get_subscribers("test.event")
        
        assert len(subscribers) == 2
        assert handler1 in subscribers
        assert handler2 in subscribers
    
    def test_get_event_history(self):
        """Test getting event history"""
        self.event_bus.publish("event1", {"data": "1"})
        self.event_bus.publish("event2", {"data": "2"})
        self.event_bus.publish("event1", {"data": "3"})
        
        all_history = self.event_bus.get_event_history()
        assert len(all_history) == 3
        
        event1_history = self.event_bus.get_event_history("event1")
        assert len(event1_history) == 2
        
        limited_history = self.event_bus.get_event_history(limit=2)
        assert len(limited_history) == 2
    
    def test_clear_history(self):
        """Test clearing event history"""
        self.event_bus.publish("test.event", {"data": "test"})
        
        assert len(self.event_bus.event_history) == 1
        
        self.event_bus.clear_history()
        
        assert len(self.event_bus.event_history) == 0
    
    def test_get_statistics(self):
        """Test getting event bus statistics"""
        self.event_bus.subscribe("event1", lambda e: None)
        self.event_bus.subscribe("event2", lambda e: None)
        
        self.event_bus.publish("event1", {"data": "1"})
        self.event_bus.publish("event1", {"data": "2"})
        self.event_bus.publish("event2", {"data": "3"})
        
        stats = self.event_bus.get_statistics()
        
        assert stats["total_events"] == 3
        assert stats["event_types"] == 2
        assert stats["subscribers"]["event1"] == 1
        assert stats["subscribers"]["event2"] == 1
        assert stats["event_counts"]["event1"] == 2
        assert stats["event_counts"]["event2"] == 1
