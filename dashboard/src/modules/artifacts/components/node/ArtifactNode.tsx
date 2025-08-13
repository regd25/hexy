import React, { useState } from 'react'
import { GraphNode } from './GraphNode'
import type { Artifact, TemporalArtifact } from '../../types'
import { COLORS } from '../../constants/colors'

interface ArtifactNodeProps {
    artifact: Artifact | TemporalArtifact
    isTemporary?: boolean
    isActive?: boolean
    validationErrors?: string[]
    onClick?: (artifact: Artifact | TemporalArtifact, event: React.MouseEvent<HTMLDivElement>) => void
    onDoubleClick?: (artifact: Artifact | TemporalArtifact, event: React.MouseEvent<HTMLDivElement>) => void
    onMouseEnter?: (artifact: Artifact | TemporalArtifact, event: React.MouseEvent<HTMLDivElement>) => void
    onMouseLeave?: (artifact: Artifact | TemporalArtifact, event: React.MouseEvent<HTMLDivElement>) => void
    onMouseDown?: (artifact: Artifact | TemporalArtifact, event: React.MouseEvent<HTMLDivElement>) => void
    isDraggingCurrent?: boolean
}

export const ArtifactNode: React.FC<ArtifactNodeProps> = ({
    artifact,
    isTemporary = false,
    isActive = false,
    validationErrors,
    onClick,
    onDoubleClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    isDraggingCurrent = false,
}) => {
    const isTemporal = 'temporaryId' in (artifact as TemporalArtifact)
    const currentErrors = validationErrors || (isTemporal ? (artifact as TemporalArtifact).validationErrors : []) || []
    const hasErrors = currentErrors.length > 0
    const [hovered, setHovered] = useState(false)

    const position = {
        x: (artifact as Artifact).visualProperties?.x ?? (artifact as Artifact).coordinates?.x ?? 0,
        y: (artifact as Artifact).visualProperties?.y ?? (artifact as Artifact).coordinates?.y ?? 0,
    }

    const temporalState = isTemporal ? (artifact as TemporalArtifact).visualState : undefined
    const baseSize = 56
    const size = Math.round(baseSize * (temporalState?.scale ?? 1))

    const color = isTemporal ? (temporalState?.color ?? '#94A3B8') : COLORS[(artifact as Artifact).type] || '#3b82f6'

    const opacity = isTemporal ? (temporalState?.opacity ?? 0.8) : 1

    const highlighted = isTemporary || isTemporal || isActive

    return (
        <GraphNode
            position={position}
            content={<span style={{ pointerEvents: 'none' }}>{(artifact as Artifact).name || '?'}</span>}
            style={{
                backgroundColor: color,
                cursor: isDraggingCurrent ? 'grabbing' : 'pointer',
                size,
                zIndex: highlighted ? 15 : 10,
                opacity,
            }}
            border={{
                color: hasErrors ? '#ef4444' : highlighted ? '#60a5fa' : 'transparent',
                width: 2,
                radius: Math.round(size / 2),
                style: isTemporal ? 'dashed' : 'solid',
            }}
            shadow={{
                enabled: true,
                color: hasErrors ? 'rgba(239,68,68,0.4)' : 'rgba(0,0,0,0.3)',
                blur: 12,
                offsetY: 4,
            }}
            disableTransitions={isDraggingCurrent}
            badgeText={isTemporal ? 'temp' : undefined}
            badgeCount={!isTemporal && hasErrors ? currentErrors.length : 0}
            tooltipMessages={hovered && hasErrors ? currentErrors : []}
            tooltipPlacement={position.y > 100 ? 'above' : 'below'}
            onMouseEnter={e => {
                setHovered(true)
                onMouseEnter?.(artifact, e)
            }}
            onMouseLeave={e => {
                setHovered(false)
                onMouseLeave?.(artifact, e)
            }}
            onClick={e => onClick?.(artifact, e)}
            onDoubleClick={e => onDoubleClick?.(artifact, e)}
            onMouseDown={e => onMouseDown?.(artifact, e)}
            title={`${(artifact as Artifact).name}`}
        />
    )
}
