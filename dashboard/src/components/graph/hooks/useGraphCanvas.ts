import { useState, useRef, useCallback } from 'react'
import { Artifact } from '../../../types/Artifact'
import { useArtifactStore } from '../../../stores/artifactStore'
import { useTemporalArtifacts } from '../../../hooks/useTemporalArtifacts'

export const useGraphCanvas = () => {
    const [isCreatingRelation, setIsCreatingRelation] = useState(false)
    const [relationSource, setRelationSource] = useState<Artifact | null>(null)
    const [relationLine, setRelationLine] = useState<{
        x1: number
        y1: number
        x2: number
        y2: number
    } | null>(null)

    const canvasRef = useRef<HTMLDivElement>(null)
    const { artifacts, updateArtifact } = useArtifactStore()
    const { createTemporalArtifact } = useTemporalArtifacts()

    const getCanvasCoordinates = useCallback((event: React.MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 }
        
        const rect = canvasRef.current.getBoundingClientRect()
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    }, [])

    const findArtifactAtPosition = useCallback((x: number, y: number) => {
        return artifacts.find(artifact => {
            const dx = x - artifact.x
            const dy = y - artifact.y
            return Math.sqrt(dx * dx + dy * dy) < 28
        })
    }, [artifacts])

    const findTemporalArtifactAtPosition = useCallback((x: number, y: number, temporalArtifacts: any[]) => {
        return temporalArtifacts.find(artifact => {
            const dx = x - artifact.x
            const dy = y - artifact.y
            return Math.sqrt(dx * dx + dy * dy) < 28
        })
    }, [])

    const handleCanvasClick = useCallback((
        event: React.MouseEvent,
        temporalArtifacts: any[],
        isNameEditorVisible: boolean,
        isDescriptionEditorVisible: boolean,
        onCreateTemporalArtifact: (artifact: any) => void,
        onCancelName: () => void
    ) => {
        if (!canvasRef.current || isCreatingRelation) return

        const { x, y } = getCanvasCoordinates(event)
        const clickedArtifact = findArtifactAtPosition(x, y)
        const clickedTemporalArtifact = findTemporalArtifactAtPosition(x, y, temporalArtifacts)

        if (
            !clickedArtifact &&
            !clickedTemporalArtifact &&
            !isNameEditorVisible &&
            !isDescriptionEditorVisible
        ) {
            const temporalArtifact = createTemporalArtifact(x, y)
            onCreateTemporalArtifact(temporalArtifact)
        }

        if (
            !clickedArtifact &&
            !clickedTemporalArtifact &&
            isNameEditorVisible
        ) {
            onCancelName()
        }
    }, [isCreatingRelation, getCanvasCoordinates, findArtifactAtPosition, findTemporalArtifactAtPosition, createTemporalArtifact])

    const handleArtifactDoubleClick = useCallback((
        artifact: Artifact,
        event: React.MouseEvent
    ) => {
        event.preventDefault()
        event.stopPropagation()

        setIsCreatingRelation(true)
        setRelationSource(artifact)
        setRelationLine({
            x1: artifact.x,
            y1: artifact.y,
            x2: event.clientX,
            y2: event.clientY,
        })
    }, [])

    const handleMouseMove = useCallback((event: React.MouseEvent) => {
        if (!canvasRef.current || !isCreatingRelation) return

        const { x, y } = getCanvasCoordinates(event)

        if (relationLine && relationSource) {
            setRelationLine({
                ...relationLine,
                x2: x,
                y2: y,
            })
        }
    }, [isCreatingRelation, relationLine, relationSource, getCanvasCoordinates])

    const handleMouseUp = useCallback((
        event: React.MouseEvent,
        onRelationCreated: (source: Artifact, target: Artifact) => void
    ) => {
        if (!isCreatingRelation || !relationSource) return

        const { x, y } = getCanvasCoordinates(event)
        const targetArtifact = findArtifactAtPosition(x, y)

        if (targetArtifact && targetArtifact.id !== relationSource.id) {
            onRelationCreated(relationSource, targetArtifact)
        }

        setIsCreatingRelation(false)
        setRelationSource(null)
        setRelationLine(null)
    }, [isCreatingRelation, relationSource, getCanvasCoordinates, findArtifactAtPosition])

    return {
        canvasRef,
        isCreatingRelation,
        relationLine,
        handleCanvasClick,
        handleArtifactDoubleClick,
        handleMouseMove,
        handleMouseUp,
        getCanvasCoordinates
    }
} 