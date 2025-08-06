/**
 * ArtifactService - Simplified service with direct EventBus integration
 * Following DRY principles - no duplicate event systems
 */

import { EventBus } from '@/shared'
import {
    Artifact,
    TemporalArtifact,
    Relationship,
    CreateArtifactPayload,
    UpdateArtifactPayload,
    ArtifactSearchQuery,
    ArtifactFilter,
    createDefaultVisualizationProperties,
    createDefaultSemanticMetadata,
} from '../types'
import {
    IArtifactRepository,
    LocalStorageArtifactRepository,
} from './ArtifactRepository'

/**
 * Simplified artifact service with direct EventBus integration
 * Following DRY principles - no duplicate event systems
 */
export class ArtifactService {
    private repository: IArtifactRepository
    private eventBus: EventBus

    constructor(eventBus: EventBus, repository?: IArtifactRepository) {
        this.eventBus = eventBus
        this.repository = repository || new LocalStorageArtifactRepository()
    }

    /**
     * Create a new artifact with semantic defaults
     */
    async createArtifact(payload: CreateArtifactPayload): Promise<Artifact> {
        try {
            // Enhance payload with semantic defaults
            const enhancedPayload: CreateArtifactPayload = {
                ...payload,
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
            }

            const artifact = await this.repository.create(enhancedPayload)

            // ✅ Single event emission - no duplication
            this.eventBus.publish('artifact:created', {
                source: 'artifacts-module',
                artifact,
                timestamp: Date.now(),
            })

            return artifact
        } catch (error) {
            console.error('Error creating artifact:', error)
            throw new Error(
                `Failed to create artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Update an existing artifact
     */
    async updateArtifact(
        id: string,
        payload: UpdateArtifactPayload
    ): Promise<Artifact> {
        try {
            const previous = await this.repository.findById(id)
            if (!previous) {
                throw new Error(`Artifact with id ${id} not found`)
            }

            const updated = await this.repository.update(id, payload)

            // ✅ Single event emission - no duplication
            this.eventBus.publish('artifact:updated', {
                source: 'artifacts-module',
                artifact: updated,
                previous,
                timestamp: Date.now(),
            })

            return updated
        } catch (error) {
            console.error('Error updating artifact:', error)
            throw new Error(
                `Failed to update artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Delete an artifact and its relationships
     */
    async deleteArtifact(id: string): Promise<boolean> {
        try {
            const success = await this.repository.delete(id)

            if (success) {
                // ✅ Single event emission - no duplication
                this.eventBus.publish('artifact:deleted', {
                    source: 'artifacts-module',
                    id,
                    timestamp: Date.now(),
                })
            }

            return success
        } catch (error) {
            console.error('Error deleting artifact:', error)
            throw new Error(
                `Failed to delete artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Get artifact by ID
     */
    async getArtifact(id: string): Promise<Artifact | null> {
        try {
            return await this.repository.findById(id)
        } catch (error) {
            console.error('Error getting artifact:', error)
            return null
        }
    }

    /**
     * Get all artifacts
     */
    async getAllArtifacts(): Promise<Artifact[]> {
        try {
            return await this.repository.findAll()
        } catch (error) {
            console.error('Error getting all artifacts:', error)
            return []
        }
    }

    /**
     * Search artifacts with semantic capabilities
     */
    async searchArtifacts(query: ArtifactSearchQuery): Promise<Artifact[]> {
        try {
            return await this.repository.search(query)
        } catch (error) {
            console.error('Error searching artifacts:', error)
            return []
        }
    }

    /**
     * Filter artifacts by criteria
     */
    async filterArtifacts(criteria: ArtifactFilter): Promise<Artifact[]> {
        try {
            return await this.repository.filter(criteria)
        } catch (error) {
            console.error('Error filtering artifacts:', error)
            return []
        }
    }

    /**
     * Create a relationship between artifacts
     */
    async createRelationship(
        relationship: Omit<Relationship, 'id' | 'createdAt'>
    ): Promise<Relationship> {
        try {
            // Validate that both artifacts exist
            const source = await this.repository.findById(relationship.sourceId)
            const target = await this.repository.findById(relationship.targetId)

            if (!source) {
                throw new Error(
                    `Source artifact ${relationship.sourceId} not found`
                )
            }
            if (!target) {
                throw new Error(
                    `Target artifact ${relationship.targetId} not found`
                )
            }

            const created =
                await this.repository.createRelationship(relationship)

            // ✅ Single event emission - no duplication
            this.eventBus.publish('relationship:created', {
                source: 'artifacts-module',
                relationship: created,
                timestamp: Date.now(),
            })

            return created
        } catch (error) {
            console.error('Error creating relationship:', error)
            throw new Error(
                `Failed to create relationship: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Delete a relationship
     */
    async deleteRelationship(id: string): Promise<boolean> {
        try {
            const success = await this.repository.deleteRelationship(id)

            if (success) {
                // ✅ Single event emission - no duplication
                this.eventBus.publish('relationship:deleted', {
                    source: 'artifacts-module',
                    id,
                    timestamp: Date.now(),
                })
            }

            return success
        } catch (error) {
            console.error('Error deleting relationship:', error)
            throw new Error(
                `Failed to delete relationship: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Get relationships for an artifact
     */
    async getArtifactRelationships(
        artifactId: string
    ): Promise<Relationship[]> {
        try {
            return await this.repository.findRelationshipsByArtifact(artifactId)
        } catch (error) {
            console.error('Error getting artifact relationships:', error)
            return []
        }
    }

    /**
     * Create a temporal artifact for drafting
     */
    async createTemporalArtifact(
        payload: Partial<CreateArtifactPayload>
    ): Promise<TemporalArtifact> {
        try {
            const temporaryId = crypto.randomUUID()

            const temporal: TemporalArtifact = {
                temporaryId,
                name: payload.name || '',
                type: payload.type || 'purpose',
                description: payload.description || '',
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
                        payload.type || 'purpose',
                        payload.coordinates?.x || 0,
                        payload.coordinates?.y || 0
                    ),
                    ...payload.visualProperties,
                },
                coordinates: payload.coordinates || { x: 0, y: 0 },
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
                visualState: {
                    opacity: 0.6,
                    scale: 0.8,
                    color: '#94A3B8',
                    pulseAnimation: true,
                },
                guidanceState: {
                    showPurposeHelp: false,
                    showContextHelp: false,
                    showAuthorityHelp: false,
                    showEvaluationHelp: false,
                },
            }

            const saved = await this.repository.saveTemporalArtifact(temporal)

            // ✅ Single event emission - no duplication
            this.eventBus.publish('temporal:created', {
                source: 'artifacts-module',
                temporal: saved,
                timestamp: Date.now(),
            })

            return saved
        } catch (error) {
            console.error('Error creating temporal artifact:', error)
            throw new Error(
                `Failed to create temporal artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Update a temporal artifact
     */
    async updateTemporalArtifact(
        temporaryId: string,
        updates: Partial<TemporalArtifact>
    ): Promise<TemporalArtifact> {
        try {
            const existing =
                await this.repository.getTemporalArtifact(temporaryId)
            if (!existing) {
                throw new Error(`Temporal artifact ${temporaryId} not found`)
            }

            const updated: TemporalArtifact = {
                ...existing,
                ...updates,
                temporaryId: existing.temporaryId, // Ensure ID cannot be changed
            }

            const saved = await this.repository.saveTemporalArtifact(updated)

            // ✅ Single event emission - no duplication
            this.eventBus.publish('temporal:updated', {
                source: 'artifacts-module',
                temporal: saved,
                timestamp: Date.now(),
            })

            return saved
        } catch (error) {
            console.error('Error updating temporal artifact:', error)
            throw new Error(
                `Failed to update temporal artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Promote temporal artifact to permanent artifact
     */
    async promoteTemporalArtifact(temporaryId: string): Promise<Artifact> {
        try {
            const temporal =
                await this.repository.getTemporalArtifact(temporaryId)
            if (!temporal) {
                throw new Error(`Temporal artifact ${temporaryId} not found`)
            }

            // Create permanent artifact from temporal
            const payload: CreateArtifactPayload = {
                name: temporal.name,
                type: temporal.type,
                description: temporal.description,
                purpose: temporal.purpose,
                context: temporal.context,
                authority: temporal.authority,
                evaluationCriteria: temporal.evaluationCriteria,
                coordinates: temporal.coordinates,
                semanticMetadata: temporal.semanticMetadata,
                visualProperties: {
                    ...temporal.visualProperties,
                    opacity: 1.0,
                    scale: 1.0,
                },
            }

            const artifact = await this.createArtifact(payload)

            // Delete temporal artifact
            await this.repository.deleteTemporalArtifact(temporaryId)

            // ✅ Single event emission - no duplication
            this.eventBus.publish('temporal:promoted', {
                source: 'artifacts-module',
                artifact,
                temporalId: temporaryId,
                timestamp: Date.now(),
            })

            return artifact
        } catch (error) {
            console.error('Error promoting temporal artifact:', error)
            throw new Error(
                `Failed to promote temporal artifact: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Delete a temporal artifact
     */
    async deleteTemporalArtifact(temporaryId: string): Promise<boolean> {
        try {
            const success =
                await this.repository.deleteTemporalArtifact(temporaryId)

            if (success) {
                // ✅ Single event emission - no duplication
                this.eventBus.publish('temporal:deleted', {
                    source: 'artifacts-module',
                    temporalId: temporaryId,
                    timestamp: Date.now(),
                })
            }

            return success
        } catch (error) {
            console.error('Error deleting temporal artifact:', error)
            return false
        }
    }

    /**
     * Get temporal artifact by ID
     */
    async getTemporalArtifact(
        temporaryId: string
    ): Promise<TemporalArtifact | null> {
        try {
            return await this.repository.getTemporalArtifact(temporaryId)
        } catch (error) {
            console.error('Error getting temporal artifact:', error)
            return null
        }
    }

    /**
     * Bulk operations
     */
    async bulkCreateArtifacts(
        payloads: CreateArtifactPayload[]
    ): Promise<Artifact[]> {
        try {
            return await this.repository.bulkCreate(payloads)
        } catch (error) {
            console.error('Error in bulk create:', error)
            return []
        }
    }

    async bulkUpdateArtifacts(
        updates: UpdateArtifactPayload[]
    ): Promise<Artifact[]> {
        try {
            return await this.repository.bulkUpdate(updates)
        } catch (error) {
            console.error('Error in bulk update:', error)
            return []
        }
    }

    async bulkDeleteArtifacts(ids: string[]): Promise<boolean> {
        try {
            return await this.repository.bulkDelete(ids)
        } catch (error) {
            console.error('Error in bulk delete:', error)
            return false
        }
    }

    /**
     * Data integrity and backup operations
     */
    async validateDataIntegrity(): Promise<boolean> {
        try {
            return await this.repository.validateDataIntegrity()
        } catch (error) {
            console.error('Error validating data integrity:', error)
            return false
        }
    }

    async exportData(): Promise<string> {
        try {
            return await this.repository.backup()
        } catch (error) {
            console.error('Error exporting data:', error)
            throw new Error(
                `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    async importData(data: string): Promise<boolean> {
        try {
            return await this.repository.restore(data)
        } catch (error) {
            console.error('Error importing data:', error)
            return false
        }
    }

    /**
     * Direct EventBus subscription methods (simplified)
     */
    subscribeToEvent(
        event: string,
        handler: (data: unknown) => void
    ): () => void {
        return this.eventBus.subscribe(event, handler)
    }

    /**
     * Get service statistics
     */
    async getStatistics(): Promise<{
        totalArtifacts: number
        totalRelationships: number
        artifactsByType: Record<string, number>
        averageBusinessValue: number
        validationStatus: { valid: number; invalid: number }
    }> {
        try {
            const artifacts = await this.getAllArtifacts()
            const relationships = await Promise.all(
                artifacts.map(a => this.getArtifactRelationships(a.id))
            )
            const totalRelationships = relationships.flat().length

            const artifactsByType = artifacts.reduce(
                (acc, artifact) => {
                    acc[artifact.type] = (acc[artifact.type] || 0) + 1
                    return acc
                },
                {} as Record<string, number>
            )

            const averageBusinessValue =
                artifacts.length > 0
                    ? artifacts.reduce(
                          (sum, a) => sum + a.semanticMetadata.businessValue,
                          0
                      ) / artifacts.length
                    : 0

            const validationStatus = artifacts.reduce(
                (acc, artifact) => {
                    if (artifact.isValid) {
                        acc.valid++
                    } else {
                        acc.invalid++
                    }
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
        } catch (error) {
            console.error('Error getting statistics:', error)
            return {
                totalArtifacts: 0,
                totalRelationships: 0,
                artifactsByType: {},
                averageBusinessValue: 0,
                validationStatus: { valid: 0, invalid: 0 },
            }
        }
    }
}
