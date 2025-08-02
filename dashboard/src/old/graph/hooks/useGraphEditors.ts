import { useState, useCallback } from 'react'
import { Artifact } from '../../../types/Artifact'
import { useTemporalArtifacts } from '../../../hooks/useTemporalArtifacts'
import { useArtifactValidation } from '../../../hooks/useArtifactValidation'
import { useNotifications } from '../../../hooks/useNotifications'
import { useArtifactStore } from '../../../stores/artifactStore'

export const useGraphEditors = () => {
    const [isNameEditorVisible, setIsNameEditorVisible] = useState(false)
    const [isDescriptionEditorVisible, setIsDescriptionEditorVisible] =
        useState(false)
    const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(
        null
    )
    const [editingTemporalId, setEditingTemporalId] = useState<string | null>(
        null
    )
    const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 })

    const {
        updateTemporalArtifactName,
        updateTemporalArtifactDescription,
        saveTemporalArtifact,
        cancelTemporalArtifact,
        getTemporalArtifact,
    } = useTemporalArtifacts()

    const { validateAndShowErrors, validateName } = useArtifactValidation()
    const { showSuccess, showError } = useNotifications()

    const handleNameChange = useCallback(
        (name: string) => {
            if (editingTemporalId) {
                updateTemporalArtifactName(editingTemporalId, name)
            }
        },
        [editingTemporalId, updateTemporalArtifactName]
    )

    const handleNameSave = useCallback(() => {
        if (!editingTemporalId) return

        const temporalArtifact = getTemporalArtifact(editingTemporalId)
        if (!temporalArtifact) return

        const nameErrors = validateName(temporalArtifact.name)
        if (nameErrors.length > 0) {
            showError(`Errores de validación: ${nameErrors.join(', ')}`)
            return null
        }

        const permanentArtifact = saveTemporalArtifact(editingTemporalId)

        if (permanentArtifact) {
            setIsNameEditorVisible(false)
            setEditingTemporalId(null)
            return permanentArtifact
        }

        return null
    }, [
        editingTemporalId,
        getTemporalArtifact,
        validateName,
        saveTemporalArtifact,
        showError,
    ])

    const handleNameCancel = useCallback(() => {
        if (editingTemporalId) {
            cancelTemporalArtifact(editingTemporalId)
        }
        setIsNameEditorVisible(false)
        setEditingTemporalId(null)
    }, [editingTemporalId, cancelTemporalArtifact])

    const handleArtifactClick = useCallback(
        (
            artifact: Artifact,
            event: React.MouseEvent,
            canvasRef: React.RefObject<HTMLDivElement | null>
        ) => {
            if (!canvasRef.current) return

            event.stopPropagation()

            const rect = canvasRef.current.getBoundingClientRect()
            const windowX = rect.left + artifact.x
            const windowY = rect.top + artifact.y + 80

            setEditingArtifact(artifact)
            setEditorPosition({ x: windowX, y: windowY })
            setIsDescriptionEditorVisible(true)
        },
        []
    )

    const handleTemporalArtifactClick = useCallback(
        (
            temporalArtifact: any,
            event: React.MouseEvent,
            canvasRef: React.RefObject<HTMLDivElement | null>
        ) => {
            if (!canvasRef.current) return

            event.stopPropagation()

            const rect = canvasRef.current.getBoundingClientRect()
            const windowX = rect.left + temporalArtifact.x
            const windowY = rect.top + temporalArtifact.y + 80

            setEditingTemporalId(temporalArtifact.id)
            setEditorPosition({ x: windowX, y: windowY })
            setIsDescriptionEditorVisible(true)
        },
        []
    )

    const handleSaveDescription = useCallback(
        (description: string) => {
            if (editingArtifact) {
                const updatedArtifact = {
                    ...editingArtifact,
                    description,
                    info: description,
                }

                if (validateAndShowErrors(updatedArtifact, 'artefacto')) {
                    const { updateArtifact } = useArtifactStore.getState()
                    updateArtifact(editingArtifact.id, updatedArtifact)
                    showSuccess(
                        `Artefacto "${editingArtifact.name}" actualizado`
                    )
                }
            } else if (editingTemporalId) {
                updateTemporalArtifactDescription(
                    editingTemporalId,
                    description
                )
            }

            setIsDescriptionEditorVisible(false)
            setEditingArtifact(null)
            setEditingTemporalId(null)
        },
        [
            editingArtifact,
            editingTemporalId,
            validateAndShowErrors,
            updateTemporalArtifactDescription,
            showSuccess,
        ]
    )

    const handleCancelDescription = useCallback(() => {
        setIsDescriptionEditorVisible(false)
        setEditingArtifact(null)
        setEditingTemporalId(null)
    }, [])

    const getCurrentEditingArtifact = useCallback(() => {
        if (editingArtifact) return editingArtifact
        if (editingTemporalId) return getTemporalArtifact(editingTemporalId)
        return null
    }, [editingArtifact, editingTemporalId, getTemporalArtifact])

    const getCurrentEditingText = useCallback(() => {
        const artifact = getCurrentEditingArtifact()
        return artifact?.description || artifact?.info || ''
    }, [getCurrentEditingArtifact])

    const openNameEditor = useCallback((temporalArtifact: any) => {
        setEditingTemporalId(temporalArtifact.id)
        setIsNameEditorVisible(true)
    }, [])

    const openDescriptionEditor = useCallback(
        (
            artifact: Artifact,
            canvasRef: React.RefObject<HTMLDivElement | null>
        ) => {
            if (!canvasRef.current) return

            const rect = canvasRef.current.getBoundingClientRect()
            const windowX = rect.left + artifact.x
            const windowY = rect.top + artifact.y + 80

            setEditingArtifact(artifact)
            setEditorPosition({ x: windowX, y: windowY })
            setIsDescriptionEditorVisible(true)
        },
        []
    )

    const isInCreationMode = useCallback(() => {
        return editingTemporalId !== null
    }, [editingTemporalId])

    return {
        isNameEditorVisible,
        isDescriptionEditorVisible,
        editorPosition,
        handleNameChange,
        handleNameSave,
        handleNameCancel,
        handleArtifactClick,
        handleTemporalArtifactClick,
        handleSaveDescription,
        handleCancelDescription,
        getCurrentEditingArtifact,
        getCurrentEditingText,
        openNameEditor,
        openDescriptionEditor,
        editingTemporalId,
        isInCreationMode,
    }
}
