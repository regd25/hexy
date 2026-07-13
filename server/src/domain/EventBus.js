/**
 * EventBus en memoria (server-side). El dashboard usaba un bus para coordinar la UI; aquí
 * sirve para notificar a suscriptores internos (p.ej. un futuro stream SSE en /api/events).
 * El frontend vanilla re-fetchea tras cada mutación, así que no es crítico para la UI.
 */
export class InMemoryEventBus {
    constructor() {
        this.handlers = new Map()
    }

    subscribe(event, handler) {
        if (!this.handlers.has(event)) this.handlers.set(event, new Set())
        this.handlers.get(event).add(handler)
        return () => this.handlers.get(event)?.delete(handler)
    }

    publish(event, payload) {
        for (const handler of this.handlers.get(event) ?? []) {
            try {
                handler(payload)
            } catch (err) {
                console.error(`[eventbus] handler for "${event}" failed:`, err)
            }
        }
    }
}

/** Bus no-op para cuando no se necesita reactividad (tests, etc.). */
export const noopEventBus = { subscribe: () => () => {}, publish: () => {} }
