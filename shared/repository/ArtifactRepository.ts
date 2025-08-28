import { Artifact, ArtifactId, Link, Result } from '@/shared'

export interface ArtifactRepository {
    getById(id: ArtifactId): Promise<Result<Artifact | null>>
    list(): Promise<Result<Artifact[]>>
    save(artifact: Artifact): Promise<Result<Artifact>>
    linkArtifacts(link: Link): Promise<Result<Link>>
    listLinks(): Promise<Result<Link[]>>
    removeLink(link: Link): Promise<Result<boolean>>
}
