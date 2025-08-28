import { Plugin, EventBusProviderCapability, ArtifactRepositoryProviderCapability } from "../Plugin";
import { Result, ok } from "../../utils/Result";
import { EventBus } from "../../events/EventBus";
import { InMemoryEventBus } from "../../events/InMemoryEventBus";
import { ArtifactRepository } from "../../repository/ArtifactRepository";
import { InMemoryArtifactRepository } from "../../repository/InMemoryArtifactRepository";

export class InMemoryProvidersPlugin implements Plugin {
  id = "builtin.in-memory-providers";
  name = "In-Memory Providers";
  version = "1.0.0";

  private readonly eventBusProvider: EventBusProviderCapability = {
    type: "event-bus-provider",
    providerId: "in-memory",
    priority: 0,
    provideEventBus: async (): Promise<Result<EventBus>> => {
      return ok(new InMemoryEventBus());
    },
  };

  private readonly repositoryProvider: ArtifactRepositoryProviderCapability = {
    type: "artifact-repository-provider",
    providerId: "in-memory",
    priority: 0,
    provideArtifactRepository: async (): Promise<Result<ArtifactRepository>> => {
      return ok(new InMemoryArtifactRepository());
    },
  };

  capabilities = [this.eventBusProvider, this.repositoryProvider];

  async init(): Promise<void> {}
  async dispose(): Promise<void> {}
}

