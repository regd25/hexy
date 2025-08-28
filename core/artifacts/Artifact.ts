export type ArtifactId = string

export type LinkType = 'composition' | 'implementation' | 'measurement' | 'flow' | 'event' | 'dependency'

export interface Artifact {
    id: ArtifactId
    type: string
    name: string
    description?: string
    metadata?: Record<string, unknown>
    createdAt: string
    updatedAt: string
}

export interface Link {
    sourceId: ArtifactId
    targetId: ArtifactId
    type: LinkType
    confidence?: number
}
