/**
 * Validation Rule Engine
 * Extensible validation system for SOL artifacts
 * Follows SOLID principles and framework conventions
 */

import { SOLArtifact } from "../artifacts"
import { ExecutionContext } from "../context/ExecutionContext"
import {
  ValidationResult,
  ValidationError,
  ValidationRule,
  ValidationCategory,
  createValidationResult,
} from "../types/Result"

export interface ValidationRuleRegistry {
  /**
   * Register a validation rule
   */
  register(rule: ValidationRule): void

  /**
   * Get a rule by ID
   */
  get(ruleId: string): ValidationRule | undefined

  /**
   * Get all rules for a specific artifact type
   */
  getRulesForArtifact(artifactType: string): ValidationRule[]

  /**
   * Get all rules in a category
   */
  getRulesByCategory(category: ValidationCategory): ValidationRule[]

  /**
   * Get all rules with specific tags
   */
  getRulesByTags(tags: string[]): ValidationRule[]

  /**
   * Check if a rule exists
   */
  hasRule(ruleId: string): boolean

  /**
   * Remove a rule
   */
  unregister(ruleId: string): boolean

  /**
   * Get all registered rules
   */
  getAllRules(): ValidationRule[]

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void

  /**
   * Check if a rule is enabled
   */
  isRuleEnabled(ruleId: string): boolean
}

export interface ValidationEngineConfig {
  /**
   * Whether to run validation in parallel
   */
  parallelExecution?: boolean

  /**
   * Maximum number of concurrent validations
   */
  maxConcurrency?: number

  /**
   * Timeout for individual rule execution in milliseconds
   */
  ruleTimeout?: number

  /**
   * Whether to stop on first error
   */
  stopOnError?: boolean

  /**
   * Whether to include warnings in results
   */
  includeWarnings?: boolean

  /**
   * Whether to include suggestions in results
   */
  includeSuggestions?: boolean

  /**
   * Custom rule configurations
   */
  ruleConfigs?: Record<string, any>
}

export interface ValidationEngineMetrics {
  ruleId: string
  executionCount: number
  totalExecutionTime: number
  averageExecutionTime: number
  successCount: number
  failureCount: number
  violationCount: number
  lastExecuted: Date
}

export class ValidationRuleEngine implements ValidationRuleRegistry {
  private rules = new Map<string, ValidationRule>()
  private enabledRules = new Set<string>()
  private ruleMetrics = new Map<string, ValidationEngineMetrics>()
  private config: ValidationEngineConfig

  constructor(config: ValidationEngineConfig = {}) {
    this.config = {
      parallelExecution: true,
      maxConcurrency: 10,
      ruleTimeout: 5000,
      stopOnError: false,
      includeWarnings: true,
      includeSuggestions: true,
      ...config,
    }
  }

  register(rule: ValidationRule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Validation rule '${rule.id}' is already registered`)
    }

    this.rules.set(rule.id, rule)
    this.enabledRules.add(rule.id)

    // Initialize metrics
    this.ruleMetrics.set(rule.id, {
      ruleId: rule.id,
      executionCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      successCount: 0,
      failureCount: 0,
      violationCount: 0,
      lastExecuted: new Date(),
    })
  }

  get(ruleId: string): ValidationRule | undefined {
    return this.rules.get(ruleId)
  }

  getRulesForArtifact(artifactType: string): ValidationRule[] {
    const applicableRules: ValidationRule[] = []

    for (const rule of this.rules.values()) {
      if (
        this.isRuleEnabled(rule.id) &&
        rule.applicableArtifacts.includes(artifactType)
      ) {
        applicableRules.push(rule)
      }
    }

    return applicableRules
  }

  getRulesByCategory(category: ValidationCategory): ValidationRule[] {
    return Array.from(this.rules.values()).filter(
      (rule) => rule.category === category
    )
  }

  getRulesByTags(tags: string[]): ValidationRule[] {
    // Para compatibilidad futura cuando se agreguen tags a ValidationRule
    return Array.from(this.rules.values()).filter((rule) =>
      tags.some((tag) => rule.category === tag)
    )
  }

  hasRule(ruleId: string): boolean {
    return this.rules.has(ruleId)
  }

  unregister(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId)
    if (removed) {
      this.enabledRules.delete(ruleId)
      this.ruleMetrics.delete(ruleId)
    }
    return removed
  }

  getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values())
  }

  setRuleEnabled(ruleId: string, enabled: boolean): void {
    if (!this.rules.has(ruleId)) {
      throw new Error(`Rule '${ruleId}' not found`)
    }

    if (enabled) {
      this.enabledRules.add(ruleId)
    } else {
      this.enabledRules.delete(ruleId)
    }
  }

  isRuleEnabled(ruleId: string): boolean {
    return this.enabledRules.has(ruleId)
  }

  /**
   * Validate an artifact using all applicable rules
   */
  async validateArtifact(
    artifact: SOLArtifact,
    context?: ExecutionContext
  ): Promise<ValidationResult> {
    const applicableRules = this.getRulesForArtifact(artifact.type)

    if (applicableRules.length === 0) {
      return createValidationResult(true, [], [], [])
    }

    const results: ValidationResult[] = []

    try {
      if (this.config.parallelExecution) {
        results.push(
          ...(await this.validateInParallel(applicableRules, artifact, context))
        )
      } else {
        results.push(
          ...(await this.validateSequentially(
            applicableRules,
            artifact,
            context
          ))
        )
      }

      return this.combineValidationResults(results)
    } catch (error) {
      const validationError: ValidationError = {
        code: "VALIDATION_ENGINE_ERROR",
        rule: "validation-engine",
        message: `Validation engine error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        severity: "critical",
        location: { artifact: artifact.metadata.id },
        remediation: "Check rule implementation and configuration",
      }

      return createValidationResult(false, [validationError], [], [])
    }
  }

  /**
   * Get validation metrics for a rule
   */
  getRuleMetrics(ruleId: string): ValidationEngineMetrics | undefined {
    return this.ruleMetrics.get(ruleId)
  }

  /**
   * Get metrics for all rules
   */
  getAllMetrics(): ValidationEngineMetrics[] {
    return Array.from(this.ruleMetrics.values())
  }

  /**
   * Reset metrics for a rule
   */
  resetRuleMetrics(ruleId: string): void {
    const metrics = this.ruleMetrics.get(ruleId)
    if (metrics) {
      metrics.executionCount = 0
      metrics.totalExecutionTime = 0
      metrics.averageExecutionTime = 0
      metrics.successCount = 0
      metrics.failureCount = 0
      metrics.violationCount = 0
      metrics.lastExecuted = new Date()
    }
  }

  /**
   * Get engine statistics
   */
  getEngineStats(): {
    totalRules: number
    enabledRules: number
    totalExecutions: number
    averageExecutionTime: number
    successRate: number
    mostUsedRule: string | null
    slowestRule: string | null
  } {
    const allMetrics = this.getAllMetrics()

    const totalExecutions = allMetrics.reduce(
      (sum, m) => sum + m.executionCount,
      0
    )
    const totalExecutionTime = allMetrics.reduce(
      (sum, m) => sum + m.totalExecutionTime,
      0
    )
    const totalSuccesses = allMetrics.reduce(
      (sum, m) => sum + m.successCount,
      0
    )

    const averageExecutionTime =
      totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0
    const successRate =
      totalExecutions > 0 ? totalSuccesses / totalExecutions : 0

    let mostUsedRule: string | null = null
    let maxExecutions = 0
    for (const metric of allMetrics) {
      if (metric.executionCount > maxExecutions) {
        maxExecutions = metric.executionCount
        mostUsedRule = metric.ruleId
      }
    }

    let slowestRule: string | null = null
    let maxAverageTime = 0
    for (const metric of allMetrics) {
      if (metric.averageExecutionTime > maxAverageTime) {
        maxAverageTime = metric.averageExecutionTime
        slowestRule = metric.ruleId
      }
    }

    return {
      totalRules: this.rules.size,
      enabledRules: this.enabledRules.size,
      totalExecutions,
      averageExecutionTime,
      successRate,
      mostUsedRule,
      slowestRule,
    }
  }

  private async validateInParallel(
    rules: ValidationRule[],
    artifact: SOLArtifact,
    context?: ExecutionContext
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []
    const chunks = this.chunkArray(rules, this.config.maxConcurrency || 10)

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((rule) => this.executeRule(rule, artifact, context))
      )
      results.push(...chunkResults)

      // Stop on error if configured
      if (this.config.stopOnError && chunkResults.some((r) => !r.isValid)) {
        break
      }
    }

    return results
  }

  private async validateSequentially(
    rules: ValidationRule[],
    artifact: SOLArtifact,
    context?: ExecutionContext
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    for (const rule of rules) {
      const result = await this.executeRule(rule, artifact, context)
      results.push(result)

      // Stop on error if configured
      if (this.config.stopOnError && !result.isValid) {
        break
      }
    }

    return results
  }

  private async executeRule(
    rule: ValidationRule,
    artifact: SOLArtifact,
    context?: ExecutionContext
  ): Promise<ValidationResult> {
    const startTime = Date.now()

    try {
      // Execute rule with timeout - ensure we get a promise
      const validatePromise = Promise.resolve(rule.validate(artifact))
      const ruleResult = await this.executeWithTimeout(
        validatePromise,
        this.config.ruleTimeout!
      )

      // Update metrics
      const executionTime = Date.now() - startTime
      this.updateRuleMetrics(
        rule.id,
        executionTime,
        true,
        ruleResult.errors.length
      )

      // Convert ValidationRuleResult to ValidationResult
      return createValidationResult(
        ruleResult.passed,
        ruleResult.errors,
        ruleResult.warnings,
        ruleResult.suggestions
      )
    } catch (error) {
      // Update metrics for failure
      const executionTime = Date.now() - startTime
      this.updateRuleMetrics(rule.id, executionTime, false, 0)

      const validationError: ValidationError = {
        code: "RULE_EXECUTION_FAILED",
        message: `Rule execution failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        severity: "critical",
        location: { artifact: artifact.metadata.id },
        rule: rule.id,
        remediation: "Check rule implementation and configuration",
      }

      return createValidationResult(false, [validationError], [], [])
    }
  }

  private combineValidationResults(
    results: ValidationResult[]
  ): ValidationResult {
    const allErrors = results.flatMap((r) => r.errors)
    const allWarnings = results.flatMap((r) => r.warnings)
    const allSuggestions = results.flatMap((r) => r.suggestions)

    // Filter based on configuration
    const errors = allErrors
    const warnings = this.config.includeWarnings ? allWarnings : []
    const suggestions = this.config.includeSuggestions ? allSuggestions : []

    return createValidationResult(
      errors.length === 0,
      errors,
      warnings,
      suggestions
    )
  }

  private updateRuleMetrics(
    ruleId: string,
    executionTime: number,
    success: boolean,
    violationCount: number
  ): void {
    const metrics = this.ruleMetrics.get(ruleId)
    if (!metrics) return

    metrics.executionCount++
    metrics.totalExecutionTime += executionTime
    metrics.averageExecutionTime =
      metrics.totalExecutionTime / metrics.executionCount
    metrics.lastExecuted = new Date()

    if (success) {
      metrics.successCount++
    } else {
      metrics.failureCount++
    }

    metrics.violationCount += violationCount
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Rule execution timeout after ${timeoutMs}ms`))
      }, timeoutMs)

      promise
        .then((result) => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timeout)
          reject(error)
        })
    })
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}
