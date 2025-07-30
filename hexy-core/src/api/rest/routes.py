"""
REST routes for Hexy Framework API
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import os

from ..services.ai_service import (
    AIService,
    SemanticRelationRequest,
)

router = APIRouter(prefix="/api", tags=["api"])

# Configure CORS
router.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_ai_service() -> AIService:
    """
    Dependency to get the AI service
    """
    api_key = os.getenv("OPENAI_API_KEY")
    return AIService(api_key=api_key)


@router.post("/generate-suggestion", response_model=Dict[str, Any])
async def generate_suggestion(
    request: SemanticRelationRequest, ai_service: AIService = Depends(get_ai_service)
) -> Dict[str, Any]:
    """
    Generates an AI suggestion for a semantic relation

    Args:
        request: Request data
        ai_service: AI service

    Returns:
        Generated suggestion
    """
    try:
        response = ai_service.generate_semantic_suggestion(
            source_node=request.sourceNode,
            target_node=request.targetNode,
            relation_type=request.relationType,
        )

        return {
            "suggestion": response.suggestion,
            "confidence": response.confidence,
            "reasoning": response.reasoning,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating suggestion: {str(e)}"
        )


@router.post("/validate-relation")
async def validate_relation(
    request: SemanticRelationRequest, ai_service: AIService = Depends(get_ai_service)
) -> Dict[str, Any]:
    """
    Validates a semantic relation

    Args:
        request: Request data
        ai_service: AI service

    Returns:
        Validation result
    """
    try:
        validation = ai_service.validate_semantic_relation(
            source_node=request.sourceNode,
            target_node=request.targetNode,
            relation_type=request.relationType,
        )

        return validation

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error validating relation: {str(e)}"
        )


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health endpoint to verify that the API is working
    """
    return {"status": "healthy", "service": "hexy-core-api"}


@router.get("/version")
async def get_version() -> Dict[str, str]:
    """
    Get the version of the service
    """
    return {"version": "0.1.0", "framework": "hexy-core"}
