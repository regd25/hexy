import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Simple test utilities - just wraps Vitest with module context
export interface TestContext {
    services: Record<string, any>
    data: Record<string, any>
}

export class SimpleTestSuite {
    private context: TestContext = { services: {}, data: {} }

    constructor(
        private moduleName: string,
        services: Record<string, () => any> = {}
    ) {
        // Initialize services
        Object.entries(services).forEach(([key, factory]) => {
            this.context.services[key] = factory()
        })
    }

    // Simple test method - just use Vitest directly
    test(name: string, testFn: (ctx: TestContext) => void | Promise<void>) {
        it(name, async () => {
            await testFn(this.context)
        })
        return this
    }

    // Group tests
    group(name: string, setupFn: (suite: SimpleTestSuite) => void) {
        describe(`${this.moduleName} - ${name}`, () => {
            beforeEach(() => {
                this.context.data = {} // Reset data
            })

            setupFn(this)
        })
        return this
    }

    // Store/retrieve test data
    set(key: string, value: any) {
        this.context.data[key] = value
    }

    get(key: string) {
        return this.context.data[key]
    }
}

// Factory function
export function createTestSuite(
    moduleName: string, 
    services: Record<string, () => any> = {}
): SimpleTestSuite {
    return new SimpleTestSuite(moduleName, services)
}

// Quick test helpers
export const assert = expect
export const should = expect 