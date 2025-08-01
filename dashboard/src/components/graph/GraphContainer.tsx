import React, { useState, useRef } from 'react'
import { Artifact } from '../../types/Artifact'
import { useArtifactStore } from '../../stores/artifactStore'
import { useNotifications } from '../../hooks/useNotifications'
import { InlineNameEditor } from './InlineNameEditor'
import { FloatingTextArea } from './FloatingTextArea'
import { ArtifactNode } from './ArtifactNode'

interface GraphContainerProps {
    className?: string
}

export const GraphContainer: React.FC<GraphContainerProps> = ({
    className,
}) => {
    const [isNameEditorVisible, setIsNameEditorVisible] = useState(false)
    const [isDescriptionEditorVisible, setIsDescriptionEditorVisible] =
        useState(false)
    const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(
        null
    )
    const [newArtifactPosition, setNewArtifactPosition] = useState({
        x: 0,
        y: 0,
    })
    const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 })
    const [isCreatingRelation, setIsCreatingRelation] = useState(false)
    const [relationSource, setRelationSource] = useState<Artifact | null>(null)
    const [relationLine, setRelationLine] = useState<{
        x1: number
        y1: number
        x2: number
        y2: number
    } | null>(null)
    const [tempArtifact, setTempArtifact] = useState<Artifact | null>(null)

    const canvasRef = useRef<HTMLDivElement>(null)

    const { artifacts, addArtifact, updateArtifact } = useArtifactStore()
    const { showSuccess } = useNotifications()

    const generateUniqueId = (name: string): string => {
        const baseId = name.replace(/\s+/g, '').toLowerCase()
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        return `${baseId}-${timestamp}-${random}`
    }

    const handleCanvasClick = (event: React.MouseEvent) => {
        if (!canvasRef.current || isCreatingRelation) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        // Check if clicking on existing artifact
        const clickedArtifact = artifacts.find(artifact => {
            const dx = x - artifact.x
            const dy = y - artifact.y
            return Math.sqrt(dx * dx + dy * dy) < 28
        })

        if (!clickedArtifact) {
            // Create temporary artifact
            const tempArtifact: Artifact = {
                id: `temp-${Date.now()}`,
                name: '',
                type: 'concept',
                info: '',
                description: '',
                x,
                y,
                vx: 0,
                vy: 0,
                fx: null,
                fy: null,
            }

            setTempArtifact(tempArtifact)
            setNewArtifactPosition({ x, y })
            setIsNameEditorVisible(true)
        }
    }

    const handleNameSave = (name: string) => {
        if (!tempArtifact || !canvasRef.current) return

        const newArtifact: Artifact = {
            ...tempArtifact,
            id: generateUniqueId(name),
            name,
        }

        addArtifact(newArtifact)
        setIsNameEditorVisible(false)
        setTempArtifact(null)

        // Convert canvas coordinates to window coordinates
        const rect = canvasRef.current.getBoundingClientRect()
        const windowX = rect.left + newArtifact.x
        const windowY = rect.top + newArtifact.y + 80

        // Open description editor immediately
        setEditingArtifact(newArtifact)
        setEditorPosition({ x: windowX, y: windowY })
        setIsDescriptionEditorVisible(true)
        showSuccess(`Artefacto "${name}" creado`)
    }

    const handleNameCancel = () => {
        setIsNameEditorVisible(false)
        setTempArtifact(null)
    }

    const handleArtifactClick = (
        artifact: Artifact,
        event: React.MouseEvent
    ) => {
        if (isCreatingRelation || !canvasRef.current) return

        event.stopPropagation()

        // Convert canvas coordinates to window coordinates
        const rect = canvasRef.current.getBoundingClientRect()
        const windowX = rect.left + artifact.x
        const windowY = rect.top + artifact.y + 80

        setEditingArtifact(artifact)
        setEditorPosition({ x: windowX, y: windowY })
        setIsDescriptionEditorVisible(true)
    }

    const handleArtifactDoubleClick = (
        artifact: Artifact,
        event: React.MouseEvent
    ) => {
        event.preventDefault()
        event.stopPropagation()

        setIsCreatingRelation(true)
        setRelationSource(artifact)
        setRelationLine({
            x1: artifact.x,
            y1: artifact.y,
            x2: event.clientX,
            y2: event.clientY,
        })
    }

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!canvasRef.current || !isCreatingRelation) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        if (relationLine && relationSource) {
            setRelationLine({
                ...relationLine,
                x2: x,
                y2: y,
            })
        }
    }

    const handleMouseUp = (event: React.MouseEvent) => {
        if (!isCreatingRelation || !relationSource) return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        const targetArtifact = artifacts.find(
            artifact =>
                artifact.id !== relationSource.id &&
                Math.sqrt(
                    Math.pow(x - artifact.x, 2) + Math.pow(y - artifact.y, 2)
                ) < 28
        )

        if (targetArtifact) {
            // Create relationship
            const relationshipText = `@${targetArtifact.id}`
            const currentDescription =
                relationSource.description || relationSource.info || ''
            const newDescription =
                currentDescription +
                (currentDescription ? '\n' : '') +
                relationshipText

            updateArtifact(relationSource.id, {
                ...relationSource,
                description: newDescription,
                info: newDescription,
            })

            // Convert canvas coordinates to window coordinates
            const rect = canvasRef.current?.getBoundingClientRect()
            if (rect) {
                const windowX = rect.left + relationSource.x
                const windowY = rect.top + relationSource.y + 80

                setEditingArtifact(relationSource)
                setEditorPosition({ x: windowX, y: windowY })
                setIsDescriptionEditorVisible(true)
            }
            showSuccess(`Relación creada con ${targetArtifact.name}`)
        }

        setIsCreatingRelation(false)
        setRelationSource(null)
        setRelationLine(null)
    }

    const handleSaveDescription = (description: string) => {
        if (editingArtifact) {
            updateArtifact(editingArtifact.id, {
                ...editingArtifact,
                description,
                info: description,
            })
            showSuccess(`Artefacto "${editingArtifact.name}" actualizado`)
        }
        setIsDescriptionEditorVisible(false)
        setEditingArtifact(null)
    }

    const handleCancelDescription = () => {
        setIsDescriptionEditorVisible(false)
        setEditingArtifact(null)
    }

    return (
        <div className={`flex-1 bg-slate-900 flex flex-col ${className || ''}`}>
            <div className="p-4 border-b border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-2">
                    Grafo de Artefactos
                </h3>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg text-sm w-fit">
                    <span className="font-semibold text-blue-400">
                        {artifacts.length}
                    </span>
                    <span className="text-slate-300">
                        artefactos en el grafo
                    </span>
                </div>
            </div>

            <div
                ref={canvasRef}
                className="flex-1 relative bg-slate-950 cursor-pointer"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
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

                {artifacts.length === 0 && !tempArtifact ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <p className="text-lg mb-2">
                            Haz clic en el canvas para crear un artefacto
                        </p>
                        <p className="text-sm">Grafo D3.js - En desarrollo</p>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
                        {/* Render temporary artifact */}
                        {tempArtifact && (
                            <ArtifactNode
                                artifact={tempArtifact}
                                isTemporary={true}
                            />
                        )}

                        {/* Render existing artifacts */}
                        {artifacts.map(artifact => (
                            <ArtifactNode
                                key={artifact.id}
                                artifact={artifact}
                                onClick={handleArtifactClick}
                                onDoubleClick={handleArtifactDoubleClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <InlineNameEditor
                isVisible={isNameEditorVisible}
                initialValue=""
                onSave={handleNameSave}
                onCancel={handleNameCancel}
                position={{
                    x: canvasRef.current
                        ? canvasRef.current.getBoundingClientRect().left +
                          newArtifactPosition.x
                        : newArtifactPosition.x,
                    y: canvasRef.current
                        ? canvasRef.current.getBoundingClientRect().top +
                          newArtifactPosition.y +
                          80
                        : newArtifactPosition.y + 80,
                }}
            />

            <FloatingTextArea
                artifact={
                    editingArtifact || {
                        id: '',
                        name: '',
                        type: 'concept',
                        info: '',
                        description: '',
                        x: 0,
                        y: 0,
                        vx: 0,
                        vy: 0,
                        fx: null,
                        fy: null,
                    }
                }
                isVisible={isDescriptionEditorVisible}
                position={editorPosition}
                onSave={handleSaveDescription}
                onCancel={handleCancelDescription}
                initialText={
                    editingArtifact?.description || editingArtifact?.info || ''
                }
            />
        </div>
    )
}
