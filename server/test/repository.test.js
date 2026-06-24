/**
 * Persistencia write-through: YAML (fuente de verdad) + SQLite (índice derivado).
 * Verifica que las mutaciones aterrizan en YAML, que las lecturas salen del índice y que
 * el índice se puede reconstruir desde cero a partir de los YAML.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { YamlStore } from '../src/repository/YamlStore.js'
import { SqliteIndex } from '../src/repository/SqliteIndex.js'
import { ArtifactRepository } from '../src/repository/ArtifactRepository.js'

async function freshRepo() {
    const dir = await mkdtemp(path.join(tmpdir(), 'hexy-test-'))
    const yaml = new YamlStore(dir)
    await yaml.init()
    const index = new SqliteIndex(path.join(dir, 'hexy.db'))
    const repo = new ArtifactRepository(yaml, index)
    await repo.bootstrap()
    return { dir, yaml, index, repo }
}

test('create writes a YAML file and indexes it', async () => {
    const { dir, yaml, repo, index } = await freshRepo()
    try {
        const created = await repo.create({ name: 'Mi Intención', type: 'intent', description: 'Una descripción larga.' })
        assert.ok(created.id)

        const files = await readdir(path.join(dir, 'artifacts'))
        assert.equal(files.length, 1)
        assert.ok(files[0].endsWith('.yaml'))

        const fromIndex = await repo.findById(created.id)
        assert.equal(fromIndex.name, 'Mi Intención')
        assert.equal(index.countArtifacts(), 1)

        // El YAML es la fuente de verdad y es lossless.
        const [persisted] = await yaml.listArtifacts()
        assert.equal(persisted.purpose, '')
        assert.equal(persisted.type, 'intent')
        assert.ok(persisted.visualProperties)
    } finally {
        index.close()
        await rm(dir, { recursive: true, force: true })
    }
})

test('update and delete are write-through', async () => {
    const { dir, repo, index } = await freshRepo()
    try {
        const a = await repo.create({ name: 'A', type: 'process', description: 'desc larga aqui' })
        const updated = await repo.update(a.id, { name: 'A2' })
        assert.equal(updated.name, 'A2')
        assert.equal((await repo.findById(a.id)).name, 'A2')

        assert.equal(await repo.delete(a.id), true)
        assert.equal(await repo.findById(a.id), null)
        assert.equal(index.countArtifacts(), 0)
    } finally {
        index.close()
        await rm(dir, { recursive: true, force: true })
    }
})

test('relationships persist and query by artifact', async () => {
    const { dir, repo, index } = await freshRepo()
    try {
        const a = await repo.create({ name: 'Src', type: 'process', description: 'desc larga aqui' })
        const b = await repo.create({ name: 'Tgt', type: 'intent', description: 'desc larga aqui' })
        const rel = await repo.createRelationship({ sourceId: a.id, targetId: b.id, type: 'depends_on' })

        const found = await repo.findRelationshipsByArtifact(a.id)
        assert.equal(found.length, 1)
        assert.equal(found[0].id, rel.id)
    } finally {
        index.close()
        await rm(dir, { recursive: true, force: true })
    }
})

test('SQLite index can be rebuilt from YAML after deletion', async () => {
    const { dir, yaml, repo, index } = await freshRepo()
    try {
        await repo.create({ name: 'Uno', type: 'intent', description: 'desc larga aqui' })
        await repo.create({ name: 'Dos', type: 'vision', description: 'desc larga aqui' })

        // Simula DB corrupta: vacíala y reconstruye desde los YAML.
        index.db.exec('DELETE FROM artifacts;')
        assert.equal(index.countArtifacts(), 0)

        const stats = await index.rebuildFromYaml(yaml)
        assert.equal(stats.artifacts, 2)
        assert.equal(index.countArtifacts(), 2)
    } finally {
        index.close()
        await rm(dir, { recursive: true, force: true })
    }
})
