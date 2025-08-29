import {
    Artifact,
    ArtifactFilter,
    ArtifactSearchQuery,
    CreateArtifactPayload,
    Relation,
    UpdateArtifactPayload,
} from '@/shared'

export interface ArtifactRepository {
    create(payload: CreateArtifactPayload): Promise<Artifact>
    findById(id: string): Promise<Artifact | null>
    findAll(): Promise<Artifact[]>
    update(id: string, payload: UpdateArtifactPayload): Promise<Artifact>
    delete(id: string): Promise<boolean>
    search(query: ArtifactSearchQuery): Promise<Artifact[]>
    filter(criteria: ArtifactFilter): Promise<Artifact[]>
    validateDataIntegrity(): Promise<boolean>
    backup(): Promise<string>
    restore(backupData: string): Promise<boolean>
    createRelation(relationship: Omit<Relation, 'id' | 'createdAt'>): Promise<Relation>
    deleteRelation(id: string): Promise<boolean>
    findRelationsByArtifact(artifactId: string): Promise<Relation[]>
    bulkCreate(artifacts: CreateArtifactPayload[]): Promise<Artifact[]>
    bulkUpdate(updates: UpdateArtifactPayload[]): Promise<Artifact[]>
    bulkDelete(ids: string[]): Promise<boolean>
}
