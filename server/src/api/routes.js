/**
 * Registro de rutas REST. Cada handler mapea 1:1 a un método de ArtifactService.
 * Lecturas → índice SQLite; mutaciones → write-through YAML + índice.
 */

import { Router } from '../router.js'
import { sendJson, sendText, notFound, badRequest } from '../http.js'
import { serializeYaml } from '../domain/sol/serializeYaml.js'
import { validateYaml } from '../domain/sol/validateYaml.js'
import { importGraph } from '../domain/sol/importGraph.js'

/**
 * @param {object} deps
 * @param {import('../domain/ArtifactService.js').ArtifactService} deps.service
 * @param {import('../domain/ValidationService.js').ValidationService} deps.validation
 */
export function createRouter({ service, validation }) {
    const router = new Router()

    router.get('/api/health', ({ res }) => sendJson(res, 200, { status: 'ok' }))

    // --- Artifacts ---
    router.get('/api/artifacts', async ({ res, query }) => {
        if (query.text || query.type) {
            return sendJson(res, 200, await service.searchArtifacts({ text: query.text, type: query.type }))
        }
        sendJson(res, 200, await service.getAllArtifacts())
    })

    router.post('/api/artifacts', async ({ res, body }) => {
        if (!body?.name || !body?.type) throw badRequest('name and type are required')
        sendJson(res, 201, await service.createArtifact(body))
    })

    router.get('/api/artifacts/:id', async ({ res, params }) => {
        const artifact = await service.getArtifact(params.id)
        if (!artifact) throw notFound(`Artifact ${params.id} not found`)
        sendJson(res, 200, artifact)
    })

    router.patch('/api/artifacts/:id', async ({ res, params, body }) => {
        sendJson(res, 200, await service.updateArtifact(params.id, body ?? {}))
    })

    router.delete('/api/artifacts/:id', async ({ res, params }) => {
        const ok = await service.deleteArtifact(params.id)
        if (!ok) throw notFound(`Artifact ${params.id} not found`)
        sendJson(res, 200, { deleted: true })
    })

    router.get('/api/artifacts/:id/relationships', async ({ res, params }) => {
        sendJson(res, 200, await service.getArtifactRelationships(params.id))
    })

    router.post('/api/artifacts/:id/validate', async ({ res, params }) => {
        const artifact = await service.getArtifact(params.id)
        if (!artifact) throw notFound(`Artifact ${params.id} not found`)
        sendJson(res, 200, await validation.validateArtifact(artifact))
    })

    // --- Relationships ---
    router.post('/api/relationships', async ({ res, body }) => {
        if (!body?.sourceId || !body?.targetId || !body?.type) throw badRequest('sourceId, targetId and type are required')
        sendJson(res, 201, await service.createRelationship(body))
    })

    router.delete('/api/relationships/:id', async ({ res, params }) => {
        const ok = await service.deleteRelationship(params.id)
        if (!ok) throw notFound(`Relationship ${params.id} not found`)
        sendJson(res, 200, { deleted: true })
    })

    // --- Temporal artifacts (drafts) ---
    router.post('/api/temporal', async ({ res, body }) => {
        sendJson(res, 201, await service.createTemporalArtifact(body ?? {}))
    })

    router.get('/api/temporal/:id', async ({ res, params }) => {
        const temporal = await service.getTemporalArtifact(params.id)
        if (!temporal) throw notFound(`Temporal artifact ${params.id} not found`)
        sendJson(res, 200, temporal)
    })

    router.patch('/api/temporal/:id', async ({ res, params, body }) => {
        sendJson(res, 200, await service.updateTemporalArtifact(params.id, body ?? {}))
    })

    router.post('/api/temporal/:id/promote', async ({ res, params }) => {
        sendJson(res, 201, await service.promoteTemporalArtifact(params.id))
    })

    router.delete('/api/temporal/:id', async ({ res, params }) => {
        const ok = await service.deleteTemporalArtifact(params.id)
        if (!ok) throw notFound(`Temporal artifact ${params.id} not found`)
        sendJson(res, 200, { deleted: true })
    })

    // --- Statistics / backup ---
    router.get('/api/statistics', async ({ res }) => sendJson(res, 200, await service.getStatistics()))
    router.get('/api/export', async ({ res }) => sendText(res, 200, await service.exportData(), 'application/json; charset=utf-8'))
    router.post('/api/import', async ({ res, body }) => sendJson(res, 200, { imported: await service.importData(body) }))

    // --- SOL (export YAML canónico + eval gate) ---
    router.get('/api/sol/yaml', async ({ res }) => {
        const artifacts = await service.getAllArtifacts()
        const relationships = (await Promise.all(artifacts.map((a) => service.getArtifactRelationships(a.id)))).flat()
        const unique = [...new Map(relationships.map((r) => [r.id, r])).values()]
        sendText(res, 200, serializeYaml(artifacts, unique), 'text/yaml; charset=utf-8')
    })

    router.post('/api/sol/validate', async ({ res, body }) => {
        let text = body?.yaml
        if (text == null) {
            const artifacts = await service.getAllArtifacts()
            const relationships = (await Promise.all(artifacts.map((a) => service.getArtifactRelationships(a.id)))).flat()
            const unique = [...new Map(relationships.map((r) => [r.id, r])).values()]
            text = serializeYaml(artifacts, unique)
        }
        sendJson(res, 200, validateYaml(text))
    })

    // Round-trip: importa un .yaml SOL → reconstruye el grafo (F2). mode: 'merge' | 'replace'.
    router.post('/api/sol/import', async ({ res, body }) => {
        if (!body?.yaml) throw badRequest('yaml is required')
        sendJson(res, 200, await importGraph(service, body.yaml, { mode: body.mode }))
    })

    return router
}
