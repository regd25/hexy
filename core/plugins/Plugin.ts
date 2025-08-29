import { Artifact, ArtifactRepository, EventBus, ExecutionContext, SystemResult } from '@/shared'

export type Capabilitytype =
    | 'executor'
    | 'validator'
    | 'connector'
    | 'observer'
    | 'relation-inference'
    | 'event-bus-provider'
    | 'artifact-repository-provider'

export interface BaseCapability {
    type: Capabilitytype
}

export interface ExecutorCapability extends BaseCapability {
    type: 'executor'
    execute(action: string, params: Record<string, unknown>, context: ExecutionContext): Promise<SystemResult<unknown>>
}

export interface ValidatorCapability extends BaseCapability {
    type: 'validator'
    validate(context: ExecutionContext): Promise<SystemResult<void>>
}

export interface ConnectorCapability extends BaseCapability {
    type: 'connector'
    connect(resource: string, options?: Record<string, unknown>): Promise<SystemResult<unknown>>
}

export interface ObserverCapability extends BaseCapability {
    type: 'observer'
    subscribe(event: string, handler: (payload: unknown) => void): void
}

export interface RelationTypeInferenceCapability extends BaseCapability {
    type: 'relation-inference'
    inferRelationType(
        a: Artifact,
        b: Artifact,
        context?: ExecutionContext
    ): Promise<SystemResult<{ type: string; confidence: number, weight: number, semanticStrength: number }>>
}

export interface EventBusProviderCapability extends BaseCapability {
    type: 'event-bus-provider'
    providerId: string
    priority?: number
    provideEventBus(config?: Record<string, unknown>): Promise<SystemResult<EventBus>>
}

export interface ArtifactRepositoryProviderCapability extends BaseCapability {
    type: 'artifact-repository-provider'
    providerId: string
    priority?: number
    provideArtifactRepository(config?: Record<string, unknown>): Promise<SystemResult<ArtifactRepository>>
}

export type Capability =
    | ExecutorCapability
    | ValidatorCapability
    | ConnectorCapability
    | ObserverCapability
    | RelationTypeInferenceCapability
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
