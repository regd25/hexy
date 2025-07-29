"""
Foundational artifacts: Purpose, Context, Authority, Evaluation
"""

from typing import Dict, Any
from .base import BaseArtifact, ArtifactType


class Purpose(BaseArtifact):
    """Purpose artifact - organizational intention behind any effort"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.PURPOSE


class Context(BaseArtifact):
    """Context artifact - where, when, and for whom an artifact has validity"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.CONTEXT


class Authority(BaseArtifact):
    """Authority artifact - source of legitimacy for an artifact"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.AUTHORITY


class Evaluation(BaseArtifact):
    """Evaluation artifact - how success will be recognized"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.EVALUATION
