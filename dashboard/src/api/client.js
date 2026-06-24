/**
 * Cliente HTTP del dashboard. Envuelve fetch contra el backend (proxy /api → server/).
 * Sustituye las llamadas directas al repositorio/servicio que antes corrían en el navegador.
 */

const BASE = '/api'

async function request(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
        let message = `${method} ${path} → ${res.status}`
        try {
            const data = await res.json()
            if (data?.error) message = data.error
        } catch {
            /* respuesta sin JSON */
        }
        throw new Error(message)
    }
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('application/json')) return res.json()
    return res.text()
}

export const api = {
    // Artifacts
    listArtifacts: () => request('GET', '/artifacts'),
    getArtifact: (id) => request('GET', `/artifacts/${id}`),
    createArtifact: (payload) => request('POST', '/artifacts', payload),
    updateArtifact: (id, payload) => request('PATCH', `/artifacts/${id}`, payload),
    deleteArtifact: (id) => request('DELETE', `/artifacts/${id}`),
    getArtifactRelationships: (id) => request('GET', `/artifacts/${id}/relationships`),

    // Relationships
    createRelationship: (payload) => request('POST', '/relationships', payload),
    deleteRelationship: (id) => request('DELETE', `/relationships/${id}`),

    // Temporal
    createTemporal: (payload) => request('POST', '/temporal', payload ?? {}),
    getTemporal: (id) => request('GET', `/temporal/${id}`),
    updateTemporal: (id, payload) => request('PATCH', `/temporal/${id}`, payload),
    promoteTemporal: (id) => request('POST', `/temporal/${id}/promote`, {}),
    deleteTemporal: (id) => request('DELETE', `/temporal/${id}`),

    // Misc
    statistics: () => request('GET', '/statistics'),
    exportData: () => request('GET', '/export'),
    importData: (backup) => request('POST', '/import', backup),
    solYaml: () => request('GET', '/sol/yaml'),
    solValidate: (yaml) => request('POST', '/sol/validate', yaml !== undefined ? { yaml } : {}),
    solImport: (yaml, mode = 'merge') => request('POST', '/sol/import', { yaml, mode }),
}
