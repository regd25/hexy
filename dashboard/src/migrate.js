/**
 * Migración única: sube al backend los datos que el dashboard antiguo guardaba en el
 * localStorage del navegador (claves hexy_*). Usa el endpoint POST /api/import.
 */
import { api } from './api/client.js'
import { actions } from './state/store.js'
import { showSuccess, showError, showInfo } from './notifications.js'

export async function importFromLocalStorage() {
    const read = (key) => {
        try {
            return JSON.parse(localStorage.getItem(key) ?? 'null') ?? []
        } catch {
            return []
        }
    }

    const artifacts = read('hexy_artifacts')
    const relationships = read('hexy_relationships')
    const temporal = read('hexy_temporal_artifacts')

    if (artifacts.length === 0 && relationships.length === 0) {
        showInfo('No hay datos de localStorage para importar')
        return
    }

    try {
        await api.importData({ artifacts, relationships, temporal })
        await actions.loadAll()
        showSuccess(`Importados ${artifacts.length} artefactos y ${relationships.length} relaciones`)
    } catch (err) {
        showError(`Error al importar: ${err.message}`)
    }
}
