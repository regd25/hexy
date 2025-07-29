"""
GraphQL Schema for Hexy Core API
"""

import graphene
from typing import List, Optional
from datetime import datetime

from ...artifacts.base import ArtifactType
from ...engine.semantic_engine import SemanticEngine


class ArtifactTypeEnum(graphene.Enum):
    """GraphQL enum for artifact types"""

    class Meta:
        name = "ArtifactType"

    PURPOSE = ArtifactType.PURPOSE.value
    CONTEXT = ArtifactType.CONTEXT.value
    AUTHORITY = ArtifactType.AUTHORITY.value
    EVALUATION = ArtifactType.EVALUATION.value
    VISION = ArtifactType.VISION.value
    POLICY = ArtifactType.POLICY.value
    PRINCIPLE = ArtifactType.PRINCIPLE.value
    GUIDELINE = ArtifactType.GUIDELINE.value
    CONCEPT = ArtifactType.CONCEPT.value
    INDICATOR = ArtifactType.INDICATOR.value
    PROCESS = ArtifactType.PROCESS.value
    PROCEDURE = ArtifactType.PROCEDURE.value
    EVENT = ArtifactType.EVENT.value
    RESULT = ArtifactType.RESULT.value
    OBSERVATION = ArtifactType.OBSERVATION.value
    ACTOR = ArtifactType.ACTOR.value
    AREA = ArtifactType.AREA.value


class SemanticContextType(graphene.ObjectType):
    """GraphQL type for semantic context"""

    domain = graphene.String()
    validity_period_start = graphene.DateTime()
    validity_period_end = graphene.DateTime()
    audience = graphene.List(graphene.String)
    tags = graphene.List(graphene.String)


class ArtifactType(graphene.ObjectType):
    """GraphQL type for artifacts"""

    id = graphene.String()
    name = graphene.String()
    type = ArtifactTypeEnum()
    context = graphene.Field(SemanticContextType)
    description = graphene.String()
    metadata = graphene.JSONString()
    created_at = graphene.DateTime()
    updated_at = graphene.DateTime()
    references = graphene.List(graphene.String)


class CoherenceReportType(graphene.ObjectType):
    """GraphQL type for coherence reports"""

    valid = graphene.Boolean()
    issues = graphene.List(graphene.JSONString)
    statistics = graphene.JSONString()


class SearchResultType(graphene.ObjectType):
    """GraphQL type for search results"""

    artifact = graphene.Field(ArtifactType)
    score = graphene.Float()
    highlights = graphene.List(graphene.String)


class Query(graphene.ObjectType):
    """GraphQL Query type"""

    # Artifact queries
    artifacts = graphene.List(
        ArtifactType,
        type=graphene.Argument(ArtifactTypeEnum),
        domain=graphene.Argument(graphene.String),
        limit=graphene.Argument(graphene.Int, default_value=100),
    )

    artifact = graphene.Field(
        ArtifactType, id=graphene.Argument(graphene.String, required=True)
    )

    # Search queries
    semantic_search = graphene.List(
        SearchResultType,
        query=graphene.Argument(graphene.String, required=True),
        limit=graphene.Argument(graphene.Int, default_value=10),
    )

    # Validation queries
    validate_coherence = graphene.Field(CoherenceReportType)

    # Statistics queries
    statistics = graphene.JSONString()

    def resolve_artifacts(self, info, type=None, domain=None, limit=100):
        """Resolve artifacts query"""
        engine = info.context.get("semantic_engine")
        if not engine:
            return []

        artifacts = list(engine.artifacts.values())

        if type:
            artifacts = [a for a in artifacts if a.get_type().value == type]

        if domain:
            artifacts = [a for a in artifacts if a.context.domain == domain]

        return artifacts[:limit]

    def resolve_artifact(self, info, id):
        """Resolve single artifact query"""
        engine = info.context.get("semantic_engine")
        if not engine:
            return None

        return engine.get_artifact(id)

    def resolve_semantic_search(self, info, query, limit=10):
        """Resolve semantic search query"""
        engine = info.context.get("semantic_engine")
        if not engine:
            return []

        results = engine.find_semantic_matches(query, limit)
        return [
            SearchResultType(
                artifact=artifact, score=1.0, highlights=[]  # Placeholder score
            )
            for artifact in results
        ]

    def resolve_validate_coherence(self, info):
        """Resolve coherence validation query"""
        engine = info.context.get("semantic_engine")
        if not engine:
            return CoherenceReportType(valid=False, issues=[], statistics={})

        report = engine.validate_coherence()
        return CoherenceReportType(
            valid=report["valid"],
            issues=report["issues"],
            statistics=report["statistics"],
        )

    def resolve_statistics(self, info):
        """Resolve statistics query"""
        engine = info.context.get("semantic_engine")
        if not engine:
            return {}

        return {
            "total_artifacts": len(engine.artifacts),
            "by_type": engine.validate_coherence()["statistics"]["by_type"],
        }


class CreateArtifactInput(graphene.InputObjectType):
    """Input type for creating artifacts"""

    id = graphene.String(required=True)
    name = graphene.String(required=True)
    type = ArtifactTypeEnum(required=True)
    description = graphene.String()
    domain = graphene.String(required=True)
    validity_period_start = graphene.DateTime(required=True)
    validity_period_end = graphene.DateTime(required=True)
    audience = graphene.List(graphene.String)
    tags = graphene.List(graphene.String)
    metadata = graphene.JSONString()


class UpdateArtifactInput(graphene.InputObjectType):
    """Input type for updating artifacts"""

    name = graphene.String()
    description = graphene.String()
    metadata = graphene.JSONString()


class Mutation(graphene.ObjectType):
    """GraphQL Mutation type"""

    create_artifact = graphene.Field(
        ArtifactType, input=graphene.Argument(CreateArtifactInput, required=True)
    )

    update_artifact = graphene.Field(
        ArtifactType,
        id=graphene.Argument(graphene.String, required=True),
        input=graphene.Argument(UpdateArtifactInput, required=True),
    )

    delete_artifact = graphene.Field(
        graphene.Boolean, id=graphene.Argument(graphene.String, required=True)
    )

    def resolve_create_artifact(self, info, input):
        """Resolve create artifact mutation"""
        engine = info.context.get("semantic_engine")
        if not engine:
            return None

        # This would need to be implemented based on the specific artifact type
        # For now, return None as placeholder
        return None

    def resolve_update_artifact(self, info, id, input):
        """Resolve update artifact mutation"""
        engine = info.context.get("semantic_engine")
        if not engine:
            return None

        success = engine.update_artifact(id, **input)
        if success:
            return engine.get_artifact(id)
        return None

    def resolve_delete_artifact(self, info, id):
        """Resolve delete artifact mutation"""
        engine = info.context.get("semantic_engine")
        if not engine:
            return False

        return engine.delete_artifact(id)


# Create schema
schema = graphene.Schema(query=Query, mutation=Mutation)
