/**
 * Persiste un grafo del extractor (Fase B) — `{artifacts:[{id,type,name,description}],
 * relationships:[{sourceId,targetId,type}]}` — al modelo, vía el servicio (write-through
 * YAML + índice). Mapea los ids del extractor a los ids creados y traduce las relaciones
 * (mismo patrón que importGraph, pero tomando el grafo JSON directo en vez de un `.yaml`).
 * Distribuye los nodos en círculo porque el grafo extraído no lleva coordenadas.
 */

/**
 * @param {import('./ArtifactService.js').ArtifactService} service
 * @param {{artifacts:Array, relationships:Array}} graph
 * @param {{mode?: 'merge'|'replace'}} [opts]
 * @returns {Promise<{artifacts:number, relationships:number, unresolved:number}>}
 */
export async function persistGraph(service, graph, { mode = 'replace' } = {}) {
    const artifacts = graph.artifacts ?? []
    const relationships = graph.relationships ?? []

    if (mode === 'replace') {
        const existing = await service.getAllArtifacts()
        const rels = (await Promise.all(existing.map((a) => service.getArtifactRelationships(a.id)))).flat()
        for (const id of new Set(rels.map((r) => r.id))) await service.deleteRelationship(id)
        await service.bulkDeleteArtifacts(existing.map((a) => a.id))
    }

    // Layout circular (el grafo extraído no persiste coordenadas).
    const n = artifacts.length
    const cx = 520
    const cy = 360
    const radius = Math.max(180, n * 12)
    const idMap = new Map() // id-extractor → id-creado

    for (let i = 0; i < n; i++) {
        const a = artifacts[i]
        const angle = (2 * Math.PI * i) / Math.max(1, n)
        const created = await service.createArtifact({
            name: a.name || a.id,
            type: a.type,
            description: a.description ?? '',
            coordinates: { x: Math.round(cx + radius * Math.cos(angle)), y: Math.round(cy + radius * Math.sin(angle)) },
        })
        idMap.set(a.id, created.id)
    }

    let createdRelationships = 0
    let unresolved = 0
    for (const r of relationships) {
        const sourceId = idMap.get(r.sourceId)
        const targetId = idMap.get(r.targetId)
        if (!sourceId || !targetId) {
            unresolved++
            continue
        }
        try {
            await service.createRelationship({ sourceId, targetId, type: r.type })
            createdRelationships++
        } catch {
            unresolved++
        }
    }

    return { artifacts: idMap.size, relationships: createdRelationships, unresolved }
}
