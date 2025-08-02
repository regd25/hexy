import React, { useState, useRef, useEffect } from 'react'

interface InlineEditorProps {
    isVisible: boolean
    initialValue: string
    onChange: (name: string) => void
    onSave: () => void
    onCancel: () => void
    position: { x: number; y: number }
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
    isVisible,
    initialValue,
    onChange,
    onSave,
    onCancel,
    position,
}) => {
    const [value, setValue] = useState(initialValue)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isVisible) {
            setValue(initialValue)
            if (inputRef.current) {
                inputRef.current.focus()
                inputRef.current.select()
            }
        }
    }, [initialValue, isVisible])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            onCancel()
        }
    }

    const handleSave = () => {
        const trimmed = value.trim()
        if (trimmed) {
            onChange(trimmed)
            onSave()
        } else {
            onCancel()
        }
    }

    const handleBlur = () => {
        const trimmed = value.trim()
        if (trimmed) {
            onChange(trimmed)
            onSave()
        } else {
            onCancel()
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        onChange(newValue)
    }

    if (!isVisible) return null

    return (
        <div
            className="fixed z-50 bg-slate-800/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-lg border border-slate-600"
            style={{
                left: Math.max(
                    10,
                    Math.min(position.x - 60, window.innerWidth - 140)
                ),
                top: Math.max(
                    10,
                    Math.min(position.y, window.innerHeight - 40)
                ),
                minWidth: '120px',
                maxWidth: '200px',
            }}
        >
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder="Nombre del artefacto..."
                className="bg-transparent text-white text-sm font-medium outline-none w-full px-1 placeholder-slate-400"
            />
        </div>
    )
}
