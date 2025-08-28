import { EventBus } from '../events/EventBus'
import { Artifact } from '../artifacts/Artifact'
import { ExecutionContext } from '../execution/ExecutionContext'
import { Result } from '../utils/Result'
import { ArtifactRepository } from '../repository/ArtifactRepository'

export type Capabilitytype =
    | 'executor'
    | 'validator'
    | 'connector'
    | 'observer'
    | 'link-inference'
    | 'event-bus-provider'
    | 'artifact-repository-provider'

export interface BaseCapability {
    type: Capabilitytype
}

export interface ExecutorCapability extends BaseCapability {
    type: 'executor'
    execute(action: string, params: Record<string, unknown>, context: ExecutionContext): Promise<Result<unknown>>
}

export interface ValidatorCapability extends BaseCapability {
    type: 'validator'
    validate(context: ExecutionContext): Promise<Result<void>>
}

export interface ConnectorCapability extends BaseCapability {
    type: 'connector'
    connect(resource: string, options?: Record<string, unknown>): Promise<Result<unknown>>
}

export interface ObserverCapability extends BaseCapability {
    type: 'observer'
    subscribe(event: string, handler: (payload: unknown) => void): void
}

export interface LinkTypeInferenceCapability extends BaseCapability {
    type: 'link-inference'
    inferLinkType(
        a: Artifact,
        b: Artifact,
        context?: ExecutionContext
    ): Promise<Result<{ type: string; confidence: number }>>
}

export interface EventBusProviderCapability extends BaseCapability {
    type: 'event-bus-provider'
    providerId: string
    priority?: number
    provideEventBus(config?: Record<string, unknown>): Promise<Result<EventBus>>
}

export interface ArtifactRepositoryProviderCapability extends BaseCapability {
    type: 'artifact-repository-provider'
    providerId: string
    priority?: number
    provideArtifactRepository(config?: Record<string, unknown>): Promise<Result<ArtifactRepository>>
}

export type Capability =
    | ExecutorCapability
    | ValidatorCapability
    | ConnectorCapability
    | ObserverCapability
    | LinkTypeInferenceCapability
    | EventBusProviderCapability
    | ArtifactRepositoryProviderCapability

export interface PluginInitDeps {
    eventBus: EventBus
    config?: Record<string, unknown>
}

export interface Plugin {
    id: string
    name: string
    version: string
    capabilities: Capability[]
    init(deps: PluginInitDeps): Promise<void> | void
    dispose(): Promise<void> | void
}
