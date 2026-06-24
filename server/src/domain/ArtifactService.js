/**
 * ArtifactService — orquestación del ciclo de vida de artefactos, relaciones y temporales.
 * Portado de dashboard/artifacts/services/ArtifactService.ts (ahora server-side).
 * Publica eventos en el EventBus tras cada mutación (consumible por SSE en el futuro).
 */

import { randomUUID } from 'node:crypto'
import { noopEventBus } from './EventBus.js'
import { createDefaultSemanticMetadata, createDefaultVisualizationProperties } from './constants.js'

export class ArtifactService {
    constructor(repository, eventBus = noopEventBus) {
        this.repository = repository
        this.eventBus = eventBus
    }

    async createArtifact(payload) {
        const enhanced = {
            ...payload,
            semanticMetadata: { ...createDefaultSemanticMetadata(), ...payload.semanticMetadata },
            visualProperties: {
                ...createDefaultVisualizationProperties(payload.type, payload.coordinates?.x ?? 0, payload.coordinates?.y ?? 0),
                ...payload.visualProperties,
            },
        }
        const artifact = await this.repository.create(enhanced)
        this.eventBus.publish('artifact:created', { source: 'artifacts-module', artifact, timestamp: Date.now() })
        return artifact
    }

    async updateArtifact(id, payload) {
        const previous = await this.repository.findById(id)
        if (!previous) throw new Error(`VisualArtifact with id ${id} not found`)
        const updated = await this.repository.update(id, payload)
        this.eventBus.publish('artifact:updated', { source: 'artifacts-module', artifact: updated, previous, timestamp: Date.now() })
        return updated
    }

    async deleteArtifact(id) {
        const success = await this.repository.delete(id)
        if (success) this.eventBus.publish('artifact:deleted', { source: 'artifacts-module', id, timestamp: Date.now() })
        return success
    }

    getArtifact(id) {
        return this.repository.findById(id)
    }

    getAllArtifacts() {
        return this.repository.findAll()
    }

    searchArtifacts(query) {
        return this.repository.search(query)
    }

    filterArtifacts(criteria) {
        return this.repository.filter(criteria)
    }

    // --- Relationships ---
    async createRelationship(relationship) {
        const source = await this.repository.findById(relationship.sourceId)
        const target = await this.repository.findById(relationship.targetId)
        if (!source) throw new Error(`Source artifact ${relationship.sourceId} not found`)
        if (!target) throw new Error(`Target artifact ${relationship.targetId} not found`)
        if (!relationship.type) throw new Error('Relationship type is required')

        const created = await this.repository.createRelationship(relationship)
        this.eventBus.publish('relationship:created', { source: 'artifacts-module', relationship: created, timestamp: Date.now() })
        return created
    }

    async deleteRelationship(id) {
        const success = await this.repository.deleteRelationship(id)
        if (success) this.eventBus.publish('relationship:deleted', { source: 'artifacts-module', id, timestamp: Date.now() })
        return success
    }

    getArtifactRelationships(artifactId) {
        return this.repository.findRelationshipsByArtifact(artifactId)
    }

    // --- Temporal artifacts (drafts) ---
    async createTemporalArtifact(payload = {}) {
        const type = payload.type ?? 'intent'
        const temporal = {
            temporaryId: randomUUID(),
            name: payload.name ?? '',
            type,
            description: payload.description ?? '',
            purpose: payload.purpose ?? '',
            context: payload.context ?? {},
            authority: payload.authority ?? '',
            evaluationCriteria: payload.evaluationCriteria ?? [],
            semanticMetadata: { ...createDefaultSemanticMetadata(), ...payload.semanticMetadata },
            visualProperties: {
                ...createDefaultVisualizationProperties(type, payload.coordinates?.x ?? 0, payload.coordinates?.y ?? 0),
                ...payload.visualProperties,
            },
            coordinates: payload.coordinates ?? { x: 0, y: 0 },
            relationships: [],
            isValid: false,
            validationErrors: [],
            status: 'creating',
            validationProgress: {
                name: 'pending',
                type: 'pending',
                description: 'pending',
                purpose: 'pending',
                context: 'pending',
                authority: 'pending',
                evaluation: 'pending',
            },
            visualState: { opacity: 0.6, scale: 0.8, color: '#94A3B8', pulseAnimation: true },
            guidanceState: {
                showPurposeHelp: false,
                showContextHelp: false,
                showAuthorityHelp: false,
                showEvaluationHelp: false,
            },
        }
        const saved = await this.repository.saveTemporalArtifact(temporal)
        this.eventBus.publish('temporal:created', { source: 'artifacts-module', temporal: saved, timestamp: Date.now() })
        return saved
    }

    async updateTemporalArtifact(temporaryId, updates) {
        const existing = await this.repository.getTemporalArtifact(temporaryId)
        if (!existing) throw new Error(`Temporal artifact ${temporaryId} not found`)
        const updated = { ...existing, ...updates, temporaryId: existing.temporaryId }
        const saved = await this.repository.saveTemporalArtifact(updated)
        this.eventBus.publish('temporal:updated', { source: 'artifacts-module', temporal: saved, timestamp: Date.now() })
        return saved
    }

    async promoteTemporalArtifact(temporaryId) {
        const temporal = await this.repository.getTemporalArtifact(temporaryId)
        if (!temporal) throw new Error(`Temporal artifact ${temporaryId} not found`)

        const payload = {
            name: temporal.name,
            type: temporal.type,
            description: temporal.description,
            purpose: temporal.purpose,
            context: temporal.context,
            authority: temporal.authority,
            evaluationCriteria: temporal.evaluationCriteria,
            coordinates: temporal.coordinates,
            semanticMetadata: temporal.semanticMetadata,
            visualProperties: { ...temporal.visualProperties, opacity: 1.0, scale: 1.0 },
        }
        const artifact = await this.createArtifact(payload)
        await this.repository.deleteTemporalArtifact(temporaryId)
        this.eventBus.publish('temporal:promoted', { source: 'artifacts-module', artifact, temporalId: temporaryId, timestamp: Date.now() })
        return artifact
    }

    async deleteTemporalArtifact(temporaryId) {
        const success = await this.repository.deleteTemporalArtifact(temporaryId)
        if (success) this.eventBus.publish('temporal:deleted', { source: 'artifacts-module', temporalId: temporaryId, timestamp: Date.now() })
        return success
    }

    getTemporalArtifact(temporaryId) {
        return this.repository.getTemporalArtifact(temporaryId)
    }

    // --- Bulk ---
    bulkCreateArtifacts(payloads) {
        return this.repository.bulkCreate(payloads)
    }
    bulkUpdateArtifacts(updates) {
        return this.repository.bulkUpdate(updates)
    }
    bulkDeleteArtifacts(ids) {
        return this.repository.bulkDelete(ids)
    }

    // --- Data integrity / backup ---
    validateDataIntegrity() {
        return this.repository.validateDataIntegrity()
    }
    exportData() {
        return this.repository.backup()
    }
    importData(data) {
        return this.repository.restore(data)
    }

    /** Estadísticas agregadas (totales, por tipo, valor de negocio medio, validez). */
    async getStatistics() {
        const artifacts = await this.getAllArtifacts()
        const relationships = await Promise.all(artifacts.map((a) => this.getArtifactRelationships(a.id)))
        // Dedup por id: una relación aparece bajo su source y su target (evita el doble conteo).
        const totalRelationships = new Set(relationships.flat().map((r) => r.id)).size

        const artifactsByType = artifacts.reduce((acc, a) => {
            acc[a.type] = (acc[a.type] || 0) + 1
            return acc
        }, {})

        const averageBusinessValue =
            artifacts.length > 0
                ? artifacts.reduce((sum, a) => sum + (a.semanticMetadata?.businessValue ?? 0), 0) / artifacts.length
                : 0

        const validationStatus = artifacts.reduce(
            (acc, a) => {
                if (a.isValid) acc.valid++
                else acc.invalid++
                return acc
            },
            { valid: 0, invalid: 0 }
        )

        return {
            totalArtifacts: artifacts.length,
            totalRelationships,
            artifactsByType,
            averageBusinessValue,
            validationStatus,
        }
    }
}
