import { useCallback, useState, useEffect, useMemo } from 'react'
import { useEventBus } from '../../../shared/event-bus/useEventBus'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { ArtifactService, ValidationService } from '../services'
import { TemporalArtifact, Artifact, CreateArtifactPayload, ValidationResult } from '../types'

export const useTemporalArtifacts = () => {
    const eventBus = useEventBus()
    const { showSuccess, showError } = useNotifications()

    const artifactService = useMemo(() => new ArtifactService(eventBus), [eventBus])
    const validationService = useMemo(() => new ValidationService(), [])

    const [temporalArtifacts, setTemporalArtifacts] = useState<TemporalArtifact[]>([])

    const isClose = (a: { x: number; y: number }, b: { x: number; y: number }, threshold = 2) => {
        return Math.hypot(a.x - b.x, a.y - b.y) <= threshold
    }

    useEffect(() => {
        const unsubscribeTemporalCreated = eventBus.subscribe<{ source: string; temporal: TemporalArtifact }>(
            'temporal:created',
            event => {
                if (event.data.source === 'artifacts-module') {
                    setTemporalArtifacts(prev => {
                        const exists = prev.some(t => t.temporaryId === event.data.temporal.temporaryId)
                        return exists ? prev.map(t => (t.temporaryId === event.data.temporal.temporaryId ? event.data.temporal : t)) : [...prev, event.data.temporal]
                    })
                }
            }
        )

        const unsubscribeTemporalUpdated = eventBus.subscribe<{ source: string; temporal: TemporalArtifact }>(
            'temporal:updated',
            event => {
                if (event.data.source === 'artifacts-module') {
                    setTemporalArtifacts(prev =>
                        prev.map(temp => (temp.temporaryId === event.data.temporal.temporaryId ? event.data.temporal : temp))
                    )
                }
            }
        )

        const unsubscribeTemporalPromoted = eventBus.subscribe<{ source: string; temporalId: string }>(
            'temporal:promoted',
            event => {
                if (event.data.source === 'artifacts-module') {
                    setTemporalArtifacts(prev => prev.filter(temp => temp.temporaryId !== event.data.temporalId))
                }
            }
        )

        const unsubscribeTemporalDeleted = eventBus.subscribe<{ source: string; temporalId: string }>(
            'temporal:deleted',
            event => {
                if (event.data.source === 'artifacts-module') {
                    setTemporalArtifacts(prev => prev.filter(temp => temp.temporaryId !== event.data.temporalId))
                }
            }
        )

        const unsubscribeArtifactCreated = eventBus.subscribe<{ source: string; artifact: Artifact }>(
            'artifact:created',
            event => {
                if (event.data.source === 'artifacts-module') {
                    const art = event.data.artifact
                    setTemporalArtifacts(prev =>
                        prev.filter(t => {
                            if (!t.name || t.name.trim().length === 0) return true
                            const sameName = t.name.trim().toLowerCase() === art.name.trim().toLowerCase()
                            const closePos = isClose(t.coordinates, art.coordinates, 4)
                            return !(sameName && closePos)
                        })
                    )
                }
            }
        )

        return () => {
            unsubscribeTemporalCreated()
            unsubscribeTemporalUpdated()
            unsubscribeTemporalPromoted()
            unsubscribeTemporalDeleted()
            unsubscribeArtifactCreated()
        }
    }, [eventBus])

    const createTemporalArtifact = useCallback(
        async (x: number, y: number): Promise<TemporalArtifact | null> => {
            try {
                const payload: Partial<CreateArtifactPayload> = {
                    name: '',
                    type: 'concept',
                    description: '',
                    coordinates: { x, y },
                }

                const temporalArtifact = await artifactService.createTemporalArtifact(payload)
                // Optimistic insert (guarded). Event will sync it too.
                setTemporalArtifacts(prev => {
                    const exists = prev.some(t => t.temporaryId === temporalArtifact.temporaryId)
                    return exists ? prev : [...prev, temporalArtifact]
                })
                return temporalArtifact
            } catch (error) {
                console.error('Error creating temporal artifact:', error)
                showError('Error al crear artefacto temporal')
                return null
            }
        },
        [artifactService, showError]
    )

    const updateTemporalArtifactName = useCallback(
        async (temporaryId: string, name: string): Promise<boolean> => {
            try {
                const validation: ValidationResult = await validationService.validatePartialArtifact({ name })
                const nameErrors = validation.errors.filter(err => err.field === 'name')

                const updates: Partial<TemporalArtifact> = {
                    name,
                    status: name.trim().length > 0 ? 'editing' : 'creating',
                    validationErrors: nameErrors.map(err => err.message),
                }

                await artifactService.updateTemporalArtifact(temporaryId, updates)
                return true
            } catch (error) {
                console.error('Error updating temporal artifact name:', error)
                showError('Error al actualizar nombre del artefacto')
                return false
            }
        },
        [artifactService, validationService, showError]
    )

    const updateTemporalArtifactDescription = useCallback(
        async (temporaryId: string, description: string): Promise<boolean> => {
            try {
                const validation: ValidationResult = await validationService.validatePartialArtifact({
                    description,
                })
                const descriptionErrors = validation.errors.filter(err => err.field === 'description')

                const updates: Partial<TemporalArtifact> = {
                    description,
                    status: 'editing',
                    validationErrors: descriptionErrors.map(err => err.message),
                }

                await artifactService.updateTemporalArtifact(temporaryId, updates)
                return descriptionErrors.length === 0
            } catch (error) {
                console.error('Error updating temporal artifact description:', error)
                showError('Error al actualizar descripción del artefacto')
                return false
            }
        },
        [artifactService, validationService, showError]
    )

    const saveTemporalArtifact = useCallback(
        async (temporaryId: string): Promise<Artifact | null> => {
            try {
                const temporalArtifact = await artifactService.getTemporalArtifact(temporaryId)

                if (!temporalArtifact) {
                    showError('Artefacto temporal no encontrado')
                    return null
                }

                const validation = await validationService.validatePartialArtifact({
                    name: temporalArtifact.name,
                })

                if (!validation.isValid) {
                    const updates: Partial<TemporalArtifact> = {
                        status: 'error',
                        validationErrors: validation.errors.map(err => err.message),
                    }
                    await artifactService.updateTemporalArtifact(temporaryId, updates)
                    showError(`Errores de validación: ${validation.errors.map(e => e.message).join(', ')}`)
                    return null
                }

                const permanentArtifact = await artifactService.promoteTemporalArtifact(temporaryId)

                // Ensure local removal even if event is missed
                setTemporalArtifacts(prev => prev.filter(t => t.temporaryId !== temporaryId))

                showSuccess(`Artefacto "${permanentArtifact.name}" creado exitosamente`)
                return permanentArtifact
            } catch (error) {
                console.error('Error saving temporal artifact:', error)
                showError('Error al guardar el artefacto')
                return null
            }
        },
        [artifactService, validationService, showSuccess, showError]
    )

    const cancelTemporalArtifact = useCallback(
        async (temporaryId: string): Promise<void> => {
            try {
                await artifactService.deleteTemporalArtifact(temporaryId)
                setTemporalArtifacts(prev => prev.filter(t => t.temporaryId !== temporaryId))
            } catch (error) {
                console.error('Error canceling temporal artifact:', error)
                showError('Error al cancelar artefacto temporal')
            }
        },
        [artifactService, showError]
    )

    const getTemporalArtifact = useCallback(
        (temporaryId: string): TemporalArtifact | undefined => {
            return temporalArtifacts.find(temp => temp.temporaryId === temporaryId)
        },
        [temporalArtifacts]
    )

    const getTemporalArtifactsByStatus = useCallback(
        (status: TemporalArtifact['status']): TemporalArtifact[] => {
            return temporalArtifacts.filter(artifact => artifact.status === status)
        },
        [temporalArtifacts]
    )

    const hasValidationErrors = useCallback(
        (temporaryId: string): boolean => {
            const artifact = getTemporalArtifact(temporaryId)
            return Boolean(artifact?.validationErrors && artifact.validationErrors.length > 0)
        },
        [getTemporalArtifact]
    )

    const getValidationErrors = useCallback(
        (temporaryId: string): string[] => {
            const artifact = getTemporalArtifact(temporaryId)
            return artifact?.validationErrors || []
        },
        [getTemporalArtifact]
    )

    const validateTemporalArtifact = useCallback(
        async (temporaryId: string): Promise<boolean> => {
            const artifact = getTemporalArtifact(temporaryId)
            if (!artifact) return false

            try {
                const validation = await validationService.validatePartialArtifact(artifact)

                if (!validation.isValid) {
                    showError(`Errores de validación: ${validation.errors.map(e => e.message).join(', ')}`)
                }

                return validation.isValid
            } catch (error) {
                console.error('Error validating temporal artifact:', error)
                showError('Error al validar artefacto temporal')
                return false
            }
        },
        [getTemporalArtifact, validationService, showError]
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
