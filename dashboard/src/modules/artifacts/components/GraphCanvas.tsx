import React from 'react'
import type { Artifact, TemporalArtifact } from '../types'
import { ArtifactNode } from './node/ArtifactNode'

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
    onCanvasMouseDown: (e: React.MouseEvent) => void
    onCanvasContextMenu: (e: React.MouseEvent) => void
    selectionRect: SelectionRect | null
    selectedIds: Set<string>
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
    onCanvasMouseDown,
    onCanvasContextMenu,
    selectionRect,
    selectedIds,
    activeArtifactId,
}) => {
    const blockInteractions = Boolean(activeArtifactId)

    return (
        <div
            ref={canvasRef}
            className={`flex-1 relative bg-slate-950 ${blockInteractions ? 'cursor-default' : 'cursor-pointer'} ${className || ''}`}
            onClick={e => {
                if (selectionRect) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                }
                onCanvasClick(e)
            }}
            onMouseMove={e => {
                onMouseMove(e)
            }}
            onMouseUp={onMouseUp}
            onMouseDown={e => {
                if (blockInteractions) {
                    e.stopPropagation()
                    e.preventDefault()
                    return
                }
                onCanvasMouseDown(e)
            }}
            onContextMenu={onCanvasContextMenu}
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

            {selectionRect && (
                <div
                    className="absolute z-30 border border-blue-400 border-dashed bg-blue-400/10 pointer-events-none"
                    style={{
                        left: Math.min(selectionRect.x, selectionRect.x + selectionRect.width),
                        top: Math.min(selectionRect.y, selectionRect.y + selectionRect.height),
                        width: Math.abs(selectionRect.width),
                        height: Math.abs(selectionRect.height),
                    }}
                />
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
                        isSelected={selectedIds.has(artifact.id)}
                    />
                ))}
            </div>
        </div>
    )
}

export default GraphCanvas
