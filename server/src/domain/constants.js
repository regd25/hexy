/**
 * Constantes y defaults del dominio Hexy.
 * Portado de shared/types/Artifact.ts y dashboard/artifacts/types/artifact.types.ts
 * (SSOT del modelo de artefactos). Mantener sincronizado con esos archivos.
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
}

export const ARTIFACT_TYPE_VALUES = Object.values(ARTIFACT_TYPES)

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
}

export const RELATION_TYPE_VALUES = Object.values(RELATION_TYPES)

/** Paleta de colores por tipo de artefacto (para visualProperties.color). */
export const ARTIFACT_COLORS = {
    [ARTIFACT_TYPES.INTENT]: '#3B82F6',
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
}

/** Autoridad por defecto sugerida para ciertos tipos (usado por ValidationService). */
export const ARTIFACT_TYPE_CONFIGS = {
    [ARTIFACT_TYPES.VISION]: { defaultAuthority: 'Executive Leadership' },
    [ARTIFACT_TYPES.POLICY]: { defaultAuthority: 'Governance Board' },
    [ARTIFACT_TYPES.PRINCIPLE]: { defaultAuthority: 'Architecture Council' },
}

/**
 * Alias de tipos legacy → canónico (datos persistidos antes de un rename).
 * `purpose` → `intent` unifica el lenguaje ubicuo con SOL.
 */
export const LEGACY_ARTIFACT_TYPE_ALIASES = {
    purpose: ARTIFACT_TYPES.INTENT,
}

/** Normaliza un tipo posiblemente legacy a su valor canónico. */
export const normalizeArtifactType = (type) => LEGACY_ARTIFACT_TYPE_ALIASES[type] ?? type

export const createDefaultSemanticMetadata = () => ({
    semanticTags: [],
    businessValue: 5,
    stakeholders: [],
    dependencies: [],
    semanticWeight: 0.5,
    contextualRelevance: 0.5,
    temporalRelevance: 0.5,
})

export const createDefaultVisualizationProperties = (type, x, y) => ({
    x,
    y,
    scale: 1,
    opacity: 0.8,
    color: ARTIFACT_COLORS[type] ?? '#6B7280',
    radius: 20,
    strokeWidth: 2,
    strokeColor: '#374151',
})
