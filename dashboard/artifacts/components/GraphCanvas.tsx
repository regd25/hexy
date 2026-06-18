import React from 'react'
import type { VisualArtifact, VisualTemporalArtifact } from '../types'
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

interface GraphEdge {
    sourceId: string
    targetId: string
    type?: string
}

interface GraphCanvasProps {
    canvasRef: React.RefObject<HTMLDivElement>
    className?: string
    artifacts: VisualArtifact[]
    temporals: VisualTemporalArtifact[]
    relationships?: GraphEdge[]
    relationLine: RelationLine | null
    isDragging: boolean
    draggingArtifactId?: string
    currentTemporalId?: string | null
    onCanvasClick: (e: React.MouseEvent) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseUp: (e: React.MouseEvent) => void
    onArtifactClick: (artifact: VisualArtifact, e: React.MouseEvent) => void
    onArtifactDoubleClick: (artifact: VisualArtifact, e: React.MouseEvent) => void
    onArtifactMouseDown: (artifact: VisualArtifact, e: React.MouseEvent) => void
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
    relationships = [],
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

    // GraphNode se posiciona por su esquina (left/top = x/y) con lado NODE_SIZE; el centroide
    // está desplazado media caja. Las aristas se anclan al centro de cada nodo.
    const NODE_RADIUS = 28
    const posById = new Map(
        artifacts.map(
            a => [a.id, { x: a.visualProperties.x + NODE_RADIUS, y: a.visualProperties.y + NODE_RADIUS }] as const
        )
    )

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
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                    <defs>
                        <marker
                            id="hexy-edge-arrow"
                            viewBox="0 0 10 10"
                            refX="9"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                        >
                            <path d="M0,0 L10,5 L0,10 z" fill="#64748b" />
                        </marker>
                    </defs>
                    {relationships.map((r, i) => {
                        const s = posById.get(r.sourceId)
                        const t = posById.get(r.targetId)
                        if (!s || !t) return null
                        return (
                            <line
                                key={`${r.sourceId}-${r.targetId}-${i}`}
                                x1={s.x}
                                y1={s.y}
                                x2={t.x}
                                y2={t.y}
                                stroke="#64748b"
                                strokeWidth={2}
                                markerEnd="url(#hexy-edge-arrow)"
                                opacity={0.8}
                            />
                        )
                    })}
                </svg>

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
                        onClick={(a, e) => onArtifactClick(a as VisualArtifact, e as React.MouseEvent)}
                        onDoubleClick={(a, e) => onArtifactDoubleClick(a as VisualArtifact, e as React.MouseEvent)}
                        onMouseDown={(a, e) => {
                            if (activeArtifactId && activeArtifactId === artifact.id) return
                            onArtifactMouseDown(a as VisualArtifact, e as React.MouseEvent)
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
