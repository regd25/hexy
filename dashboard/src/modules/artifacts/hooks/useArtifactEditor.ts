import { useState, useEffect, useMemo, useCallback } from 'react'
import { useEventBus } from '../../../shared/event-bus/useEventBus'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { ArtifactService, ValidationService } from '../services'
import {
    Artifact,
    ArtifactType,
    CreateArtifactPayload,
    ValidationResult,
} from '../types'

interface ArtifactFormData {
    name: string
    type: ArtifactType
    description: string
    purpose?: string
    authority?: string
    evaluationCriteria?: string[]
}

interface UseArtifactEditorProps {
    artifact?: Artifact
    onSave: (artifact: Artifact) => void
    onCancel: () => void
}

export const useArtifactEditor = ({
    artifact,
    onSave,
    onCancel,
}: UseArtifactEditorProps) => {
    const eventBus = useEventBus()
    const { showSuccess, showError } = useNotifications()

    const artifactService = useMemo(
        () => new ArtifactService(eventBus),
        [eventBus]
    )
    const validationService = useMemo(() => new ValidationService(), [])

    const [formData, setFormData] = useState<ArtifactFormData>({
        name: artifact?.name || '',
        type: artifact?.type || 'concept',
        description: artifact?.description || '',
        purpose: artifact?.purpose || '',
        authority: artifact?.authority || '',
        evaluationCriteria: artifact?.evaluationCriteria || [],
    })

    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isValidating, setIsValidating] = useState(false)

    useEffect(() => {
        const validateForm = async () => {
            setIsValidating(true)
            try {
                const validation: ValidationResult =
                    await validationService.validatePartialArtifact(formData)
                setValidationErrors(validation.errors.map(err => err.message))
            } catch (error) {
                console.error('Error validating form:', error)
                setValidationErrors(['Error al validar formulario'])
            } finally {
                setIsValidating(false)
            }
        }

        validateForm()
    }, [formData, validationService])

    const handleInputChange = useCallback(
        (
            field: keyof ArtifactFormData,
            value: string | ArtifactType | string[]
        ) => {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }))
        },
        []
    )

    const handleSave = useCallback(async () => {
        setIsValidating(true)
        try {
            const validation: ValidationResult =
                await validationService.validateTemporalArtifact(formData)

            if (!validation.isValid) {
                showError(
                    'Por favor corrige los errores de validación antes de guardar'
                )
                return
            }

            if (artifact) {
                const updatedArtifact = await artifactService.updateArtifact(
                    artifact.id,
                    {
                        id: artifact.id,
                        ...formData,
                    }
                )
                onSave(updatedArtifact)
                showSuccess(
                    `Artefacto "${updatedArtifact.name}" actualizado correctamente`
                )
            } else {
                const payload: CreateArtifactPayload = {
                    name: formData.name,
                    type: formData.type,
                    description: formData.description,
                    purpose: formData.purpose || '',
                    authority: formData.authority || '',
                    evaluationCriteria: formData.evaluationCriteria || [],
                }

                const newArtifact =
                    await artifactService.createArtifact(payload)
                onSave(newArtifact)
                showSuccess(
                    `Artefacto "${newArtifact.name}" creado correctamente`
                )
            }
        } catch (error) {
            console.error('Error saving artifact:', error)
            showError('Error al guardar artefacto')
        } finally {
            setIsValidating(false)
        }
    }, [
        formData,
        artifact,
        artifactService,
        validationService,
        onSave,
        showSuccess,
        showError,
    ])

    const handleCancel = useCallback(() => {
        const hasChanges =
            formData.name !== (artifact?.name || '') ||
            formData.type !== (artifact?.type || 'concept') ||
            formData.description !== (artifact?.description || '') ||
            formData.purpose !== (artifact?.purpose || '') ||
            formData.authority !== (artifact?.authority || '')

        if (hasChanges) {
            const shouldCancel = window.confirm(
                '¿Estás seguro de que quieres cancelar? Se perderán los cambios.'
            )
            if (shouldCancel) {
                onCancel()
            }
        } else {
            onCancel()
        }
    }, [formData, artifact, onCancel])

    const hasFieldError = useCallback(
        (fieldName: string): boolean => {
            return validationErrors.some(error =>
                error.toLowerCase().includes(fieldName.toLowerCase())
            )
        },
        [validationErrors]
    )

    const getFieldError = useCallback(
        (fieldName: string): string | undefined => {
            return validationErrors.find(error =>
                error.toLowerCase().includes(fieldName.toLowerCase())
            )
        },
        [validationErrors]
    )

    const isFormValid =
        !isValidating &&
        validationErrors.length === 0 &&
        formData.name.trim().length > 0

    const addEvaluationCriterion = useCallback(
        (criterion: string) => {
            if (criterion.trim().length > 0) {
                const newCriteria = [
                    ...(formData.evaluationCriteria || []),
                    criterion.trim(),
                ]
                handleInputChange('evaluationCriteria', newCriteria)
            }
        },
        [formData.evaluationCriteria, handleInputChange]
    )

    const removeEvaluationCriterion = useCallback(
        (index: number) => {
            const newCriteria = [...(formData.evaluationCriteria || [])]
            newCriteria.splice(index, 1)
            handleInputChange('evaluationCriteria', newCriteria)
        },
        [formData.evaluationCriteria, handleInputChange]
    )

    const updateEvaluationCriterion = useCallback(
        (index: number, criterion: string) => {
            const newCriteria = [...(formData.evaluationCriteria || [])]
            newCriteria[index] = criterion
            handleInputChange('evaluationCriteria', newCriteria)
        },
        [formData.evaluationCriteria, handleInputChange]
    )

    return {
        formData,
        validationErrors,
        isValidating,
        isFormValid,
        handleInputChange,
        handleSave,
        handleCancel,
        hasFieldError,
        getFieldError,
        addEvaluationCriterion,
        removeEvaluationCriterion,
        updateEvaluationCriterion,
    }
}
