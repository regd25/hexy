import { Artifact, EventBus, Relation, RelationType, SystemResult, err, ok } from '@/shared'
import { PluginManager } from '../plugins/PluginManager'

export class SemanticEngine {
    private readonly plugins: PluginManager
    private readonly eventBus: EventBus

    constructor(plugins: PluginManager, eventBus: EventBus) {
        this.plugins = plugins
        this.eventBus = eventBus
    }

    async inferRelation(a: Artifact, b: Artifact): Promise<SystemResult<Relation>> {
        const caps = this.plugins.listCapabilities('relation-inference')
        if (caps.length === 0) {
            return err(new Error('No relation-inference capabilities registered'))
        }
        const suggestions: Array<{ type: string; confidence: number; weight: number; semanticStrength: number }> = []
        for (const cap of caps) {
            const result = await cap.inferRelationType(a, b)
            if (result.ok && result.value) suggestions.push(result.value)
        }
        if (suggestions.length === 0) {
            return err(new Error('No suggestion could be produced'))
        }
        suggestions.sort((x, y) => y.confidence - x.confidence)
        const best = suggestions[0]
        const relation: Relation = {
            sourceId: a.id,
            targetId: b.id,
            type: best.type as RelationType,
            confidence: best.confidence,
            weight: best.weight,
            semanticStrength: best.semanticStrength,
            metadata: {},
            createdAt: new Date().toISOString(),
            validationStatus: 'valid',
        }
        await this.eventBus.publish({
            name: 'relation.inferred',
            payload: relation,
            timestamp: Date.now(),
        })
        return ok(relation)
    }
}
