import { Artifact, EventBus, Link, LinkType, Result, err, ok } from '@/shared'
import { PluginManager } from '../plugins/PluginManager'

export class SemanticEngine {
    private readonly plugins: PluginManager
    private readonly eventBus: EventBus

    constructor(plugins: PluginManager, eventBus: EventBus) {
        this.plugins = plugins
        this.eventBus = eventBus
    }

    async inferLink(a: Artifact, b: Artifact): Promise<Result<Link>> {
        const caps = this.plugins.listCapabilities('link-inference')
        if (caps.length === 0) {
            return err(new Error('No link-inference capabilities registered'))
        }
        const suggestions: Array<{ type: string; confidence: number }> = []
        for (const cap of caps) {
            const result = await cap.inferLinkType(a, b)
            if (result.ok) suggestions.push(result.value)
        }
        if (suggestions.length === 0) {
            return err(new Error('No suggestion could be produced'))
        }
        suggestions.sort((x, y) => y.confidence - x.confidence)
        const best = suggestions[0]
        const link: Link = {
            sourceId: a.id,
            targetId: b.id,
            type: best.type as LinkType,
            confidence: best.confidence,
        }
        await this.eventBus.publish({
            name: 'link.inferred',
            payload: link,
            timestamp: Date.now(),
        })
        return ok(link)
    }
}
