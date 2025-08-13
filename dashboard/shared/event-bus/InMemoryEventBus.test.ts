import { describe, it, expect, vi } from 'vitest'
import { InMemoryEventBus } from '.'

describe('InMemoryEventBus', () => {
    it('should deliver published events to subscribers', () => {
        const bus = new InMemoryEventBus()
        const handler = vi.fn()

        const unsubscribe = bus.subscribe('artifact:created', handler)

        const payload = { id: 'A-1', name: 'Test' }
        bus.publish('artifact:created', payload)

        expect(handler).toHaveBeenCalledTimes(1)
        const callArg = handler.mock.calls[0][0]
        expect(callArg.event).toBe('artifact:created')
        expect(callArg.data).toEqual(payload)
        expect(callArg.source).toBe('in-memory')
        expect(typeof callArg.timestamp).toBe('number')

        unsubscribe()
    })

    it('should not throw when publishing to an event without subscribers', () => {
        const bus = new InMemoryEventBus()
        expect(() => bus.publish('no:listeners', { ok: true })).not.toThrow()
    })
})
