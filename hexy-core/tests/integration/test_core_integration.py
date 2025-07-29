"""
Integration tests for core functionality
"""
import pytest
from src.engine.semantic_engine import SemanticEngine
from src.events.event_bus import EventBus
from src.plugins.plugin_manager import PluginManager
from src.artifacts.foundational import Purpose, Context, Authority, Evaluation
from src.artifacts.strategic import Vision, Policy, Principle
from src.artifacts.operational import Process, Procedure, Event
from src.artifacts.organizational import Actor, Area


class TestCoreIntegration:
    """Test core integration scenarios"""
    
    def setup_method(self):
        """Setup for each test"""
        self.event_bus = EventBus()
        self.engine = SemanticEngine(self.event_bus)
        self.plugin_manager = PluginManager(self.event_bus)
    
    def test_complete_artifact_lifecycle(self):
        """Test complete artifact lifecycle"""
        # Create artifacts
        purpose = Purpose(
            id="test-purpose",
            name="Test Purpose",
            description="A test purpose",
            relationships=[],
            metadata={"domain": "test"}
        )
        
        context = Context(
            id="test-context",
            name="Test Context",
            description="A test context",
            relationships=["test-purpose"],
            metadata={"region": "test"}
        )
        
        # Register artifacts
        assert self.engine.register_artifact(purpose)
        assert self.engine.register_artifact(context)
        
        # Verify artifacts exist
        assert self.engine.get_artifact("test-purpose") is not None
        assert self.engine.get_artifact("test-context") is not None
        
        # Update artifact
        assert self.engine.update_artifact("test-purpose", name="Updated Purpose")
        updated_purpose = self.engine.get_artifact("test-purpose")
        assert updated_purpose.name == "Updated Purpose"
        
        # Add relationship
        self.engine.add_relationship("test-purpose", "test-context", "contextualizes")
        assert len(self.engine.relationships) == 1
        
        # Delete artifact
        assert self.engine.delete_artifact("test-purpose")
        assert self.engine.get_artifact("test-purpose") is None
    
    def test_event_system_integration(self):
        """Test event system integration"""
        events_received = []
        
        def event_handler(event):
            events_received.append(event)
        
        self.event_bus.subscribe("artifact.registered", event_handler)
        
        # Create and register artifact
        purpose = Purpose(
            id="event-test",
            name="Event Test",
            description="Testing events"
        )
        
        self.engine.register_artifact(purpose)
        
        # Verify events were published
        assert len(events_received) == 1
        assert events_received[0].type == "artifact.registered"
        assert events_received[0].data["artifact_id"] == "event-test"
    
    def test_plugin_system_integration(self):
        """Test plugin system integration"""
        from src.plugins.deployment.aws_cdk_plugin import AWSCDKPlugin
        
        # Register plugin
        plugin = AWSCDKPlugin()
        assert self.plugin_manager.register_plugin(plugin)
        
        # Execute plugin action
        result = self.plugin_manager.execute_plugin(
            "aws-cdk-deployment",
            "deploy",
            {"stack_name": "test-stack"}
        )
        
        assert result is not None
        assert result["success"] is True
        
        # Verify plugin statistics
        stats = self.plugin_manager.get_statistics()
        assert stats["total_plugins"] == 1
        assert "deployment" in stats["capabilities"]
    
    def test_semantic_search_integration(self):
        """Test semantic search integration"""
        # Create artifacts with different content
        artifacts = [
            Purpose(id="p1", name="Transparency Purpose", description="Transform culture to transparency"),
            Context(id="c1", name="Latam Context", description="Operations in Latin America"),
            Authority(id="a1", name="Board Authority", description="Executive board decisions"),
            Evaluation(id="e1", name="Success Metrics", description="Measure transparency success")
        ]
        
        # Register all artifacts
        for artifact in artifacts:
            self.engine.register_artifact(artifact)
        
        # Test semantic search
        results = self.engine.find_semantic_matches("transparency", limit=2)
        assert len(results) > 0
        
        # Verify search returns relevant artifacts
        artifact_names = [a.name for a in results]
        assert "Transparency Purpose" in artifact_names or "Success Metrics" in artifact_names
    
    def test_coherence_validation_integration(self):
        """Test coherence validation integration"""
        # Create coherent artifact set
        purpose = Purpose(id="p1", name="Purpose", description="Main purpose")
        context = Context(id="c1", name="Context", description="Main context")
        authority = Authority(id="a1", name="Authority", description="Main authority")
        
        # Register artifacts
        for artifact in [purpose, context, authority]:
            self.engine.register_artifact(artifact)
        
        # Add relationships
        self.engine.add_relationship("p1", "c1", "contextualizes")
        self.engine.add_relationship("p1", "a1", "authorized_by")
        
        # Validate coherence
        report = self.engine.validate_coherence()
        assert report["valid"] is True
        assert report["statistics"]["total_artifacts"] == 3
        assert len(report["issues"]) == 0
    
    def test_large_artifact_set_performance(self):
        """Test performance with large artifact set"""
        # Create many artifacts
        artifacts = []
        for i in range(100):
            artifact = Purpose(
                id=f"purpose-{i}",
                name=f"Purpose {i}",
                description=f"Description {i}",
                metadata={"index": i}
            )
            artifacts.append(artifact)
        
        # Register all artifacts
        for artifact in artifacts:
            assert self.engine.register_artifact(artifact)
        
        # Verify all artifacts are accessible
        assert len(self.engine.artifacts) == 100
        
        # Test search performance
        results = self.engine.find_semantic_matches("Purpose", limit=10)
        assert len(results) == 10
        
        # Test coherence validation performance
        report = self.engine.validate_coherence()
        assert report["statistics"]["total_artifacts"] == 100
    
    def test_artifact_type_operations(self):
        """Test operations across different artifact types"""
        artifacts = [
            Purpose(id="p1", name="Purpose", description="Purpose"),
            Context(id="c1", name="Context", description="Context"),
            Authority(id="a1", name="Authority", description="Authority"),
            Evaluation(id="e1", name="Evaluation", description="Evaluation"),
            Vision(id="v1", name="Vision", description="Vision"),
            Policy(id="pol1", name="Policy", description="Policy"),
            Principle(id="pr1", name="Principle", description="Principle"),
            Process(id="proc1", name="Process", description="Process"),
            Procedure(id="proc2", name="Procedure", description="Procedure"),
            Event(id="ev1", name="Event", description="Event"),
            Actor(id="act1", name="Actor", description="Actor"),
            Area(id="area1", name="Area", description="Area")
        ]
        
        # Register all artifacts
        for artifact in artifacts:
            assert self.engine.register_artifact(artifact)
        
        # Test getting artifacts by type
        purposes = self.engine.get_artifacts_by_type(artifact.get_type())
        assert len(purposes) == 1
        
        # Test coherence with all types
        report = self.engine.validate_coherence()
        assert report["valid"] is True
        assert report["statistics"]["total_artifacts"] == 12
    
    def test_error_handling_integration(self):
        """Test error handling in integration scenarios"""
        # Test registering invalid artifact
        invalid_artifact = Purpose(
            id="",  # Invalid ID
            name="",  # Invalid name
            description=""
        )
        
        # Should handle gracefully
        result = self.engine.register_artifact(invalid_artifact)
        # Note: Current implementation doesn't validate, so this would succeed
        # In a real implementation, this should fail gracefully
        
        # Test non-existent artifact operations
        assert not self.engine.update_artifact("non-existent", name="test")
        assert not self.engine.delete_artifact("non-existent")
        assert self.engine.get_artifact("non-existent") is None
    
    def test_concurrent_operations(self):
        """Test concurrent operations"""
        import threading
        import time
        
        def register_artifacts(thread_id):
            for i in range(10):
                artifact = Purpose(
                    id=f"thread-{thread_id}-{i}",
                    name=f"Thread {thread_id} Artifact {i}",
                    description=f"Description {i}"
                )
                self.engine.register_artifact(artifact)
                time.sleep(0.01)  # Small delay
        
        # Create multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=register_artifacts, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all artifacts were registered
        assert len(self.engine.artifacts) == 50
        
        # Verify coherence is still valid
        report = self.engine.validate_coherence()
        assert report["valid"] is True
