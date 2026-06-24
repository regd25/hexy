/**
 * Arranque del backend Hexy (node:http puro).
 *   1. Inicializa YamlStore (fuente de verdad) y SqliteIndex (índice derivado).
 *   2. Reconstruye el índice desde los YAML (la DB nunca es autoritativa).
 *   3. Cablea ArtifactService + ValidationService y levanta el servidor HTTP.
 */

import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { YamlStore } from './repository/YamlStore.js'
import { SqliteIndex } from './repository/SqliteIndex.js'
import { ArtifactRepository } from './repository/ArtifactRepository.js'
import { ArtifactService } from './domain/ArtifactService.js'
import { ValidationService } from './domain/ValidationService.js'
import { InMemoryEventBus } from './domain/EventBus.js'
import { createRouter } from './api/routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = Number(process.env.PORT ?? 4000)
const DATA_DIR = process.env.HEXY_DATA_DIR ?? path.join(__dirname, '..', 'data')
const DB_PATH = process.env.HEXY_DB_PATH ?? path.join(DATA_DIR, 'hexy.db')

/** Construye el grafo de dependencias del backend (reutilizable en tests). */
export async function buildApp({ dataDir = DATA_DIR, dbPath = DB_PATH } = {}) {
    const yamlStore = new YamlStore(dataDir)
    await yamlStore.init()

    const index = new SqliteIndex(dbPath)
    const repository = new ArtifactRepository(yamlStore, index)
    const stats = await repository.bootstrap()

    const eventBus = new InMemoryEventBus()
    const service = new ArtifactService(repository, eventBus)
    const validation = new ValidationService()
    const router = createRouter({ service, validation })

    return { yamlStore, index, repository, service, validation, router, bootstrapStats: stats }
}

async function main() {
    const app = await buildApp()
    console.log(
        `[server] índice reconstruido desde YAML: ${app.bootstrapStats.artifacts} artefactos, ` +
            `${app.bootstrapStats.relationships} relaciones, ${app.bootstrapStats.temporal} temporales`
    )

    const server = http.createServer(app.router.handler())
    server.listen(PORT, () => {
        console.log(`[server] Hexy backend escuchando en http://localhost:${PORT}`)
        console.log(`[server] datos (fuente de verdad): ${DATA_DIR}`)
    })

    const shutdown = () => {
        console.log('\n[server] cerrando…')
        server.close(() => {
            app.index.close()
            process.exit(0)
        })
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
}

// Solo arranca el servidor si se ejecuta directamente (no al importarse en tests).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((err) => {
        console.error('[server] fallo al arrancar:', err)
        process.exit(1)
    })
}
