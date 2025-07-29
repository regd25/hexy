"""
Operational artifacts: Process, Procedure, Event, Result, Observation
"""

from .base import BaseArtifact, ArtifactType


class Process(BaseArtifact):
    """Process artifact - living sequence of transformations"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.PROCESS


class Procedure(BaseArtifact):
    """Procedure artifact - detailed choreography of specific actions"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.PROCEDURE


class Event(BaseArtifact):
    """Event artifact - relevant state change"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.EVENT


class Result(BaseArtifact):
    """Result artifact - desired effect of a flow or process"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.RESULT


class Observation(BaseArtifact):
    """Observation artifact - perceptual or narrative fact record"""

    def get_type(self) -> ArtifactType:
        return ArtifactType.OBSERVATION
