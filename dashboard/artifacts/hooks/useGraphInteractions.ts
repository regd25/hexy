import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import type { Artifact } from '../types'
import { RELATIONSHIP_TYPES, createDefaultRelationshipVisualProperties } from '../types/artifact.types'
import type { ArtifactService } from '../services/ArtifactService'

interface RelationLine {
    x1: number
    y1: number
    x2: number
    y2: number
}

interface SelectionRect {
    x: number
    y: number
    width: number
    height: number
}

interface UseGraphInteractionsParams {
    canvasRef: React.RefObject<HTMLDivElement>
    artifacts: Artifact[]
    setArtifacts: React.Dispatch<React.SetStateAction<Artifact[]>>
    artifactService: ArtifactService
    onOpenEditor: (artifact: Artifact) => void
    showSuccess: (msg: string) => void
    showError: (msg: string) => void
}

export const useGraphInteractions = ({
    canvasRef,
    artifacts,
    setArtifacts,
    artifactService,
    onOpenEditor,
    showSuccess,
    showError,
}: UseGraphInteractionsParams) => {
    const [isDragging, setIsDragging] = useState(false)
    const [draggingArtifact, setDraggingArtifact] = useState<Artifact | null>(null)
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [relationLine, setRelationLine] = useState<RelationLine | null>(null)
    const [relationSource, setRelationSource] = useState<Artifact | null>(null)

    const [isSelecting, setIsSelecting] = useState(false)
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null)
    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

    const pendingDrag = useRef<{
        artifact: Artifact
        offsetX: number
        offsetY: number
        startX: number
        startY: number
    } | null>(null)

    const justDraggedRef = useRef<boolean>(false)
    const rafIdRef = useRef<number | null>(null)
    const dragClickSuppressUntilRef = useRef<number>(0)
    const selectionClickSuppressUntilRef = useRef<number>(0)
    const mouseDownAtRef = useRef<number>(0)

    const DRAG_DELAY_MS = 120
    const NODE_SIZE = 56
    const SELECTION_THRESHOLD_PX = 6

    const isRelationActive = useMemo(() => Boolean(relationLine && relationSource), [relationLine, relationSource])

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    const computeSelectionFromRect = useCallback(
        (rect: SelectionRect): Set<string> => {
            const norm = {
                x: Math.min(rect.x, rect.x + rect.width),
                y: Math.min(rect.y, rect.y + rect.height),
                w: Math.abs(rect.width),
                h: Math.abs(rect.height),
            }
            const next = new Set<string>()
            for (const a of artifacts) {
                const ax = a.visualProperties.x
                const ay = a.visualProperties.y
                const intersects =
                    norm.x < ax + NODE_SIZE && norm.x + norm.w > ax && norm.y < ay + NODE_SIZE && norm.y + norm.h > ay
                if (intersects) next.add(a.id)
            }
            return next
        },
        [artifacts]
    )

    const handleCanvasMouseDown = useCallback(
        (event: React.MouseEvent) => {
            if (!canvasRef.current) return
            if (event.button !== 0) return
            event.preventDefault()
            const rect = canvasRef.current.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            setSelectionStart({ x, y })
            setSelectionRect(null)
            if (!event.shiftKey) {
                clearSelection()
            }
            setContextMenu(null)
        },
        [canvasRef, clearSelection]
    )

    const handleCanvasContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault()
            if (!canvasRef.current) return
            setContextMenu({ x: event.clientX, y: event.clientY })
        },
        [canvasRef]
    )

    const handleArtifactMouseDown = useCallback(
        (artifact: Artifact, event: React.MouseEvent) => {
            if (!canvasRef.current) return
            event.stopPropagation()
            const rect = canvasRef.current.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            const offsetX = x - artifact.visualProperties.x
            const offsetY = y - artifact.visualProperties.y
            pendingDrag.current = { artifact, offsetX, offsetY, startX: x, startY: y }
            mouseDownAtRef.current = Date.now()
        },
        [canvasRef]
    )

    const handleMouseMove = useCallback(
        (event: React.MouseEvent) => {
            if (!canvasRef.current) return
            const rect = canvasRef.current.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            if (selectionStart) {
                const dx = x - selectionStart.x
                const dy = y - selectionStart.y
                const movedEnough = Math.abs(dx) > SELECTION_THRESHOLD_PX || Math.abs(dy) > SELECTION_THRESHOLD_PX
                if (!isSelecting && movedEnough) {
                    setIsSelecting(true)
                    setSelectionRect({ x: selectionStart.x, y: selectionStart.y, width: dx, height: dy })
                    setSelectedIds(
                        computeSelectionFromRect({ x: selectionStart.x, y: selectionStart.y, width: dx, height: dy })
                    )
                    return
                }
                if (isSelecting) {
                    const nextRect = {
                        x: selectionStart.x,
                        y: selectionStart.y,
                        width: dx,
                        height: dy,
                    }
                    setSelectionRect(nextRect)
                    setSelectedIds(computeSelectionFromRect(nextRect))
                    return
                }
            }

            if (!isDragging && pendingDrag.current) {
                const elapsed = Date.now() - mouseDownAtRef.current
                if (elapsed < DRAG_DELAY_MS) {
                    return
                }
                setIsDragging(true)
                setDraggingArtifact(pendingDrag.current.artifact)
                setDragOffset({ x: pendingDrag.current.offsetX, y: pendingDrag.current.offsetY })
            }

            if (isDragging && (draggingArtifact || pendingDrag.current?.artifact)) {
                const active = draggingArtifact || pendingDrag.current?.artifact
                const newX = x - dragOffset.x
                const newY = y - dragOffset.y
                if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
                rafIdRef.current = requestAnimationFrame(() => {
                    setArtifacts(prev =>
                        prev.map(a =>
                            a.id === active?.id
                                ? {
                                      ...a,
                                      visualProperties: { ...a.visualProperties, x: newX, y: newY },
                                      coordinates: { ...a.coordinates, x: newX, y: newY },
                                  }
                                : a
                        )
                    )
                })
                return
            }

            if (isRelationActive && relationLine) {
                setRelationLine({ ...relationLine, x2: x, y2: y })
            }
        },
        [
            canvasRef,
            selectionStart,
            isSelecting,
            setArtifacts,
            isDragging,
            draggingArtifact,
            dragOffset,
            isRelationActive,
            relationLine,
            computeSelectionFromRect,
        ]
    )

    const handleMouseUp = useCallback(
        (event: React.MouseEvent) => {
            if (!canvasRef.current) return

            if (isSelecting) {
                setIsSelecting(false)
                setSelectionStart(null)
                setSelectionRect(null)
                selectionClickSuppressUntilRef.current = Date.now() + 600
                return
            }

            if (selectionStart) {
                const rect = canvasRef.current.getBoundingClientRect()
                const x = event.clientX - rect.left
                const y = event.clientY - rect.top
                const dx = Math.abs(x - selectionStart.x)
                const dy = Math.abs(y - selectionStart.y)
                if (dx > 2 || dy > 2) {
                    selectionClickSuppressUntilRef.current = Date.now() + 600
                }
                setSelectionStart(null)
                setSelectionRect(null)
            }

            if (isDragging && draggingArtifact) {
                const moved = artifacts.find(a => a.id === draggingArtifact.id)
                if (moved) {
                    artifactService
                        .updateArtifact(moved.id, {
                            id: moved.id,
                            coordinates: { x: moved.visualProperties.x, y: moved.visualProperties.y },
                            visualProperties: { x: moved.visualProperties.x, y: moved.visualProperties.y },
                        })
                        .catch(() => {})
                }
                setIsDragging(false)
                setDraggingArtifact(null)
                pendingDrag.current = null
                justDraggedRef.current = true
                dragClickSuppressUntilRef.current = Date.now() + 250
                return
            }

            if (!isRelationActive || !relationSource) return

            const rect = canvasRef.current.getBoundingClientRect()
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
                artifactService
                    .createRelationship({
                        sourceId: relationSource.id,
                        targetId: targetArtifact.id,
                        type: RELATIONSHIP_TYPES.REFERENCES,
                        weight: 0.5,
                        description: '',
                        metadata: {},
                        visualProperties: createDefaultRelationshipVisualProperties(RELATIONSHIP_TYPES.REFERENCES),
                        semanticStrength: 0.5,
                        businessImpact: 'low',
                        validationStatus: 'valid',
                        contextualRelevance: 0.5,
                        temporalRelevance: 0.5,
                        stakeholderImpact: [],
                    })
                    .then(() => showSuccess(`Relación creada con ${targetArtifact.name}`))
                    .catch(error => {
                        const message = error instanceof Error ? error.message : 'Error desconocido'
                        showError(`Error al crear relación: ${message}`)
                    })
            }

            setRelationLine(null)
            setRelationSource(null)
            pendingDrag.current = null
        },
        [
            canvasRef,
            isSelecting,
            selectionStart,
            isDragging,
            draggingArtifact,
            artifacts,
            artifactService,
            isRelationActive,
            relationSource,
            showSuccess,
            showError,
        ]
    )

    useEffect(() => {
        if (!isSelecting) return
        const handleMove = (e: MouseEvent) => {
            if (!canvasRef.current || !selectionStart) return
            const rect = canvasRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const nextRect = {
                x: selectionStart.x,
                y: selectionStart.y,
                width: x - selectionStart.x,
                height: y - selectionStart.y,
            }
            setSelectionRect(nextRect)
            setSelectedIds(computeSelectionFromRect(nextRect))
        }
        const handleUp = () => {
            setIsSelecting(false)
            setSelectionStart(null)
            setSelectionRect(null)
            selectionClickSuppressUntilRef.current = Date.now() + 600
        }
        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseup', handleUp)
        return () => {
            document.removeEventListener('mousemove', handleMove)
            document.removeEventListener('mouseup', handleUp)
        }
    }, [isSelecting, canvasRef, selectionStart, computeSelectionFromRect])

    const handleArtifactDoubleClick = useCallback((artifact: Artifact, event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setRelationSource(artifact)
        setRelationLine({
            x1: artifact.visualProperties.x,
            y1: artifact.visualProperties.y,
            x2: event.clientX,
            y2: event.clientY,
        })
    }, [])

    const handleArtifactClick = useCallback(
        (artifact: Artifact, event: React.MouseEvent) => {
            if (!canvasRef.current) return
            if (justDraggedRef.current) {
                justDraggedRef.current = false
                return
            }
            if (event) event.stopPropagation()
            pendingDrag.current = null
            setIsDragging(false)
            setDraggingArtifact(null)
            onOpenEditor(artifact)
        },
        [canvasRef, onOpenEditor]
    )

    const shouldBlockCanvasClick = useCallback((): boolean => {
        const now = Date.now()
        return now < dragClickSuppressUntilRef.current || now < selectionClickSuppressUntilRef.current
    }, [])

    const deleteSelected = useCallback(async () => {
        const ids = Array.from(selectedIds)
        if (ids.length === 0) return
        try {
            const ok = await artifactService.bulkDeleteArtifacts(ids)
            if (!ok) {
                showError('No se pudieron eliminar todos los artefactos seleccionados')
            }
            setArtifacts(prev => prev.filter(a => !selectedIds.has(a.id)))
            setSelectedIds(new Set())
            setContextMenu(null)
            showSuccess(`Eliminados ${ids.length} artefacto(s)`)
        } catch {
            showError('Error al eliminar artefactos seleccionados')
        }
    }, [artifactService, selectedIds, setArtifacts, showError, showSuccess])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (selectedIds.size === 0) return
            const isDelete = e.key === 'Delete' || e.key === 'Del' || e.key.toLowerCase() === 'supr'
            const isCmdBackspace = (e.metaKey || e.ctrlKey) && e.key === 'Backspace'
            if (isDelete || isCmdBackspace) {
                e.preventDefault()
                deleteSelected().catch(() => {})
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [selectedIds, deleteSelected])

    return {
        isDragging,
        draggingArtifact,
        relationLine,
        isSelecting,
        selectionRect,
        selectedIds,
        contextMenu,
        handleCanvasMouseDown,
        handleCanvasContextMenu,
        handleArtifactMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleArtifactDoubleClick,
        handleArtifactClick,
        shouldBlockCanvasClick,
        clearSelection,
        deleteSelected,
        setContextMenu,
    }
}
