/**
 * Core Abstraction: OrchestrationStrategy
 * Strategy pattern for all orchestration modes
 * This interface remains stable regardless of how many orchestration modes are added
 */

import { SemanticDecision } from "./SemanticDecision"
import { ExecutionContext } from "../context/ExecutionContext"
import { ExecutionResult } from "./Result"
import { PluginCapability } from "./PluginCapability"
import { SOLArtifactType } from "@/artifacts"

/**
 * Orchestration strategy interface
 * Defines how semantic decisions are executed
 */
export interface OrchestrationStrategy {
  /**
   * Unique identifier for this orchestration strategy
   */
  readonly name: string

  /**
   * Human-readable description of this orchestration strategy
   */
  readonly description: string

  /**
   * Artifact types this strategy can handle
   */
  readonly supportedArtifacts: SOLArtifactType[]

  /**
   * Priority of this strategy (higher number = higher priority)
   */
  readonly priority: number

  /**
   * Check if this strategy can handle the given semantic decision
   * @param decision - The semantic decision to check
   * @param context - The execution context
   * @returns True if this strategy can handle the decision
   */
  canHandle(decision: SemanticDecision, context: ExecutionContext): boolean

  /**
   * Execute the semantic decision using this orchestration strategy
   * @param decision - The semantic decision to execute
   * @param context - The execution context
   * @returns The execution result
   */
  execute(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionResult>

  /**
   * Get the plugin capabilities required for this orchestration
   * @param decision - The semantic decision being orchestrated
   * @returns Array of required plugin capabilities
   */
  getRequiredCapabilities(decision: SemanticDecision): PluginCapability[]

  /**
   * Get configuration schema for this orchestration strategy
   * @returns Configuration schema or undefined if no configuration needed
   */
  getConfigurationSchema(): any | undefined

  /**
   * Validate the execution context before orchestration
   * @param context - The execution context to validate
   * @returns True if the context is valid for this strategy
   */
  validateContext(context: ExecutionContext): boolean

  /**
   * Estimate the execution time for this orchestration
   * @param decision - The semantic decision to estimate
   * @param context - The execution context
   * @returns Estimated execution time in milliseconds
   */
  estimateExecutionTime(
    decision: SemanticDecision,
    context: ExecutionContext
  ): number
}

/**
 * Registry for orchestration strategies
 * Manages all registered strategies and provides strategy selection
 */
export interface OrchestrationStrategyRegistry {
  /**
   * Register an orchestration strategy
   * @param strategy - The strategy implementation
   */
  register(strategy: OrchestrationStrategy): void

  /**
   * Get a strategy by name
   * @param name - The strategy name
   * @returns The strategy or undefined if not found
   */
  get(name: string): OrchestrationStrategy | undefined

  /**
   * Find the best strategy for the given semantic decision
   * @param decision - The semantic decision to find a strategy for
   * @param context - The execution context
   * @returns The best strategy or undefined if none found
   */
  findBestStrategy(
    decision: SemanticDecision,
    context: ExecutionContext
  ): OrchestrationStrategy | undefined

  /**
   * Get all strategies that can handle the given decision
   * @param decision - The semantic decision to check
   * @param context - The execution context
   * @returns Array of compatible strategies, sorted by priority
   */
  getCompatibleStrategies(
    decision: SemanticDecision,
    context: ExecutionContext
  ): OrchestrationStrategy[]

  /**
   * Get all registered strategy names
   * @returns Array of registered strategy names
   */
  getAllStrategyNames(): string[]

  /**
   * Check if a strategy exists
   * @param name - The strategy name
   * @returns True if the strategy exists
   */
  hasStrategy(name: string): boolean

  /**
   * Remove a strategy from the registry
   * @param name - The strategy name to remove
   * @returns True if the strategy was removed
   */
  unregister(name: string): boolean
}

/**
 * Execution metrics for orchestration strategies
 */
export interface OrchestrationMetrics {
  /**
   * Strategy name
   */
  strategyName: string

  /**
   * Number of executions
   */
  executionCount: number

  /**
   * Total execution time in milliseconds
   */
  totalExecutionTime: number

  /**
   * Average execution time in milliseconds
   */
  averageExecutionTime: number

  /**
   * Number of successful executions
   */
  successCount: number

  /**
   * Number of failed executions
   */
  failureCount: number

  /**
   * Success rate (0-1)
   */
  successRate: number

  /**
   * Last execution timestamp
   */
  lastExecutionTime: Date
}
