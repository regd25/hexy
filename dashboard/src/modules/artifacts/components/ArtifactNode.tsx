import React, { useState } from 'react'
import { Artifact, TemporalArtifact } from '../../../shared/types/Artifact'
import { COLORS } from '../constants/colors'
import { MouseEvent } from '../../../shared/types/DOMEvents'

interface ArtifactNodeProps {
    artifact: Artifact | TemporalArtifact
    isTemporary?: boolean
    onClick?: (
        artifact: Artifact | TemporalArtifact,
        event: React.MouseEvent
    ) => void
    onDoubleClick?: (
        artifact: Artifact | TemporalArtifact,
        event: React.MouseEvent
    ) => void
    onMouseEnter?: (
        artifact: Artifact | TemporalArtifact,
        event: MouseEvent
    ) => void
    onMouseLeave?: (
        artifact: Artifact | TemporalArtifact,
        event: MouseEvent
    ) => void
}

export const ArtifactNode: React.FC<ArtifactNodeProps> = ({
    artifact,
    isTemporary = false,
    onClick,
    onDoubleClick,
}) => {
    const isTemporalArtifact = 'isTemporary' in artifact && artifact.isTemporary
    const temporalArtifact = isTemporalArtifact
        ? (artifact as TemporalArtifact)
        : null
    const hasErrors =
        temporalArtifact?.validationErrors &&
        temporalArtifact.validationErrors.length > 0
    const [showErrorTooltip, setShowErrorTooltip] = useState(false)

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
        if (!isTemporary && !isTemporalArtifact) {
            event.currentTarget.style.transform = 'scale(1.1)'
            event.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
            event.currentTarget.style.boxShadow =
                '0 4px 12px rgba(0, 0, 0, 0.4)'
        }

        if (hasErrors) {
            setShowErrorTooltip(true)
        }
    }

    const handleMouseLeave = (event: MouseEvent) => {
        if (!isTemporary && !isTemporalArtifact) {
            event.currentTarget.style.transform = 'scale(1)'
            event.currentTarget.style.borderColor = 'transparent'
            event.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
        }

        setShowErrorTooltip(false)
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
            zIndex: isTemporary || isTemporalArtifact ? 15 : 10,
            overflow: 'visible' as const,
        }

        if (isTemporalArtifact) {
            const hasErrors =
                temporalArtifact?.validationErrors &&
                temporalArtifact.validationErrors.length > 0

            if (hasErrors) {
                return {
                    ...baseStyles,
                    border: '2px solid #ef4444',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                }
            }

            return {
                ...baseStyles,
                border: '2px solid #60a5fa',
                boxShadow: '0 4px 12px rgba(96, 165, 250, 0.4)',
            }
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
        zIndex: isTemporary || isTemporalArtifact ? 16 : 11,
    })

    const getErrorIndicator = () => {
        if (!hasErrors) return null

        return (
            <div
                style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    zIndex: 17,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
            >
                {temporalArtifact?.validationErrors?.length} error(es)
            </div>
        )
    }

    const getErrorTooltip = () => {
        if (
            !hasErrors ||
            !temporalArtifact?.validationErrors ||
            !showErrorTooltip
        )
            return null

        // Calculate position to avoid overflow
        const tooltipHeight = 60 + temporalArtifact.validationErrors.length * 20
        const shouldShowAbove = artifact.y > tooltipHeight + 20

        return (
            <div
                style={{
                    position: 'absolute',
                    top: shouldShowAbove ? `-${tooltipHeight}px` : '60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1f2937',
                    color: 'white',
                    fontSize: '11px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    zIndex: 20,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid #ef4444',
                    maxWidth: '250px',
                    minWidth: '200px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    textAlign: 'left',
                }}
            >
                <div
                    style={{
                        fontWeight: '600',
                        marginBottom: '4px',
                        color: '#ef4444',
                    }}
                >
                    Errores de validación:
                </div>
                {temporalArtifact.validationErrors.map((error, index) => (
                    <div
                        key={index}
                        style={{ marginBottom: '2px', lineHeight: '1.3' }}
                    >
                        • {error}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div
            className="artifact-node"
            style={getNodeStyles()}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title={
                isTemporalArtifact && hasErrors
                    ? temporalArtifact?.validationErrors?.join('\n')
                    : `${artifact.name} is a ${artifact.type}`
            }
        >
            <span style={getTextStyles()}>{artifact.name || '?'}</span>
            {getErrorIndicator()}
            {getErrorTooltip()}
        </div>
    )
}
