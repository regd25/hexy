import React from 'react'
import { useArtifactStore } from '../../stores/artifactStore'
import { useTemporalArtifacts } from '../../hooks/useTemporalArtifacts'
import { useGraphCanvas } from './hooks/useGraphCanvas'
import { useGraphEditors } from './hooks/useGraphEditors'
import { GraphHeader } from './components/GraphHeader'
import { GraphCanvas } from './components/GraphCanvas'
import { InlineEditor } from './InlineEditor'
import { FloatingTextArea } from './FloatingTextArea'

interface GraphContainerProps {
    className?: string
}

export const GraphContainer: React.FC<GraphContainerProps> = ({
    className,
}) => {
    const { artifacts, updateArtifact } = useArtifactStore()
    const { temporalArtifacts } = useTemporalArtifacts()

    const {
        canvasRef: canvasRefFromCanvas,
        relationLine,
        handleCanvasClick,
        handleArtifactDoubleClick,
        handleMouseMove,
        handleMouseUp,
    } = useGraphCanvas()

    const {
        isNameEditorVisible,
        isDescriptionEditorVisible,
        editorPosition,
        handleNameChange,
        handleNameSave,
        handleNameCancel,
        handleArtifactClick,
        handleTemporalArtifactClick,
        handleSaveDescription,
        handleCancelDescription,
        getCurrentEditingArtifact,
        getCurrentEditingText,
        openNameEditor,
        openDescriptionEditor,
        editingTemporalId,
    } = useGraphEditors()

    const handleCanvasClickWrapper = (event: React.MouseEvent) => {
        handleCanvasClick(
            event,
            temporalArtifacts,
            isNameEditorVisible,
            isDescriptionEditorVisible,
            openNameEditor,
            handleNameCancel
        )
    }

    const handleMouseUpWrapper = (event: React.MouseEvent) => {
        handleMouseUp(event, (source, target) => {
            const relationshipText = `@${target.id}`
            const currentDescription = source.description || source.info || ''
            const newDescription =
                currentDescription +
                (currentDescription ? '\n' : '') +
                relationshipText

            const updatedArtifact = {
                ...source,
                description: newDescription,
                info: newDescription,
            }

            updateArtifact(source.id, updatedArtifact)
            openDescriptionEditor(source, canvasRefFromCanvas)
        })
    }

    const handleNameSaveWrapper = () => {
        const permanentArtifact = handleNameSave()
        if (permanentArtifact) {
            openDescriptionEditor(permanentArtifact, canvasRefFromCanvas)
        }
    }

    return (
        <div className={`flex-1 bg-slate-900 flex flex-col ${className || ''}`}>
            <GraphHeader
                artifactCount={artifacts.length}
                temporalArtifactCount={temporalArtifacts.length}
            />

            <GraphCanvas
                artifacts={artifacts}
                temporalArtifacts={temporalArtifacts}
                relationLine={relationLine}
                onCanvasClick={handleCanvasClickWrapper}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpWrapper}
                onArtifactClick={(artifact, event) =>
                    handleArtifactClick(artifact, event, canvasRefFromCanvas)
                }
                onTemporalArtifactClick={(artifact, event) =>
                    handleTemporalArtifactClick(
                        artifact,
                        event,
                        canvasRefFromCanvas
                    )
                }
                onArtifactDoubleClick={handleArtifactDoubleClick}
                canvasRef={canvasRefFromCanvas}
            />

            <InlineEditor
                isVisible={isNameEditorVisible}
                initialValue=""
                onChange={handleNameChange}
                onSave={handleNameSaveWrapper}
                onCancel={handleNameCancel}
                position={{
                    x: canvasRefFromCanvas.current
                        ? canvasRefFromCanvas.current.getBoundingClientRect()
                              .left + (getCurrentEditingArtifact()?.x || 0)
                        : getCurrentEditingArtifact()?.x || 0,
                    y: canvasRefFromCanvas.current
                        ? canvasRefFromCanvas.current.getBoundingClientRect()
                              .top +
                          (getCurrentEditingArtifact()?.y || 0) +
                          80
                        : (getCurrentEditingArtifact()?.y || 0) + 80,
                }}
            />

            <FloatingTextArea
                artifact={
                    getCurrentEditingArtifact() || {
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
                initialText={getCurrentEditingText()}
                showCancelButton={
                    isDescriptionEditorVisible && editingTemporalId !== null
                }
            />
        </div>
    )
}
