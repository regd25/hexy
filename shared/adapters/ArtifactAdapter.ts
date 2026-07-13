/**
 * ArtifactAdapter - Simple conversion utilities
 */

import { Artifact, ArtifactType, ARTIFACT_TYPES, ARTIFACT_COLORS, ArtifactMetadata } from '../types/Artifact'

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
        return ARTIFACT_COLORS[type]
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

    static createDefaultArtifactMetadata(): ArtifactMetadata {
        return {
            tags: [],
            dependencies: [],
            weight: 0.5,
            contextualRelevance: 0.5,
            temporalRelevance: 1.0,
            businessImpact: 0.5,
        }
    }
}
