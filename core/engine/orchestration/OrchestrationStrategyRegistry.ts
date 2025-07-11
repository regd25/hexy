/**
 * Orchestration Strategy Registry
 * Manages all orchestration strategies and provides strategy selection
 */

import {
  OrchestrationStrategy,
  OrchestrationStrategyRegistry,
  OrchestrationMetrics,
} from "../../types/OrchestrationStrategy"
import { SemanticDecision } from "../../types/SemanticDecision"
import { ExecutionContext } from "../../context/ExecutionContext"

export class ConcreteOrchestrationStrategyRegistry
  implements OrchestrationStrategyRegistry
{
  private strategies = new Map<string, OrchestrationStrategy>()
  private metrics = new Map<string, OrchestrationMetrics>()

  register(strategy: OrchestrationStrategy): void {
    if (this.strategies.has(strategy.name)) {
      throw new Error(
        `Strategy with name '${strategy.name}' is already registered`
      )
    }

    this.strategies.set(strategy.name, strategy)

    // Initialize metrics for this strategy
    this.metrics.set(strategy.name, {
      strategyName: strategy.name,
      executionCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      lastExecutionTime: new Date(),
    })
  }

  get(name: string): OrchestrationStrategy | undefined {
    return this.strategies.get(name)
  }

  findBestStrategy(
    decision: SemanticDecision,
    context: ExecutionContext
  ): OrchestrationStrategy | undefined {
    const compatibleStrategies = this.getCompatibleStrategies(decision, context)

    if (compatibleStrategies.length === 0) {
      return undefined
    }

    // Return the strategy with highest priority
    // In case of tie, prefer the one with better success rate
    return compatibleStrategies.reduce((best, current) => {
      if (current.priority > best.priority) {
        return current
      }

      if (current.priority === best.priority) {
        const bestMetrics = this.metrics.get(best.name)
        const currentMetrics = this.metrics.get(current.name)

        if (bestMetrics && currentMetrics) {
          // Prefer strategy with better success rate
          if (currentMetrics.successRate > bestMetrics.successRate) {
            return current
          }

          // If success rates are equal, prefer faster strategy
          if (
            currentMetrics.successRate === bestMetrics.successRate &&
            currentMetrics.averageExecutionTime <
              bestMetrics.averageExecutionTime
          ) {
            return current
          }
        }
      }

      return best
    })
  }

  getCompatibleStrategies(
    decision: SemanticDecision,
    context: ExecutionContext
  ): OrchestrationStrategy[] {
    const compatible: OrchestrationStrategy[] = []

    for (const strategy of this.strategies.values()) {
      if (strategy.canHandle(decision, context)) {
        compatible.push(strategy)
      }
    }

    // Sort by priority (highest first), then by success rate
    return compatible.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }

      const aMetrics = this.metrics.get(a.name)
      const bMetrics = this.metrics.get(b.name)

      if (aMetrics && bMetrics) {
        return bMetrics.successRate - aMetrics.successRate
      }

      return 0
    })
  }

  getAllStrategyNames(): string[] {
    return Array.from(this.strategies.keys())
  }

  hasStrategy(name: string): boolean {
    return this.strategies.has(name)
  }

  unregister(name: string): boolean {
    const removed = this.strategies.delete(name)
    if (removed) {
      this.metrics.delete(name)
    }
    return removed
  }

  /**
   * Update metrics after strategy execution
   */
  updateMetrics(
    strategyName: string,
    executionTime: number,
    success: boolean
  ): void {
    const metrics = this.metrics.get(strategyName)
    if (!metrics) {
      return
    }

    metrics.executionCount++
    metrics.totalExecutionTime += executionTime
    metrics.averageExecutionTime =
      metrics.totalExecutionTime / metrics.executionCount
    metrics.lastExecutionTime = new Date()

    if (success) {
      metrics.successCount++
    } else {
      metrics.failureCount++
    }

    metrics.successRate = metrics.successCount / metrics.executionCount
  }

  /**
   * Get metrics for a specific strategy
   */
  getMetrics(strategyName: string): OrchestrationMetrics | undefined {
    return this.metrics.get(strategyName)
  }

  /**
   * Get metrics for all strategies
   */
  getAllMetrics(): OrchestrationMetrics[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Reset metrics for a specific strategy
   */
  resetMetrics(strategyName: string): void {
    const metrics = this.metrics.get(strategyName)
    if (metrics) {
      metrics.executionCount = 0
      metrics.totalExecutionTime = 0
      metrics.averageExecutionTime = 0
      metrics.successCount = 0
      metrics.failureCount = 0
      metrics.successRate = 0
      metrics.lastExecutionTime = new Date()
    }
  }

  /**
   * Reset metrics for all strategies
   */
  resetAllMetrics(): void {
    for (const strategyName of this.strategies.keys()) {
      this.resetMetrics(strategyName)
    }
  }

  /**
   * Get strategy recommendations for a decision
   */
  getStrategyRecommendations(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Array<{
    strategy: OrchestrationStrategy
    score: number
    reasoning: string[]
  }> {
    const compatibleStrategies = this.getCompatibleStrategies(decision, context)

    return compatibleStrategies
      .map((strategy) => {
        const metrics = this.metrics.get(strategy.name)
        const reasoning: string[] = []
        let score = strategy.priority

        // Adjust score based on metrics
        if (metrics) {
          // Boost score for high success rate
          if (metrics.successRate > 0.9) {
            score += 20
            reasoning.push("High success rate (>90%)")
          } else if (metrics.successRate > 0.7) {
            score += 10
            reasoning.push("Good success rate (>70%)")
          }

          // Boost score for fast execution
          if (metrics.averageExecutionTime < 1000) {
            score += 15
            reasoning.push("Fast execution (<1s average)")
          } else if (metrics.averageExecutionTime < 5000) {
            score += 5
            reasoning.push("Reasonable execution time (<5s average)")
          }

          // Consider execution count (more experience = better)
          if (metrics.executionCount > 100) {
            score += 10
            reasoning.push("Highly experienced strategy (>100 executions)")
          } else if (metrics.executionCount > 10) {
            score += 5
            reasoning.push("Experienced strategy (>10 executions)")
          }
        }

        // Adjust score based on artifact type match
        if (strategy.supportedArtifactTypes.includes(decision.artifact.type)) {
          score += 25
          reasoning.push(`Optimized for ${decision.artifact.type} artifacts`)
        }

        // Add estimated execution time consideration
        const estimatedTime = strategy.estimateExecutionTime(decision, context)
        if (estimatedTime < 2000) {
          score += 10
          reasoning.push("Quick estimated execution time")
        }

        return {
          strategy,
          score,
          reasoning,
        }
      })
      .sort((a, b) => b.score - a.score)
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): {
    totalStrategies: number
    totalExecutions: number
    averageSuccessRate: number
    mostUsedStrategy: string | null
    fastestStrategy: string | null
  } {
    const allMetrics = this.getAllMetrics()

    const totalExecutions = allMetrics.reduce(
      (sum, m) => sum + m.executionCount,
      0
    )
    const averageSuccessRate =
      allMetrics.length > 0
        ? allMetrics.reduce((sum, m) => sum + m.successRate, 0) /
          allMetrics.length
        : 0

    const mostUsedStrategy =
      allMetrics.reduce(
        (best, current) =>
          current.executionCount > (best?.executionCount || 0) ? current : best,
        null
      )?.strategyName || null

    const fastestStrategy =
      allMetrics.reduce(
        (best, current) =>
          current.averageExecutionTime <
          (best?.averageExecutionTime || Infinity)
            ? current
            : best,
        null
      )?.strategyName || null

    return {
      totalStrategies: this.strategies.size,
      totalExecutions,
      averageSuccessRate,
      mostUsedStrategy,
      fastestStrategy,
    }
  }
}
