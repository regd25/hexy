"""
Base classes for Hexy artifacts
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class ArtifactType(Enum):
    """Types of artifacts in Hexy Framework"""

    PURPOSE = "purpose"
    CONTEXT = "context"
    AUTHORITY = "authority"
    EVALUATION = "evaluation"
    VISION = "vision"
    POLICY = "policy"
    PRINCIPLE = "principle"
    GUIDELINE = "guideline"
    CONCEPT = "concept"
    INDICATOR = "indicator"
    PROCESS = "process"
    PROCEDURE = "procedure"
    EVENT = "event"
    RESULT = "result"
    OBSERVATION = "observation"
    ACTOR = "actor"
    AREA = "area"


class BaseArtifact(ABC):
    """Base class for all semantic artifacts"""

    def __init__(
        self,
        id: str,
        name: str,
        description: str = "",
        relationships: List[str] = None,
        metadata: Dict[str, Any] = None,
    ):
        self.id = id
        self.name = name
        self.description = description
        self.relationships = relationships or []
        self.metadata = metadata or {}
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.embedding: Optional[List[float]] = None

    @abstractmethod
    def get_type(self) -> ArtifactType:
        """Get the type of this artifact"""
        pass

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.get_type().value,
            "description": self.description,
            "relationships": self.relationships,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def from_dict(self, data: Dict[str, Any]) -> "BaseArtifact":
        """Create artifact from dictionary"""
        pass

    def get_embeddings(self) -> List[float]:
        """Get semantic embeddings for this artifact"""
        if self.embedding is None:
            self.embedding = self._generate_embeddings()
        return self.embedding

    def _generate_embeddings(self) -> List[float]:
        """Generate embeddings for this artifact"""
        return []

    def add_relationship(self, relationship_id: str):
        """Add a relationship to another artifact"""
        if relationship_id not in self.relationships:
            self.relationships.append(relationship_id)

    def remove_relationship(self, relationship_id: str):
        """Remove a relationship to another artifact"""
        if relationship_id in self.relationships:
            self.relationships.remove(relationship_id)

    def update(self, **kwargs):
        """Update artifact properties"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.now()

    def __str__(self) -> str:
        return f"{self.get_type().value}: {self.name} ({self.id})"

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id='{self.id}' name='{self.name}'>"
