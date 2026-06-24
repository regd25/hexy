/**
 * Constantes de UI (etiquetas + colores). Espejan shared/types/Artifact.ts y
 * dashboard/artifacts/constants/colors.ts. El backend es la fuente de verdad del modelo;
 * esto es solo para presentación.
 */

export const ARTIFACT_TYPE_LABELS = {
    intent: 'Intención',
    context: 'Contexto',
    authority: 'Autoridad',
    evaluation: 'Evaluación',
    vision: 'Visión',
    policy: 'Política',
    principle: 'Principio',
    guideline: 'Guía',
    concept: 'Concepto',
    indicator: 'Indicador',
    process: 'Proceso',
    procedure: 'Procedimiento',
    event: 'Evento',
    result: 'Resultado',
    observation: 'Observación',
    actor: 'Actor',
    area: 'Área',
}

/** Opciones para selects de tipo (sin 'all'). */
export const ARTIFACT_TYPE_OPTIONS = Object.entries(ARTIFACT_TYPE_LABELS).map(([value, label]) => ({ value, label }))

/** Opciones para el filtro de la lista (con 'all' al inicio). */
export const ARTIFACT_FILTER_OPTIONS = [{ value: 'all', label: 'Todos' }, ...ARTIFACT_TYPE_OPTIONS]

/** Color por tipo para los nodos (de constants/colors.ts del dashboard original). */
export const COLORS = {
    intent: '#a855f7',
    context: '#14b8a6',
    authority: '#10b981',
    evaluation: '#f59e0b',
    vision: '#6366f1',
    policy: '#ef4444',
    principle: '#ec4899',
    guideline: '#f97316',
    concept: '#06b6d4',
    indicator: '#0891b2',
    process: '#059669',
    procedure: '#84cc16',
    event: '#d97706',
    result: '#dc2626',
    observation: '#0ea5e9',
    actor: '#8b5cf6',
    area: '#a855f7',
    reference: '#64748b',
}

export const NODE_SIZE = 56
export const NODE_RADIUS = 28
