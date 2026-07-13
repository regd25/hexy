import { Actor, Event, Intent } from './Artifact'

export type Severity = 'info' | 'warning' | 'error'

export interface Observation {
    name: string
    value: unknown
    timestamp: number
}

export interface Violation {
    code: string
    message: string
    severity: Severity
    timestamp: number
}

export interface ExecutionContext {
    id: string
    actor: Actor
    intent: Intent
    inputs: Readonly<Record<string, unknown>>
    createdAt: string
    events: ReadonlyArray<Event>
    observations: ReadonlyArray<Observation>
    violations: ReadonlyArray<Violation>
}

export function createExecutionContext(
    id: string,
    actor: Actor,
    intent: Intent,
    inputs: Record<string, unknown>
): ExecutionContext {
    return {
        id,
        actor,
        intent,
        inputs: Object.freeze({ ...inputs }),
        createdAt: new Date().toISOString(),
        events: Object.freeze([]),
        observations: Object.freeze([]),
        violations: Object.freeze([]),
    }
}

export function withEvent(context: ExecutionContext, event: Event): ExecutionContext {
    const events = Object.freeze([...context.events, event])
    return { ...context, events }
}

export function withObservation(context: ExecutionContext, observation: Observation): ExecutionContext {
    const observations = Object.freeze([...context.observations, observation])
    return { ...context, observations }
}

export function withViolation(context: ExecutionContext, violation: Violation): ExecutionContext {
    const violations = Object.freeze([...context.violations, violation])
    return { ...context, violations }
}
