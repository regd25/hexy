import { useCallback } from 'react'
import { useArtifactStore } from '../../../stores/artifactStore'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { Artifact, TemporalArtifact } from '../../../shared/types/Artifact'

export const useArtifactValidation = () => {
    const { validateArtifact } = useArtifactStore()
    const { showError } = useNotifications()

    const validateArtifactData = useCallback(
        (artifact: Partial<Artifact | TemporalArtifact>) => {
            return validateArtifact(artifact)
        },
        [validateArtifact]
    )

    const validateAndShowErrors = useCallback(
        (
            artifact: Partial<Artifact | TemporalArtifact>,
            context: string = 'artefacto'
        ) => {
            const errors = validateArtifactData(artifact)

            if (errors.length > 0) {
                const errorMessage = `Errores de validación en ${context}: ${errors.join(', ')}`
                showError(errorMessage)
                return false
            }

            return true
        },
        [validateArtifactData, showError]
    )

    const validateName = useCallback((name: string) => {
        const errors: string[] = []

        if (!name || name.trim().length === 0) {
            errors.push('El nombre del artefacto es requerido')
        } else if (name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres')
        } else if (name.trim().length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres')
        }

        return errors
    }, [])

    const validateType = useCallback((type: string) => {
        const errors: string[] = []

        if (!type) {
            errors.push('El tipo de artefacto es requerido')
        }

        return errors
    }, [])

    const validateDescription = useCallback((description: string) => {
        const errors: string[] = []
        if (!description || description.trim().length === 0) {
            errors.push('La descripción del artefacto es requerida')
        } else if (description.trim().length < 10) {
            errors.push('La descripción debe tener al menos 10 caracteres')
        } else if (description.trim().length > 1000) {
            errors.push('La descripción no puede exceder 1000 caracteres')
        }
        return errors
    }, [])

    const validateCoordinates = useCallback((x: number, y: number) => {
        const errors: string[] = []

        if (typeof x !== 'number' || isNaN(x)) {
            errors.push('Coordenada X inválida')
        }

        if (typeof y !== 'number' || isNaN(y)) {
            errors.push('Coordenada Y inválida')
        }

        return errors
    }, [])

    const validateArtifactForSave = useCallback(
        (artifact: Partial<Artifact | TemporalArtifact>) => {
            const allErrors: string[] = []

            // Validate name
            allErrors.push(...validateName(artifact.name || ''))

            // Validate type
            allErrors.push(...validateType(artifact.type || ''))

            // Validate description (optional but if present, validate length)
            if (artifact.description) {
                allErrors.push(...validateDescription(artifact.description))
            }

            // Validate coordinates
            if (artifact.x !== undefined && artifact.y !== undefined) {
                allErrors.push(...validateCoordinates(artifact.x, artifact.y))
            }

            return allErrors
        },
        [validateName, validateType, validateDescription, validateCoordinates]
    )

    const isArtifactValid = useCallback(
        (artifact: Partial<Artifact | TemporalArtifact>) => {
            return validateArtifactData(artifact).length === 0
        },
        [validateArtifactData]
    )

    const getValidationSummary = useCallback(
        (artifact: Partial<Artifact | TemporalArtifact>) => {
            const errors = validateArtifactData(artifact)
            return {
                isValid: errors.length === 0,
                errors,
                errorCount: errors.length,
                hasNameError: errors.some(error => error.includes('nombre')),
                hasTypeError: errors.some(error => error.includes('tipo')),
                hasDescriptionError: errors.some(error =>
                    error.includes('descripción')
                ),
                hasCoordinateError: errors.some(error =>
                    error.includes('Coordenada')
                ),
            }
        },
        [validateArtifactData]
    )

    return {
        validateArtifactData,
        validateAndShowErrors,
        validateName,
        validateType,
        validateDescription,
        validateCoordinates,
        validateArtifactForSave,
        isArtifactValid,
        getValidationSummary,
    }
}
