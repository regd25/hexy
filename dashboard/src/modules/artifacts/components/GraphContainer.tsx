import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useEventBus } from '../../../shared/event-bus'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { InlineEditor } from '../../../shared/editors/InlineEditor'
import { FloatingEditor as FloatingTextArea } from '../../../shared/editors/FloatingEditor'
import { ArtifactNode } from './ArtifactNode'
import { ArtifactService } from '../services'
import { Artifact, CreateArtifactPayload } from '../types'

interface GraphContainerProps {
    className?: string
}

export const GraphContainer: React.FC<GraphContainerProps> = ({
    className,
}) => {
    const [isNameEditorVisible, setIsNameEditorVisible] = useState(false)
    const [isDescriptionEditorVisible, setIsDescriptionEditorVisible] =
        useState(false)
    const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(
        null
    )
    const [newArtifactPosition, setNewArtifactPosition] = useState({
        x: 0,
        y: 0,
    })
    const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 })
    const [isCreatingRelation, setIsCreatingRelation] = useState(false)
    const [relationSource, setRelationSource] = useState<Artifact | null>(null)
    const [relationLine, setRelationLine] = useState<{
        x1: number
        y1: number
        x2: number
        y2: number
    } | null>(null)
    const [tempArtifact, setTempArtifact] = useState<Artifact | null>(null)
    const [currentName, setCurrentName] = useState('')
    const [nameValidationErrors, setNameValidationErrors] = useState<string[]>(
        []
    )
    const [artifacts, setArtifacts] = useState<Artifact[]>([])

    const canvasRef = useRef<HTMLDivElement>(null)
    const eventBus = useEventBus()
    const { showSuccess, showError } = useNotifications()

    // Initialize ArtifactService
    const artifactService = useMemo(
        () => new ArtifactService(eventBus),
        [eventBus]
    )

    // Load artifacts on mount
    useEffect(() => {
        const loadArtifacts = async () => {
            try {
                const loadedArtifacts = await artifactService.getAllArtifacts()
                setArtifacts(loadedArtifacts)
            } catch (error) {
                console.error('Error loading artifacts:', error)
            }
        }
        loadArtifacts()
    }, [artifactService])

    // Listen for artifact changes
    useEffect(() => {
        const unsubscribeCreated = eventBus.subscribe(
            'artifact:created',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev => [...prev, data.artifact])
                }
            }
        )

        const unsubscribeUpdated = eventBus.subscribe(
            'artifact:updated',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev =>
                        prev.map(a =>
                            a.id === data.artifact.id ? data.artifact : a
                        )
                    )
                }
            }
        )

        const unsubscribeDeleted = eventBus.subscribe(
            'artifact:deleted',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev => prev.filter(a => a.id !== data.id))
                }
            }
        )

        return () => {
            unsubscribeCreated()
            unsubscribeUpdated()
            unsubscribeDeleted()
        }
    }, [eventBus])

    // Validate name in real-time
    const validateNameInput = (name: string): string[] => {
        const errors: string[] = []

        if (!name || name.trim().length === 0) {
            errors.push('El nombre del artefacto es requerido')
        } else if (name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres')
        } else if (name.trim().length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres')
        }

        // Check for duplicate names
        const existingArtifact = artifacts.find(
            a => a.name.toLowerCase() === name.trim().toLowerCase()
        )
        if (existingArtifact) {
            errors.push('Ya existe un artefacto con este nombre')
        }

        return errors
    }

    const handleNameChange = (name: string) => {
        setCurrentName(name)
        const errors = validateNameInput(name)
        setNameValidationErrors(errors)
    }

    // Simple validation for descriptions
    const validateDescription = (description: string): string[] => {
        const errors: string[] = []
        if (!description || description.trim().length === 0) {
            errors.push('La descripción del artefacto es requerida')
        } else if (description.trim().length < 10) {
            errors.push('La descripción debe tener al menos 10 caracteres')
        } else if (description.trim().length > 1000) {
            errors.push('La descripción no puede exceder 1000 caracteres')
        }
        return errors
    }



    const handleCanvasClick = (event: React.MouseEvent) => {
        if (!canvasRef.current || isCreatingRelation) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        // Check if clicking on existing artifact
        const clickedArtifact = artifacts.find(artifact => {
            const dx = x - artifact.visualProperties.x
            const dy = y - artifact.visualProperties.y
            return Math.sqrt(dx * dx + dy * dy) < 28
        })

        if (!clickedArtifact) {
            // Create temporary artifact (using old format for compatibility with ArtifactNode)
            const tempArtifact: any = {
                id: `temp-${Date.now()}`,
                name: '',
                type: 'concept',
                description: '',
                x,
                y,
            }

            setTempArtifact(tempArtifact)
            setNewArtifactPosition({ x, y })
            setIsNameEditorVisible(true)
        }
    }

    const handleNameSave = async () => {
        if (!tempArtifact || !canvasRef.current || !currentName.trim()) return

        // Check if there are validation errors
        if (nameValidationErrors.length > 0) {
            showError(`Error en el nombre: ${nameValidationErrors.join(', ')}`)
            return
        }

        try {
            const payload: CreateArtifactPayload = {
                name: currentName,
                type: 'concept',
                description: '',
                coordinates: { x: tempArtifact.x, y: tempArtifact.y },
            }

            const newArtifact = await artifactService.createArtifact(payload)
            
            setIsNameEditorVisible(false)
            setTempArtifact(null)
            setCurrentName('')

            // Convert canvas coordinates to window coordinates
            const rect = canvasRef.current.getBoundingClientRect()
            const windowX = rect.left + newArtifact.visualProperties.x
            const windowY = rect.top + newArtifact.visualProperties.y + 80

            // Open description editor immediately
            setEditingArtifact(newArtifact)
            setEditorPosition({ x: windowX, y: windowY })
            setIsDescriptionEditorVisible(true)
            showSuccess(`Artefacto "${currentName}" creado`)
        } catch (error) {
            showError(`Error al crear artefacto: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
    }

    const handleNameCancel = () => {
        setIsNameEditorVisible(false)
        setTempArtifact(null)
        setCurrentName('')
    }

    const handleArtifactClick = (
        artifact: Artifact,
        event: React.MouseEvent
    ) => {
        if (isCreatingRelation || !canvasRef.current) return

        event.stopPropagation()

        // Convert canvas coordinates to window coordinates
        const rect = canvasRef.current.getBoundingClientRect()
        const windowX = rect.left + artifact.visualProperties.x
        const windowY = rect.top + artifact.visualProperties.y + 80

        setEditingArtifact(artifact)
        setEditorPosition({ x: windowX, y: windowY })
        setIsDescriptionEditorVisible(true)
    }

    const handleArtifactDoubleClick = (
        artifact: Artifact,
        event: React.MouseEvent
    ) => {
        event.preventDefault()
        event.stopPropagation()

        setIsCreatingRelation(true)
        setRelationSource(artifact)
        setRelationLine({
            x1: artifact.visualProperties.x,
            y1: artifact.visualProperties.y,
            x2: event.clientX,
            y2: event.clientY,
        })
    }

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!canvasRef.current || !isCreatingRelation) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        if (relationLine && relationSource) {
            setRelationLine({
                ...relationLine,
                x2: x,
                y2: y,
            })
        }
    }

    const handleMouseUp = (event: React.MouseEvent) => {
        if (!isCreatingRelation || !relationSource) return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        const targetArtifact = artifacts.find(
            artifact =>
                artifact.id !== relationSource.id &&
                Math.sqrt(
                    Math.pow(x - artifact.visualProperties.x, 2) + Math.pow(y - artifact.visualProperties.y, 2)
                ) < 28
        )

        if (targetArtifact) {
            // Create relationship
            const relationshipText = `@${targetArtifact.id}`
            const currentDescription = relationSource.description || ''
            const newDescription =
                currentDescription +
                (currentDescription ? '\n' : '') +
                relationshipText

            // Update artifact using ArtifactService
            const updateArtifact = async () => {
                try {
                    await artifactService.updateArtifact(relationSource.id, {
                        id: relationSource.id,
                        description: newDescription,
                    })
                    showSuccess(`Relación creada con ${targetArtifact.name}`)
                } catch (error) {
                    showError(`Error al crear relación: ${error instanceof Error ? error.message : 'Error desconocido'}`)
                }
            }
            updateArtifact()

            // Convert canvas coordinates to window coordinates
            const rect = canvasRef.current?.getBoundingClientRect()
            if (rect) {
                const windowX = rect.left + relationSource.visualProperties.x
                const windowY = rect.top + relationSource.visualProperties.y + 80

                setEditingArtifact(relationSource)
                setEditorPosition({ x: windowX, y: windowY })
                setIsDescriptionEditorVisible(true)
            }
        }

        setIsCreatingRelation(false)
        setRelationSource(null)
        setRelationLine(null)
    }

    const handleSaveDescription = async (description: string) => {
        if (editingArtifact) {
            // Validate description
            const descriptionErrors = validateDescription(description)
            if (descriptionErrors.length > 0) {
                showError(
                    `Error en la descripción: ${descriptionErrors.join(', ')}`
                )
                return
            }

            try {
                await artifactService.updateArtifact(editingArtifact.id, {
                    id: editingArtifact.id,
                    description,
                })
                showSuccess(`Artefacto "${editingArtifact.name}" actualizado`)
            } catch (error) {
                showError(`Error al actualizar artefacto: ${error instanceof Error ? error.message : 'Error desconocido'}`)
            }
        }
        setIsDescriptionEditorVisible(false)
        setEditingArtifact(null)
    }

    const handleCancelDescription = () => {
        setIsDescriptionEditorVisible(false)
        setEditingArtifact(null)
    }

    return (
        <div className={`flex-1 bg-slate-900 flex flex-col ${className || ''}`}>
            <div className="p-4 border-b border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-2">
                    Grafo de Artefactos
                </h3>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg text-sm w-fit">
                    <span className="font-semibold text-blue-400">
                        {artifacts.length}
                    </span>
                    <span className="text-slate-300">
                        artefactos en el grafo
                    </span>
                </div>
            </div>

            <div
                ref={canvasRef}
                className="flex-1 relative bg-slate-950 cursor-pointer"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {relationLine && (
                    <svg className="absolute inset-0 pointer-events-none z-20">
                        <line
                            x1={relationLine.x1}
                            y1={relationLine.y1}
                            x2={relationLine.x2}
                            y2={relationLine.y2}
                            stroke="#60a5fa"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    </svg>
                )}

                {artifacts.length === 0 && !tempArtifact ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <p className="text-lg mb-2">
                            Haz clic en el canvas para crear un artefacto
                        </p>
                        <p className="text-sm">
                            Sistema de artefactos restaurado
                        </p>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
                        {/* Render temporary artifact */}
                        {tempArtifact && (
                            <ArtifactNode
                                artifact={tempArtifact}
                                isTemporary={true}
                            />
                        )}

                        {/* Render existing artifacts */}
                        {artifacts.map(artifact => (
                            <ArtifactNode
                                key={artifact.id}
                                artifact={artifact}
                                onClick={handleArtifactClick}
                                onDoubleClick={handleArtifactDoubleClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <InlineEditor
                isVisible={isNameEditorVisible}
                initialValue=""
                onChange={handleNameChange}
                onSave={handleNameSave}
                onCancel={handleNameCancel}
                position={{
                    x: canvasRef.current
                        ? canvasRef.current.getBoundingClientRect().left +
                          newArtifactPosition.x
                        : newArtifactPosition.x,
                    y: canvasRef.current
                        ? canvasRef.current.getBoundingClientRect().top +
                          newArtifactPosition.y +
                          80
                        : newArtifactPosition.y + 80,
                }}
                placeholder="Nombre del artefacto..."
            />

            <FloatingTextArea
                isVisible={isDescriptionEditorVisible}
                position={editorPosition}
                onSave={handleSaveDescription}
                onCancel={handleCancelDescription}
                initialText={
                    editingArtifact?.description || editingArtifact?.info || ''
                }
                title={
                    editingArtifact ? `Editando: ${editingArtifact.name}` : ''
                }
                subtitle={
                    editingArtifact ? `Tipo: ${editingArtifact.type}` : ''
                }
                placeholder="Describe este artefacto... (Ctrl+Enter para guardar)"
                showCancelButton={true}
                validateText={validateDescription}
            />
        </div>
    )
}

export default GraphContainer
