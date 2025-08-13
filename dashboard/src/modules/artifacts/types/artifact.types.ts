/**
 * Enhanced artifact types with D3.js visualization and semantic relationships
 * Following Hexy Framework semantic principles and DDD patterns
 */

import { z } from 'zod'

/**
 * Semantic artifact types following Hexy framework taxonomy
 */
export const ARTIFACT_TYPES = {
    // Foundational artifacts
    PURPOSE: 'purpose',
    CONTEXT: 'context',
    AUTHORITY: 'authority',
    EVALUATION: 'evaluation',

    // Strategic artifacts
    VISION: 'vision',
    POLICY: 'policy',
    PRINCIPLE: 'principle',
    GUIDELINE: 'guideline',
    CONCEPT: 'concept',
    INDICATOR: 'indicator',

    // Operational artifacts
    PROCESS: 'process',
    PROCEDURE: 'procedure',
    EVENT: 'event',
    RESULT: 'result',
    OBSERVATION: 'observation',

    // Organizational artifacts
    ACTOR: 'actor',
    AREA: 'area',

    // System artifacts
    REFERENCE: 'reference',
} as const

export type ArtifactType = (typeof ARTIFACT_TYPES)[keyof typeof ARTIFACT_TYPES]

/**
 * D3.js visualization properties for graph rendering
 */
export interface VisualizationProperties {
    x: number
    y: number
    vx?: number // D3.js velocity
    vy?: number // D3.js velocity
    fx?: number // D3.js fixed position
    fy?: number // D3.js fixed position
    scale: number
    opacity: number
    color: string
    radius: number
    strokeWidth: number
    strokeColor: string
}

/**
 * Semantic metadata for enhanced artifact understanding
 */
export interface SemanticMetadata {
    semanticTags: string[]
    businessValue: number
    stakeholders: string[]
    dependencies: string[]
    semanticWeight: number
    contextualRelevance: number
    temporalRelevance: number
}

/**
 * Enhanced core artifact interface with visualization and semantic properties
 */
export interface Artifact {
    readonly id: string
    name: string
    type: ArtifactType
    description: string

    // Semantic metadata (Hexy foundational artifacts)
    purpose: string
    context: Record<string, unknown>
    authority: string
    evaluationCriteria: string[]

    // Enhanced semantic metadata
    semanticMetadata: SemanticMetadata

    // D3.js visualization properties
    visualProperties: VisualizationProperties

    // Temporal and spatial properties
    coordinates: {
        x: number
        y: number
        z?: number
    }

    // Versioning
    version: string
    createdAt: Date
    updatedAt: Date

    // Relationships
    relationships: Relationship[]

    // Validation state
    isValid: boolean
    validationErrors: string[]
}

/**
 * Validation state for individual artifact fields
 */
export type ValidationState = 'valid' | 'invalid' | 'pending' | 'warning'

/**
 * Enhanced temporal artifact with validation progress and visual state
 */
export interface TemporalArtifact extends Omit<Artifact, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    id?: string
    status: 'creating' | 'editing' | 'validating' | 'error'
    temporaryId: string

    // Enhanced validation state tracking
    validationProgress: {
        name: ValidationState
        type: ValidationState
        description: ValidationState
        purpose: ValidationState
        context: ValidationState
        authority: ValidationState
        evaluation: ValidationState
    }

    // Visual state for graph rendering
    visualState: {
        opacity: number
        scale: number
        color: string
        pulseAnimation: boolean
        strokeDashArray?: string
    }

    // Semantic guidance state
    guidanceState: {
        showPurposeHelp: boolean
        showContextHelp: boolean
        showAuthorityHelp: boolean
        showEvaluationHelp: boolean
    }
}

/**
 * Visual properties for relationship rendering
 */
export interface RelationshipVisualProperties {
    strokeWidth: number
    strokeColor: string
    strokeDashArray?: string
    opacity: number
    animated: boolean
    curvature: number
    arrowSize: number
}

/**
 * Enhanced semantic relationship with visual properties
 */
export interface Relationship {
    readonly id: string
    sourceId: string
    targetId: string
    type: RelationshipType
    weight: number
    description?: string
    metadata: Record<string, unknown>
    createdAt: Date

    // Visual properties for graph rendering
    visualProperties: RelationshipVisualProperties

    // Semantic strength and validation
    semanticStrength: number
    businessImpact: 'high' | 'medium' | 'low'
    validationStatus: 'valid' | 'warning' | 'error'

    // Contextual information
    contextualRelevance: number
    temporalRelevance: number
    stakeholderImpact: string[]
}

/**
 * Relationship types following semantic patterns
 */
export const RELATIONSHIP_TYPES = {
    DEPENDS_ON: 'depends_on',
    IMPLEMENTS: 'implements',
    INFLUENCES: 'influences',
    CONTAINS: 'contains',
    REFERENCES: 'references',
    SUPPORTS: 'supports',
    CONFLICTS_WITH: 'conflicts_with',
    EVOLVES_TO: 'evolves_to',
    VALIDATES: 'validates',
    DERIVES_FROM: 'derives_from',
} as const

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[keyof typeof RELATIONSHIP_TYPES]

/**
 * Enhanced artifact validation schema using Zod
 */
export const visualizationPropertiesSchema = z.object({
    x: z.number(),
    y: z.number(),
    vx: z.number().optional(),
    vy: z.number().optional(),
    fx: z.number().optional(),
    fy: z.number().optional(),
    scale: z.number().min(0.1).max(3),
    opacity: z.number().min(0).max(1),
    color: z.string().regex(/^#[0-9A-F]{6}$/i),
    radius: z.number().min(5).max(50),
    strokeWidth: z.number().min(0).max(10),
    strokeColor: z.string().regex(/^#[0-9A-F]{6}$/i),
})

export const semanticMetadataSchema = z.object({
    semanticTags: z.array(z.string()),
    businessValue: z.number().min(0).max(10),
    stakeholders: z.array(z.string()),
    dependencies: z.array(z.string()),
    semanticWeight: z.number().min(0).max(1),
    contextualRelevance: z.number().min(0).max(1),
    temporalRelevance: z.number().min(0).max(1),
})

export const relationshipVisualPropertiesSchema = z.object({
    strokeWidth: z.number().min(1).max(10),
    strokeColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    strokeDashArray: z.string().optional(),
    opacity: z.number().min(0).max(1),
    animated: z.boolean(),
    curvature: z.number().min(0).max(1),
    arrowSize: z.number().min(5).max(20),
})

export const relationshipSchema = z.object({
    id: z.string().uuid(),
    sourceId: z.string().uuid(),
    targetId: z.string().uuid(),
    type: z.enum(Object.values(RELATIONSHIP_TYPES) as [RelationshipType, ...RelationshipType[]]),
    weight: z.number().min(0).max(1),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()),
    createdAt: z.date(),
    visualProperties: relationshipVisualPropertiesSchema,
    semanticStrength: z.number().min(0).max(1),
    businessImpact: z.enum(['high', 'medium', 'low']),
    validationStatus: z.enum(['valid', 'warning', 'error']),
    contextualRelevance: z.number().min(0).max(1),
    temporalRelevance: z.number().min(0).max(1),
    stakeholderImpact: z.array(z.string()),
})

export const artifactSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(200),
    type: z.enum(Object.values(ARTIFACT_TYPES) as [ArtifactType, ...ArtifactType[]]),
    description: z.string().min(10).max(2000),
    purpose: z.string().min(10).max(500),
    context: z.record(z.string(), z.unknown()),
    authority: z.string().min(1).max(100),
    evaluationCriteria: z.array(z.string()).min(1),
    semanticMetadata: semanticMetadataSchema,
    visualProperties: visualizationPropertiesSchema,
    coordinates: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number().optional(),
    }),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    createdAt: z.date(),
    updatedAt: z.date(),
    relationships: z.array(relationshipSchema),
    isValid: z.boolean(),
    validationErrors: z.array(z.string()),
})

/**
 * Enhanced temporal artifact schema
 */
export const temporalArtifactSchema = artifactSchema.partial().extend({
    status: z.enum(['creating', 'editing', 'validating', 'error']),
    temporaryId: z.string().uuid(),
    validationProgress: z.object({
        name: z.enum(['valid', 'invalid', 'pending', 'warning']),
        type: z.enum(['valid', 'invalid', 'pending', 'warning']),
        description: z.enum(['valid', 'invalid', 'pending', 'warning']),
        purpose: z.enum(['valid', 'invalid', 'pending', 'warning']),
        context: z.enum(['valid', 'invalid', 'pending', 'warning']),
        authority: z.enum(['valid', 'invalid', 'pending', 'warning']),
        evaluation: z.enum(['valid', 'invalid', 'pending', 'warning']),
    }),
    visualState: z.object({
        opacity: z.number().min(0).max(1),
        scale: z.number().min(0.1).max(3),
        color: z.string().regex(/^#[0-9A-F]{6}$/i),
        pulseAnimation: z.boolean(),
        strokeDashArray: z.string().optional(),
    }),
    guidanceState: z.object({
        showPurposeHelp: z.boolean(),
        showContextHelp: z.boolean(),
        showAuthorityHelp: z.boolean(),
        showEvaluationHelp: z.boolean(),
    }),
})

/**
 * Artifact creation payload
 */
export interface CreateArtifactPayload {
    name: string
    type: ArtifactType
    description: string
    purpose?: string
    context?: Record<string, unknown>
    authority?: string
    evaluationCriteria?: string[]
    coordinates?: { x: number; y: number; z?: number }
    semanticMetadata?: Partial<SemanticMetadata>
    visualProperties?: Partial<VisualizationProperties>
}

/**
 * Artifact update payload
 */
export interface UpdateArtifactPayload extends Partial<CreateArtifactPayload> {
    id: string
}

/**
 * Artifact search query with semantic capabilities
 */
export interface ArtifactSearchQuery {
    text?: string
    type?: ArtifactType
    semanticTags?: string[]
    stakeholders?: string[]
    businessValueRange?: { min: number; max: number }
    dateRange?: { start: Date; end: Date }
    relationships?: { type: RelationshipType; targetId?: string }[]
    semanticWeightRange?: { min: number; max: number }
}

/**
 * Enhanced artifact filter criteria
 */
export interface ArtifactFilter {
    type?: ArtifactType
    semanticTags?: string[]
    stakeholders?: string[]
    validity?: 'valid' | 'invalid' | 'all'
    businessValueRange?: { min: number; max: number }
    createdAfter?: Date
    createdBefore?: Date
    hasRelationships?: boolean
    relationshipTypes?: RelationshipType[]
}

/**
 * Artifact export format with enhanced metadata
 */
export interface ArtifactExport {
    artifacts: Artifact[]
    relationships: Relationship[]
    metadata: {
        version: string
        exportedAt: Date
        totalArtifacts: number
        totalRelationships: number
        semanticSummary: {
            averageBusinessValue: number
            mostCommonTypes: ArtifactType[]
            totalStakeholders: number
            relationshipDensity: number
        }
    }
}

/**
 * Validation result with semantic feedback
 */
export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
    suggestions: ValidationSuggestion[]
    semanticScore: number
}

export interface ValidationError {
    field: string
    message: string
    code: string
    severity: 'error' | 'warning'
}

export interface ValidationWarning {
    field: string
    message: string
    suggestion?: string
}

export interface ValidationSuggestion {
    field: string
    suggestion: string
    reasoning: string
    confidence: number
}

/**
 * Type guards for runtime type checking
 */
export const isArtifact = (value: unknown): value is Artifact => {
    return artifactSchema.safeParse(value).success
}

export const isTemporalArtifact = (value: unknown): value is TemporalArtifact => {
    return temporalArtifactSchema.safeParse(value).success
}

export const isRelationship = (value: unknown): value is Relationship => {
    return relationshipSchema.safeParse(value).success
}

export const isValidArtifactType = (type: string): type is ArtifactType => {
    return Object.values(ARTIFACT_TYPES).includes(type as ArtifactType)
}

export const isValidRelationshipType = (type: string): type is RelationshipType => {
    return Object.values(RELATIONSHIP_TYPES).includes(type as RelationshipType)
}

/**
 * Artifact type configuration with enhanced semantic properties
 */
export interface ArtifactTypeConfig {
    color: string
    icon: string
    description: string
    validationRules: z.ZodSchema<unknown>
    defaultPurpose?: string
    defaultAuthority?: string
    defaultEvaluationCriteria?: string[]
    semanticProperties: {
        defaultBusinessValue: number
        defaultSemanticWeight: number
        suggestedStakeholders: string[]
        commonTags: string[]
    }
    visualDefaults: {
        radius: number
        strokeWidth: number
        opacity: number
    }
}

/**
 * Enhanced color palette for artifact types with semantic meaning
 */
export const ARTIFACT_COLORS: Record<ArtifactType, string> = {
    [ARTIFACT_TYPES.PURPOSE]: '#3B82F6', // Blue - Direction
    [ARTIFACT_TYPES.VISION]: '#8B5CF6', // Purple - Aspiration
    [ARTIFACT_TYPES.POLICY]: '#EF4444', // Red - Rules
    [ARTIFACT_TYPES.PRINCIPLE]: '#F59E0B', // Amber - Foundation
    [ARTIFACT_TYPES.GUIDELINE]: '#10B981', // Emerald - Guidance
    [ARTIFACT_TYPES.CONTEXT]: '#6366F1', // Indigo - Environment
    [ARTIFACT_TYPES.ACTOR]: '#EC4899', // Pink - People
    [ARTIFACT_TYPES.CONCEPT]: '#14B8A6', // Teal - Ideas
    [ARTIFACT_TYPES.PROCESS]: '#F97316', // Orange - Flow
    [ARTIFACT_TYPES.PROCEDURE]: '#84CC16', // Lime - Steps
    [ARTIFACT_TYPES.EVENT]: '#06B6D4', // Cyan - Moments
    [ARTIFACT_TYPES.RESULT]: '#A855F7', // Violet - Outcomes
    [ARTIFACT_TYPES.OBSERVATION]: '#6B7280', // Gray - Facts
    [ARTIFACT_TYPES.EVALUATION]: '#DC2626', // Red - Assessment
    [ARTIFACT_TYPES.INDICATOR]: '#059669', // Green - Metrics
    [ARTIFACT_TYPES.AREA]: '#7C3AED', // Purple - Domains
    [ARTIFACT_TYPES.AUTHORITY]: '#B91C1C', // Dark Red - Power
    [ARTIFACT_TYPES.REFERENCE]: '#9CA3AF', // Cool Gray - Links
}

/**
 * Relationship type colors for visual distinction
 */
export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
    [RELATIONSHIP_TYPES.DEPENDS_ON]: '#EF4444', // Red - Dependency
    [RELATIONSHIP_TYPES.IMPLEMENTS]: '#10B981', // Green - Implementation
    [RELATIONSHIP_TYPES.INFLUENCES]: '#F59E0B', // Amber - Influence
    [RELATIONSHIP_TYPES.CONTAINS]: '#3B82F6', // Blue - Containment
    [RELATIONSHIP_TYPES.REFERENCES]: '#6B7280', // Gray - Reference
    [RELATIONSHIP_TYPES.SUPPORTS]: '#059669', // Dark Green - Support
    [RELATIONSHIP_TYPES.CONFLICTS_WITH]: '#DC2626', // Dark Red - Conflict
    [RELATIONSHIP_TYPES.EVOLVES_TO]: '#8B5CF6', // Purple - Evolution
    [RELATIONSHIP_TYPES.VALIDATES]: '#14B8A6', // Teal - Validation
    [RELATIONSHIP_TYPES.DERIVES_FROM]: '#F97316', // Orange - Derivation
}

/**
 * Utility functions for semantic operations
 */
export const createDefaultVisualizationProperties = (
    type: ArtifactType,
    x: number,
    y: number
): VisualizationProperties => {
    return {
        x,
        y,
        scale: 1,
        opacity: 0.8,
        color: ARTIFACT_COLORS[type],
        radius: 20,
        strokeWidth: 2,
        strokeColor: '#374151',
    }
}

export const createDefaultSemanticMetadata = (): SemanticMetadata => {
    return {
        semanticTags: [],
        businessValue: 5,
        stakeholders: [],
        dependencies: [],
        semanticWeight: 0.5,
        contextualRelevance: 0.5,
        temporalRelevance: 1.0,
    }
}

export const createDefaultRelationshipVisualProperties = (type: RelationshipType): RelationshipVisualProperties => {
    return {
        strokeWidth: 2,
        strokeColor: RELATIONSHIP_COLORS[type],
        opacity: 0.7,
        animated: false,
        curvature: 0.3,
        arrowSize: 8,
    }
}
/**
 * Basic artifact type configurations (simplified for now)
 */
export const ARTIFACT_TYPE_CONFIGS: Partial<Record<ArtifactType, ArtifactTypeConfig>> = {
    [ARTIFACT_TYPES.PURPOSE]: {
        color: ARTIFACT_COLORS[ARTIFACT_TYPES.PURPOSE],
        icon: 'Target',
        description: 'Organizational intention and direction',
        validationRules: z.object({
            description: z.string().min(50).max(1000),
            purpose: z.string().min(20).max(500),
        }),
        defaultPurpose: 'Define organizational direction and intention',
        defaultAuthority: 'Executive Leadership',
        defaultEvaluationCriteria: ['Alignment with mission', 'Measurable impact', 'Stakeholder buy-in'],
        semanticProperties: {
            defaultBusinessValue: 8,
            defaultSemanticWeight: 0.9,
            suggestedStakeholders: ['Executive Team', 'Board of Directors', 'Strategic Planning'],
            commonTags: ['strategy', 'direction', 'mission', 'goals'],
        },
        visualDefaults: {
            radius: 25,
            strokeWidth: 3,
            opacity: 0.9,
        },
    },
}
