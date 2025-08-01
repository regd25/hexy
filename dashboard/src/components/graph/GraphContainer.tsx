import React, { useState, useRef } from 'react'
import { Artifact } from '../../types/Artifact'
import { useArtifactStore } from '../../stores/artifactStore'
import { useNotifications } from '../../hooks/useNotifications'
import { ArtifactEditor } from '../editor/ArtifactEditor'
import { Modal } from '../ui/Modal'
import { COLORS } from '../../constants/colors'

interface GraphContainerProps {
    className?: string
}

export const GraphContainer: React.FC<GraphContainerProps> = ({
    className,
}) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [editingArtifact, setEditingArtifact] = useState<
        Artifact | undefined
    >()
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
    const canvasRef = useRef<HTMLDivElement>(null)

    const { artifacts, addArtifact, updateArtifact } = useArtifactStore()
    const { showSuccess } = useNotifications()

    const handleCanvasClick = (event: React.MouseEvent) => {
        if (!canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        setClickPosition({ x, y })
        setEditingArtifact(undefined)
        setIsEditorOpen(true)
    }

    const handleArtifactClick = (artifact: Artifact) => {
        setEditingArtifact(artifact)
        setIsEditorOpen(true)
    }

    const handleSaveArtifact = (artifact: Artifact) => {
        if (editingArtifact) {
            updateArtifact(editingArtifact.id, artifact)
            showSuccess(`Artefacto "${artifact.name}" actualizado`)
        } else {
            // Asignar posición del clic al nuevo artefacto
            const newArtifact = {
                ...artifact,
                x: clickPosition.x,
                y: clickPosition.y,
            }
            addArtifact(newArtifact)
            showSuccess(`Artefacto "${artifact.name}" creado`)
        }
        setIsEditorOpen(false)
        setEditingArtifact(undefined)
    }

    const handleCancelEdit = () => {
        setIsEditorOpen(false)
        setEditingArtifact(undefined)
    }

    return (
        <div className={`graph-container ${className || ''}`}>
            <div className="graph-header">
                <h3>Grafo de Artefactos</h3>
                <div className="graph-info">
                    {artifacts.length} artefactos en el grafo
                </div>
            </div>

            <div
                ref={canvasRef}
                className="graph-canvas"
                onClick={handleCanvasClick}
            >
                {artifacts.length === 0 ? (
                    <div className="graph-placeholder">
                        <p>Haz clic en el canvas para crear un artefacto</p>
                        <p>Grafo D3.js - En desarrollo</p>
                    </div>
                ) : (
                    <div className="graph-nodes">
                        {artifacts.map(artifact => (
                            <div
                                key={artifact.id}
                                className="artifact-node"
                                style={{
                                    position: 'absolute',
                                    left: artifact.x,
                                    top: artifact.y,
                                    backgroundColor:
                                        COLORS[artifact.type] || '#3b82f6',
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    border: '2px solid transparent',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                    zIndex: 10,
                                }}
                                onClick={e => {
                                    e.stopPropagation()
                                    handleArtifactClick(artifact)
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform =
                                        'scale(1.1)'
                                    e.currentTarget.style.borderColor =
                                        '#60a5fa'
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 12px rgba(0, 0, 0, 0.4)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                    e.currentTarget.style.borderColor =
                                        'transparent'
                                    e.currentTarget.style.boxShadow =
                                        '0 2px 8px rgba(0, 0, 0, 0.3)'
                                }}
                                title={`${artifact.name} (${artifact.type})`}
                            >
                                {artifact.name.length > 2
                                    ? artifact.name.substring(0, 2)
                                    : artifact.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isEditorOpen}
                onClose={handleCancelEdit}
                title={editingArtifact ? 'Editar Artefacto' : 'Nuevo Artefacto'}
                size="lg"
            >
                <ArtifactEditor
                    artifact={editingArtifact}
                    onSave={handleSaveArtifact}
                    onCancel={handleCancelEdit}
                />
            </Modal>
        </div>
    )
}
