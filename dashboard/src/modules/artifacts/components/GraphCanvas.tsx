import React from 'react'
import { Artifact } from '../../../shared/types/Artifact'
import { ArtifactNode } from './ArtifactNode'

interface GraphCanvasProps {
    artifacts: Artifact[]
    temporalArtifacts: any[]
    relationLine: {
        x1: number
        y1: number
        x2: number
        y2: number
    } | null
    onCanvasClick: (event: React.MouseEvent) => void
    onMouseMove: (event: React.MouseEvent) => void
    onMouseUp: (event: React.MouseEvent) => void
    onArtifactClick: (artifact: Artifact, event: React.MouseEvent) => void
    onTemporalArtifactClick: (artifact: any, event: React.MouseEvent) => void
    onArtifactDoubleClick: (artifact: Artifact, event: React.MouseEvent) => void
    canvasRef: React.RefObject<HTMLDivElement | null>
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
    artifacts,
    temporalArtifacts,
    relationLine,
    onCanvasClick,
    onMouseMove,
    onMouseUp,
    onArtifactClick,
    onTemporalArtifactClick,
    onArtifactDoubleClick,
    canvasRef
}) => {
    return (
        <div
            ref={canvasRef}
            className="flex-1 relative bg-slate-950 cursor-pointer"
            onClick={onCanvasClick}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
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

            {artifacts.length === 0 && temporalArtifacts.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-lg mb-2">
                        Haz clic en el canvas para crear un artefacto
                    </p>
                    <p className="text-sm">Grafo D3.js - En desarrollo</p>
                </div>
            ) : (
                <div className="relative w-full h-full">
                    {/* Render temporal artifacts */}
                    {temporalArtifacts.map(temporalArtifact => (
                        <ArtifactNode
                            key={temporalArtifact.id}
                            artifact={temporalArtifact}
                            isTemporary={true}
                            onClick={onTemporalArtifactClick}
                            onDoubleClick={onArtifactDoubleClick}
                        />
                    ))}

                    {/* Render existing artifacts */}
                    {artifacts.map(artifact => (
                        <ArtifactNode
                            key={artifact.id}
                            artifact={artifact}
                            onClick={onArtifactClick}
                            onDoubleClick={onArtifactDoubleClick}
                        />
                    ))}
                </div>
            )}
        </div>
    )
} 