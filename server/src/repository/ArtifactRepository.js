/**
 * ArtifactRepository — orquesta la persistencia write-through:
 *   mutaciones  → escribe YAML (fuente de verdad) y luego espeja en SQLite (índice)
 *   lecturas    → SQLite (índice derivado)
 *
 * Reemplaza a la LocalStorageArtifactRepository del dashboard (misma superficie de métodos
 * que consume ArtifactService), pero respaldada por disco + índice en lugar de localStorage.
 */

import { randomUUID } from 'node:crypto'
import {
    normalizeArtifactType,
    createDefaultSemanticMetadata,
    createDefaultVisualizationProperties,
} from '../domain/constants.js'

const VERSION = '1.0.0'

const incrementVersion = (version) => {
    const parts = String(version ?? VERSION)
        .split('.')
        .map(Number)
    parts[2] = (parts[2] ?? 0) + 1
    return parts.join('.')
}

export class ArtifactRepository {
    constructor(yamlStore, sqliteIndex) {
        this.yaml = yamlStore
        this.index = sqliteIndex
    }

    /** Construye el índice desde los YAML al arrancar (la DB es derivada). */
    async bootstrap() {
        await this.yaml.init()
        return this.index.rebuildFromYaml(this.yaml)
    }

    // --- Artifacts ---
    async create(payload) {
        const now = new Date().toISOString()
        const type = normalizeArtifactType(payload.type)
        const coordinates = payload.coordinates ?? { x: 0, y: 0 }

        const artifact = {
            id: randomUUID(),
            name: payload.name,
            type,
            description: payload.description ?? '',
            purpose: payload.purpose ?? '',
            context: payload.context ?? {},
            authority: payload.authority ?? '',
            evaluationCriteria: payload.evaluationCriteria ?? [],
            semanticMetadata: { ...createDefaultSemanticMetadata(), ...payload.semanticMetadata },
            visualProperties: {
                ...createDefaultVisualizationProperties(type, coordinates.x, coordinates.y),
                ...payload.visualProperties,
            },
            coordinates,
            version: VERSION,
            createdAt: now,
            updatedAt: now,
            relationships: [],
            isValid: true,
            validationErrors: [],
        }

        await this.yaml.writeArtifact(artifact)
        this.index.upsertArtifact(artifact)
        return artifact
    }

    async findById(id) {
        return this.index.findArtifactById(id)
    }

    async findAll() {
        return this.index.findAllArtifacts()
    }

    async update(id, payload) {
        const existing = this.index.findArtifactById(id)
        if (!existing) throw new Error(`VisualArtifact with id ${id} not found`)

        const updated = {
            ...existing,
            name: payload.name ?? existing.name,
            type: payload.type !== undefined ? normalizeArtifactType(payload.type) : existing.type,
            description: payload.description ?? existing.description,
            purpose: payload.purpose ?? existing.purpose,
            context: payload.context ?? existing.context,
            authority: payload.authority ?? existing.authority,
            evaluationCriteria: payload.evaluationCriteria ?? existing.evaluationCriteria,
            coordinates: payload.coordinates ?? existing.coordinates,
            semanticMetadata: payload.semanticMetadata
                ? { ...existing.semanticMetadata, ...payload.semanticMetadata }
                : existing.semanticMetadata,
            visualProperties: payload.visualProperties
                ? { ...existing.visualProperties, ...payload.visualProperties }
                : existing.visualProperties,
            updatedAt: new Date().toISOString(),
            version: incrementVersion(existing.version),
        }

        await this.yaml.writeArtifact(updated)
        this.index.upsertArtifact(updated)
        return updated
    }

    async delete(id) {
        const removed = await this.yaml.deleteArtifact(id)
        this.index.deleteArtifact(id)
        return removed
    }

    async search(query) {
        return this.index.searchArtifacts(query)
    }

    async filter(criteria) {
        return this.index.filterArtifacts(criteria)
    }

    async validateDataIntegrity() {
        const artifacts = this.index.findAllArtifacts()
        const ids = artifacts.map((a) => a.id)
        return ids.length === new Set(ids).size
    }

    async backup() {
        return JSON.stringify(
            {
                version: VERSION,
                timestamp: new Date().toISOString(),
                artifacts: this.index.findAllArtifacts(),
                relationships: this.index.findAllRelationships(),
                temporal: this.index.findAllTemporal(),
            },
            null,
            2
        )
    }

    async restore(backupData) {
        const backup = typeof backupData === 'string' ? JSON.parse(backupData) : backupData
        if (!backup.artifacts) throw new Error('Invalid backup format')

        for (const a of backup.artifacts) {
            const normalized = { ...a, type: normalizeArtifactType(a.type) }
            await this.yaml.writeArtifact(normalized)
        }
        for (const r of backup.relationships ?? []) await this.yaml.writeRelationship(r)
        for (const t of backup.temporal ?? []) await this.yaml.writeTemporal(t)

        await this.index.rebuildFromYaml(this.yaml)
        return true
    }

    // --- Relationships ---
    async createRelationship(relationship) {
        if (!relationship.type) throw new Error('Relationship type is required')
        const created = { ...relationship, id: randomUUID(), createdAt: new Date().toISOString() }
        await this.yaml.writeRelationship(created)
        this.index.upsertRelationship(created)
        return created
    }

    async deleteRelationship(id) {
        const removed = await this.yaml.deleteRelationship(id)
        this.index.deleteRelationship(id)
        return removed
    }

    async findRelationshipsByArtifact(artifactId) {
        return this.index.findRelationshipsByArtifact(artifactId)
    }

    // --- Bulk ---
    async bulkCreate(payloads) {
        const out = []
        for (const p of payloads) {
            try {
                out.push(await this.create(p))
            } catch {
                /* skip failed */
            }
        }
        return out
    }

    async bulkUpdate(updates) {
        const out = []
        for (const u of updates) {
            try {
                out.push(await this.update(u.id, u))
            } catch {
                /* skip failed */
            }
        }
        return out
    }

    async bulkDelete(ids) {
        let ok = true
        for (const id of ids) {
            try {
                if (!(await this.delete(id))) ok = false
            } catch {
                ok = false
            }
        }
        return ok
    }

    // --- Temporal ---
    async saveTemporalArtifact(temporal) {
        await this.yaml.writeTemporal(temporal)
        this.index.upsertTemporal(temporal)
        return temporal
    }

    async getTemporalArtifact(temporaryId) {
        return this.index.findTemporalById(temporaryId)
    }

    async deleteTemporalArtifact(temporaryId) {
        const removed = await this.yaml.deleteTemporal(temporaryId)
        this.index.deleteTemporal(temporaryId)
        return removed
    }
}
