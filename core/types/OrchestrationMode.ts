/**
 * Orchestration Mode Enum
 * Defines the different modes of orchestration available
 */

export enum OrchestrationMode {
  /**
   * Orchestrator mode - Centralized orchestration with deterministic execution
   */
  ORCHESTRATOR = "orchestrator",

  /**
   * Reactive mode - Event-driven reactive orchestration
   */
  REACTIVE = "reactive",

  /**
   * Choreographed mode - Distributed choreography (future implementation)
   */
  CHOREOGRAPHED = "choreographed",

  /**
   * Hybrid mode - Combination of orchestration and choreography (future implementation)
   */
  HYBRID = "hybrid",
}

export interface OrchestrationConfig {
  mode: OrchestrationMode
  timeout?: number
  retryStrategy?: RetryStrategy
  fallbackMode?: OrchestrationMode
  monitoring?: MonitoringConfig
}

export interface RetryStrategy {
  maxRetries: number
  backoffType: "linear" | "exponential" | "custom"
  baseDelay: number
  maxDelay: number
  retryCondition?: (error: Error) => boolean
}

export interface MonitoringConfig {
  enableMetrics: boolean
  enableTracing: boolean
  enableLogging: boolean
  metricsInterval: number
}

export type OrchestrationResult = {
  mode: OrchestrationMode
  success: boolean
  duration: number
  steps: number
  errors: Error[]
  metadata: Record<string, any>
}
