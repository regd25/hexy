import { useState, useEffect } from 'react'
import { Artifact, ArtifactType } from '../types/Artifact'
import { useNotifications } from './useNotifications'
import { useArtifactValidation } from './useArtifactValidation'
import { ArtifactEditorService, ArtifactFormData } from '../services/ArtifactEditorService'

interface UseArtifactEditorProps {
    artifact?: Artifact
    onSave: (artifact: Artifact) => void
    onCancel: () => void
}

export const useArtifactEditor = ({ artifact, onSave, onCancel }: UseArtifactEditorProps) => {
    const [formData, setFormData] = useState<ArtifactFormData>({
        name: artifact?.name || '',
        type: artifact?.type || 'concept',
        description: artifact?.description || '',
    })
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    const { showSuccess, showError } = useNotifications()
    const { validateAndShowErrors } = useArtifactValidation()

    useEffect(() => {
        const validation = ArtifactEditorService.validateFormData(formData)
        setValidationErrors(validation.errors)
    }, [formData])

    const handleInputChange = (field: keyof ArtifactFormData, value: string | ArtifactType) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSave = () => {
        const validation = ArtifactEditorService.validateFormData(formData)
        
        if (!validation.isValid) {
            showError('Por favor corrige los errores de validación antes de guardar')
            return
        }

        const artifactData = ArtifactEditorService.createArtifactFromFormData(formData, artifact)

        if (validateAndShowErrors(artifactData, 'artefacto')) {
            onSave(artifactData)
            showSuccess(`Artefacto "${artifactData.name}" guardado correctamente`)
        }
    }

    const handleCancel = () => {
        const shouldShowConfirmation = ArtifactEditorService.shouldShowCancelConfirmation(formData, artifact)
        
        if (shouldShowConfirmation) {
            const shouldCancel = window.confirm(
                '¿Estás seguro de que quieres cancelar? Se perderán los cambios.'
            )
            if (shouldCancel) {
                onCancel()
            }
        } else {
            onCancel()
        }
    }

    const hasFieldError = (fieldName: string): boolean =>
        validationErrors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()))

    const getFieldError = (fieldName: string): string | undefined =>
        validationErrors.find(error => error.toLowerCase().includes(fieldName.toLowerCase()))

    const isFormValid = validationErrors.length === 0

    return {
        formData,
        validationErrors,
        handleInputChange,
        handleSave,
        handleCancel,
        hasFieldError,
        getFieldError,
        isFormValid,
    }
} 