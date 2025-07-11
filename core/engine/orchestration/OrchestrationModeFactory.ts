/**
 * Orchestration Mode Factory
 * Legacy factory for orchestration modes, now wraps the new strategy system
 */

import { SemanticDecision } from "../../types/SemanticDecision"
import { ExecutionContext } from "../../context/ExecutionContext"
import { ExecutionResult } from "../../types/Result"
import { OrchestrationMode } from "../../types/OrchestrationMode"
import { ConcreteOrchestrationStrategyRegistry } from "./OrchestrationStrategyRegistry"
import { createDefaultOrchestrationRegistry } from "./index"

export interface OrchestrationModeConfigs {
  deterministic?: {
    timeout: number
    retryPolicy: {
      maxRetries: number
      backoffDelay: number
    }
  }
  reactive?: {
    eventThreshold: number
    responseTime: number
  }
}

export class OrchestrationModeFactory {
  private strategyRegistry: ConcreteOrchestrationStrategyRegistry
  private config: OrchestrationModeConfigs

  constructor(config: OrchestrationModeConfigs = {}) {
    this.config = config
    this.strategyRegistry = createDefaultOrchestrationRegistry()
  }

  /**
   * Determine the optimal orchestration mode for a decision
   */
  determineOptimalMode(
    decision: SemanticDecision,
    context: ExecutionContext
  ): OrchestrationMode {
    const strategy = this.strategyRegistry.findBestStrategy(decision, context)

    if (!strategy) {
      return OrchestrationMode.ORCHESTRATOR // Default fallback
    }

    // Map strategy names to orchestration modes
    switch (strategy.name) {
      case "deterministic":
        return OrchestrationMode.ORCHESTRATOR
      case "reactive":
        return OrchestrationMode.REACTIVE
      default:
        return OrchestrationMode.ORCHESTRATOR
    }
  }

  /**
   * Execute using the specified orchestration mode
   */
  async execute(
    mode: OrchestrationMode,
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Find strategy based on mode
    let strategyName: string

    switch (mode) {
      case OrchestrationMode.ORCHESTRATOR:
        strategyName = "deterministic"
        break
      case OrchestrationMode.REACTIVE:
        strategyName = "reactive"
        break
      default:
        strategyName = "deterministic"
    }

    const strategy = this.strategyRegistry.get(strategyName)

    if (!strategy) {
      throw new Error(`No strategy found for mode: ${mode}`)
    }

    const startTime = Date.now()
    const result = await strategy.execute(decision, context)
    const executionTime = Date.now() - startTime

    // Update metrics
    this.strategyRegistry.updateMetrics(
      strategyName,
      executionTime,
      result.success
    )

    return result
  }

  /**
   * Get orchestration recommendations
   */
  getOrchestrationRecommendations(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Array<{
    mode: OrchestrationMode
    reasoning: string[]
    score: number
  }> {
    const recommendations = this.strategyRegistry.getStrategyRecommendations(
      decision,
      context
    )

    return recommendations.map((rec) => ({
      mode: this.mapStrategyToMode(rec.strategy.name),
      reasoning: rec.reasoning,
      score: rec.score,
    }))
  }

  /**
   * Get the strategy registry for advanced operations
   */
  getStrategyRegistry(): ConcreteOrchestrationStrategyRegistry {
    return this.strategyRegistry
  }

  private mapStrategyToMode(strategyName: string): OrchestrationMode {
    switch (strategyName) {
      case "deterministic":
        return OrchestrationMode.ORCHESTRATOR
      case "reactive":
        return OrchestrationMode.REACTIVE
      default:
        return OrchestrationMode.ORCHESTRATOR
    }
  }
}
