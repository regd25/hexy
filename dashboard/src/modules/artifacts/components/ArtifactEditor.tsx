import { useState, useEffect } from 'react'
import { Artifact, ArtifactType } from '../../shared/types/Artifact'
import { useArtifactStore } from '../../stores/artifactStore'
import { useNotifications } from '../../shared/notifications/useNotifications'
import { useArtifactValidation } from '../../hooks/useArtifactValidation'
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
    const [description] = useState(artifact?.description || '')
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    const { showSuccess, showError } = useNotifications()
    const { artifacts } = useArtifactStore()
    const { validateArtifactForSave, validateAndShowErrors } =
        useArtifactValidation()

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
    } = useAutocomplete(
        artifacts,
        (artifact: Artifact) =>
            artifact.name.toLowerCase().includes(query.toLowerCase()) ||
            artifact.id.toLowerCase().includes(query.toLowerCase()) ||
            artifact.type.toLowerCase().includes(query.toLowerCase())
    )

    useEffect(() => {
        // Validate artifact data whenever form fields change
        const artifactData = {
            name,
            type,
            description,
        }
        const errors = validateArtifactForSave(artifactData)
        setValidationErrors(errors)
    }, [name, type, description, validateArtifactForSave])

    const handleSave = () => {
        if (validationErrors.length > 0) {
            showError(
                'Por favor corrige los errores de validación antes de guardar'
            )
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

        // Final validation before saving
        if (validateAndShowErrors(artifactData, 'artefacto')) {
            onSave(artifactData)
            showSuccess(
                `Artefacto "${artifactData.name}" guardado correctamente`
            )
        }
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

    const hasNameError = validationErrors.some(error =>
        error.includes('nombre')
    )
    const hasTypeError = validationErrors.some(error => error.includes('tipo'))
    const hasDescriptionError = validationErrors.some(error =>
        error.includes('descripción')
    )

    return (
        <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-6">
                {artifact ? 'Editar Artefacto' : 'Crear Nuevo Artefacto'}
            </h2>

            <div className="space-y-6">
                {/* Name Field */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-slate-300 mb-2"
                    >
                        Nombre *
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            hasNameError
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-slate-600'
                        }`}
                        placeholder="Ingresa el nombre del artefacto"
                    />
                    {hasNameError && (
                        <p className="mt-1 text-sm text-red-400">
                            {validationErrors.find(error =>
                                error.includes('nombre')
                            )}
                        </p>
                    )}
                </div>

                {/* Type Field */}
                <div>
                    <label
                        htmlFor="type"
                        className="block text-sm font-medium text-slate-300 mb-2"
                    >
                        Tipo *
                    </label>
                    <select
                        id="type"
                        value={type}
                        onChange={e => setType(e.target.value as ArtifactType)}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            hasTypeError
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-slate-600'
                        }`}
                    >
                        {ARTIFACT_TYPES.map(artifactType => (
                            <option
                                key={artifactType.value}
                                value={artifactType.value}
                            >
                                {artifactType.label}
                            </option>
                        ))}
                    </select>
                    {hasTypeError && (
                        <p className="mt-1 text-sm text-red-400">
                            {validationErrors.find(error =>
                                error.includes('tipo')
                            )}
                        </p>
                    )}
                </div>

                {/* Description Field */}
                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-slate-300 mb-2"
                    >
                        Descripción
                    </label>
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            id="description"
                            value={description}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            className={`w-full px-3 py-2 bg-slate-700 border rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                                hasDescriptionError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-slate-600'
                            }`}
                            placeholder="Describe el artefacto. Usa @ para referenciar otros artefactos..."
                            rows={6}
                        />
                        {hasDescriptionError && (
                            <p className="mt-1 text-sm text-red-400">
                                {validationErrors.find(error =>
                                    error.includes('descripción')
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* Autocomplete Dropdown */}
                {showAutocomplete && (
                    <AutocompleteDropdown
                        query={query}
                        artifacts={artifacts}
                        onSelect={insertReference}
                        position={position}
                        visible={showAutocomplete}
                    />
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    {artifact && (
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={validationErrors.length > 0}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {artifact ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </div>
        </div>
    )
}
