// Core DI components
export * from './container'
export * from './token'
export * from './scope'
export * from './module'
export * from './application'

// Decorators
export * from './injectable'
export * from './inject'
export * from './module-decorator'

// Errors
export * from './resolve-error'
export * from './service-not-found-error'
export * from './repository-not-found-error'

// Layer-specific decorators for hexagonal architecture
export * from './layers'

// Export a default container instance for convenience
import { Container } from './container'
export const container = new Container()
