/**
 * ArtifactAdapter - Simple conversion utilities
 */

import { Artifact, ArtifactType, ARTIFACT_TYPES } from '../types/Artifact'

export class ArtifactAdapter {
    /**
     * Create artifact with default values
     */
    static createWithDefaults(data: Partial<Artifact>): Artifact {
        const now = new Date().toISOString()

        return {
            id: data.id || '',
            name: data.name || '',
            type: data.type || ARTIFACT_TYPES.CONCEPT,
            description: data.description || '',
            version: data.version || '1.0.0',
            metadata: data.metadata,
            createdAt: data.createdAt || now,
            updatedAt: data.updatedAt || now,
        }
    }

    /**
     * Map string type to valid ArtifactType
     */
    static mapToValidType(type: string): ArtifactType {
        if (Object.values(ARTIFACT_TYPES).includes(type as ArtifactType)) {
            return type as ArtifactType
        }
        return ARTIFACT_TYPES.CONCEPT // default
    }

    /**
     * Create default artifact colors for UI
     */
    static getArtifactColor(type: ArtifactType): string {
        const colors: Record<ArtifactType, string> = {
            [ARTIFACT_TYPES.PURPOSE]: '#3B82F6',
            [ARTIFACT_TYPES.VISION]: '#8B5CF6',
            [ARTIFACT_TYPES.POLICY]: '#EF4444',
            [ARTIFACT_TYPES.PRINCIPLE]: '#F59E0B',
            [ARTIFACT_TYPES.GUIDELINE]: '#10B981',
            [ARTIFACT_TYPES.CONTEXT]: '#6366F1',
            [ARTIFACT_TYPES.ACTOR]: '#EC4899',
            [ARTIFACT_TYPES.CONCEPT]: '#14B8A6',
            [ARTIFACT_TYPES.PROCESS]: '#F97316',
            [ARTIFACT_TYPES.PROCEDURE]: '#84CC16',
            [ARTIFACT_TYPES.EVENT]: '#06B6D4',
            [ARTIFACT_TYPES.RESULT]: '#A855F7',
            [ARTIFACT_TYPES.OBSERVATION]: '#6B7280',
            [ARTIFACT_TYPES.EVALUATION]: '#DC2626',
            [ARTIFACT_TYPES.INDICATOR]: '#059669',
            [ARTIFACT_TYPES.AREA]: '#7C3AED',
            [ARTIFACT_TYPES.AUTHORITY]: '#B91C1C',
            [ARTIFACT_TYPES.REFERENCE]: '#9CA3AF',
        }
        return colors[type] || '#14B8A6'
    }

    /**
     * Validation utilities
     */
    static isValidArtifact(artifact: unknown): artifact is Artifact {
        return (
            typeof artifact === 'object' &&
            artifact !== null &&
            'id' in artifact &&
            'name' in artifact &&
            'type' in artifact
        )
    }
}
