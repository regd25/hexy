import { z } from 'zod'
import {
    ARTIFACT_TYPES,
    type ArtifactType,
    type RelationType,
    RELATION_TYPES,
    type ArtifactFilter,
    type ArtifactSearchQuery,
} from '@shared'
import {
    relationSchema as baseRelationshipSchema,
    visualArtifactSchema,
    type RelationVisualProperties,
    createDefaultRelationVisualProperties,
} from './VisualArtifact'

export type RelationshipType = RelationType

export const RELATIONSHIP_TYPES: Record<
    | 'DEPENDS_ON'
    | 'IMPLEMENTS'
    | 'INFLUENCES'
    | 'CONTAINS'
    | 'REFERENCES'
    | 'SUPPORTS'
    | 'CONFLICTS_WITH'
    | 'EVOLVES_TO'
    | 'VALIDATES'
    | 'DERIVES_FROM',
    RelationshipType
> = {
    DEPENDS_ON: RELATION_TYPES.DEPENDS_ON,
    IMPLEMENTS: RELATION_TYPES.IMPLEMENTS,
    INFLUENCES: RELATION_TYPES.INFLUENCES,
    CONTAINS: RELATION_TYPES.CONTAINS,
    REFERENCES: RELATION_TYPES.REFERENCES,
    SUPPORTS: RELATION_TYPES.SUPPORTS,
    CONFLICTS_WITH: RELATION_TYPES.CONFLICTS_WITH,
    EVOLVES_TO: RELATION_TYPES.EVOLVES_TO,
    VALIDATES: RELATION_TYPES.VALIDATES,
    DERIVES_FROM: RELATION_TYPES.DERIVES_FROM,
}

export const relationshipSchema = baseRelationshipSchema.extend({
    contextualRelevance: z.number().min(0).max(1).optional(),
    temporalRelevance: z.number().min(0).max(1).optional(),
    stakeholderImpact: z.array(z.string()).optional(),
})

export type Relationship = z.infer<typeof relationshipSchema>

export const artifactSchema = visualArtifactSchema

export const createDefaultRelationshipVisualProperties = (
    type: RelationshipType
): RelationVisualProperties => createDefaultRelationVisualProperties(type)

export interface CreateArtifactPayload {
    name: string
    type: ArtifactType
    description: string
    purpose?: string
    context?: Record<string, unknown>
    authority?: string
    evaluationCriteria?: string[]
    coordinates?: { x: number; y: number }
    semanticMetadata?: ReturnType<typeof createDefaultSemanticMetadata>
    visualProperties?: Partial<RelationVisualProperties> & { x?: number; y?: number }
}

export interface UpdateArtifactPayload extends Partial<CreateArtifactPayload> {
    id: string
}

export { ArtifactFilter, ArtifactSearchQuery }

export const ARTIFACT_TYPE_CONFIGS: Partial<
    Record<ArtifactType, { defaultAuthority?: string }>
> = {
    [ARTIFACT_TYPES.VISION]: { defaultAuthority: 'Executive Leadership' },
    [ARTIFACT_TYPES.POLICY]: { defaultAuthority: 'Governance Board' },
    [ARTIFACT_TYPES.PRINCIPLE]: { defaultAuthority: 'Architecture Council' },
}

export const createDefaultSemanticMetadata = () => ({
    semanticTags: [],
    businessValue: 5,
    stakeholders: [],
    dependencies: [],
    semanticWeight: 0.5,
    contextualRelevance: 0.5,
    temporalRelevance: 0.5,
})


