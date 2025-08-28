import { Artifact, ArtifactId, Link, Result } from '@/shared'
import { ArtifactRepository } from './ArtifactRepository'

export class InMemoryArtifactRepository implements ArtifactRepository {
    private readonly artifacts: Map<ArtifactId, Artifact> = new Map()
    private readonly links: Link[] = []

    async getById(id: ArtifactId): Promise<Result<Artifact | null>> {
        const found = this.artifacts.get(id) ?? null
        return Result.ok(found)
    }

    async list(): Promise<Result<Artifact[]>> {
        return Result.ok(Array.from(this.artifacts.values()))
    }

    async save(artifact: Artifact): Promise<Result<Artifact>> {
        const now = new Date().toISOString()
        const existing = this.artifacts.get(artifact.id)
        const toSave: Artifact = existing
            ? { ...existing, ...artifact, updatedAt: now }
            : { ...artifact, createdAt: artifact.createdAt ?? now, updatedAt: now }
        this.artifacts.set(toSave.id, toSave)
        return Result.ok(toSave)
    }

    async linkArtifacts(link: Link): Promise<Result<Link>> {
        const { sourceId, targetId } = link
        if (sourceId === targetId) {
            return Result.err(new Error('Cannot link an artifact to itself'))
        }
        const source = this.artifacts.get(sourceId)
        const target = this.artifacts.get(targetId)
        if (!source || !target) {
            return Result.err(new Error('Both artifacts must exist to create a link'))
        }
        const exists = this.links.some(l => l.sourceId === sourceId && l.targetId === targetId && l.type === link.type)
        if (!exists) this.links.push({ ...link })
        return Result.ok(link)
    }

    async listLinks(): Promise<Result<Link[]>> {
        return Result.ok([...this.links])
    }

    async removeLink(link: Link): Promise<Result<boolean>> {
        const before = this.links.length
        const remaining = this.links.filter(
            l => !(l.sourceId === link.sourceId && l.targetId === link.targetId && l.type === link.type)
        )
        this.links.length = 0
        for (const l of remaining) this.links.push(l)
        return Result.ok(remaining.length < before)
    }
}
