/**
 * Shared artifact types - Single Source of Truth
 * Base types that both core and dashboard extend
 * Compatible with existing artifact.types.ts and core/artifacts/Artifact.ts
 */

export type ArtifactId = string

export type LinkType = 'composition' | 'implementation' | 'measurement' | 'flow' | 'event' | 'dependency'

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
    metadata?: Record<string, unknown>
    createdAt: string
    updatedAt: string
}

/**
 * Link/relationship interface
 */
export interface Link {
    sourceId: ArtifactId
    targetId: ArtifactId
    type: LinkType
    confidence?: number
}

/**
 * Semantic artifact types following Hexy framework
 */
export const ARTIFACT_TYPES = {
    PURPOSE: 'purpose',
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
    REFERENCE: 'reference',
} as const

export type ArtifactType = (typeof ARTIFACT_TYPES)[keyof typeof ARTIFACT_TYPES]

export const isArtifact = (value: unknown): value is Artifact => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'type' in value &&
        'purpose' in value &&
        'authority' in value
    )
}

/**
 * Foundational Artifacts
 */
export interface Purpose extends Artifact {
    type: typeof ARTIFACT_TYPES.PURPOSE
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

export class Result<TValue, TError extends Error = Error> implements Artifact {
    type = ARTIFACT_TYPES.RESULT

    constructor(
        public ok: boolean,
        public value?: TValue,
        public error?: TError
    ) {}

    static ok<TValue, TError extends Error = Error>(value: TValue): Result<TValue, TError> {
        return new Result<TValue, TError>(true, value, undefined)
    }

    static err<TError extends Error>(error: TError): Result<never, TError> {
        return new Result<never, TError>(false, undefined, error)
    }

    static isOk<TValue, TError extends Error>(result: Result<TValue, TError>): result is Result<TValue, TError> {
        return result.ok
    }

    static map<TValue, TNewValue, TError extends Error>(
        result: Result<TValue, TError>,
        mapper: (value: TValue) => TNewValue
    ): Result<TNewValue, TError> {
        if (!result.value) throw new Error('Result has no value')
        return new Result<TNewValue, TError>(true, mapper(result.value))
    }

    static mapError<TValue, TError extends Error, TNewError extends Error>(
        result: Result<TValue, TError>,
        mapper: (error: TError) => TNewError
    ): Result<TValue, TNewError> {
        if (!result.error) throw new Error('Result has no error')
        return new Result<TValue, TNewError>(true, result.value, mapper(result.error))
    }

    static unwrapOrThrow<TValue, TError extends Error>(result: Result<TValue, TError>): TValue {
        if (result.ok) return result.value as TValue
        throw result.error
    }
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

export interface Reference extends Artifact {
    type: typeof ARTIFACT_TYPES.REFERENCE
}
