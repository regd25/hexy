import { PluginManager } from '../plugins/PluginManager'
import { ArtifactRepositoryProviderCapability, EventBusProviderCapability, Plugin } from '../plugins/Plugin'
import { EventBus, InMemoryEventBus } from '@/shared'
import { ArtifactRepository } from '../../shared/repository/ArtifactRepository'
import { InMemoryArtifactRepository } from '../../shared/repository/InMemoryArtifactRepository'

export interface CoreRuntimeConfig {
    eventBusProviderId?: string
    artifactRepositoryProviderId?: string
    eventBusConfig?: Record<string, unknown>
    repositoryConfig?: Record<string, unknown>
}

export class CoreRuntime {
    private readonly pluginManager: PluginManager
    private eventBus: EventBus | null = null
    private repository: ArtifactRepository | null = null

    constructor(pluginManager?: PluginManager) {
        this.pluginManager = pluginManager ?? new PluginManager()
    }

    get plugins(): Plugin[] {
        return this.pluginManager.listPlugins()
    }

    getEventBus(): EventBus {
        if (!this.eventBus) this.eventBus = new InMemoryEventBus()
        return this.eventBus
    }

    getRepository(): ArtifactRepository {
        if (!this.repository) this.repository = new InMemoryArtifactRepository()
        return this.repository
    }

    async initialize(config?: CoreRuntimeConfig): Promise<void> {
        const eventBus = await this.selectEventBus(config)
        const repository = await this.selectArtifactRepository(config)
        this.eventBus = eventBus ?? new InMemoryEventBus()
        this.repository = repository ?? new InMemoryArtifactRepository()

        for (const plugin of this.pluginManager.listPlugins()) {
            await plugin.init({ eventBus: this.eventBus, config: {} })
        }
    }

    private async selectEventBus(config?: CoreRuntimeConfig): Promise<EventBus | null> {
        const providerCaps = this.pluginManager.listCapabilities('event-bus-provider') as EventBusProviderCapability[]
        const sorted = providerCaps.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
        const matchId = config?.eventBusProviderId
        for (const cap of sorted) {
            if (!matchId || cap.providerId === matchId) {
                const res = await cap.provideEventBus(config?.eventBusConfig)
                if (res.ok) return res.value
            }
        }
        return null
    }

    private async selectArtifactRepository(config?: CoreRuntimeConfig): Promise<ArtifactRepository | null> {
        const providerCaps = this.pluginManager.listCapabilities(
            'artifact-repository-provider'
        ) as ArtifactRepositoryProviderCapability[]
        const sorted = providerCaps.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
        const matchId = config?.artifactRepositoryProviderId
        for (const cap of sorted) {
            if (!matchId || cap.providerId === matchId) {
                const res = await cap.provideArtifactRepository(config?.repositoryConfig)
                if (res.ok) return res.value
            }
        }
        return null
    }
}
