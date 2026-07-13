/**
 * SqliteIndex — ÍNDICE DERIVADO (nunca autoritativo). Espejo de los YAML en una base
 * SQLite embebida (node:sqlite, cero dependencias) para lecturas y consultas rápidas.
 * Si el archivo .db se borra o corrompe, se regenera con rebuildFromYaml().
 *
 * Cada fila guarda las columnas indexables + el objeto completo en `data` (JSON), de modo
 * que las lecturas devuelven exactamente el mismo modelo que el YAML.
 */

import { DatabaseSync } from 'node:sqlite'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS artifacts (
    id             TEXT PRIMARY KEY,
    type           TEXT NOT NULL,
    name           TEXT NOT NULL,
    is_valid       INTEGER NOT NULL DEFAULT 1,
    business_value REAL NOT NULL DEFAULT 0,
    created_at     TEXT,
    data           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_artifacts_valid ON artifacts(is_valid);

CREATE TABLE IF NOT EXISTS relationships (
    id        TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type      TEXT NOT NULL,
    data      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rel_source ON relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_rel_target ON relationships(target_id);

CREATE TABLE IF NOT EXISTS temporal (
    temporary_id TEXT PRIMARY KEY,
    type         TEXT,
    name         TEXT,
    data         TEXT NOT NULL
);
`

export class SqliteIndex {
    constructor(dbPath) {
        this.db = new DatabaseSync(dbPath)
        this.db.exec('PRAGMA journal_mode = WAL;')
        this.db.exec(SCHEMA)
    }

    // --- Artifacts ---
    upsertArtifact(a) {
        this.db
            .prepare(
                `INSERT INTO artifacts (id, type, name, is_valid, business_value, created_at, data)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                   type=excluded.type, name=excluded.name, is_valid=excluded.is_valid,
                   business_value=excluded.business_value, created_at=excluded.created_at, data=excluded.data`
            )
            .run(
                a.id,
                a.type,
                a.name,
                a.isValid === false ? 0 : 1,
                a.semanticMetadata?.businessValue ?? 0,
                typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString(),
                JSON.stringify(a)
            )
    }

    deleteArtifact(id) {
        const info = this.db.prepare('DELETE FROM artifacts WHERE id = ?').run(id)
        return info.changes > 0
    }

    findArtifactById(id) {
        const row = this.db.prepare('SELECT data FROM artifacts WHERE id = ?').get(id)
        return row ? JSON.parse(row.data) : null
    }

    findAllArtifacts() {
        return this.db
            .prepare('SELECT data FROM artifacts ORDER BY created_at')
            .all()
            .map((r) => JSON.parse(r.data))
    }

    /** Búsqueda por texto (name/description/purpose) y/o tipo. */
    searchArtifacts({ text, type }) {
        let rows
        if (type) {
            rows = this.db.prepare('SELECT data FROM artifacts WHERE type = ?').all(type)
        } else {
            rows = this.db.prepare('SELECT data FROM artifacts').all()
        }
        let result = rows.map((r) => JSON.parse(r.data))
        if (text) {
            const q = text.toLowerCase()
            result = result.filter(
                (a) =>
                    a.name?.toLowerCase().includes(q) ||
                    a.description?.toLowerCase().includes(q) ||
                    a.purpose?.toLowerCase().includes(q)
            )
        }
        return result
    }

    /** Filtro por tipo / validez / fechas. */
    filterArtifacts(criteria) {
        let result = this.findAllArtifacts()
        if (criteria.type) result = result.filter((a) => a.type === criteria.type)
        if (criteria.validity === 'valid') result = result.filter((a) => a.isValid)
        if (criteria.validity === 'invalid') result = result.filter((a) => !a.isValid)
        if (criteria.createdAfter) result = result.filter((a) => new Date(a.createdAt) >= new Date(criteria.createdAfter))
        if (criteria.createdBefore)
            result = result.filter((a) => new Date(a.createdAt) <= new Date(criteria.createdBefore))
        return result
    }

    countArtifacts() {
        return this.db.prepare('SELECT COUNT(*) AS n FROM artifacts').get().n
    }

    // --- Relationships ---
    upsertRelationship(r) {
        this.db
            .prepare(
                `INSERT INTO relationships (id, source_id, target_id, type, data)
                 VALUES (?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                   source_id=excluded.source_id, target_id=excluded.target_id,
                   type=excluded.type, data=excluded.data`
            )
            .run(r.id, r.sourceId, r.targetId, r.type, JSON.stringify(r))
    }

    deleteRelationship(id) {
        const info = this.db.prepare('DELETE FROM relationships WHERE id = ?').run(id)
        return info.changes > 0
    }

    findRelationshipsByArtifact(artifactId) {
        return this.db
            .prepare('SELECT data FROM relationships WHERE source_id = ? OR target_id = ?')
            .all(artifactId, artifactId)
            .map((r) => JSON.parse(r.data))
    }

    findAllRelationships() {
        return this.db
            .prepare('SELECT data FROM relationships')
            .all()
            .map((r) => JSON.parse(r.data))
    }

    countRelationships() {
        return this.db.prepare('SELECT COUNT(*) AS n FROM relationships').get().n
    }

    // --- Temporal ---
    upsertTemporal(t) {
        this.db
            .prepare(
                `INSERT INTO temporal (temporary_id, type, name, data)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(temporary_id) DO UPDATE SET
                   type=excluded.type, name=excluded.name, data=excluded.data`
            )
            .run(t.temporaryId, t.type ?? null, t.name ?? null, JSON.stringify(t))
    }

    deleteTemporal(temporaryId) {
        const info = this.db.prepare('DELETE FROM temporal WHERE temporary_id = ?').run(temporaryId)
        return info.changes > 0
    }

    findTemporalById(temporaryId) {
        const row = this.db.prepare('SELECT data FROM temporal WHERE temporary_id = ?').get(temporaryId)
        return row ? JSON.parse(row.data) : null
    }

    findAllTemporal() {
        return this.db
            .prepare('SELECT data FROM temporal')
            .all()
            .map((r) => JSON.parse(r.data))
    }

    /** Vacía y repuebla el índice completo desde el YamlStore (fuente de verdad). */
    async rebuildFromYaml(yamlStore) {
        const [artifacts, relationships, temporal] = await Promise.all([
            yamlStore.listArtifacts(),
            yamlStore.listRelationships(),
            yamlStore.listTemporal(),
        ])

        this.db.exec('BEGIN')
        try {
            this.db.exec('DELETE FROM artifacts; DELETE FROM relationships; DELETE FROM temporal;')
            for (const a of artifacts) this.upsertArtifact(a)
            for (const r of relationships) this.upsertRelationship(r)
            for (const t of temporal) this.upsertTemporal(t)
            this.db.exec('COMMIT')
        } catch (err) {
            this.db.exec('ROLLBACK')
            throw err
        }

        return { artifacts: artifacts.length, relationships: relationships.length, temporal: temporal.length }
    }

    close() {
        this.db.close()
    }
}
