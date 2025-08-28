import { Artifact, ArtifactId, Link } from '../artifacts/Artifact'
import { Result } from '../utils/Result'

export interface ArtifactRepository {
    getById(id: ArtifactId): Promise<Result<Artifact | null>>
    list(): Promise<Result<Artifact[]>>
    save(artifact: Artifact): Promise<Result<Artifact>>
    linkArtifacts(link: Link): Promise<Result<Link>>
    listLinks(): Promise<Result<Link[]>>
    removeLink(link: Link): Promise<Result<boolean>>
}
