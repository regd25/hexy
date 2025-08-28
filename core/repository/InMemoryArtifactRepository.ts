import { Artifact, ArtifactId, Link } from "../artifacts/Artifact";
import { ArtifactRepository } from "./ArtifactRepository";
import { Result, err, ok } from "../utils/Result";

export class InMemoryArtifactRepository implements ArtifactRepository {
  private readonly artifacts: Map<ArtifactId, Artifact> = new Map();
  private readonly links: Link[] = [];

  async getById(id: ArtifactId): Promise<Result<Artifact | null>> {
    const found = this.artifacts.get(id) ?? null;
    return ok(found);
  }

  async list(): Promise<Result<Artifact[]>> {
    return ok(Array.from(this.artifacts.values()));
  }

  async save(artifact: Artifact): Promise<Result<Artifact>> {
    const now = new Date().toISOString();
    const existing = this.artifacts.get(artifact.id);
    const toSave: Artifact = existing
      ? { ...existing, ...artifact, updatedAt: now }
      : { ...artifact, createdAt: artifact.createdAt ?? now, updatedAt: now };
    this.artifacts.set(toSave.id, toSave);
    return ok(toSave);
  }

  async linkArtifacts(link: Link): Promise<Result<Link>> {
    const { sourceId, targetId } = link;
    if (sourceId === targetId) {
      return err(new Error("Cannot link an artifact to itself"));
    }
    const source = this.artifacts.get(sourceId);
    const target = this.artifacts.get(targetId);
    if (!source || !target) {
      return err(new Error("Both artifacts must exist to create a link"));
    }
    const exists = this.links.some(
      l => l.sourceId === sourceId && l.targetId === targetId && l.type === link.type
    );
    if (!exists) this.links.push({ ...link });
    return ok(link);
  }

  async listLinks(): Promise<Result<Link[]>> {
    return ok([...this.links]);
  }

  async removeLink(link: Link): Promise<Result<boolean>> {
    const before = this.links.length;
    const remaining = this.links.filter(
      l => !(l.sourceId === link.sourceId && l.targetId === link.targetId && l.type === link.type)
    );
    this.links.length = 0;
    for (const l of remaining) this.links.push(l);
    return ok(remaining.length < before);
  }
}

