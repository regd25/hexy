import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

interface FloatingEditorProps {
    isVisible: boolean
    position: { x: number; y: number }
    onSave: (text: string) => void
    onCancel: () => void
    initialText?: string
    placeholder?: string
    title?: string
    subtitle?: string
    showCancelButton?: boolean
    validateText?: (text: string) => string[]
    beforeButton?: React.ReactNode
    saveButtonText?: string
    cancelButtonText?: string
    width?: string
    height?: string
    className?: string
}

export interface FloatingEditorHandle {
    focus: () => void
}

export const FloatingEditor = forwardRef<FloatingEditorHandle, FloatingEditorProps>(
    (
        {
            isVisible,
            position,
            onSave,
            onCancel,
            initialText = '',
            placeholder = 'Escribe aquí...',
            title,
            subtitle,
            showCancelButton = false,
            validateText = () => [],
            beforeButton,
            saveButtonText = 'Guardar',
            cancelButtonText = 'Cancelar',
            width = 'min(400px, 90vw)',
            height = 'h-24',
            className = '',
        },
        ref
    ) => {
        const [text, setText] = useState(initialText)
        const [validationErrors, setValidationErrors] = useState<string[]>([])
        const textareaRef = useRef<HTMLTextAreaElement>(null)
        const containerRef = useRef<HTMLDivElement>(null)
        const [animateIn, setAnimateIn] = useState(false)

        useImperativeHandle(ref, () => ({
            focus: () => {
                if (textareaRef.current) {
                    textareaRef.current.focus()
                    textareaRef.current.select()
                    textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    textareaRef.current.className += ' shadow-lg border-blue-500'
                }
            },
        }))

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
            if (!isVisible) return
            setAnimateIn(false)
            const id = window.requestAnimationFrame(() => setAnimateIn(true))
            return () => window.cancelAnimationFrame(id)
        }, [isVisible])

        useEffect(() => {
            const errors = validateText(text)
            setValidationErrors(errors)
        }, [text, validateText])

        useEffect(() => {
            if (!isVisible) return
            const handler = (e: MouseEvent) => {
                const target = e.target as Node | null
                if (containerRef.current && target && !containerRef.current.contains(target)) {
                    onCancel()
                }
            }
            document.addEventListener('mousedown', handler, { capture: true })
            return () => document.removeEventListener('mousedown', handler, { capture: true })
        }, [isVisible, onCancel])

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

        if (!isVisible) return null

        return (
            <>
                <div
                    className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ${
                        animateIn ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={onCancel}
                />
                <div
                    ref={containerRef}
                    className={`fixed z-50 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-slate-600 ${className}`}
                    style={{
                        left: Math.max(10, Math.min(position.x - 140, window.innerWidth - 320)),
                        top: Math.max(10, Math.min(position.y, window.innerHeight - 200)),
                        minWidth: '280px',
                        maxWidth: '90vw',
                        width,
                    }}
                >
                    {(title || subtitle) && (
                        <div className="mb-3">
                            {title && <h4 className="text-sm font-semibold text-blue-400 mb-1">{title}</h4>}
                            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`w-full ${height} px-3 py-2 bg-slate-700/50 text-white rounded-md border focus:outline-none resize-none text-sm transform transition-transform duration-100 ${
                            validationErrors.length > 0
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-slate-600 focus:border-blue-500'
                        } ${animateIn ? 'scale-100' : 'scale-95'}`}
                    />

                    {validationErrors.length > 0 && (
                        <div className="mt-2 text-xs text-red-400">
                            {validationErrors.map((error, index) => (
                                <div key={index}>• {error}</div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                        {beforeButton}

                        <div className="flex gap-2">
                            {showCancelButton && (
                                <button
                                    onClick={onCancel}
                                    className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                                >
                                    {cancelButtonText}
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={validationErrors.length > 0}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                            >
                                {saveButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
)

FloatingEditor.displayName = 'FloatingEditor'
