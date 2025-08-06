import React, { useState, useEffect, useMemo } from 'react'
import { useEventBus } from '../../../shared/event-bus/useEventBus'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { ArtifactService } from '../services'
import { useArtifactValidation } from '../hooks/useArtifactValidation'
import { useAutocomplete } from '../../../shared/auto-complete/useAutocomplete'
import { AutocompleteDropdown } from '../../../shared/auto-complete/AutocompleteDropdown'
import { Artifact, ArtifactType, ARTIFACT_TYPES } from '../types'

interface ArtifactEditorProps {
    artifact?: Artifact
    onSave: (artifact: Artifact) => void
    onCancel: () => void
}

const ARTIFACT_TYPE_OPTIONS: { value: ArtifactType; label: string }[] = [
    { value: ARTIFACT_TYPES.PURPOSE, label: 'Propósito' },
    { value: ARTIFACT_TYPES.VISION, label: 'Visión' },
    { value: ARTIFACT_TYPES.POLICY, label: 'Política' },
    { value: ARTIFACT_TYPES.PRINCIPLE, label: 'Principio' },
    { value: ARTIFACT_TYPES.GUIDELINE, label: 'Guía' },
    { value: ARTIFACT_TYPES.CONTEXT, label: 'Contexto' },
    { value: ARTIFACT_TYPES.ACTOR, label: 'Actor' },
    { value: ARTIFACT_TYPES.CONCEPT, label: 'Concepto' },
    { value: ARTIFACT_TYPES.PROCESS, label: 'Proceso' },
    { value: ARTIFACT_TYPES.PROCEDURE, label: 'Procedimiento' },
    { value: ARTIFACT_TYPES.EVENT, label: 'Evento' },
    { value: ARTIFACT_TYPES.RESULT, label: 'Resultado' },
    { value: ARTIFACT_TYPES.OBSERVATION, label: 'Observación' },
    { value: ARTIFACT_TYPES.EVALUATION, label: 'Evaluación' },
    { value: ARTIFACT_TYPES.INDICATOR, label: 'Indicador' },
    { value: ARTIFACT_TYPES.AREA, label: 'Área' },
    { value: ARTIFACT_TYPES.AUTHORITY, label: 'Autoridad' },
    { value: ARTIFACT_TYPES.REFERENCE, label: 'Referencia' },
]

export const ArtifactEditor: React.FC<ArtifactEditorProps> = ({
    artifact,
    onSave,
    onCancel,
}) => {
    const eventBus = useEventBus()
    const { showSuccess, showError } = useNotifications()

    const artifactService = useMemo(
        () => new ArtifactService(eventBus),
        [eventBus]
    )

    const [artifacts, setArtifacts] = useState<Artifact[]>([])

    // Form state
    const [name, setName] = useState(artifact?.name || '')
    const [type, setType] = useState<ArtifactType>(
        artifact?.type || ARTIFACT_TYPES.CONCEPT
    )
    const [description, setDescription] = useState(artifact?.description || '')
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    const { validateArtifactForSave, validateAndShowErrors } =
        useArtifactValidation()

    useEffect(() => {
        const loadArtifacts = async () => {
            try {
                const allArtifacts = await artifactService.getAllArtifacts()
                setArtifacts(allArtifacts)
            } catch (error) {
                // Error loading artifacts for autocomplete - silent fail
            }
        }

        loadArtifacts()

        const unsubscribeCreated = eventBus.subscribe(
            'artifact:created',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev => [...prev, data.artifact])
                }
            }
        )

        const unsubscribeUpdated = eventBus.subscribe(
            'artifact:updated',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev =>
                        prev.map(a =>
                            a.id === data.artifact.id ? data.artifact : a
                        )
                    )
                }
            }
        )

        const unsubscribeDeleted = eventBus.subscribe(
            'artifact:deleted',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev => prev.filter(a => a.id !== data.id))
                }
            }
        )

        return () => {
            unsubscribeCreated()
            unsubscribeUpdated()
            unsubscribeDeleted()
        }
    }, [artifactService, eventBus])

    const artifactDropdownItems = artifacts.map(artifact => ({
        id: artifact.id,
        name: artifact.name,
        type: artifact.type as string,
        description: artifact.description,
    }))

    const {
        showAutocomplete,
        query,
        position,
        textareaRef,
        handleKeyDown,
        insertReference,
    } = useAutocomplete({
        items: artifactDropdownItems,
        filterKeys: ['name', 'id', 'type'],
        trigger: '@',
        maxResults: 8,
        getDisplayValue: (item) => item.name,
    })

    useEffect(() => {
        const validateForm = async () => {
            try {
                const artifactData = { name, type, description }
                const errors = await validateArtifactForSave(artifactData)
                setValidationErrors(errors)
            } catch (error) {
                setValidationErrors(['Error de validación'])
            }
        }

        validateForm()
    }, [name, type, description, validateArtifactForSave])

    const handleSave = async () => {
        if (validationErrors.length > 0) {
            showError(
                'Por favor corrige los errores de validación antes de guardar'
            )
            return
        }

        try {
            if (artifact) {
                const updatedArtifact = await artifactService.updateArtifact(
                    artifact.id,
                    {
                        id: artifact.id,
                        name: name.trim(),
                        type,
                        description: description.trim(),
                    }
                )

                const isValid = await validateAndShowErrors(
                    updatedArtifact,
                    'artefacto'
                )
                if (isValid) {
                    onSave(updatedArtifact)
                    showSuccess(
                        `Artefacto "${updatedArtifact.name}" actualizado correctamente`
                    )
                }
            } else {
                const newArtifact = await artifactService.createArtifact({
                    name: name.trim(),
                    type,
                    description: description.trim(),
                })

                const isValid = await validateAndShowErrors(
                    newArtifact,
                    'artefacto'
                )
                if (isValid) {
                    onSave(newArtifact)
                    showSuccess(
                        `Artefacto "${newArtifact.name}" creado correctamente`
                    )
                }
            }
        } catch (error) {
            showError('Error al guardar el artefacto')
        }
    }

    const handleCancel = () => {
        if (name.trim() || description.trim()) {
            // eslint-disable-next-line no-alert
            const shouldCancel = window.confirm(
                '¿Estás seguro de que quieres cancelar? Se perderán los cambios.'
            )
            if (shouldCancel) {
                onCancel()
            }
        } else {
            onCancel()
        }
    }

    const hasNameError = validationErrors.some(error =>
        error.toLowerCase().includes('nombre')
    )
    const hasTypeError = validationErrors.some(error =>
        error.toLowerCase().includes('tipo')
    )
    const hasDescriptionError = validationErrors.some(error =>
        error.toLowerCase().includes('descripción')
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
                                error.toLowerCase().includes('nombre')
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
                        {ARTIFACT_TYPE_OPTIONS.map(artifactType => (
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
                                error.toLowerCase().includes('tipo')
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
                            onChange={e => setDescription(e.target.value)}
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
                                    error.toLowerCase().includes('descripción')
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* Autocomplete Dropdown */}
                {showAutocomplete && (
                    <AutocompleteDropdown
                        query={query}
                        items={artifactDropdownItems}
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
