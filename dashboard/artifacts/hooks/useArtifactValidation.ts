import { useCallback, useMemo } from 'react'
import { useNotifications } from '../../shared/notifications/useNotifications'
import { ValidationService } from '../services'
import { Artifact, TemporalArtifact, ValidationResult } from '../types'

export const useArtifactValidation = () => {
    const { showError } = useNotifications()

    const validationService = useMemo(() => new ValidationService(), [])

    const validateName = useCallback(
        async (name: string): Promise<string[]> => {
            try {
                const validation: ValidationResult = await validationService.validatePartialArtifact({ name })
                return validation.errors.filter(err => err.field === 'name').map(err => err.message)
            } catch (error) {
                console.error('Error validating name:', error)
                return ['Error al validar nombre']
            }
        },
        [validationService]
    )

    const validateDescription = useCallback(
        async (description: string): Promise<string[]> => {
            try {
                const validation: ValidationResult = await validationService.validatePartialArtifact({
                    description,
                })
                return validation.errors.filter(err => err.field === 'description').map(err => err.message)
            } catch (error) {
                console.error('Error validating description:', error)
                return ['Error al validar descripción']
            }
        },
        [validationService]
    )

    const validateArtifactForSave = useCallback(
        async (artifactData: Partial<Artifact>): Promise<string[]> => {
            try {
                const validation: ValidationResult = await validationService.validatePartialArtifact(artifactData)
                return validation.errors.map(err => err.message)
            } catch (error) {
                console.error('Error validating artifact for save:', error)
                return ['Error al validar artefacto']
            }
        },
        [validationService]
    )

    const validateAndShowErrors = useCallback(
        async (artifact: Partial<Artifact> | TemporalArtifact, entityName: string): Promise<boolean> => {
            try {
                const validation: ValidationResult = await validationService.validatePartialArtifact(artifact)

                if (!validation.isValid) {
                    const errorMessages = validation.errors.map(err => err.message).join(', ')
                    showError(`Errores en ${entityName}: ${errorMessages}`)
                    return false
                }

                return true
            } catch (error) {
                console.error('Error in validation:', error)
                showError(`Error al validar ${entityName}`)
                return false
            }
        },
        [validationService, showError]
    )

    const validateFullArtifact = useCallback(
        async (artifact: Artifact): Promise<ValidationResult> => {
            try {
                return await validationService.validateArtifact(artifact)
            } catch (error) {
                console.error('Error validating full artifact:', error)
                return {
                    isValid: false,
                    errors: [
                        {
                            field: 'general',
                            message: 'Error al validar artefacto',
                            code: 'VALIDATION_ERROR',
                            severity: 'error',
                        },
                    ],
                    warnings: [],
                    suggestions: [],
                    semanticScore: 0,
                }
            }
        },
        [validationService]
    )

    const validateTemporalArtifact = useCallback(
        async (temporal: TemporalArtifact): Promise<ValidationResult> => {
            try {
                return await validationService.validateTemporalArtifact(temporal)
            } catch (error) {
                console.error('Error validating temporal artifact:', error)
                return {
                    isValid: false,
                    errors: [
                        {
                            field: 'general',
                            message: 'Error al validar artefacto temporal',
                            code: 'VALIDATION_ERROR',
                            severity: 'error',
                        },
                    ],
                    warnings: [],
                    suggestions: [],
                    semanticScore: 0,
                }
            }
        },
        [validationService]
    )

    return {
        validateName,
        validateDescription,
        validateArtifactForSave,
        validateAndShowErrors,
        validateFullArtifact,
        validateTemporalArtifact,
    }
}
