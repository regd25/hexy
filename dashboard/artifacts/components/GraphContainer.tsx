import React, { useState, useRef, useEffect, useMemo, useCallback, RefObject } from 'react'
import { useEventBus } from '../../shared/event-bus'
import { useNotifications } from '../../shared/notifications/useNotifications'
import { InlineEditor } from '../../shared/editors/InlineEditor'
import { FloatingEditor as FloatingTextArea, FloatingEditorHandle } from '../../shared/editors/FloatingEditor'
import { ArtifactService } from '../services'
import { VisualArtifact } from '../types'
import { useTemporalArtifacts } from '../hooks/useTemporalArtifacts'
import { GraphHeader } from './GraphHeader'
import { GraphCanvas } from './GraphCanvas'
import { useGraphInteractions } from '../hooks/useGraphInteractions'
import ContextMenu from './ContextMenu'
import { AutocompleteDropdown } from '../../shared/auto-complete/AutocompleteDropdown'
import { useAutocomplete } from '../../shared/auto-complete/useAutocomplete'
import {
    RELATIONSHIP_TYPES,
    createDefaultRelationshipVisualProperties,
    type RelationshipType,
    type Relationship,
} from '../types/artifact.types'
import { ValidationService } from '../services/ValidationService'

interface GraphContainerProps {
    className?: string
}

export const GraphContainer: React.FC<GraphContainerProps> = ({ className }) => {
    const [isNameEditorVisible, setIsNameEditorVisible] = useState(false)
    const [isDescriptionEditorVisible, setIsDescriptionEditorVisible] = useState(false)
    const [editingArtifact, setEditingArtifact] = useState<VisualArtifact | null>(null)
    const [newArtifactPosition, setNewArtifactPosition] = useState({ x: 0, y: 0 })
    const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 })
    const [currentName, setCurrentName] = useState('')
    const [nameValidationErrors, setNameValidationErrors] = useState<string[]>([])
    const [artifacts, setArtifacts] = useState<VisualArtifact[]>([])
    const [currentTemporalId, setCurrentTemporalId] = useState<string | null>(null)
    const [pendingRelationFromId, setPendingRelationFromId] = useState<string | null>(null)
    const [pendingMentionName, setPendingMentionName] = useState<string | null>(null)

    const canvasRef = useRef<HTMLDivElement>(null) as unknown as RefObject<HTMLDivElement>
    const editorRef = useRef<FloatingEditorHandle>(null)
    const eventBus = useEventBus()
    const { showSuccess, showError } = useNotifications()

    const artifactService = useMemo(() => new ArtifactService(eventBus), [eventBus])
    const validationService = useMemo(() => new ValidationService(), [])

    const autocomplete = useAutocomplete<VisualArtifact>({
        items: artifacts,
        filterKeys: ['name', 'id', 'type'],
        trigger: '@',
        maxResults: 8,
        getDisplayValue: (item: VisualArtifact) => item.name.replace(/\s+/g, ''),
    })

    const {
        temporalArtifacts,
        createTemporalArtifact,
        updateTemporalArtifactName,
        updateTemporalArtifactDescription,
        saveTemporalArtifact,
        cancelTemporalArtifact,
        getTemporalArtifact,
    } = useTemporalArtifacts()

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

    useEffect(() => {
        const unsubscribeCreated = eventBus.subscribe<{ source: string; artifact: VisualArtifact }>(
            'artifact:created',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev => [...prev, data.artifact])
                }
            }
        )

        const unsubscribeUpdated = eventBus.subscribe<{ source: string; artifact: VisualArtifact }>(
            'artifact:updated',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev => prev.map(a => (a.id === data.artifact.id ? data.artifact : a)))
                }
            }
        )

        const unsubscribeDeleted = eventBus.subscribe<{ source: string; id: string }>(
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

    const validateNameInput = (name: string): string[] => {
        const errors: string[] = []
        if (!name || name.trim().length === 0) {
            errors.push('El nombre del artefacto es requerido')
        } else if (name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres')
        } else if (name.trim().length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres')
        }
        const existingArtifact = artifacts.find(a => a.name.toLowerCase() === name.trim().toLowerCase())
        if (existingArtifact) {
            errors.push('Ya existe un artefacto con este nombre')
        }
        return errors
    }

    const handleNameChange = async (name: string) => {
        setCurrentName(name)
        if (currentTemporalId) {
            try {
                await updateTemporalArtifactName(currentTemporalId, name)
                const temp = getTemporalArtifact(currentTemporalId)
                setNameValidationErrors(temp?.validationErrors || [])
            } catch (error) {
                setNameValidationErrors(validateNameInput(name))
            }
        } else {
            setNameValidationErrors(validateNameInput(name))
        }
    }

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

    const handleCanvasClick = async (event: React.MouseEvent) => {
        if (!canvasRef.current) return
        if (isDescriptionEditorVisible) {
            setTimeout(() => editorRef.current?.focus(), 0)
            return
        }
        if (interactions.shouldBlockCanvasClick()) return
        const rect = canvasRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        const clickedArtifact = artifacts.find(artifact => {
            const dx = x - artifact.visualProperties.x
            const dy = y - artifact.visualProperties.y
            return Math.sqrt(dx * dx + dy * dy) < 28
        })

        if (!clickedArtifact) {
            try {
                const temporal = await createTemporalArtifact(x, y)
                if (temporal) {
                    setCurrentTemporalId(temporal.temporaryId)
                    setNewArtifactPosition({ x, y })
                    setIsNameEditorVisible(true)
                }
            } catch (error) {
                showError('Error al crear artefacto temporal')
            }
        }
    }

    const handleNameSave = async () => {
        if (!canvasRef.current || !currentTemporalId || !currentName.trim()) return
        if (nameValidationErrors.length > 0) {
            showError(`Error en el nombre: ${nameValidationErrors.join(', ')}`)
            return
        }
        try {
            setIsNameEditorVisible(false)
            const temp = getTemporalArtifact(currentTemporalId)
            const rect = canvasRef.current.getBoundingClientRect()
            const baseX = temp?.visualProperties.x ?? newArtifactPosition.x
            const baseY = temp?.visualProperties.y ?? newArtifactPosition.y
            const windowX = rect.left + baseX
            const windowY = rect.top + baseY + 80
            setEditingArtifact(null)
            setEditorPosition({ x: windowX, y: windowY })
            setIsDescriptionEditorVisible(true)
        } catch (error) {
            showError(`Error al preparar editor: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
    }

    const handleNameCancel = () => {
        setIsNameEditorVisible(false)
        if (currentTemporalId) {
            cancelTemporalArtifact(currentTemporalId).catch(() => {})
        }
        setCurrentTemporalId(null)
        setCurrentName('')
    }

    const openDescriptionEditor = useCallback((artifact: VisualArtifact) => {
        if (!canvasRef.current) return
        const rect = canvasRef.current.getBoundingClientRect()
        const windowX = rect.left + artifact.visualProperties.x
        const windowY = rect.top + artifact.visualProperties.y + 80
        setEditingArtifact(artifact)
        setEditorPosition({ x: windowX, y: windowY })
        setIsDescriptionEditorVisible(true)
    }, [])

    const interactions = useGraphInteractions({
        canvasRef,
        artifacts,
        setArtifacts,
        artifactService,
        onOpenEditor: openDescriptionEditor,
        showSuccess,
        showError,
    })

    const handleSaveDescription = async (description: string) => {
        const descriptionErrors = validateDescription(description)
        if (descriptionErrors.length > 0) {
            showError(`Error en la descripción: ${descriptionErrors.join(', ')}`)
            return
        }

        const parseMentions = (text: string): string[] => {
            const matches = text.match(/@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g) || []
            return matches.map(m => m.slice(1))
        }

        const sanitize = (s: string) => s.replace(/\s+/g, '').toLowerCase()
        const mentions = parseMentions(description)

        if (currentTemporalId) {
            try {
                const ok = await updateTemporalArtifactDescription(currentTemporalId, description)
                if (!ok) return
                const newArtifact = await saveTemporalArtifact(currentTemporalId)
                if (!newArtifact) return
                setIsDescriptionEditorVisible(false)
                setCurrentTemporalId(null)
                setCurrentName('')
                setEditingArtifact(null)
                showSuccess(`Artefacto "${newArtifact.name}" creado`)

                if (pendingRelationFromId) {
                    const source = artifacts.find(a => a.id === pendingRelationFromId)
                    if (source) {
                        const proposedType: RelationshipType = RELATIONSHIP_TYPES.DEPENDS_ON
                        const relationshipCandidate: Relationship = {
                            id: crypto.randomUUID(),
                            sourceId: source.id,
                            targetId: newArtifact.id,
                            type: proposedType,
                            weight: 0.5,
                            description: '',
                            metadata: {},
                            createdAt: new Date(),
                            visualProperties: createDefaultRelationshipVisualProperties(proposedType),
                            semanticStrength: 0.5,
                            businessImpact: 'low',
                            validationStatus: 'valid',
                            contextualRelevance: 0.5,
                            temporalRelevance: 0.5,
                            stakeholderImpact: [],
                        }
                        try {
                            const validation = await validationService.validateRelationship(
                                relationshipCandidate,
                                source,
                                newArtifact
                            )
                            const finalType: RelationshipType = validation.isValid
                                ? proposedType
                                : RELATIONSHIP_TYPES.REFERENCES
                            const { id: _id, createdAt: _createdAt, ...payload } = relationshipCandidate
                            await artifactService.createRelationship({
                                ...payload,
                                type: finalType,
                                visualProperties: createDefaultRelationshipVisualProperties(finalType),
                            })
                        } catch {}
                    }
                    setPendingRelationFromId(null)
                    setPendingMentionName(null)
                }

                if (mentions.length > 0) {
                    for (const m of mentions) {
                        const target = artifacts.find(a => sanitize(a.name) === sanitize(m))
                        if (!target) continue

                        const proposedType: RelationshipType = RELATIONSHIP_TYPES.DEPENDS_ON
                        const relationshipCandidate: Relationship = {
                            id: crypto.randomUUID(),
                            sourceId: newArtifact.id,
                            targetId: target.id,
                            type: proposedType,
                            weight: 0.5,
                            description: '',
                            metadata: {},
                            createdAt: new Date(),
                            visualProperties: createDefaultRelationshipVisualProperties(proposedType),
                            semanticStrength: 0.5,
                            businessImpact: 'low',
                            validationStatus: 'valid',
                            contextualRelevance: 0.5,
                            temporalRelevance: 0.5,
                            stakeholderImpact: [],
                        }

                        try {
                            const validation = await validationService.validateRelationship(
                                relationshipCandidate,
                                newArtifact,
                                target
                            )
                            const finalType: RelationshipType = validation.isValid
                                ? proposedType
                                : RELATIONSHIP_TYPES.REFERENCES

                            const { id: _id, createdAt: _createdAt, ...payload } = relationshipCandidate
                            await artifactService.createRelationship({
                                ...payload,
                                type: finalType,
                                visualProperties: createDefaultRelationshipVisualProperties(finalType),
                            })
                        } catch (e) {
                            console.error('Error creando relación desde mención:', e)
                        }
                    }
                }
                return
            } catch (error) {
                showError(`Error al crear artefacto: ${error instanceof Error ? error.message : 'Error desconocido'}`)
                return
            }
        }

        if (editingArtifact) {
            try {
                await artifactService.updateArtifact(editingArtifact.id, { id: editingArtifact.id, description })
                showSuccess(`Artefacto "${editingArtifact.name}" actualizado`)

                if (mentions.length > 0) {
                    for (const m of mentions) {
                        const target = artifacts.find(a => sanitize(a.name) === sanitize(m))
                        if (!target) continue

                        const proposedType: RelationshipType = RELATIONSHIP_TYPES.DEPENDS_ON
                        const relationshipCandidate: Relationship = {
                            id: crypto.randomUUID(),
                            sourceId: editingArtifact.id,
                            targetId: target.id,
                            type: proposedType,
                            weight: 0.5,
                            description: '',
                            metadata: {},
                            createdAt: new Date(),
                            visualProperties: createDefaultRelationshipVisualProperties(proposedType),
                            semanticStrength: 0.5,
                            businessImpact: 'low',
                            validationStatus: 'valid',
                            contextualRelevance: 0.5,
                            temporalRelevance: 0.5,
                            stakeholderImpact: [],
                        }

                        try {
                            const validation = await validationService.validateRelationship(
                                relationshipCandidate,
                                editingArtifact,
                                target
                            )
                            const finalType: RelationshipType = validation.isValid
                                ? proposedType
                                : RELATIONSHIP_TYPES.REFERENCES

                            await artifactService.createRelationship({
                                ...relationshipCandidate,
                                type: finalType,
                                visualProperties: createDefaultRelationshipVisualProperties(finalType),
                            })
                        } catch (e) {
                            console.error('Error creando relación desde mención:', e)
                        }
                    }
                }
            } catch (error) {
                showError(
                    `Error al actualizar artefacto: ${error instanceof Error ? error.message : 'Error desconocido'}`
                )
            }
        }

        setIsDescriptionEditorVisible(false)
        setEditingArtifact(null)
    }

    const handleCancelDescription = () => {
        if (currentTemporalId) {
            cancelTemporalArtifact(currentTemporalId).catch(() => {})
            setCurrentTemporalId(null)
            setCurrentName('')
        }
        setIsDescriptionEditorVisible(false)
        setEditingArtifact(null)
    }

    return (
        <div className={`flex-1 bg-slate-900 flex flex-col ${className || ''}`}>
            <GraphHeader
                artifactCount={artifacts.length}
                temporalArtifactCount={temporalArtifacts.length}
                selectedCount={interactions.selectedIds.size}
            />

            <div className="relative flex-1 flex">
                <GraphCanvas
                    canvasRef={canvasRef}
                    artifacts={artifacts}
                    temporals={temporalArtifacts}
                    relationLine={
                        interactions.relationLine as unknown as {
                            x1: number
                            y1: number
                            x2: number
                            y2: number
                        } | null
                    }
                    isDragging={interactions.isDragging}
                    draggingArtifactId={interactions.draggingArtifact?.id}
                    currentTemporalId={currentTemporalId}
                    onCanvasClick={handleCanvasClick}
                    onMouseMove={interactions.handleMouseMove}
                    onMouseUp={interactions.handleMouseUp}
                    onArtifactClick={interactions.handleArtifactClick}
                    onArtifactDoubleClick={interactions.handleArtifactDoubleClick}
                    onArtifactMouseDown={interactions.handleArtifactMouseDown}
                    onCanvasMouseDown={interactions.handleCanvasMouseDown}
                    onCanvasContextMenu={interactions.handleCanvasContextMenu}
                    selectionRect={
                        interactions.selectionRect as unknown as {
                            x: number
                            y: number
                            width: number
                            height: number
                        } | null
                    }
                    selectedIds={interactions.selectedIds}
                    activeArtifactId={editingArtifact?.id || null}
                />

                {interactions.contextMenu && (
                    <ContextMenu
                        x={interactions.contextMenu.x}
                        y={interactions.contextMenu.y}
                        onDelete={() => interactions.deleteSelected()}
                        onClose={() => interactions.setContextMenu(null)}
                        disabled={interactions.selectedIds.size === 0}
                    />
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
                        ? canvasRef.current.getBoundingClientRect().left + newArtifactPosition.x
                        : newArtifactPosition.x,
                    y: canvasRef.current
                        ? canvasRef.current.getBoundingClientRect().top + newArtifactPosition.y + 80
                        : newArtifactPosition.y + 80,
                }}
                placeholder="Nombre del artefacto..."
                validationErrors={nameValidationErrors}
            />

            <FloatingTextArea
                ref={editorRef}
                isVisible={isDescriptionEditorVisible}
                position={editorPosition}
                onSave={handleSaveDescription}
                onCancel={handleCancelDescription}
                initialText={
                    editingArtifact?.description ||
                    (currentTemporalId ? getTemporalArtifact(currentTemporalId)?.description || '' : '')
                }
                title={
                    editingArtifact
                        ? `Editando: ${editingArtifact.name}`
                        : currentTemporalId
                          ? `Nuevo artefacto: ${getTemporalArtifact(currentTemporalId)?.name || ''}`
                          : ''
                }
                subtitle={
                    editingArtifact
                        ? `Tipo: ${editingArtifact.type}`
                        : currentTemporalId
                          ? `Tipo: ${getTemporalArtifact(currentTemporalId)?.type || ''}`
                          : ''
                }
                placeholder="Describe este artefacto... (Ctrl+Enter para guardar)"
                showCancelButton={true}
                validateText={validateDescription}
                textareaRefExternal={autocomplete.textareaRef}
                onTextareaInput={autocomplete.handleInput}
                onTextareaKeyDownExtra={e => {
                    if (!autocomplete.showAutocomplete) return
                    if (e.key === 'Enter') {
                        const items = autocomplete.filteredItems
                        if (!items || items.length === 0) {
                            e.preventDefault()
                            const nameFromQuery = autocomplete.query
                            if (!canvasRef.current) return
                            const base = editingArtifact?.visualProperties || { x: 200, y: 200 }
                            const x = base.x + 120
                            const y = base.y + 20
                            createTemporalArtifact(x, y)
                                .then(async temporal => {
                                    if (!temporal) return
                                    setCurrentTemporalId(temporal.temporaryId)
                                    setNewArtifactPosition({ x, y })
                                    setIsDescriptionEditorVisible(false)
                                    setIsNameEditorVisible(true)
                                    setCurrentName(nameFromQuery)
                                    if (editingArtifact) {
                                        setPendingRelationFromId(editingArtifact.id)
                                        setPendingMentionName(nameFromQuery)
                                    }
                                    try {
                                        await updateTemporalArtifactName(temporal.temporaryId, nameFromQuery)
                                    } catch {}
                                })
                                .catch(() => {})
                        }
                    }
                }}
                ignoreOutsideClickSelectors={[".autocomplete-dropdown"]}
            />

            <AutocompleteDropdown
                query={autocomplete.query}
                items={artifacts.map(a => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    description: a.description,
                }))}
                onSelect={item => autocomplete.insertReference(item as unknown as VisualArtifact)}
                position={autocomplete.position}
                visible={autocomplete.showAutocomplete}
                searchFields={["name", "id", "type"]}
                maxItems={8}
            />
        </div>
    )
}
