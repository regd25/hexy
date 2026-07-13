/**
 * Shared artifact types - Single Source of Truth
 * Base types that both core and dashboard extend
 * Compatible with existing artifact.types.ts and core/artifacts/Artifact.ts
 */

/**
 * Relation types
 */
export const RELATION_TYPES = {
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

export type RelationType = (typeof RELATION_TYPES)[keyof typeof RELATION_TYPES]

/**
 * Relation/relationship interface
 */
export interface Relation {
    sourceId: ArtifactId
    targetId: ArtifactId
    type: RelationType
    confidence: number
    weight: number
    semanticStrength: number
    metadata: Record<string, unknown>
    createdAt: string
    description?: string
    validationStatus: 'valid' | 'warning' | 'error' | 'pending'
}

/**
 * Relationship type colors for visual distinction
 */
export const RELATION_COLORS: Record<RelationType, string> = {
    [RELATION_TYPES.DEPENDS_ON]: '#EF4444', // Red - Dependency
    [RELATION_TYPES.IMPLEMENTS]: '#10B981', // Green - Implementation
    [RELATION_TYPES.INFLUENCES]: '#F59E0B', // Amber - Influence
    [RELATION_TYPES.CONTAINS]: '#3B82F6', // Blue - Containment
    [RELATION_TYPES.REFERENCES]: '#6B7280', // Gray - Relation
    [RELATION_TYPES.SUPPORTS]: '#059669', // Dark Green - Support
    [RELATION_TYPES.CONFLICTS_WITH]: '#DC2626', // Dark Red - Conflict
    [RELATION_TYPES.EVOLVES_TO]: '#8B5CF6', // Purple - Evolution
    [RELATION_TYPES.VALIDATES]: '#14B8A6', // Teal - Validation
    [RELATION_TYPES.DERIVES_FROM]: '#F97316', // Orange - Derivation
}


/**
 * Semantic artifact types following Hexy framework
 */
export const ARTIFACT_TYPES = {
    INTENT: 'intent',
    CONTEXT: 'context',
    AUTHORITY: 'authority',
    EVALUATION: 'evaluation',
    VISION: 'vision',
    POLICY: 'policy',
    PRINCIPLE: 'principle',
    GUIDELINE: 'guideline',
    CONCEPT: 'concept',
    INDICATOR: 'indicator',
    PROCESS: 'process',
    PROCEDURE: 'procedure',
    EVENT: 'event',
    RESULT: 'result',
    OBSERVATION: 'observation',
    ACTOR: 'actor',
    AREA: 'area',
} as const

export const ARTIFACT_TYPES_LABELS: Record<ArtifactType, string> = {
    [ARTIFACT_TYPES.INTENT]: 'Intención',
    [ARTIFACT_TYPES.CONTEXT]: 'Contexto',
    [ARTIFACT_TYPES.AUTHORITY]: 'Autoridad',
    [ARTIFACT_TYPES.EVALUATION]: 'Evaluación',
    [ARTIFACT_TYPES.VISION]: 'Visión',
    [ARTIFACT_TYPES.POLICY]: 'Política',
    [ARTIFACT_TYPES.PRINCIPLE]: 'Principio',
    [ARTIFACT_TYPES.GUIDELINE]: 'Guía',
    [ARTIFACT_TYPES.CONCEPT]: 'Concepto',
    [ARTIFACT_TYPES.INDICATOR]: 'Indicador',
    [ARTIFACT_TYPES.PROCESS]: 'Proceso',
    [ARTIFACT_TYPES.PROCEDURE]: 'Procedimiento',
    [ARTIFACT_TYPES.EVENT]: 'Evento',
    [ARTIFACT_TYPES.RESULT]: 'Resultado',
    [ARTIFACT_TYPES.OBSERVATION]: 'Observación',
    [ARTIFACT_TYPES.ACTOR]: 'Actor',
    [ARTIFACT_TYPES.AREA]: 'Área',
}

export type ArtifactType = (typeof ARTIFACT_TYPES)[keyof typeof ARTIFACT_TYPES]

/**
 * Legacy artifact type aliases for backward compatibility.
 * Maps deprecated type strings (persisted before a rename) to their canonical value.
 * `purpose` → `intent` unifies the Ubiquitous Language with SOL — see
 * docs/hexy/UBIQUITOUS-LANGUAGE.md (SOL is the source of truth).
 */
export const LEGACY_ARTIFACT_TYPE_ALIASES: Record<string, ArtifactType> = {
    purpose: ARTIFACT_TYPES.INTENT,
}

/**
 * Normalize a possibly-legacy artifact type string to its canonical value.
 * Use when reading persisted data that may predate a type rename.
 */
export const normalizeArtifactType = (type: string): ArtifactType =>
    LEGACY_ARTIFACT_TYPE_ALIASES[type] ?? (type as ArtifactType)

/**
 * Semantic metadata for enhanced artifact understanding
 */
export interface ArtifactMetadata {
    tags: string[]
    dependencies: string[]
    weight: number
    temporalRelevance: number // 0-1
    contextualRelevance: number // 0-1
    businessImpact: number // 0-1
}


export type ArtifactId = string

/**
 * Artifact interface - Single Source of Truth
 * Includes all Hexy semantic properties from the start
 */
export interface Artifact {
    readonly id: ArtifactId
    name: string
    type: ArtifactType
    description: string
    version: string
    metadata?: ArtifactMetadata
    createdAt: string
    updatedAt: string
}

export const isArtifact = (value: unknown): value is Artifact => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'type' in value &&
        'description' in value &&
        'version' in value &&
        'createdAt' in value &&
        'updatedAt' in value
    )
}

/**
 * Enhanced color palette for artifact types with semantic meaning
 */
export const ARTIFACT_COLORS: Record<ArtifactType, string> = {
    [ARTIFACT_TYPES.INTENT]: '#3B82F6', // Blue - Direction
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
}

/**
 * VisualArtifact creation payload
 */
export interface CreateArtifactPayload {
    name: string
    type: ArtifactType
    description: string
    metadata: ArtifactMetadata
}

/**
 * VisualArtifact update payload
 */
export interface UpdateArtifactPayload extends Partial<CreateArtifactPayload> {
    id: string
}

/**
 * VisualArtifact search query with semantic capabilities
 */
export interface ArtifactSearchQuery {
    text?: string
    type?: ArtifactType
    semanticTags?: string[]
    stakeholders?: string[]
    businessValueRange?: { min: number; max: number }
    dateRange?: { start: Date; end: Date }
    relationships?: { type: RelationType; targetId?: string }[]
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
    relationshipTypes?: RelationType[]
}

/**
 * VisualArtifact export format with enhanced metadata
 */
export interface ArtifactExport {
    artifacts: Artifact[]
    relationships: Relation[]
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
 * Foundational Artifacts
 */
export interface Intent extends Artifact {
    type: typeof ARTIFACT_TYPES.INTENT
}

export interface Context extends Artifact {
    type: typeof ARTIFACT_TYPES.CONTEXT
}

export interface Authority extends Artifact {
    type: typeof ARTIFACT_TYPES.AUTHORITY
}

export interface Evaluation extends Artifact {
    type: typeof ARTIFACT_TYPES.EVALUATION
}

/**
 * Strategic and Narrative Artifacts
 */

export interface Vision extends Artifact {
    type: typeof ARTIFACT_TYPES.VISION
}

export interface Policy extends Artifact {
    type: typeof ARTIFACT_TYPES.POLICY
}

export interface Principle extends Artifact {
    type: typeof ARTIFACT_TYPES.PRINCIPLE
}

export interface Guideline extends Artifact {
    type: typeof ARTIFACT_TYPES.GUIDELINE
}

export interface Concept extends Artifact {
    type: typeof ARTIFACT_TYPES.CONCEPT
}

export interface Indicator extends Artifact {
    type: typeof ARTIFACT_TYPES.INDICATOR
}

/**
 * Operational Artifacts
 */

export interface Process extends Artifact {
    type: typeof ARTIFACT_TYPES.PROCESS
}

export interface Procedure extends Artifact {
    type: typeof ARTIFACT_TYPES.PROCEDURE
}

export interface Event extends Artifact {
    type: typeof ARTIFACT_TYPES.EVENT
}

export interface Result extends Artifact {
    type: typeof ARTIFACT_TYPES.RESULT
}

/**
 * Organizational Artifacts
 */

export interface Actor extends Artifact {
    type: typeof ARTIFACT_TYPES.ACTOR
}

export interface Area extends Artifact {
    type: typeof ARTIFACT_TYPES.AREA
}