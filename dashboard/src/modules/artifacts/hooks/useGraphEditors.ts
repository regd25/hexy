import { useState, useCallback, useMemo } from 'react'
import { useEventBus } from '../../../shared/event-bus/useEventBus'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { ArtifactService } from '../services'
import { useTemporalArtifacts } from './useTemporalArtifacts'
import { Artifact, TemporalArtifact } from '../types'

interface EditorPosition {
    x: number
    y: number
    width?: number
    height?: number
}

export const useGraphEditors = () => {
    const eventBus = useEventBus()
    const { showError } = useNotifications()

    const artifactService = useMemo(
        () => new ArtifactService(eventBus),
        [eventBus]
    )

    const {
        createTemporalArtifact,
        updateTemporalArtifactName,
        updateTemporalArtifactDescription,
        saveTemporalArtifact,
        cancelTemporalArtifact,
        getTemporalArtifact,
    } = useTemporalArtifacts()

    const [isNameEditorVisible, setIsNameEditorVisible] = useState(false)
    const [isDescriptionEditorVisible, setIsDescriptionEditorVisible] =
        useState(false)
    const [currentTemporalId, setCurrentTemporalId] = useState<string | null>(
        null
    )
    const [nameEditorPosition, setNameEditorPosition] =
        useState<EditorPosition>({ x: 0, y: 0 })
    const [descriptionEditorPosition, setDescriptionEditorPosition] =
        useState<EditorPosition>({ x: 0, y: 0 })

    const openNameEditor = useCallback(
        async (x: number, y: number) => {
            try {
                const temporal = await createTemporalArtifact(x, y)
                if (temporal) {
                    setCurrentTemporalId(temporal.temporaryId)
                    setNameEditorPosition({ x, y: y - 40 })
                    setIsNameEditorVisible(true)
                }
            } catch (error) {
                console.error('Error opening name editor:', error)
                showError('Error al crear editor de nombre')
            }
        },
        [createTemporalArtifact, showError]
    )

    const closeNameEditor = useCallback(() => {
        if (currentTemporalId) {
            cancelTemporalArtifact(currentTemporalId)
        }
        setIsNameEditorVisible(false)
        setCurrentTemporalId(null)
    }, [currentTemporalId, cancelTemporalArtifact])

    const saveNameAndOpenDescription = useCallback(
        async (name: string) => {
            if (!currentTemporalId) return

            try {
                const success = await updateTemporalArtifactName(
                    currentTemporalId,
                    name
                )
                if (success && name.trim().length > 0) {
                    const temporal = getTemporalArtifact(currentTemporalId)
                    if (temporal) {
                        setDescriptionEditorPosition({
                            x: temporal.coordinates.x,
                            y: temporal.coordinates.y + 40,
                            width: 300,
                            height: 120,
                        })
                        setIsNameEditorVisible(false)
                        setIsDescriptionEditorVisible(true)
                    }
                }
            } catch (error) {
                console.error('Error saving name:', error)
                showError('Error al guardar nombre')
            }
        },
        [
            currentTemporalId,
            updateTemporalArtifactName,
            getTemporalArtifact,
            showError,
        ]
    )

    const openDescriptionEditor = useCallback((artifact: Artifact) => {
        setDescriptionEditorPosition({
            x: artifact.coordinates.x,
            y: artifact.coordinates.y + 40,
            width: 300,
            height: 120,
        })
        setIsDescriptionEditorVisible(true)
    }, [])

    const closeDescriptionEditor = useCallback(() => {
        setIsDescriptionEditorVisible(false)
        if (currentTemporalId) {
            setCurrentTemporalId(null)
        }
    }, [currentTemporalId])

    const saveDescription = useCallback(
        async (description: string) => {
            if (currentTemporalId) {
                try {
                    await updateTemporalArtifactDescription(
                        currentTemporalId,
                        description
                    )
                    const artifact =
                        await saveTemporalArtifact(currentTemporalId)

                    if (artifact) {
                        setIsDescriptionEditorVisible(false)
                        setCurrentTemporalId(null)
                    }
                } catch (error) {
                    console.error('Error saving temporal description:', error)
                    showError('Error al guardar descripción temporal')
                }
            } else {
                setIsDescriptionEditorVisible(false)
            }
        },
        [
            currentTemporalId,
            updateTemporalArtifactDescription,
            saveTemporalArtifact,
            showError,
        ]
    )

    const cancelDescription = useCallback(() => {
        if (currentTemporalId) {
            cancelTemporalArtifact(currentTemporalId)
            setCurrentTemporalId(null)
        }
        setIsDescriptionEditorVisible(false)
    }, [currentTemporalId, cancelTemporalArtifact])

    const updateArtifactDescription = useCallback(
        async (artifactId: string, description: string) => {
            try {
                await artifactService.updateArtifact(artifactId, {
                    id: artifactId,
                    description,
                })
            } catch (error) {
                console.error('Error updating artifact description:', error)
                showError('Error al actualizar descripción del artefacto')
            }
        },
        [artifactService, showError]
    )

    const getCurrentTemporalArtifact = useCallback(():
        | TemporalArtifact
        | undefined => {
        if (!currentTemporalId) return undefined
        return getTemporalArtifact(currentTemporalId)
    }, [currentTemporalId, getTemporalArtifact])

    const handleCanvasClick = useCallback(
        (x: number, y: number) => {
            if (isNameEditorVisible || isDescriptionEditorVisible) {
                return
            }
            openNameEditor(x, y)
        },
        [isNameEditorVisible, isDescriptionEditorVisible, openNameEditor]
    )

    const resetEditors = useCallback(() => {
        if (currentTemporalId) {
            cancelTemporalArtifact(currentTemporalId)
        }
        setIsNameEditorVisible(false)
        setIsDescriptionEditorVisible(false)
        setCurrentTemporalId(null)
    }, [currentTemporalId, cancelTemporalArtifact])

    const getEditorStyles = useCallback((position: EditorPosition) => {
        return {
            position: 'absolute' as const,
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: position.width ? `${position.width}px` : 'auto',
            height: position.height ? `${position.height}px` : 'auto',
            zIndex: 1000,
        }
    }, [])

    return {
        isNameEditorVisible,
        isDescriptionEditorVisible,
        currentTemporalId,
        nameEditorPosition,
        descriptionEditorPosition,
        openNameEditor,
        closeNameEditor,
        saveNameAndOpenDescription,
        openDescriptionEditor,
        closeDescriptionEditor,
        saveDescription,
        cancelDescription,
        updateArtifactDescription,
        getCurrentTemporalArtifact,
        handleCanvasClick,
        resetEditors,
        getEditorStyles,
    }
}
