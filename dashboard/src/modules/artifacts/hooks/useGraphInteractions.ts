import React, { useCallback, useMemo, useRef, useState } from 'react'
import type { Artifact } from '../types'
import { RELATIONSHIP_TYPES, createDefaultRelationshipVisualProperties } from '../types/artifact.types'
import type { ArtifactService } from '../services/ArtifactService'

interface RelationLine {
    x1: number
    y1: number
    x2: number
    y2: number
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

    const isRelationActive = useMemo(() => Boolean(relationLine && relationSource), [relationLine, relationSource])

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
        },
        [canvasRef]
    )

    const handleMouseMove = useCallback(
        (event: React.MouseEvent) => {
            if (!canvasRef.current) return
            const rect = canvasRef.current.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            if (!isDragging && pendingDrag.current) {
                const dx = Math.abs(x - pendingDrag.current.startX)
                const dy = Math.abs(y - pendingDrag.current.startY)
                if (dx > 3 || dy > 3) {
                    setIsDragging(true)
                    setDraggingArtifact(pendingDrag.current.artifact)
                    setDragOffset({ x: pendingDrag.current.offsetX, y: pendingDrag.current.offsetY })
                }
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
        [canvasRef, isDragging, draggingArtifact, dragOffset, setArtifacts, isRelationActive, relationLine]
    )

    const handleMouseUp = useCallback(
        (event: React.MouseEvent) => {
            if (!canvasRef.current) return

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
                    Math.sqrt(Math.pow(x - artifact.visualProperties.x, 2) + Math.pow(y - artifact.visualProperties.y, 2)) < 28
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
        [canvasRef, isDragging, draggingArtifact, artifacts, artifactService, isRelationActive, relationSource, showSuccess, showError]
    )

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
            onOpenEditor(artifact)
        },
        [canvasRef, onOpenEditor]
    )

    const shouldBlockCanvasClick = useCallback((): boolean => {
        return Date.now() < dragClickSuppressUntilRef.current
    }, [])

    return {
        isDragging,
        draggingArtifact,
        relationLine,
        handleArtifactMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleArtifactDoubleClick,
        handleArtifactClick,
        shouldBlockCanvasClick,
    }
}
