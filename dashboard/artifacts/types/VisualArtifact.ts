/**
 * Enhanced artifact types with D3.js visualization and semantic relationships
 * Following Hexy Framework semantic principles and DDD patterns
 * Extends base artifact types from shared SSOT
 */

import { z } from 'zod'
import {
    ArtifactType,
    ARTIFACT_TYPES,
    RelationType,
    Artifact,
    Relation,
    RELATION_TYPES,
    RELATION_COLORS,
    ARTIFACT_COLORS,
    ArtifactMetadata,
    CreateArtifactPayload,
    UpdateArtifactPayload
} from '@/shared'

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
 * Enhanced artifact interface with visualization and semantic properties
 * Extends base artifact from shared SSOT
 */
export interface VisualArtifact extends Artifact {
    visualProperties: VisualizationProperties
    coordinates: {
        x: number
        y: number
        z?: number
    }

    // Enhanced relationships
    relationships: Relation[]
}

/**
 * Validation state for individual artifact fields
 */
export type ValidationState = 'valid' | 'invalid' | 'pending' | 'warning'


/**
 * Visual properties for relationship rendering
 */
export interface RelationVisualProperties {
    strokeWidth: number
    strokeColor: string
    strokeDashArray?: string
    opacity: number
    animated: boolean
    curvature: number
    arrowSize: number
}


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

export const relationVisualPropertiesSchema = z.object({
    strokeWidth: z.number().min(1).max(10),
    strokeColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    strokeDashArray: z.string().optional(),
    opacity: z.number().min(0).max(1),
    animated: z.boolean(),
    curvature: z.number().min(0).max(1),
    arrowSize: z.number().min(5).max(20),
})

export const relationSchema = z.object({
    sourceId: z.string().uuid(),
    targetId: z.string().uuid(),
    type: z.string(),
    confidence: z.number().optional(),
    semanticStrength: z.number().min(0).max(1),
    businessImpact: z.enum(['high', 'medium', 'low']),
    id: z.string().uuid(),
    weight: z.number().min(0).max(1),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()),
    createdAt: z.date(),
    visualProperties: relationVisualPropertiesSchema,
    validationStatus: z.enum(['valid', 'warning', 'error']),
})

export const visualArtifactSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(200),
    type: z.enum(Object.values(ARTIFACT_TYPES) as [ArtifactType, ...ArtifactType[]]),
    description: z.string().min(10).max(2000),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    metadata: z.record(z.string(), z.unknown()).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    semanticMetadata: semanticMetadataSchema,
    visualProperties: visualizationPropertiesSchema,
    coordinates: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number().optional(),
    }),
    relationships: z.array(relationSchema),
})

export interface CreateVisualArtifactPayload extends CreateArtifactPayload {
    visualProperties: VisualizationProperties
}

export interface UpdateVisualArtifactPayload extends UpdateArtifactPayload {
    visualProperties?: Partial<VisualizationProperties>
}


/**
 * Type guards for runtime type checking
 */
export const isVisualArtifact = (value: unknown): value is VisualArtifact => {
    return visualArtifactSchema.safeParse(value).success
}


    export const isRelation = (value: unknown): value is Relation => {
    return relationSchema.safeParse(value).success
}

export const isValidRelationType = (type: string): type is RelationType => {
    return Object.values(RELATION_TYPES).includes(type as RelationType)
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


export const createDefaultRelationVisualProperties = (type: RelationType): RelationVisualProperties => {
    const strokeColor = RELATION_COLORS[type as RelationType]

    return {
        strokeWidth: 2,
        strokeColor,
        opacity: 0.7,
        animated: false,
        curvature: 0.3,
        arrowSize: 8,
    }
}
