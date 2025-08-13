import React, { useMemo, useState } from 'react'

export interface GraphNodePosition {
    x: number
    y: number
}

export interface GraphNodeBorder {
    color?: string
    width?: number
    radius?: number
    style?: 'solid' | 'dashed' | 'dotted'
}

export interface GraphNodeShadow {
    enabled?: boolean
    color?: string
    blur?: number
    spread?: number
    offsetX?: number
    offsetY?: number
}

export interface GraphNodeStyle {
    backgroundColor?: string
    opacity?: number
    size?: number
    cursor?: React.CSSProperties['cursor']
    zIndex?: number
}

export interface GraphNodeProps {
    id?: string
    position: GraphNodePosition
    content?: React.ReactNode
    title?: string
    className?: string
    style?: GraphNodeStyle
    border?: GraphNodeBorder
    shadow?: GraphNodeShadow
    ariaLabel?: string
    tabIndex?: number
    // mouse/keyboard events
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
    onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void
    onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
    onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void
    onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
    onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void
    // accessibility
    role?: React.AriaRole
    // helpers
    disableTransitions?: boolean
    // validation/tooltip support
    tooltipMessages?: string[]
    tooltipPlacement?: 'above' | 'below'
    tooltipBgColor?: string
    tooltipBorderColor?: string
    badgeText?: string
    badgeCount?: number
    badgeBgColor?: string
    badgeTextColor?: string
}

const toPx = (value: number | undefined, fallback: number): string => `${value ?? fallback}px`

export const GraphNode: React.FC<GraphNodeProps> = ({
    id,
    position,
    content,
    title,
    className = '',
    style,
    border,
    shadow,
    ariaLabel,
    tabIndex = 0,
    onClick,
    onDoubleClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    onKeyUp,
    role = 'button',
    disableTransitions = false,
    tooltipMessages = [],
    tooltipPlacement = 'below',
    tooltipBgColor = '#1f2937',
    tooltipBorderColor = '#ef4444',
    badgeText,
    badgeCount,
    badgeBgColor = '#ef4444',
    badgeTextColor = '#ffffff',
}) => {
    const [hovered, setHovered] = useState(false)

    const baseSize = style?.size ?? 56
    const borderRadius = border?.radius ?? baseSize / 2

    const boxShadow = useMemo(() => {
        if (!shadow?.enabled) return undefined
        const color = shadow.color ?? 'rgba(0,0,0,0.3)'
        const blur = toPx(shadow.blur, 8)
        const spread = toPx(shadow.spread, 0)
        const offsetX = toPx(shadow.offsetX, 0)
        const offsetY = toPx(shadow.offsetY, 4)
        return `${offsetX} ${offsetY} ${blur} ${spread} ${color}`
    }, [shadow])

    const borderCss = `${toPx(border?.width, 2)} ${border?.style ?? 'solid'} ${border?.color ?? 'transparent'}`

    const showBadge = (badgeCount !== undefined && badgeCount > 0) || Boolean(badgeText)
    const showTooltip = hovered && tooltipMessages.length > 0
    const tooltipTop = tooltipPlacement === 'above'

    return (
        <div
            id={id}
            role={role}
            aria-label={ariaLabel}
            title={title}
            tabIndex={tabIndex}
            data-graph-node="true"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={e => {
                setHovered(true)
                onMouseEnter?.(e)
            }}
            onMouseLeave={e => {
                setHovered(false)
                onMouseLeave?.(e)
            }}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            className={`absolute select-none ${className}`}
            style={{
                left: position.x,
                top: position.y,
                width: baseSize,
                height: baseSize,
                border: borderCss,
                borderRadius,
                backgroundColor: style?.backgroundColor ?? '#3b82f6',
                opacity: style?.opacity ?? 1,
                cursor: style?.cursor ?? 'pointer',
                boxShadow,
                zIndex: style?.zIndex ?? 10,
                transition: disableTransitions ? 'none' : 'transform 120ms ease, box-shadow 120ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
                color: '#fff',
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: 12,
                lineHeight: 1,
            }}
        >
            {content}

            {showBadge && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: badgeBgColor,
                        color: badgeTextColor,
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        zIndex: 20,
                    }}
                >
                    {badgeText ?? `${badgeCount} error(es)`}
                </div>
            )}

            {showTooltip && (
                <div
                    style={{
                        position: 'absolute',
                        top: tooltipTop ? -Math.max(60, tooltipMessages.length * 20) : baseSize + 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: tooltipBgColor,
                        color: '#fff',
                        fontSize: 11,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontWeight: 500,
                        zIndex: 30,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        border: `1px solid ${tooltipBorderColor}`,
                        maxWidth: 260,
                        minWidth: 200,
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        overflowWrap: 'break-word',
                        textAlign: 'left',
                    }}
                >
                    {tooltipMessages.map((msg, idx) => (
                        <div key={idx}>• {msg}</div>
                    ))}
                </div>
            )}
        </div>
    )
}
