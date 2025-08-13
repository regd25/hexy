import React, { useEffect, useMemo, useState } from 'react'
import { useEventBus } from '../../../shared/event-bus/useEventBus'
import { ArtifactService } from '../services'
import { Artifact, ArtifactType, ARTIFACT_TYPES } from '../types'
import { Selector } from '@/shared'

interface ArtifactListProps {
    className?: string
}

const TYPE_OPTIONS: { value: ArtifactType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
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

export const ArtifactList: React.FC<ArtifactListProps> = ({ className = '' }) => {
    const eventBus = useEventBus()
    const artifactService = useMemo(() => new ArtifactService(eventBus), [eventBus])

    const [artifacts, setArtifacts] = useState<Artifact[]>([])
    const [query, setQuery] = useState('')
    const [type, setType] = useState<ArtifactType | 'all'>('all')

    useEffect(() => {
        const load = async () => {
            const all = await artifactService.getAllArtifacts()
            setArtifacts(all)
        }
        load()

        const unsubCreated = eventBus.subscribe<Artifact>('artifact:created', event => {
            if (event.source === 'artifacts-module') {
                setArtifacts(prev => [...prev, event.data])
            }
        })
        const unsubUpdated = eventBus.subscribe<Artifact>('artifact:updated', event => {
            if (event.source === 'artifacts-module') {
                setArtifacts(prev => prev.map(a => (a.id === event.data.id ? event.data : a)))
            }
        })
        const unsubDeleted = eventBus.subscribe<Artifact>('artifact:deleted', event => {
            if (event.source === 'artifacts-module') {
                setArtifacts(prev => prev.filter(a => a.id !== event.data.id))
            }
        })

        return () => {
            unsubCreated()
            unsubUpdated()
            unsubDeleted()
        }
    }, [artifactService, eventBus])

    const filtered = useMemo(() => {
        const byType = type === 'all' ? artifacts : artifacts.filter(a => a.type === type)
        if (!query.trim()) return byType
        const q = query.toLowerCase()
        return byType.filter(
            a =>
                a.name.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                a.semanticMetadata.semanticTags.some(tag => tag.toLowerCase().includes(q))
        )
    }, [artifacts, type, query])

    return (
        <div className={`bg-background-secondary border border-slate-700 rounded-lg p-4 ${className}`}>
            <div className="flex-wrap items-center gap-3 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar por nombre, descripción o tags"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Selector
                    value={type}
                    onChange={(v: string) => setType(v as ArtifactType | 'all')}
                    options={TYPE_OPTIONS}
                    size="sm"
                    className="min-w-[10rem]"
                />
            </div>

            <div className="max-h-80 overflow-auto divide-y divide-slate-700">
                {filtered.map(a => (
                    <div
                        key={a.id}
                        className="py-3 flex items-start justify-between"
                    >
                        <div>
                            <div className="text-sm font-semibold text-white">{a.name}</div>
                            <div className="text-xs text-slate-400 mt-1 line-clamp-2">{a.description}</div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {a.semanticMetadata.semanticTags.slice(0, 4).map(tag => (
                                    <span
                                        key={tag}
                                        className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded h-fit">
                            {a.type}
                        </span>
                    </div>
                ))}
                {filtered.length === 0 && <div className="py-6 text-center text-slate-400 text-sm">Sin resultados</div>}
            </div>
        </div>
    )
}
