/**
 * Orchestration Mode Factory - Integrates all orchestration modes
 * Provides a unified interface for different orchestration strategies
 */

import { ExecutionContext } from '../../context/ExecutionContext'
import { SemanticDecision } from '../../types/SemanticDecision'
import { OrchestrationMode } from '../../types/OrchestrationMode'
import { PluginManager } from '../../plugins/PluginManager'
import { ValidationSystem } from '../../validation/ValidationSystem'
import { EventSystem } from '../../events/EventSystem'
import { ArtifactRepository } from '../../repositories/ArtifactRepository'

import { OrchestratorMode, OrchestratorConfig } from './OrchestratorMode'
import { ReactiveMode, ReactiveConfig } from './ReactiveMode'
import { ChoreographedMode, ChoreographedConfig } from './ChoreographedMode'

export interface OrchestrationModeConfigs {
  orchestrator: OrchestratorConfig
  reactive: ReactiveConfig
  choreographed: ChoreographedConfig
}

export interface OrchestrationResult {
  mode: OrchestrationMode
  context: ExecutionContext
  executionTime: number
  success: boolean
  metrics?: OrchestrationMetrics
}

export interface OrchestrationMetrics {
  stepsExecuted: number
  eventsProcessed: number
  consensusReached: boolean
  coherenceViolations: number
  interventionsExecuted: number
  participants: number
}

export class OrchestrationModeFactory {
  private readonly pluginManager: PluginManager
  private readonly validationSystem: ValidationSystem
  private readonly eventSystem: EventSystem
  private readonly artifactRepository: ArtifactRepository
  private readonly configs: OrchestrationModeConfigs

  // Mode instances
  private orchestratorMode: OrchestratorMode
  private reactiveMode: ReactiveMode
  private choreographedMode: ChoreographedMode

  constructor(
    pluginManager: PluginManager,
    validationSystem: ValidationSystem,
    eventSystem: EventSystem,
    artifactRepository: ArtifactRepository,
    configs?: Partial<OrchestrationModeConfigs>
  ) {
    this.pluginManager = pluginManager
    this.validationSystem = validationSystem
    this.eventSystem = eventSystem
    this.artifactRepository = artifactRepository
    
    // Initialize configurations with defaults
    this.configs = {
      orchestrator: configs?.orchestrator || OrchestratorMode.createDefaultConfig(),
      reactive: configs?.reactive || ReactiveMode.createDefaultConfig(),
      choreographed: configs?.choreographed || ChoreographedMode.createDefaultConfig()
    }

    // Initialize mode instances
    this.orchestratorMode = new OrchestratorMode(
      this.pluginManager,
      this.validationSystem,
      this.configs.orchestrator
    )

    this.reactiveMode = new ReactiveMode(
      this.eventSystem,
      this.validationSystem,
      this.artifactRepository,
      this.configs.reactive
    )

    this.choreographedMode = new ChoreographedMode(
      this.eventSystem,
      this.artifactRepository,
      this.configs.choreographed
    )
  }

  /**
   * Execute orchestration using the specified mode
   */
  async execute(
    mode: OrchestrationMode,
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<OrchestrationResult> {
    const startTime = Date.now()
    let result: OrchestrationResult

    try {
      let updatedContext: ExecutionContext

      switch (mode) {
        case OrchestrationMode.ORCHESTRATOR:
          updatedContext = await this.executeOrchestratorMode(decision, context)
          break

        case OrchestrationMode.REACTIVE:
          updatedContext = await this.executeReactiveMode(decision, context)
          break

        case OrchestrationMode.CHOREOGRAPHED:
          updatedContext = await this.executeChoreographedMode(decision, context)
          break

        default:
          throw new Error(`Unsupported orchestration mode: ${mode}`)
      }

      const executionTime = Date.now() - startTime

      result = {
        mode,
        context: updatedContext,
        executionTime,
        success: true,
        metrics: this.calculateMetrics(mode, updatedContext, executionTime)
      }

    } catch (error) {
      const executionTime = Date.now() - startTime

      result = {
        mode,
        context,
        executionTime,
        success: false
      }

      // Add execution error to context
      context.addResult({
        type: 'failure',
        error: error as Error,
        metadata: {
          orchestrationMode: mode,
          executionTime
        }
      })
    }

    return result
  }

  /**
   * Determine the best orchestration mode for a given decision and context
   */
  determineOptimalMode(
    decision: SemanticDecision,
    context: ExecutionContext
  ): OrchestrationMode {
    const { artifact } = decision

    // Strategic artifacts typically benefit from choreographed mode
    if (artifact.organizational?.level === 'strategic') {
      return OrchestrationMode.CHOREOGRAPHED
    }

    // Event-driven artifacts work well with reactive mode
    if (artifact.type === 'Event' || artifact.type === 'Observation') {
      return OrchestrationMode.REACTIVE
    }

    // Process and procedure artifacts benefit from orchestrator mode
    if (artifact.type === 'Process' || artifact.type === 'Procedure') {
      return OrchestrationMode.ORCHESTRATOR
    }

    // Complex artifacts with multiple dependencies benefit from choreographed mode
    if (artifact.relationships?.dependsOn && artifact.relationships.dependsOn.length > 3) {
      return OrchestrationMode.CHOREOGRAPHED
    }

    // High-risk operations benefit from orchestrator mode for better control
    if (context.getIntent().priority === 'critical') {
      return OrchestrationMode.ORCHESTRATOR
    }

    // Default to orchestrator mode for predictable execution
    return OrchestrationMode.ORCHESTRATOR
  }

  /**
   * Execute orchestrator mode
   */
  private async executeOrchestratorMode(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    return await this.orchestratorMode.execute(decision, context)
  }

  /**
   * Execute reactive mode
   */
  private async executeReactiveMode(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    return await this.reactiveMode.initialize(decision, context)
  }

  /**
   * Execute choreographed mode
   */
  private async executeChoreographedMode(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    // Initialize choreographed mode
    const initializedContext = await this.choreographedMode.initialize(decision, context)
    
    // Coordinate execution
    return await this.choreographedMode.coordinate(decision, initializedContext)
  }

  /**
   * Calculate orchestration metrics
   */
  private calculateMetrics(
    mode: OrchestrationMode,
    context: ExecutionContext,
    executionTime: number
  ): OrchestrationMetrics {
    const baseMetrics: OrchestrationMetrics = {
      stepsExecuted: 0,
      eventsProcessed: 0,
      consensusReached: false,
      coherenceViolations: context.getViolations().length,
      interventionsExecuted: 0,
      participants: 1
    }

    switch (mode) {
      case OrchestrationMode.ORCHESTRATOR:
        return {
          ...baseMetrics,
          stepsExecuted: context.getResults().length,
          eventsProcessed: context.getEvents().length
        }

      case OrchestrationMode.REACTIVE:
        return {
          ...baseMetrics,
          eventsProcessed: context.getEvents().length,
          interventionsExecuted: context.getViolations().filter(v => v.type === 'authority').length
        }

      case OrchestrationMode.CHOREOGRAPHED:
        return {
          ...baseMetrics,
          consensusReached: context.getResults().some(r => r.type === 'success'),
          participants: context.getObservations().length + 1
        }

      default:
        return baseMetrics
    }
  }

  /**
   * Get mode-specific configuration
   */
  getModeConfig<T extends keyof OrchestrationModeConfigs>(mode: T): OrchestrationModeConfigs[T] {
    return this.configs[mode]
  }

  /**
   * Update mode-specific configuration
   */
  updateModeConfig<T extends keyof OrchestrationModeConfigs>(
    mode: T,
    config: Partial<OrchestrationModeConfigs[T]>
  ): void {
    this.configs[mode] = { ...this.configs[mode], ...config }

    // Reinitialize the corresponding mode with new config
    switch (mode) {
      case 'orchestrator':
        this.orchestratorMode = new OrchestratorMode(
          this.pluginManager,
          this.validationSystem,
          this.configs.orchestrator
        )
        break

      case 'reactive':
        this.reactiveMode = new ReactiveMode(
          this.eventSystem,
          this.validationSystem,
          this.artifactRepository,
          this.configs.reactive
        )
        break

      case 'choreographed':
        this.choreographedMode = new ChoreographedMode(
          this.eventSystem,
          this.artifactRepository,
          this.configs.choreographed
        )
        break
    }
  }

  /**
   * Get orchestration mode recommendations
   */
  getOrchestrationRecommendations(
    decision: SemanticDecision,
    context: ExecutionContext
  ): OrchestrationRecommendation[] {
    const recommendations: OrchestrationRecommendation[] = []

    // Analyze artifact characteristics
    const { artifact } = decision

    // Orchestrator mode recommendation
    const orchestratorScore = this.calculateOrchestratorScore(artifact, context)
    recommendations.push({
      mode: OrchestrationMode.ORCHESTRATOR,
      score: orchestratorScore,
      reasoning: [
        'Provides centralized control and predictable execution',
        'Best for sequential processes and critical operations',
        'Enables detailed step-by-step monitoring'
      ],
      risks: [
        'Single point of failure',
        'May be slower for simple operations',
        'Less flexible for dynamic scenarios'
      ]
    })

    // Reactive mode recommendation
    const reactiveScore = this.calculateReactiveScore(artifact, context)
    recommendations.push({
      mode: OrchestrationMode.REACTIVE,
      score: reactiveScore,
      reasoning: [
        'Excellent for event-driven scenarios',
        'Provides real-time coherence validation',
        'Enables continuous monitoring and intervention'
      ],
      risks: [
        'May miss complex cross-artifact relationships',
        'Reactive nature may cause delays',
        'Requires robust event infrastructure'
      ]
    })

    // Choreographed mode recommendation
    const choreographedScore = this.calculateChoreographedScore(artifact, context)
    recommendations.push({
      mode: OrchestrationMode.CHOREOGRAPHED,
      score: choreographedScore,
      reasoning: [
        'Enables distributed decision making',
        'Scales well with multiple participants',
        'Provides fault tolerance through redundancy'
      ],
      risks: [
        'Consensus may be slow to achieve',
        'Complex coordination overhead',
        'May require sophisticated conflict resolution'
      ]
    })

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score)
  }

  // Score calculation methods
  private calculateOrchestratorScore(artifact: any, context: ExecutionContext): number {
    let score = 0.5 // Base score

    // Boost for processes and procedures
    if (artifact.type === 'Process' || artifact.type === 'Procedure') {
      score += 0.3
    }

    // Boost for critical priority
    if (context.getIntent().priority === 'critical') {
      score += 0.2
    }

    // Boost for operational level
    if (artifact.organizational?.level === 'operational') {
      score += 0.2
    }

    // Penalize for high dependency count
    if (artifact.relationships?.dependsOn?.length > 5) {
      score -= 0.1
    }

    return Math.min(1.0, Math.max(0.0, score))
  }

  private calculateReactiveScore(artifact: any, context: ExecutionContext): number {
    let score = 0.3 // Lower base score

    // Boost for event-related artifacts
    if (artifact.type === 'Event' || artifact.type === 'Observation') {
      score += 0.4
    }

    // Boost for monitoring scenarios
    if (artifact.type === 'Indicator' || artifact.type === 'Result') {
      score += 0.3
    }

    // Boost for high change frequency environments
    if (context.getEvents().length > 10) {
      score += 0.2
    }

    return Math.min(1.0, Math.max(0.0, score))
  }

  private calculateChoreographedScore(artifact: any, context: ExecutionContext): number {
    let score = 0.4 // Medium base score

    // Boost for strategic level
    if (artifact.organizational?.level === 'strategic') {
      score += 0.3
    }

    // Boost for high dependency count
    if (artifact.relationships?.dependsOn?.length > 3) {
      score += 0.2
    }

    // Boost for organizational artifacts
    if (artifact.type === 'Actor' || artifact.type === 'Area') {
      score += 0.2
    }

    // Boost for complex governance artifacts
    if (['Vision', 'Policy', 'Principle'].includes(artifact.type)) {
      score += 0.1
    }

    return Math.min(1.0, Math.max(0.0, score))
  }

  /**
   * Get all orchestration modes statistics
   */
  getOrchestrationStatistics(): OrchestrationStatistics {
    return {
      totalExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      modeUsage: {
        [OrchestrationMode.ORCHESTRATOR]: 0,
        [OrchestrationMode.REACTIVE]: 0,
        [OrchestrationMode.CHOREOGRAPHED]: 0
      },
      commonFailureReasons: []
    }
  }

  /**
   * Validate orchestration mode compatibility
   */
  validateModeCompatibility(
    mode: OrchestrationMode,
    decision: SemanticDecision,
    context: ExecutionContext
  ): ValidationResult {
    const issues: string[] = []
    const warnings: string[] = []

    // Check if mode is suitable for artifact type
    const { artifact } = decision

    if (mode === OrchestrationMode.CHOREOGRAPHED && artifact.organizational?.level === 'operational') {
      warnings.push('Choreographed mode may be overkill for operational-level artifacts')
    }

    if (mode === OrchestrationMode.REACTIVE && artifact.type === 'Process') {
      warnings.push('Reactive mode may not be optimal for process artifacts that require sequential execution')
    }

    if (mode === OrchestrationMode.ORCHESTRATOR && artifact.organizational?.level === 'strategic') {
      warnings.push('Orchestrator mode may limit the collaborative benefits of strategic-level artifacts')
    }

    // Check context compatibility
    if (mode === OrchestrationMode.CHOREOGRAPHED && context.getActor().type === 'system') {
      issues.push('Choreographed mode requires human or organizational actors for consensus')
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    }
  }
}

// Supporting interfaces
export interface OrchestrationRecommendation {
  mode: OrchestrationMode
  score: number
  reasoning: string[]
  risks: string[]
}

export interface OrchestrationStatistics {
  totalExecutions: number
  successRate: number
  averageExecutionTime: number
  modeUsage: Record<OrchestrationMode, number>
  commonFailureReasons: string[]
}

export interface ValidationResult {
  isValid: boolean
  issues: string[]
  warnings: string[]
} 