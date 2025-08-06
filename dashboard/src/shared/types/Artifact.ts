export interface Artifact {
    id: string
    name: string
    type: ArtifactType
    info: string
    description: string
    x: number
    y: number
    vx: number
    vy: number
    fx: number | null
    fy: number | null
}

export interface TemporalArtifact extends Omit<Artifact, 'id'> {
    id: string
    isTemporary: true
    createdAt: number
    status: 'creating' | 'editing' | 'saving' | 'error'
    validationErrors?: string[]
}

export type ArtifactType =
    | 'purpose'
    | 'vision'
    | 'policy'
    | 'principle'
    | 'guideline'
    | 'context'
    | 'actor'
    | 'concept'
    | 'process'
    | 'procedure'
    | 'event'
    | 'result'
    | 'observation'
    | 'evaluation'
    | 'indicator'
    | 'area'
    | 'authority'
    | 'reference'

export interface Link {
    source: Artifact
    target: Artifact
    weight: number
    id: string
}

export interface ArtifactReference {
    id: string
    name: string
    type: ArtifactType
}

export interface ArtifactData {
    id: string
    name: string
    type: ArtifactType
    description: string
}

export interface ArtifactStore {
    artifacts: Artifact[]
    selectedArtifact: Artifact | null
    addArtifact: (artifact: Artifact) => void
    updateArtifact: (id: string, updates: Partial<Artifact>) => void
    deleteArtifact: (id: string) => void
    selectArtifact: (artifact: Artifact | null) => void
    filterArtifacts: (query: string) => Artifact[]
}
