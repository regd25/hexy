/**
 * Importa un documento SOL `.yaml` al modelo (F2 round-trip). Parsea, distribuye los nodos
 * en círculo (el `.yaml` no lleva coordenadas) y crea artefactos + relaciones vía el servicio
 * (write-through YAML + índice). Resuelve las referencias `Type:Id` a los ids recién creados;
 * las que no resuelven se reportan como `unresolved` (anti-alucinación).
 */

import { parseYaml, solRefFor } from './parseYaml.js'

/**
 * @param {import('../ArtifactService.js').ArtifactService} service
 * @param {string} text  documento `.yaml`
 * @param {{mode?: 'merge'|'replace'}} [opts]
 * @returns {Promise<{artifacts:number, relationships:number, unresolved:string[]}>}
 */
export async function importGraph(service, text, { mode = 'merge' } = {}) {
    const { artifacts } = parseYaml(text)

    if (mode === 'replace') {
        const existing = await service.getAllArtifacts()
        const rels = (await Promise.all(existing.map((a) => service.getArtifactRelationships(a.id)))).flat()
        for (const id of new Set(rels.map((r) => r.id))) await service.deleteRelationship(id)
        await service.bulkDeleteArtifacts(existing.map((a) => a.id))
    }

    // Layout circular (el SOL no persiste coordenadas).
    const n = artifacts.length
    const cx = 520
    const cy = 360
    const radius = Math.max(180, n * 26)
    const refToId = new Map()
    let createdArtifacts = 0

    for (let i = 0; i < n; i++) {
        const a = artifacts[i]
        const angle = (2 * Math.PI * i) / Math.max(1, n)
        const coordinates = {
            x: Math.round(cx + radius * Math.cos(angle)),
            y: Math.round(cy + radius * Math.sin(angle)),
        }
        const created = await service.createArtifact({
            name: a.name,
            type: a.type,
            description: a.description,
            coordinates,
        })
        refToId.set(solRefFor(a), created.id)
        createdArtifacts++
    }

    let createdRelationships = 0
    const unresolved = []
    for (const a of artifacts) {
        const sourceId = refToId.get(solRefFor(a))
        for (const r of a.relationships) {
            const targetId = refToId.get(r.targetRef)
            if (!targetId) {
                unresolved.push(r.targetRef)
                continue
            }
            try {
                await service.createRelationship({ sourceId, targetId, type: r.type })
                createdRelationships++
            } catch {
                unresolved.push(r.targetRef)
            }
        }
    }

    return { artifacts: createdArtifacts, relationships: createdRelationships, unresolved }
}
