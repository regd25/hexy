/**
 * Store observable mínimo (pub/sub). Única fuente de verdad de la UI, sincronizada con el
 * backend. Sustituye al EventBus + estado disperso en hooks del dashboard React: tras cada
 * mutación se actualiza el estado local y se notifica a los suscriptores (que re-renderizan).
 */

import { api } from '../api/client.js'
import { parseMentions, sanitize } from '../editors/mentions.js'

const state = {
    artifacts: [],
    relationships: [],
    temporals: [],
    selectedIds: new Set(),
    validity: { isValid: true, errorCount: 0 },
    inferred: [], // relaciones inferidas por el motor (F3); overlay sobre el grafo
    diagnostics: [], // diagnósticos estructurales del motor (Fase A): {severity,code,artifactId,message}
    loaded: false,
}

const listeners = new Set()

function emit() {
    for (const fn of listeners) fn(state)
}

/** Suscribe un listener; devuelve la función para desuscribir. */
export function subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
}

export function getState() {
    return state
}

/**
 * Nodos "referencia" fantasma: @menciones en las descripciones que no corresponden a ningún
 * artefacto existente. Derivado (no persistido). Devuelve [{ name, sources: [artifactId] }].
 */
export function getPhantoms() {
    const byName = new Map(state.artifacts.map((a) => [sanitize(a.name), a.id]))
    const phantoms = new Map() // sanitized → { name, sources: Set }
    for (const a of state.artifacts) {
        for (const mention of parseMentions(a.description ?? '')) {
            const key = sanitize(mention)
            if (!key || byName.has(key)) continue // resuelve a un artefacto → no es fantasma
            if (!phantoms.has(key)) phantoms.set(key, { name: mention, sources: new Set() })
            phantoms.get(key).sources.add(a.id)
        }
    }
    return [...phantoms.values()].map((p) => ({ name: p.name, sources: [...p.sources] }))
}

/** Deduplica relaciones por id (una relación aparece bajo source y target). */
function dedupeRelationships(lists) {
    const seen = new Set()
    const out = []
    for (const r of lists.flat()) {
        const key = r.id ?? `${r.sourceId}->${r.targetId}:${r.type}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push(r)
    }
    return out
}

/** Recalcula el eval gate SOL del modelo completo (lo evalúa el backend). */
async function refreshValidity() {
    try {
        if (state.artifacts.length === 0) {
            state.validity = { isValid: true, errorCount: 0 }
            return
        }
        const result = await api.solValidate()
        state.validity = {
            isValid: result.isValid,
            errorCount: result.errors.filter((e) => e.severity === 'error').length,
        }
    } catch {
        /* deja la validez anterior si falla */
    }
}

export const actions = {
    /** Carga inicial: artefactos + relaciones. */
    async loadAll() {
        const artifacts = await api.listArtifacts()
        const relLists = await Promise.all(artifacts.map((a) => api.getArtifactRelationships(a.id)))
        state.artifacts = artifacts
        state.relationships = dedupeRelationships(relLists)
        state.inferred = [] // las inferencias quedan obsoletas al recargar el modelo
        state.diagnostics = []
        state.loaded = true
        await refreshValidity()
        emit()
    },

    /** Overlay de relaciones inferidas por el motor (F3). */
    setInferred(list) {
        state.inferred = list ?? []
        emit()
    },
    clearInferred() {
        if (state.inferred.length === 0) return
        state.inferred = []
        emit()
    },

    /** Diagnósticos estructurales del motor (Fase A): errores/warnings accionables. */
    setDiagnostics(list) {
        state.diagnostics = list ?? []
        emit()
    },

    /** Reemplaza un artefacto en memoria sin ir al backend (drag en vivo). */
    patchArtifactLocal(id, changes) {
        state.artifacts = state.artifacts.map((a) => (a.id === id ? { ...a, ...changes } : a))
        emit()
    },

    async createArtifact(payload) {
        const created = await api.createArtifact(payload)
        state.artifacts = [...state.artifacts, created]
        await refreshValidity()
        emit()
        return created
    },

    async updateArtifact(id, payload) {
        const updated = await api.updateArtifact(id, payload)
        state.artifacts = state.artifacts.map((a) => (a.id === id ? updated : a))
        await refreshValidity()
        emit()
        return updated
    },

    /** Persiste solo posición tras un drag (no recalcula validez). */
    async persistPosition(id, x, y) {
        const updated = await api.updateArtifact(id, { coordinates: { x, y }, visualProperties: { x, y } })
        state.artifacts = state.artifacts.map((a) => (a.id === id ? updated : a))
        emit()
    },

    /** Persiste posiciones de varios artefactos en paralelo (tras un auto-layout); un solo emit. */
    async persistPositions(list) {
        if (!list || list.length === 0) return
        const updates = await Promise.all(
            list.map(({ id, x, y }) =>
                api.updateArtifact(id, { coordinates: { x, y }, visualProperties: { x, y } })
            )
        )
        const byId = new Map(updates.map((u) => [u.id, u]))
        state.artifacts = state.artifacts.map((a) => byId.get(a.id) ?? a)
        emit()
    },

    async deleteArtifacts(ids) {
        for (const id of ids) await api.deleteArtifact(id)
        const removed = new Set(ids)
        state.artifacts = state.artifacts.filter((a) => !removed.has(a.id))
        state.relationships = state.relationships.filter((r) => !removed.has(r.sourceId) && !removed.has(r.targetId))
        state.selectedIds = new Set([...state.selectedIds].filter((id) => !removed.has(id)))
        await refreshValidity()
        emit()
    },

    async createRelationship(payload) {
        const created = await api.createRelationship(payload)
        if (!state.relationships.some((r) => r.id === created.id)) {
            state.relationships = [...state.relationships, created]
        }
        await refreshValidity()
        emit()
        return created
    },

    async deleteRelationship(id) {
        await api.deleteRelationship(id)
        state.relationships = state.relationships.filter((r) => r.id !== id)
        await refreshValidity()
        emit()
    },

    // --- Temporal ---
    async createTemporal(x, y) {
        // Solo un temporal a la vez (igual que el dashboard original).
        if (state.temporals.length > 0) {
            const existing = state.temporals[0]
            const updated = await api.updateTemporal(existing.temporaryId, {
                coordinates: { x, y },
                visualProperties: { ...existing.visualProperties, x, y },
                status: 'creating',
                validationErrors: [],
            })
            state.temporals = [updated]
            emit()
            return updated
        }
        const created = await api.createTemporal({ name: '', type: 'intent', description: '', coordinates: { x, y } })
        state.temporals = [created]
        emit()
        return created
    },

    async updateTemporal(id, changes) {
        const updated = await api.updateTemporal(id, changes)
        state.temporals = state.temporals.map((t) => (t.temporaryId === id ? updated : t))
        emit()
        return updated
    },

    getTemporal(id) {
        return state.temporals.find((t) => t.temporaryId === id)
    },

    async promoteTemporal(id) {
        const artifact = await api.promoteTemporal(id)
        state.temporals = state.temporals.filter((t) => t.temporaryId !== id)
        state.artifacts = [...state.artifacts, artifact]
        await refreshValidity()
        emit()
        return artifact
    },

    async cancelTemporal(id) {
        try {
            await api.deleteTemporal(id)
        } catch {
            /* puede no existir */
        }
        state.temporals = state.temporals.filter((t) => t.temporaryId !== id)
        emit()
    },

    // --- Selección ---
    setSelection(ids) {
        state.selectedIds = new Set(ids)
        emit()
    },
    clearSelection() {
        if (state.selectedIds.size === 0) return
        state.selectedIds = new Set()
        emit()
    },
}
