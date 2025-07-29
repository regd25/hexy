"""
Serverless handlers for artifact operations
"""

import json
import logging
from typing import Dict, Any, List
from datetime import datetime

from ..engine.semantic_engine import SemanticEngine
from ..artifacts.foundational import Purpose, Context, Authority, Evaluation
from ..artifacts.base import SemanticContext

logger = logging.getLogger(__name__)


def create(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Create a new artifact"""
    try:
        body = json.loads(event.get("body", "{}"))

        # Extract artifact data
        artifact_id = body.get("id")
        name = body.get("name")
        artifact_type = body.get("type")
        description = body.get("description", "")
        domain = body.get("domain")
        validity_start = datetime.fromisoformat(body.get("validity_period_start"))
        validity_end = datetime.fromisoformat(body.get("validity_period_end"))
        audience = body.get("audience", [])
        tags = body.get("tags", [])
        metadata = body.get("metadata", {})

        # Create semantic context
        semantic_context = SemanticContext(
            domain=domain,
            validity_period=(validity_start, validity_end),
            audience=audience,
            tags=tags,
        )

        # Create artifact based on type
        artifact = _create_artifact_by_type(
            artifact_type, artifact_id, name, semantic_context, description, metadata
        )

        # Register with semantic engine
        engine = _get_semantic_engine()
        success = engine.register_artifact(artifact)

        if success:
            return {
                "statusCode": 201,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"success": True, "artifact": artifact.to_dict()}),
            }
        else:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(
                    {"success": False, "error": "Failed to register artifact"}
                ),
            }

    except Exception as e:
        logger.error(f"Error creating artifact: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"success": False, "error": str(e)}),
        }


def list_artifacts(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """List all artifacts"""
    try:
        # Get query parameters
        query_params = event.get("queryStringParameters", {}) or {}
        artifact_type = query_params.get("type")
        domain = query_params.get("domain")
        limit = int(query_params.get("limit", 100))

        engine = _get_semantic_engine()
        artifacts = list(engine.artifacts.values())

        # Apply filters
        if artifact_type:
            artifacts = [a for a in artifacts if a.get_type().value == artifact_type]

        if domain:
            artifacts = [a for a in artifacts if a.context.domain == domain]

        # Limit results
        artifacts = artifacts[:limit]

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(
                {
                    "success": True,
                    "artifacts": [artifact.to_dict() for artifact in artifacts],
                    "total": len(artifacts),
                }
            ),
        }

    except Exception as e:
        logger.error(f"Error listing artifacts: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"success": False, "error": str(e)}),
        }


def get_artifact(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Get a specific artifact"""
    try:
        artifact_id = event.get("pathParameters", {}).get("id")

        if not artifact_id:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(
                    {"success": False, "error": "Artifact ID is required"}
                ),
            }

        engine = _get_semantic_engine()
        artifact = engine.get_artifact(artifact_id)

        if not artifact:
            return {
                "statusCode": 404,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"success": False, "error": "Artifact not found"}),
            }

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"success": True, "artifact": artifact.to_dict()}),
        }

    except Exception as e:
        logger.error(f"Error getting artifact: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"success": False, "error": str(e)}),
        }


def update_artifact(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Update an artifact"""
    try:
        artifact_id = event.get("pathParameters", {}).get("id")
        body = json.loads(event.get("body", "{}"))

        if not artifact_id:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(
                    {"success": False, "error": "Artifact ID is required"}
                ),
            }

        engine = _get_semantic_engine()
        success = engine.update_artifact(artifact_id, **body)

        if success:
            artifact = engine.get_artifact(artifact_id)
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"success": True, "artifact": artifact.to_dict()}),
            }
        else:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(
                    {"success": False, "error": "Failed to update artifact"}
                ),
            }

    except Exception as e:
        logger.error(f"Error updating artifact: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"success": False, "error": str(e)}),
        }


def delete_artifact(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Delete an artifact"""
    try:
        artifact_id = event.get("pathParameters", {}).get("id")

        if not artifact_id:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(
                    {"success": False, "error": "Artifact ID is required"}
                ),
            }

        engine = _get_semantic_engine()
        success = engine.delete_artifact(artifact_id)

        return {
            "statusCode": 200 if success else 404,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(
                {
                    "success": success,
                    "message": "Artifact deleted" if success else "Artifact not found",
                }
            ),
        }

    except Exception as e:
        logger.error(f"Error deleting artifact: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"success": False, "error": str(e)}),
        }


def _create_artifact_by_type(
    artifact_type: str,
    artifact_id: str,
    name: str,
    context: SemanticContext,
    description: str,
    metadata: Dict[str, Any],
):
    """Create artifact based on type"""
    if artifact_type == "purpose":
        return Purpose(artifact_id, name, context, description, metadata=metadata)
    elif artifact_type == "context":
        return Context(artifact_id, name, context, description, metadata=metadata)
    elif artifact_type == "authority":
        return Authority(artifact_id, name, context, description, metadata=metadata)
    elif artifact_type == "evaluation":
        return Evaluation(artifact_id, name, context, description, metadata=metadata)
    else:
        raise ValueError(f"Unsupported artifact type: {artifact_type}")


def _get_semantic_engine() -> SemanticEngine:
    """Get semantic engine instance"""
    # In a real implementation, this would be a singleton or dependency injection
    # For now, create a new instance
    from ..events.event_bus import EventBus

    return SemanticEngine(EventBus())
