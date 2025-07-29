"""
Unit tests for semantic engine
"""
import pytest
from unittest.mock import Mock, patch

from src.engine.semantic_engine import SemanticEngine
from src.events.event_bus import EventBus
from src.artifacts.foundational import Purpose, Context, Authority, Evaluation


class TestSemanticEngine:
    """Test SemanticEngine class"""
    
    def setup_method(self):
        """Setup method for each test"""
        self.event_bus = Mock(spec=EventBus)
        self.engine = SemanticEngine(self.event_bus)
    
    def test_engine_initialization(self):
        """Test semantic engine initialization"""
        assert self.engine.artifacts == {}
        assert self.engine.relationships == []
        assert self.engine.event_bus == self.event_bus
    
    def test_register_artifact(self):
        """Test registering an artifact"""
        purpose = Purpose(
            id="test-purpose",
            name="Test Purpose",
            description="A test purpose"
        )
        
        result = self.engine.register_artifact(purpose)
        
        assert result is True
        assert "test-purpose" in self.engine.artifacts
        assert self.engine.artifacts["test-purpose"] == purpose
        self.event_bus.publish.assert_called_once()
    
    def test_get_artifact(self):
        """Test getting an artifact by ID"""
        purpose = Purpose(
            id="test-purpose",
            name="Test Purpose"
        )
        
        self.engine.artifacts["test-purpose"] = purpose
        
        retrieved = self.engine.get_artifact("test-purpose")
        assert retrieved == purpose
        
        not_found = self.engine.get_artifact("non-existent")
        assert not_found is None
    
    def test_get_artifacts_by_type(self):
        """Test getting artifacts by type"""
        purpose = Purpose(id="p1", name="Purpose 1")
        context = Context(id="c1", name="Context 1")
        authority = Authority(id="a1", name="Authority 1")
        
        self.engine.artifacts = {
            "p1": purpose,
            "c1": context,
            "a1": authority
        }
        
        purposes = self.engine.get_artifacts_by_type(purpose.get_type())
        assert len(purposes) == 1
        assert purposes[0] == purpose
        
        contexts = self.engine.get_artifacts_by_type(context.get_type())
        assert len(contexts) == 1
        assert contexts[0] == context
    
    def test_update_artifact(self):
        """Test updating an artifact"""
        purpose = Purpose(
            id="test-purpose",
            name="Original Name",
            description="Original description"
        )
        
        self.engine.artifacts["test-purpose"] = purpose
        
        result = self.engine.update_artifact("test-purpose", name="Updated Name")
        
        assert result is True
        assert purpose.name == "Updated Name"
        self.event_bus.publish.assert_called()
    
    def test_update_nonexistent_artifact(self):
        """Test updating a non-existent artifact"""
        result = self.engine.update_artifact("non-existent", name="Updated")
        
        assert result is False
    
    def test_delete_artifact(self):
        """Test deleting an artifact"""
        purpose = Purpose(id="test-purpose", name="Test Purpose")
        self.engine.artifacts["test-purpose"] = purpose
        
        result = self.engine.delete_artifact("test-purpose")
        
        assert result is True
        assert "test-purpose" not in self.engine.artifacts
        self.event_bus.publish.assert_called()
    
    def test_delete_nonexistent_artifact(self):
        """Test deleting a non-existent artifact"""
        result = self.engine.delete_artifact("non-existent")
        
        assert result is False
    
    def test_find_semantic_matches(self):
        """Test semantic search functionality"""
        purpose = Purpose(id="p1", name="Test Purpose")
        context = Context(id="c1", name="Test Context")
        
        self.engine.artifacts = {"p1": purpose, "c1": context}
        
        results = self.engine.find_semantic_matches("test", limit=1)
        
        assert len(results) == 1
        assert results[0] in [purpose, context]
    
    def test_validate_coherence(self):
        """Test coherence validation"""
        purpose = Purpose(id="p1", name="Purpose 1")
        context = Context(id="c1", name="Context 1")
        
        self.engine.artifacts = {"p1": purpose, "c1": context}
        
        report = self.engine.validate_coherence()
        
        assert report["valid"] is True
        assert report["statistics"]["total_artifacts"] == 2
        assert "purpose" in report["statistics"]["by_type"]
        assert "context" in report["statistics"]["by_type"]
        assert report["statistics"]["by_type"]["purpose"] == 1
        assert report["statistics"]["by_type"]["context"] == 1
    
    def test_add_relationship(self):
        """Test adding relationships between artifacts"""
        purpose = Purpose(id="p1", name="Purpose 1")
        context = Context(id="c1", name="Context 1")
        
        self.engine.artifacts = {"p1": purpose, "c1": context}
        
        self.engine.add_relationship("p1", "c1", "references")
        
        assert len(self.engine.relationships) == 1
        relationship = self.engine.relationships[0]
        assert relationship["source"] == "p1"
        assert relationship["target"] == "c1"
        assert relationship["type"] == "references"
    
    def test_add_invalid_relationship(self):
        """Test adding invalid relationships"""
        purpose = Purpose(id="p1", name="Purpose 1")
        self.engine.artifacts = {"p1": purpose}
        
        self.engine.add_relationship("p1", "non-existent", "references")
        
        assert len(self.engine.relationships) == 0
    
    def test_validate_relationship(self):
        """Test relationship validation"""
        purpose = Purpose(id="p1", name="Purpose 1")
        context = Context(id="c1", name="Context 1")
        
        self.engine.artifacts = {"p1": purpose, "c1": context}
        
        valid_relationship = {"source": "p1", "target": "c1", "type": "references"}
        invalid_relationship = {"source": "p1", "target": "non-existent", "type": "references"}
        
        assert self.engine._validate_relationship(valid_relationship) is True
        assert self.engine._validate_relationship(invalid_relationship) is False
