/**
 * YamlStore — FUENTE DE VERDAD. Persiste cada entidad como un archivo `.yaml` lossless
 * (todos los campos del modelo) en disco, versionable en git y editable por el usuario.
 *
 * Layout:
 *   data/artifacts/<id>.yaml
 *   data/relationships/<id>.yaml
 *   data/temporal/<temporaryId>.yaml
 *
 * El YAML es lossless a propósito (la serialización SOL canónica, lossy, vive en
 * domain/sol/serializeYaml.js y se usa solo para export/validación).
 */

import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { stringify, parse } from 'yaml'

export class YamlStore {
    constructor(dataDir) {
        this.dataDir = dataDir
        this.dirs = {
            artifacts: path.join(dataDir, 'artifacts'),
            relationships: path.join(dataDir, 'relationships'),
            temporal: path.join(dataDir, 'temporal'),
        }
    }

    /** Crea los directorios de datos si no existen. Idempotente. */
    async init() {
        for (const dir of Object.values(this.dirs)) {
            await mkdir(dir, { recursive: true })
        }
    }

    async #readAll(dir) {
        if (!existsSync(dir)) return []
        const files = (await readdir(dir)).filter((f) => f.endsWith('.yaml'))
        const out = []
        for (const file of files) {
            const raw = await readFile(path.join(dir, file), 'utf-8')
            const parsed = parse(raw)
            if (parsed) out.push(parsed)
        }
        return out
    }

    #writeEntity(dir, id, entity) {
        const file = path.join(dir, `${id}.yaml`)
        return writeFile(file, stringify(entity, { lineWidth: 0 }), 'utf-8')
    }

    async #deleteEntity(dir, id) {
        const file = path.join(dir, `${id}.yaml`)
        if (!existsSync(file)) return false
        await rm(file)
        return true
    }

    // --- Artifacts ---
    listArtifacts() {
        return this.#readAll(this.dirs.artifacts)
    }
    writeArtifact(artifact) {
        return this.#writeEntity(this.dirs.artifacts, artifact.id, artifact)
    }
    deleteArtifact(id) {
        return this.#deleteEntity(this.dirs.artifacts, id)
    }

    // --- Relationships ---
    listRelationships() {
        return this.#readAll(this.dirs.relationships)
    }
    writeRelationship(rel) {
        return this.#writeEntity(this.dirs.relationships, rel.id, rel)
    }
    deleteRelationship(id) {
        return this.#deleteEntity(this.dirs.relationships, id)
    }

    // --- Temporal artifacts (drafts) ---
    listTemporal() {
        return this.#readAll(this.dirs.temporal)
    }
    writeTemporal(temporal) {
        return this.#writeEntity(this.dirs.temporal, temporal.temporaryId, temporal)
    }
    deleteTemporal(temporaryId) {
        return this.#deleteEntity(this.dirs.temporal, temporaryId)
    }
}
