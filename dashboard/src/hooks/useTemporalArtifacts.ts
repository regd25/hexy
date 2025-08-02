import { useCallback } from 'react'
import { useArtifactStore } from '../stores/artifactStore'
import { useNotifications } from './useNotifications'
import { useArtifactValidation } from './useArtifactValidation'
import { TemporalArtifact, Artifact } from '../types/Artifact'

export const useTemporalArtifacts = () => {
    const {
        temporalArtifacts,
        addTemporalArtifact,
        updateTemporalArtifact,
        commitTemporalArtifact,
        discardTemporalArtifact,
        getTemporalArtifactById,
    } = useArtifactStore()

    const { showSuccess, showError } = useNotifications()
    const { validateAndShowErrors, validateName, validateDescription } =
        useArtifactValidation()

    const createTemporalArtifact = useCallback(
        (x: number, y: number) => {
            const temporalArtifact = addTemporalArtifact({
                name: '',
                type: 'concept',
                info: '',
                description: '',
                x,
                y,
                vx: 0,
                vy: 0,
                fx: null,
                fy: null,
            })

            return temporalArtifact
        },
        [addTemporalArtifact]
    )

    const updateTemporalArtifactName = useCallback(
        (id: string, name: string) => {
            const nameErrors = validateName(name)

            updateTemporalArtifact(id, {
                name,
                status: name.trim().length > 0 ? 'editing' : 'creating',
                validationErrors: nameErrors,
            })

            // Always return true to allow continuing with description
            return true
        },
        [updateTemporalArtifact, validateName]
    )

    const updateTemporalArtifactDescription = useCallback(
        (id: string, description: string) => {
            const descriptionErrors = validateDescription(description)

            updateTemporalArtifact(id, {
                description,
                info: description,
                status: 'editing',
                validationErrors: descriptionErrors,
            })

            return descriptionErrors.length === 0
        },
        [updateTemporalArtifact, validateDescription]
    )

    const saveTemporalArtifact = useCallback(
        (id: string): Artifact | null => {
            const temporalArtifact = getTemporalArtifactById(id)

            if (!temporalArtifact) {
                showError('Artefacto temporal no encontrado')
                return null
            }

            // Only validate the name for saving (not the entire artifact)
            const nameErrors = validateName(temporalArtifact.name)
            if (nameErrors.length > 0) {
                updateTemporalArtifact(id, {
                    status: 'error',
                    validationErrors: nameErrors,
                })
                showError(`Errores de validación: ${nameErrors.join(', ')}`)
                return null
            }

            updateTemporalArtifact(id, { status: 'saving' })

            const permanentArtifact = commitTemporalArtifact(id)

            if (permanentArtifact) {
                showSuccess(
                    `Artefacto "${permanentArtifact.name}" creado exitosamente`
                )
                return permanentArtifact
            } else {
                showError('Error al guardar el artefacto')
                return null
            }
        },
        [
            getTemporalArtifactById,
            validateName,
            updateTemporalArtifact,
            commitTemporalArtifact,
            showSuccess,
            showError,
        ]
    )

    const cancelTemporalArtifact = useCallback(
        (id: string) => {
            discardTemporalArtifact(id)
        },
        [discardTemporalArtifact]
    )

    const getTemporalArtifact = useCallback(
        (id: string) => {
            return getTemporalArtifactById(id)
        },
        [getTemporalArtifactById]
    )

    const getTemporalArtifactsByStatus = useCallback(
        (status: TemporalArtifact['status']) => {
            return temporalArtifacts.filter(
                artifact => artifact.status === status
            )
        },
        [temporalArtifacts]
    )

    const hasValidationErrors = useCallback(
        (id: string) => {
            const artifact = getTemporalArtifactById(id)
            return (
                artifact?.validationErrors &&
                artifact.validationErrors.length > 0
            )
        },
        [getTemporalArtifactById]
    )

    const getValidationErrors = useCallback(
        (id: string) => {
            const artifact = getTemporalArtifactById(id)
            return artifact?.validationErrors || []
        },
        [getTemporalArtifactById]
    )

    const validateTemporalArtifact = useCallback(
        (id: string) => {
            const artifact = getTemporalArtifactById(id)
            if (!artifact) return false

            return validateAndShowErrors(artifact, 'artefacto temporal')
        },
        [getTemporalArtifactById, validateAndShowErrors]
    )

    return {
        temporalArtifacts,
        createTemporalArtifact,
        updateTemporalArtifactName,
        updateTemporalArtifactDescription,
        saveTemporalArtifact,
        cancelTemporalArtifact,
        getTemporalArtifact,
        getTemporalArtifactsByStatus,
        hasValidationErrors,
        getValidationErrors,
        validateTemporalArtifact,
    }
}
