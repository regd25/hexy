import React from 'react'
import { Artifact } from '../../types/Artifact'
import { COLORS } from '../../constants/colors'
import { MouseEvent } from '../../types/DOMEvents'

interface ArtifactNodeProps {
    artifact: Artifact
    isTemporary?: boolean
    onClick?: (artifact: Artifact, event: React.MouseEvent) => void
    onDoubleClick?: (artifact: Artifact, event: React.MouseEvent) => void
}

export const ArtifactNode: React.FC<ArtifactNodeProps> = ({
    artifact,
    isTemporary = false,
    onClick,
    onDoubleClick,
}) => {
    const handleClick = (event: MouseEvent) => {
        if (onClick) {
            onClick(artifact, event)
        }
    }

    const handleDoubleClick = (event: MouseEvent) => {
        if (onDoubleClick) {
            onDoubleClick(artifact, event)
        }
    }

    const handleMouseEnter = (event: MouseEvent) => {
        if (!isTemporary) {
            event.currentTarget.style.transform = 'scale(1.1)'
            event.currentTarget.style.borderColor = '#60a5fa'
            event.currentTarget.style.boxShadow =
                '0 4px 12px rgba(0, 0, 0, 0.4)'
        }
    }

    const handleMouseLeave = (event: MouseEvent) => {
        if (!isTemporary) {
            event.currentTarget.style.transform = 'scale(1)'
            event.currentTarget.style.borderColor = 'transparent'
            event.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
        }
    }

    const getNodeStyles = () => {
        const baseStyles = {
            position: 'absolute' as const,
            left: artifact.x,
            top: artifact.y,
            backgroundColor: COLORS[artifact.type] || '#3b82f6',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            zIndex: isTemporary ? 15 : 10,
            overflow: 'visible' as const,
        }

        if (isTemporary) {
            return {
                ...baseStyles,
                border: '2px solid #60a5fa',
                boxShadow: '0 4px 12px rgba(96, 165, 250, 0.4)',
            }
        }

        return {
            ...baseStyles,
            cursor: 'pointer',
            border: '2px solid transparent',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }
    }

    const getTextStyles = () => ({
        color: 'white',
        fontSize: '12px',
        fontWeight: '800',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap' as const,
        padding: '2px 6px',
        position: 'absolute' as const,
        zIndex: isTemporary ? 16 : 11,
    })

    return (
        <div
            className="artifact-node"
            style={getNodeStyles()}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title={
                isTemporary
                    ? undefined
                    : `${artifact.name} is a ${artifact.type}`
            }
        >
            <span style={getTextStyles()}>{artifact.name || '?'}</span>
        </div>
    )
}
