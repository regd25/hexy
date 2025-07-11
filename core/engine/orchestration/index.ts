/**
 * Orchestration Module Index
 * Exports all orchestration strategies and related components
 */

import { DeterministicOrchestrationStrategy } from "./DeterministicOrchestrationStrategy"
import { ConcreteOrchestrationStrategyRegistry } from "./OrchestrationStrategyRegistry"

// Strategy implementations
export { DeterministicOrchestrationStrategy } from "./DeterministicOrchestrationStrategy"

// Registry implementation
export { ConcreteOrchestrationStrategyRegistry } from "./OrchestrationStrategyRegistry"

// Types (re-exported for convenience)
export type {
  OrchestrationStrategy,
  OrchestrationStrategyRegistry,
  OrchestrationMetrics,
} from "../../types/OrchestrationStrategy"

// Factory for creating pre-configured registry with default strategies
export function createDefaultOrchestrationRegistry(): ConcreteOrchestrationStrategyRegistry {
  const registry = new ConcreteOrchestrationStrategyRegistry()

  // Register default strategies
  registry.register(new DeterministicOrchestrationStrategy())

  return registry
}

// Convenience function to get strategy recommendations
export function getStrategyRecommendations(
  registry: ConcreteOrchestrationStrategyRegistry,
  decision: any,
  context: any
) {
  return registry.getStrategyRecommendations(decision, context)
}
