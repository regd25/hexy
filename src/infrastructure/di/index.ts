// Core DI components
export * from './container'
export * from './token'
export * from './scope'
export * from './module-class'
export * from './application'

// Decorators
export * from './injectable'
export * from './inject'
export * from './module'

// Errors
export * from './resolve-error'

// Lifecycle hooks
export * from './lifecycle'

// Export a default container instance for convenience
import { Container } from './container'
export const container = new Container()
