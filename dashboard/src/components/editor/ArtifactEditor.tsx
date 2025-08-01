import { useState, useEffect } from 'react'
import { Artifact, ArtifactType } from '../../types/Artifact'
import { useArtifactStore } from '../../stores/artifactStore'
import { useNotifications } from '../../hooks/useNotifications'
import { useAutocomplete } from '../../hooks/useAutocomplete'
import { AutocompleteDropdown } from './AutocompleteDropdown'

interface ArtifactEditorProps {
    artifact?: Artifact
    onSave: (artifact: Artifact) => void
    onCancel: () => void
}

const ARTIFACT_TYPES: { value: ArtifactType; label: string }[] = [
    { value: 'purpose', label: 'Propósito' },
    { value: 'vision', label: 'Visión' },
    { value: 'policy', label: 'Política' },
    { value: 'principle', label: 'Principio' },
    { value: 'guideline', label: 'Guía' },
    { value: 'context', label: 'Contexto' },
    { value: 'actor', label: 'Actor' },
    { value: 'concept', label: 'Concepto' },
    { value: 'process', label: 'Proceso' },
    { value: 'procedure', label: 'Procedimiento' },
    { value: 'event', label: 'Evento' },
    { value: 'result', label: 'Resultado' },
    { value: 'observation', label: 'Observación' },
    { value: 'evaluation', label: 'Evaluación' },
    { value: 'indicator', label: 'Indicador' },
    { value: 'area', label: 'Área' },
    { value: 'authority', label: 'Autoridad' },
    { value: 'reference', label: 'Referencia' },
]

const generateId = (): string =>
    `artifact-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

export const ArtifactEditor: React.FC<ArtifactEditorProps> = ({
    artifact,
    onSave,
    onCancel,
}) => {
    const [name, setName] = useState(artifact?.name || '')
    const [type, setType] = useState<ArtifactType>(artifact?.type || 'concept')
    const [description, setDescription] = useState(artifact?.description || '')
    const [isValid, setIsValid] = useState(false)

    const { showSuccess, showError } = useNotifications()
    const { artifacts } = useArtifactStore()

    const {
        showAutocomplete,
        query,
        position,
        selectedIndex,
        textareaRef,
        handleInput,
        handleKeyDown,
        insertReference,
        hideAutocomplete,
    } = useAutocomplete(artifacts)

    useEffect(() => {
        setIsValid(name.trim().length > 0 && description.trim().length > 0)
    }, [name, description])

    const handleSave = () => {
        if (!isValid) {
            showError('Por favor completa todos los campos requeridos')
            return
        }

        const artifactData: Artifact = {
            id: artifact?.id || generateId(),
            name: name.trim(),
            type,
            description: description.trim(),
            info: description.trim(),
            x: artifact?.x || 100,
            y: artifact?.y || 100,
            vx: 0,
            vy: 0,
            fx: null,
            fy: null,
        }

        onSave(artifactData)
        showSuccess(`Artefacto "${artifactData.name}" guardado correctamente`)
    }

    const handleCancel = () => {
        if (name.trim() || description.trim()) {
            if (
                window.confirm(
                    '¿Estás seguro de que quieres cancelar? Se perderán los cambios.'
                )
            ) {
                onCancel()
            }
        } else {
            onCancel()
        }
    }

    return (
        <div className="artifact-editor">
            <div className="editor-header">
                <h3 className="editor-title">
                    {artifact ? 'Editar Artefacto' : 'Nuevo Artefacto'}
                </h3>
            </div>

            <div className="editor-content">
                <div className="form-group">
                    <label htmlFor="artifact-name" className="form-label">
                        Nombre del Artefacto *
                    </label>
                    <input
                        id="artifact-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ingresa el nombre del artefacto..."
                        className="form-input"
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="artifact-type" className="form-label">
                        Tipo de Artefacto
                    </label>
                    <select
                        id="artifact-type"
                        value={type}
                        onChange={e => setType(e.target.value as ArtifactType)}
                        className="form-select"
                    >
                        {ARTIFACT_TYPES.map(t => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label
                        htmlFor="artifact-description"
                        className="form-label"
                    >
                        Descripción *
                    </label>
                    <div className="textarea-container">
                        <textarea
                            ref={textareaRef}
                            id="artifact-description"
                            value={description}
                            onChange={e => {
                                setDescription(e.target.value)
                                handleInput(e)
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe el artefacto... Usa @ para referenciar otros artefactos"
                            className="form-textarea"
                            rows={8}
                        />
                        <AutocompleteDropdown
                            query={query}
                            artifacts={artifacts}
                            onSelect={insertReference}
                            position={position}
                            visible={showAutocomplete}
                        />
                    </div>
                    <div className="form-hint">
                        💡 Usa @ seguido del nombre de otro artefacto para crear
                        referencias semánticas
                    </div>
                </div>
            </div>

            <div className="editor-actions">
                <button
                    onClick={handleSave}
                    disabled={!isValid}
                    className="btn btn-primary"
                >
                    {artifact ? 'Actualizar' : 'Crear'} Artefacto
                </button>
                <button onClick={handleCancel} className="btn btn-secondary">
                    Cancelar
                </button>
            </div>
        </div>
    )
}
