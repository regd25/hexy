import React from 'react'
import type { Artifact, TemporalArtifact } from '../types'
import { ArtifactNode } from './node/ArtifactNode'

interface RelationLine {
    x1: number
    y1: number
    x2: number
    y2: number
}

interface GraphCanvasProps {
    canvasRef: React.RefObject<HTMLDivElement>
    className?: string
    artifacts: Artifact[]
    temporals: TemporalArtifact[]
    relationLine: RelationLine | null
    isDragging: boolean
    draggingArtifactId?: string
    currentTemporalId?: string | null
    onCanvasClick: (e: React.MouseEvent) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseUp: (e: React.MouseEvent) => void
    onArtifactClick: (artifact: Artifact, e: React.MouseEvent) => void
    onArtifactDoubleClick: (artifact: Artifact, e: React.MouseEvent) => void
    onArtifactMouseDown: (artifact: Artifact, e: React.MouseEvent) => void
    activeArtifactId?: string | null
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
    canvasRef,
    className,
    artifacts,
    temporals,
    relationLine,
    isDragging,
    draggingArtifactId,
    currentTemporalId,
    onCanvasClick,
    onMouseMove,
    onMouseUp,
    onArtifactClick,
    onArtifactDoubleClick,
    onArtifactMouseDown,
    activeArtifactId,
}) => {
    const blockInteractions = Boolean(activeArtifactId)

    return (
        <div
            ref={canvasRef}
            className={`flex-1 relative bg-slate-950 ${blockInteractions ? 'cursor-default' : 'cursor-pointer'} ${className || ''}`}
            onClick={onCanvasClick}
            onMouseMove={e => {
                if (blockInteractions) return
                onMouseMove(e)
            }}
            onMouseUp={onMouseUp}
            onMouseDown={e => {
                if (blockInteractions) {
                    e.stopPropagation()
                    e.preventDefault()
                    return
                }
            }}
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

            <div className="relative w-full h-full">
                {temporals.map(temporal => (
                    <ArtifactNode
                        key={temporal.temporaryId}
                        artifact={temporal}
                        isTemporary={true}
                        isActive={currentTemporalId === temporal.temporaryId}
                        validationErrors={temporal.validationErrors}
                    />
                ))}

                {artifacts.map(artifact => (
                    <ArtifactNode
                        key={artifact.id}
                        artifact={artifact}
                        onClick={(a, e) => onArtifactClick(a as Artifact, e as React.MouseEvent)}
                        onDoubleClick={(a, e) => onArtifactDoubleClick(a as Artifact, e as React.MouseEvent)}
                        onMouseDown={(a, e) => {
                            if (activeArtifactId && activeArtifactId === artifact.id) return
                            onArtifactMouseDown(a as Artifact, e as React.MouseEvent)
                        }}
                        isDraggingCurrent={isDragging && draggingArtifactId === artifact.id}
                        isActive={activeArtifactId === artifact.id}
                    />
                ))}
            </div>
        </div>
    )
}

export default GraphCanvas
