/**
 * Simplified Artifact Repository Implementation
 * Following repository pattern for data persistence abstraction
 */

import {
    Artifact,
    TemporalArtifact,
    Relationship,
    ArtifactSearchQuery,
    ArtifactFilter,
    CreateArtifactPayload,
    UpdateArtifactPayload,
    createDefaultSemanticMetadata,
    createDefaultVisualizationProperties,
} from '../types'

/**
 * Repository interface for artifact persistence
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IArtifactRepository {
    create(payload: CreateArtifactPayload): Promise<Artifact>
    findById(id: string): Promise<Artifact | null>
    findAll(): Promise<Artifact[]>
    update(id: string, payload: UpdateArtifactPayload): Promise<Artifact>
    delete(id: string): Promise<boolean>
    search(query: ArtifactSearchQuery): Promise<Artifact[]>
    filter(criteria: ArtifactFilter): Promise<Artifact[]>

    // Relationship management
    createRelationship(
        relationship: Omit<Relationship, 'id' | 'createdAt'>
    ): Promise<Relationship>
    deleteRelationship(id: string): Promise<boolean>
    findRelationshipsByArtifact(artifactId: string): Promise<Relationship[]>

    // Temporal artifact operations
    saveTemporalArtifact(temporal: TemporalArtifact): Promise<TemporalArtifact>
    getTemporalArtifact(temporaryId: string): Promise<TemporalArtifact | null>
    deleteTemporalArtifact(temporaryId: string): Promise<boolean>

    // Bulk operations
    bulkCreate(artifacts: CreateArtifactPayload[]): Promise<Artifact[]>
    bulkUpdate(updates: UpdateArtifactPayload[]): Promise<Artifact[]>
    bulkDelete(ids: string[]): Promise<boolean>

    validateDataIntegrity(): Promise<boolean>
    backup(): Promise<string>
    restore(backupData: string): Promise<boolean>
}

/**
 * LocalStorage implementation of artifact repository
 */
export class LocalStorageArtifactRepository implements IArtifactRepository {
    private readonly ARTIFACTS_KEY = 'hexy_artifacts'
    private readonly RELATIONSHIPS_KEY = 'hexy_relationships'
    private readonly TEMPORAL_KEY = 'hexy_temporal_artifacts'
    private readonly VERSION_KEY = 'hexy_data_version'
    private currentVersion = '1.0.0'

    constructor() {
        this.initializeStorage()
    }

    private initializeStorage(): void {
        if (!localStorage.getItem(this.ARTIFACTS_KEY)) {
            localStorage.setItem(this.ARTIFACTS_KEY, JSON.stringify([]))
        }
        if (!localStorage.getItem(this.RELATIONSHIPS_KEY)) {
            localStorage.setItem(this.RELATIONSHIPS_KEY, JSON.stringify([]))
        }
        if (!localStorage.getItem(this.TEMPORAL_KEY)) {
            localStorage.setItem(this.TEMPORAL_KEY, JSON.stringify([]))
        }
        if (!localStorage.getItem(this.VERSION_KEY)) {
            localStorage.setItem(this.VERSION_KEY, this.currentVersion)
        }
    }

    private getArtifacts(): Artifact[] {
        try {
            const data = localStorage.getItem(this.ARTIFACTS_KEY)
            if (!data) return []

            const artifacts: Artifact[] = JSON.parse(data)
            return artifacts.map(artifact => ({
                ...artifact,
                createdAt: new Date(artifact.createdAt),
                updatedAt: new Date(artifact.updatedAt),
            }))
        } catch (error) {
            // Error loading artifacts from localStorage
            return []
        }
    }

    private saveArtifacts(artifacts: Artifact[]): void {
        try {
            localStorage.setItem(this.ARTIFACTS_KEY, JSON.stringify(artifacts))
        } catch {
            throw new Error('Failed to save artifacts to storage')
        }
    }

    private generateId(): string {
        return crypto.randomUUID()
    }

    async create(payload: CreateArtifactPayload): Promise<Artifact> {
        const artifacts = this.getArtifacts()
        const now = new Date()

        const artifact: Artifact = {
            id: this.generateId(),
            name: payload.name,
            type: payload.type,
            description: payload.description,
            purpose: payload.purpose || '',
            context: payload.context || {},
            authority: payload.authority || '',
            evaluationCriteria: payload.evaluationCriteria || [],
            semanticMetadata: {
                ...createDefaultSemanticMetadata(),
                ...payload.semanticMetadata,
            },
            visualProperties: {
                ...createDefaultVisualizationProperties(
                    payload.type,
                    payload.coordinates?.x || 0,
                    payload.coordinates?.y || 0
                ),
                ...payload.visualProperties,
            },
            coordinates: payload.coordinates || { x: 0, y: 0 },
            version: '1.0.0',
            createdAt: now,
            updatedAt: now,
            relationships: [],
            isValid: true,
            validationErrors: [],
        }

        artifacts.push(artifact)
        this.saveArtifacts(artifacts)

        return artifact
    }

    async findById(id: string): Promise<Artifact | null> {
        const artifacts = this.getArtifacts()
        return artifacts.find(a => a.id === id) || null
    }

    async findAll(): Promise<Artifact[]> {
        return this.getArtifacts()
    }

    async update(
        id: string,
        payload: UpdateArtifactPayload
    ): Promise<Artifact> {
        const artifacts = this.getArtifacts()
        const index = artifacts.findIndex(a => a.id === id)

        if (index === -1) {
            throw new Error(`Artifact with id ${id} not found`)
        }

        const existing = artifacts[index]
        const updated: Artifact = {
            ...existing,
            name: payload.name !== undefined ? payload.name : existing.name,
            type: payload.type !== undefined ? payload.type : existing.type,
            description:
                payload.description !== undefined
                    ? payload.description
                    : existing.description,
            purpose:
                payload.purpose !== undefined
                    ? payload.purpose
                    : existing.purpose,
            context:
                payload.context !== undefined
                    ? payload.context
                    : existing.context,
            authority:
                payload.authority !== undefined
                    ? payload.authority
                    : existing.authority,
            evaluationCriteria:
                payload.evaluationCriteria !== undefined
                    ? payload.evaluationCriteria
                    : existing.evaluationCriteria,
            coordinates:
                payload.coordinates !== undefined
                    ? payload.coordinates
                    : existing.coordinates,
            semanticMetadata: payload.semanticMetadata
                ? {
                      ...existing.semanticMetadata,
                      ...payload.semanticMetadata,
                  }
                : existing.semanticMetadata,
            visualProperties: payload.visualProperties
                ? {
                      ...existing.visualProperties,
                      ...payload.visualProperties,
                  }
                : existing.visualProperties,
            updatedAt: new Date(),
            version: this.incrementVersion(existing.version),
        }

        artifacts[index] = updated
        this.saveArtifacts(artifacts)

        return updated
    }

    async delete(id: string): Promise<boolean> {
        const artifacts = this.getArtifacts()
        const index = artifacts.findIndex(a => a.id === id)

        if (index === -1) {
            return false
        }

        artifacts.splice(index, 1)
        this.saveArtifacts(artifacts)

        return true
    }

    async search(query: ArtifactSearchQuery): Promise<Artifact[]> {
        const artifacts = await this.findAll()

        return artifacts.filter(artifact => {
            if (query.text) {
                const searchText = query.text.toLowerCase()
                const matchesText =
                    artifact.name.toLowerCase().includes(searchText) ||
                    artifact.description.toLowerCase().includes(searchText) ||
                    artifact.purpose.toLowerCase().includes(searchText)

                if (!matchesText) return false
            }

            if (query.type && artifact.type !== query.type) {
                return false
            }

            return true
        })
    }

    async filter(criteria: ArtifactFilter): Promise<Artifact[]> {
        const artifacts = await this.findAll()

        return artifacts.filter(artifact => {
            if (criteria.type && artifact.type !== criteria.type) return false
            if (criteria.validity === 'valid' && !artifact.isValid) return false
            if (criteria.validity === 'invalid' && artifact.isValid)
                return false
            if (
                criteria.createdAfter &&
                artifact.createdAt < criteria.createdAfter
            )
                return false
            if (
                criteria.createdBefore &&
                artifact.createdAt > criteria.createdBefore
            )
                return false

            return true
        })
    }

    async validateDataIntegrity(): Promise<boolean> {
        try {
            const artifacts = this.getArtifacts()

            // Check for duplicate IDs
            const artifactIds = artifacts.map(a => a.id)
            const uniqueIds = new Set(artifactIds)

            if (artifactIds.length !== uniqueIds.size) {
                return false
            }

            return true
        } catch {
            return false
        }
    }

    async backup(): Promise<string> {
        const artifacts = this.getArtifacts()

        const backup = {
            version: this.currentVersion,
            timestamp: new Date().toISOString(),
            artifacts,
        }

        return JSON.stringify(backup, null, 2)
    }

    async restore(backupData: string): Promise<boolean> {
        try {
            const backup = JSON.parse(backupData)

            if (!backup.artifacts) {
                throw new Error('Invalid backup format')
            }

            localStorage.setItem(
                this.ARTIFACTS_KEY,
                JSON.stringify(backup.artifacts)
            )

            return true
        } catch {
            return false
        }
    }

    // Relationship management methods
    async createRelationship(
        relationship: Omit<Relationship, 'id' | 'createdAt'>
    ): Promise<Relationship> {
        // For simplified implementation, we'll just return a mock relationship
        // In a real implementation, this would store relationships separately
        const newRelationship: Relationship = {
            ...relationship,
            id: this.generateId(),
            createdAt: new Date(),
        }
        return newRelationship
    }

    async deleteRelationship(id: string): Promise<boolean> {
        const relationships: Relationship[] = JSON.parse(
            localStorage.getItem(this.RELATIONSHIPS_KEY) || '[]'
        )
        const index = relationships.findIndex(r => r.id === id)

        if (index === -1) {
            return false
        }
        relationships.splice(index, 1)
        localStorage.setItem(
            this.RELATIONSHIPS_KEY,
            JSON.stringify(relationships)
        )
        return true
    }

    async findRelationshipsByArtifact(
        artifactId: string
    ): Promise<Relationship[]> {
        const relationships: Relationship[] = JSON.parse(
            localStorage.getItem(this.RELATIONSHIPS_KEY) || '[]'
        )
        return relationships.filter(
            r => r.sourceId === artifactId || r.targetId === artifactId
        )
    }

    // Bulk operations
    async bulkCreate(artifacts: CreateArtifactPayload[]): Promise<Artifact[]> {
        const results: Artifact[] = []
        for (const payload of artifacts) {
            try {
                const artifact = await this.create(payload)
                results.push(artifact)
            } catch {
                // Skip failed artifact creation
            }
        }
        return results
    }

    async bulkUpdate(updates: UpdateArtifactPayload[]): Promise<Artifact[]> {
        const results: Artifact[] = []
        for (const update of updates) {
            try {
                const artifact = await this.update(update.id, update)
                results.push(artifact)
            } catch {
                // Skip failed artifact update
            }
        }
        return results
    }

    async bulkDelete(ids: string[]): Promise<boolean> {
        let allSuccessful = true
        for (const id of ids) {
            try {
                const success = await this.delete(id)
                if (!success) allSuccessful = false
            } catch {
                allSuccessful = false
            }
        }
        return allSuccessful
    }

    // Temporal artifact operations
    async saveTemporalArtifact(
        temporal: TemporalArtifact
    ): Promise<TemporalArtifact> {
        try {
            const data = localStorage.getItem(this.TEMPORAL_KEY)
            const temporalArtifacts = data ? JSON.parse(data) : []

            const index = temporalArtifacts.findIndex(
                (t: TemporalArtifact) => t.temporaryId === temporal.temporaryId
            )

            if (index >= 0) {
                temporalArtifacts[index] = temporal
            } else {
                temporalArtifacts.push(temporal)
            }

            localStorage.setItem(
                this.TEMPORAL_KEY,
                JSON.stringify(temporalArtifacts)
            )
            return temporal
        } catch {
            throw new Error('Failed to save temporal artifact')
        }
    }

    async getTemporalArtifact(
        temporaryId: string
    ): Promise<TemporalArtifact | null> {
        try {
            const data = localStorage.getItem(this.TEMPORAL_KEY)
            if (!data) return null

            const temporalArtifacts = JSON.parse(data)
            return (
                temporalArtifacts.find(
                    (t: TemporalArtifact) => t.temporaryId === temporaryId
                ) || null
            )
        } catch {
            return null
        }
    }

    async deleteTemporalArtifact(temporaryId: string): Promise<boolean> {
        try {
            const data = localStorage.getItem(this.TEMPORAL_KEY)
            if (!data) return false

            const temporalArtifacts = JSON.parse(data)
            const filtered = temporalArtifacts.filter(
                (t: TemporalArtifact) => t.temporaryId !== temporaryId
            )

            localStorage.setItem(this.TEMPORAL_KEY, JSON.stringify(filtered))
            return true
        } catch {
            return false
        }
    }

    private incrementVersion(version: string): string {
        const parts = version.split('.').map(Number)
        parts[2] += 1 // Increment patch version
        return parts.join('.')
    }
}
