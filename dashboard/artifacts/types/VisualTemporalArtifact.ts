import { z } from "zod"
import { VisualArtifact, ValidationState, visualArtifactSchema } from "./VisualArtifact"

/**
 * Enhanced temporal artifact schema
 */
export const temporalArtifactSchema = visualArtifactSchema.partial().extend({
    status: z.enum(['creating', 'editing', 'error']),
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
 * Enhanced temporal artifact with validation progress and visual state
 */
export interface VisualTemporalArtifact extends Omit<VisualArtifact, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    status: 'creating' | 'editing' | 'error'
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

export const isTemporalArtifact = (value: unknown): value is VisualTemporalArtifact => {
    return temporalArtifactSchema.safeParse(value).success
}
