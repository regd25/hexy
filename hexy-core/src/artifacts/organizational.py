"""
Organizational artifacts: Actor, Area
"""

from .base import BaseArtifact, ArtifactType


class Actor(BaseArtifact):
    """Actor artifact - entity capable of taking meaningful action"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.ACTOR


class Area(BaseArtifact):
    """Area artifact - operational domain with identity and purpose"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.AREA
