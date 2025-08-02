import React, { useState, useEffect, useRef } from 'react'
import { Artifact } from '../../types/Artifact'
import { useArtifactValidation } from '../../hooks/useArtifactValidation'
import { ThinkingIcon } from '../ui/icons'

interface FloatingTextAreaProps {
    artifact: Artifact
    isVisible: boolean
    position: { x: number; y: number }
    onSave: (description: string) => void
    onCancel: () => void
    initialText?: string
    showCancelButton?: boolean
}

export const FloatingTextArea: React.FC<FloatingTextAreaProps> = ({
    artifact,
    isVisible,
    position,
    onSave,
    onCancel,
    initialText = '',
    showCancelButton = false,
}) => {
    const [text, setText] = useState(initialText)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isReformulating, setIsReformulating] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { validateDescription } = useArtifactValidation()

    useEffect(() => {
        setText(initialText)
    }, [initialText])

    useEffect(() => {
        if (isVisible && textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.select()
        }
    }, [isVisible])

    useEffect(() => {
        const errors = validateDescription(text)
        setValidationErrors(errors)
    }, [text, validateDescription])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel()
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSave()
        }
    }

    const handleSave = () => {
        if (validationErrors.length === 0) {
            onSave(text)
            setText('')
        }
    }

    const handleReformulate = async () => {
        setIsReformulating(true)
        // Simulate AI reformulation
        setTimeout(() => {
            setText(text + ' [Reformulado con IA]')
            setIsReformulating(false)
        }, 1000)
    }

    if (!isVisible) return null

    return (
        <div
            className="fixed z-50 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-slate-600"
            style={{
                left: Math.max(
                    10,
                    Math.min(position.x - 140, window.innerWidth - 320)
                ),
                top: Math.max(
                    10,
                    Math.min(position.y, window.innerHeight - 200)
                ),
                minWidth: '280px',
                maxWidth: '90vw',
                width: 'min(400px, 90vw)',
            }}
        >
            <div className="mb-3">
                <h4 className="text-sm font-semibold text-blue-400 mb-1">
                    {artifact.name}
                </h4>
                <p className="text-xs text-slate-400">{artifact.type}</p>
            </div>

            <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe este artefacto... Usa @ para referenciar otros artefactos"
                className={`w-full h-24 px-3 py-2 bg-slate-700/50 text-white rounded-md border focus:outline-none resize-none text-sm ${
                    validationErrors.length > 0
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-600 focus:border-blue-500'
                }`}
            />

            {validationErrors.length > 0 && (
                <div className="mt-2 text-xs text-red-400">
                    {validationErrors.map((error, index) => (
                        <div key={index}>• {error}</div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between mt-3">
                <button
                    onClick={handleReformulate}
                    disabled={isReformulating}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
                >
                    <ThinkingIcon />
                    <span className="hidden sm:inline">Reformular</span>
                </button>

                <div className="flex gap-2">
                    {showCancelButton && (
                        <button
                            onClick={onCancel}
                            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={validationErrors.length > 0}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    )
}
