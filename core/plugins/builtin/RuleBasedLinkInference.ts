import { LinkTypeInferenceCapability, Plugin } from '../Plugin'
import { Artifact, SystemResult, ok } from '@/shared'

function score(text: string, pattern: RegExp): number {
    const matches = text.match(pattern)
    if (!matches) return 0
    return Math.min(1, matches.length * 0.2)
}

function inferByRules(a: Artifact, b: Artifact): { type: string; confidence: number } {
    const text = `${a.name} ${a.description ?? ''} ${b.name} ${b.description ?? ''}`
    const rules: Array<{ type: string; pattern: RegExp }> = [
        { type: 'composition', pattern: /\b(part\w* of|composed of|contains)\b/i },
        { type: 'implementation', pattern: /\b(implements?|enforces?|realizes?)\b/i },
        { type: 'measurement', pattern: /\b(measures?|kpi|indicator|monitors?)\b/i },
        { type: 'flow', pattern: /\b(next step|after|then|workflow)\b/i },
        { type: 'event', pattern: /\b(emits?|publishes?|subscribes?|trigger(?:ed)?|on\s+\w+ed)\b/i },
        { type: 'dependency', pattern: /\b(uses?|depends? on|requires?)\b/i },
    ]
    let best = { type: 'dependency', confidence: 0.3 }
    for (const r of rules) {
        const s = score(text, r.pattern)
        if (s > best.confidence) best = { type: r.type, confidence: s }
    }
    return best
}

export class RuleBasedLinkInferencePlugin implements Plugin {
    id = 'builtin.rule-link-inference'
    name = 'Rule-based Relation Inference'
    version = '1.0.0'

    private readonly capability: LinkTypeInferenceCapability = {
        type: 'link-inference',
        inferLinkType: async (a: Artifact, b: Artifact): Promise<SystemResult<{ type: string; confidence: number }>> => {
            const res = inferByRules(a, b)
            return ok(res)
        },
    }

    capabilities = [this.capability]

    async init(): Promise<void> {
        // noop
    }

    async dispose(): Promise<void> {
        // noop
    }
}
