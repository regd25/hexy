import React, { useEffect, useMemo, useState } from 'react'
import { useEventBus } from '../../shared/event-bus/useEventBus'
import { useNotifications } from '../../shared/notifications/useNotifications'
import { ArtifactService } from '../services'
import { Artifact, ArtifactType, ARTIFACT_TYPES } from '../types'
import { useArtifactValidation } from '../hooks/useArtifactValidation'

interface SemanticArtifactEditorProps {
    artifact?: Artifact
    onSaved?: (artifact: Artifact) => void
}

const TYPE_OPTIONS: { value: ArtifactType; label: string }[] = [
    { value: ARTIFACT_TYPES.PURPOSE, label: 'Propósito' },
    { value: ARTIFACT_TYPES.CONTEXT, label: 'Contexto' },
    { value: ARTIFACT_TYPES.AUTHORITY, label: 'Autoridad' },
    { value: ARTIFACT_TYPES.EVALUATION, label: 'Evaluación' },
    { value: ARTIFACT_TYPES.CONCEPT, label: 'Concepto' },
    { value: ARTIFACT_TYPES.PROCESS, label: 'Proceso' },
    { value: ARTIFACT_TYPES.POLICY, label: 'Política' },
    { value: ARTIFACT_TYPES.PRINCIPLE, label: 'Principio' },
    { value: ARTIFACT_TYPES.GUIDELINE, label: 'Guía' },
]

export const SemanticArtifactEditor: React.FC<SemanticArtifactEditorProps> = ({ artifact, onSaved }) => {
    const eventBus = useEventBus()
    const { showError, showSuccess } = useNotifications()
    const artifactService = useMemo(() => new ArtifactService(eventBus), [eventBus])
    const { validateArtifactForSave } = useArtifactValidation()

    const [name, setName] = useState(artifact?.name ?? '')
    const [type, setType] = useState<ArtifactType>(artifact?.type ?? ARTIFACT_TYPES.CONCEPT)
    const [description, setDescription] = useState(artifact?.description ?? '')
    const [purpose, setPurpose] = useState(artifact?.purpose ?? '')
    const [authority, setAuthority] = useState(artifact?.authority ?? '')
    const [contextText, setContextText] = useState(artifact ? JSON.stringify(artifact.context, null, 2) : '{\n  \n}')
    const [evaluationText, setEvaluationText] = useState(artifact ? artifact.evaluationCriteria.join(', ') : '')

    const [errors, setErrors] = useState<string[]>([])

    useEffect(() => {
        const run = async () => {
            let context: Record<string, unknown> = {}
            try {
                context = JSON.parse(contextText)
            } catch {
                context = {}
            }
            const partial: Partial<Artifact> = {
                name,
                type,
                description,
                purpose,
                authority,
                context,
                evaluationCriteria: getEvaluationCriteria(),
            }
            const errs = await validateArtifactForSave(partial)
            setErrors(errs)
        }
        run()
    }, [name, type, description, purpose, authority, contextText, evaluationText, validateArtifactForSave])

    const getEvaluationCriteria = () => {
        return evaluationText
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
    }

    const onSave = async () => {
        if (errors.length > 0) {
            showError('Corrige los errores antes de guardar')
            return
        }
        try {
            const evaluationCriteria = getEvaluationCriteria()
            const context = JSON.parse(contextText)
            if (artifact) {
                const updated = await artifactService.updateArtifact(artifact.id, {
                    id: artifact.id,
                    name: name.trim(),
                    type,
                    description: description.trim(),
                    purpose: purpose.trim(),
                    authority: authority.trim(),
                    context,
                    evaluationCriteria,
                })
                onSaved?.(updated)
                showSuccess('Artefacto actualizado')
            } else {
                const created = await artifactService.createArtifact({
                    name: name.trim(),
                    type,
                    description: description.trim(),
                    purpose: purpose.trim(),
                    authority: authority.trim(),
                    context,
                    evaluationCriteria,
                })
                onSaved?.(created)
                showSuccess('Artefacto creado')
            }
        } catch (error) {
            showError('Error al guardar artefacto')
        }
    }

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Nombre</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre del artefacto"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as ArtifactType)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {TYPE_OPTIONS.map(opt => (
                            <option
                                key={opt.value}
                                value={opt.value}
                            >
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Descripción</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Describe el artefacto"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Propósito</label>
                    <input
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Propósito"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Autoridad</label>
                    <input
                        value={authority}
                        onChange={e => setAuthority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Autoridad"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Contexto (JSON)</label>
                    <textarea
                        value={contextText}
                        onChange={e => setContextText(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                        placeholder="{ }"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">
                        Criterios de Evaluación (separados por coma)
                    </label>
                    <textarea
                        value={evaluationText}
                        onChange={e => setEvaluationText(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="criterio1, criterio2"
                    />
                </div>
            </div>

            {errors.length > 0 && <div className="mt-3 text-xs text-red-400">{errors[0]}</div>}

            <div className="mt-4 flex justify-end">
                <button
                    onClick={onSave}
                    disabled={errors.length > 0}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    Guardar
                </button>
            </div>
        </div>
    )
}
