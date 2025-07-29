"""
Semantic Engine - Core processing engine for Hexy artifacts
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from ..artifacts.base import BaseArtifact, ArtifactType
from ..events.event_bus import EventBus

logger = logging.getLogger(__name__)


class SemanticEngine:
    """Main engine for semantic processing of artifacts"""

    def __init__(self, event_bus: EventBus = None):
        self.event_bus = event_bus or EventBus()
        self.artifacts: Dict[str, BaseArtifact] = {}
        self.relationships: List[Dict[str, Any]] = []

        self._setup_event_handlers()

    def _setup_event_handlers(self):
        """Setup event handlers for the semantic engine"""
        self.event_bus.subscribe("artifact.registered", self._on_artifact_registered)
        self.event_bus.subscribe("artifact.updated", self._on_artifact_updated)
        self.event_bus.subscribe("artifact.deleted", self._on_artifact_deleted)

    def register_artifact(self, artifact: BaseArtifact) -> bool:
        """Register an artifact in the semantic engine"""
        try:
            self.artifacts[artifact.id] = artifact

            self.event_bus.publish(
                "artifact.registered",
                {
                    "artifact_id": artifact.id,
                    "artifact_type": artifact.get_type().value,
                    "timestamp": datetime.now().isoformat(),
                },
            )

            logger.info(f"Artifact registered successfully: {artifact.id}")
            return True

        except Exception as e:
            logger.error(f"Error registering artifact {artifact.id}: {str(e)}")
            return False

    def get_artifact(self, artifact_id: str) -> Optional[BaseArtifact]:
        """Get an artifact by ID"""
        return self.artifacts.get(artifact_id)

    def get_artifacts_by_type(self, artifact_type: ArtifactType) -> List[BaseArtifact]:
        """Get all artifacts of a specific type"""
        return [
            artifact
            for artifact in self.artifacts.values()
            if artifact.get_type() == artifact_type
        ]

    def update_artifact(self, artifact_id: str, **kwargs) -> bool:
        """Update an existing artifact"""
        artifact = self.get_artifact(artifact_id)
        if not artifact:
            logger.error(f"Artifact not found: {artifact_id}")
            return False

        try:
            artifact.update(**kwargs)

            self.event_bus.publish(
                "artifact.updated",
                {"artifact_id": artifact_id, "timestamp": datetime.now().isoformat()},
            )

            logger.info(f"Artifact updated successfully: {artifact_id}")
            return True

        except Exception as e:
            logger.error(f"Error updating artifact {artifact_id}: {str(e)}")
            return False

    def delete_artifact(self, artifact_id: str) -> bool:
        """Delete an artifact"""
        if artifact_id not in self.artifacts:
            logger.error(f"Artifact not found: {artifact_id}")
            return False

        try:
            del self.artifacts[artifact_id]

            self.event_bus.publish(
                "artifact.deleted",
                {"artifact_id": artifact_id, "timestamp": datetime.now().isoformat()},
            )

            logger.info(f"Artifact deleted successfully: {artifact_id}")
            return True

        except Exception as e:
            logger.error(f"Error deleting artifact {artifact_id}: {str(e)}")
            return False

    def find_semantic_matches(self, query: str, limit: int = 10) -> List[BaseArtifact]:
        """Find semantically similar artifacts"""
        # Placeholder for semantic search implementation
        return list(self.artifacts.values())[:limit]

    def validate_coherence(self) -> Dict[str, Any]:
        """Validate coherence between all artifacts"""
        coherence_report = {
            "valid": True,
            "issues": [],
            "statistics": {"total_artifacts": len(self.artifacts), "by_type": {}},
        }

        for artifact in self.artifacts.values():
            artifact_type = artifact.get_type().value
            if artifact_type not in coherence_report["statistics"]["by_type"]:
                coherence_report["statistics"]["by_type"][artifact_type] = 0
            coherence_report["statistics"]["by_type"][artifact_type] += 1

        return coherence_report

    def add_relationship(
        self, source_id: str, target_id: str, relationship_type: str = "references"
    ):
        """Add a relationship between artifacts"""
        relationship = {
            "source": source_id,
            "target": target_id,
            "type": relationship_type,
            "created_at": datetime.now().isoformat(),
        }

        if self._validate_relationship(relationship):
            self.relationships.append(relationship)
            logger.info(f"Relationship added: {source_id} -> {target_id}")
        else:
            logger.error(f"Invalid relationship: {source_id} -> {target_id}")

    def _validate_relationship(self, relationship: Dict[str, Any]) -> bool:
        """Validate a relationship between artifacts"""
        source_id = relationship.get("source")
        target_id = relationship.get("target")

        return source_id in self.artifacts and target_id in self.artifacts

    def _on_artifact_registered(self, event: Dict[str, Any]):
        """Handle artifact registered event"""
        logger.info(f"Artifact registered event: {event}")

    def _on_artifact_updated(self, event: Dict[str, Any]):
        """Handle artifact updated event"""
        logger.info(f"Artifact updated event: {event}")

    def _on_artifact_deleted(self, event: Dict[str, Any]):
        """Handle artifact deleted event"""
        logger.info(f"Artifact deleted event: {event}")
