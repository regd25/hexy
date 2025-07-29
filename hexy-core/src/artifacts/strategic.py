"""
Strategic artifacts: Vision, Policy, Principle, Guideline, Concept, Indicator
"""

from .base import BaseArtifact, ArtifactType


class Vision(BaseArtifact):
    """Vision artifact - desired future state"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.VISION


class Policy(BaseArtifact):
    """Policy artifact - collective commitments that govern behavior"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.POLICY


class Principle(BaseArtifact):
    """Principle artifact - fundamental operational truth"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.PRINCIPLE


class Guideline(BaseArtifact):
    """Guideline artifact - recommendation based on experience"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.GUIDELINE


class Concept(BaseArtifact):
    """Concept artifact - shared meaning of key terms"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.CONCEPT


class Indicator(BaseArtifact):
    """Indicator artifact - data-driven story for progress inference"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.INDICATOR
