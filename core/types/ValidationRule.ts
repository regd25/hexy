/**
 * Core Abstraction: ValidationRule<T>
 * Generic interface for artifact validation rules
 * This interface remains stable regardless of how many validation rules are added
 */

import { SOLArtifact } from "../artifacts"
import { ValidationResult } from "./Result"
import { ExecutionContext } from "../context/ExecutionContext"

/**
 * Validation rule severity levels
 */
export enum ValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

/**
 * Validation rule category
 */
export enum ValidationCategory {
  SYNTAX = "syntax",
  SEMANTIC = "semantic",
  BUSINESS = "business",
  SECURITY = "security",
  PERFORMANCE = "performance",
  COMPLIANCE = "compliance",
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  /**
   * Issue severity
   */
  severity: ValidationSeverity

  /**
   * Issue category
   */
  category: ValidationCategory

  /**
   * Rule that generated this issue
   */
  ruleId: string

  /**
   * Issue message
   */
  message: string

  /**
   * Detailed description
   */
  description?: string

  /**
   * Location in the artifact where the issue occurs
   */
  location?: {
    line?: number
    column?: number
    path?: string
  }

  /**
   * Suggested fix
   */
  suggestedFix?: string

  /**
   * Additional context
   */
  context?: Record<string, any>
}

/**
 * Validation rule interface
 * @template T - The artifact type this rule validates
 */
export interface ValidationRule<T extends SOLArtifact> {
  /**
   * Unique identifier for this validation rule
   */
  readonly id: string

  /**
   * Human-readable name of the rule
   */
  readonly name: string

  /**
   * Description of what this rule validates
   */
  readonly description: string

  /**
   * Rule category
   */
  readonly category: ValidationCategory

  /**
   * Rule severity
   */
  readonly severity: ValidationSeverity

  /**
   * Rule version
   */
  readonly version: string

  /**
   * Artifact types this rule applies to
   */
  readonly applicableTypes: string[]

  /**
   * Whether this rule is enabled by default
   */
  readonly enabledByDefault: boolean

  /**
   * Rule configuration schema
   */
  readonly configurationSchema?: any

  /**
   * Check if this rule can validate the given artifact
   * @param artifact - The artifact to check
   * @returns True if this rule can validate the artifact
   */
  canValidate(artifact: SOLArtifact): artifact is T

  /**
   * Validate the artifact
   * @param artifact - The artifact to validate
   * @param context - Optional execution context
   * @param config - Optional rule configuration
   * @returns Validation result
   */
  validate(
    artifact: T,
    context?: ExecutionContext,
    config?: any
  ): Promise<ValidationResult>

  /**
   * Get the priority of this rule (higher number = higher priority)
   * @returns Rule priority
   */
  getPriority(): number

  /**
   * Get dependencies on other rules
   * @returns Array of rule IDs this rule depends on
   */
  getDependencies(): string[]

  /**
   * Check if this rule conflicts with another rule
   * @param otherId - The other rule ID
   * @returns True if there's a conflict
   */
  conflictsWith(otherId: string): boolean
}

/**
 * Validation rule engine interface
 * Manages all validation rules and orchestrates validation
 */
export interface ValidationRuleEngine {
  /**
   * Register a validation rule
   * @param rule - The validation rule to register
   */
  registerRule<T extends SOLArtifact>(rule: ValidationRule<T>): void

  /**
   * Unregister a validation rule
   * @param ruleId - The rule ID to unregister
   * @returns True if the rule was unregistered
   */
  unregisterRule(ruleId: string): boolean

  /**
   * Get a validation rule by ID
   * @param ruleId - The rule ID
   * @returns The validation rule or undefined if not found
   */
  getRule(ruleId: string): ValidationRule<any> | undefined

  /**
   * Get all applicable rules for an artifact
   * @param artifact - The artifact to get rules for
   * @returns Array of applicable validation rules
   */
  getApplicableRules(artifact: SOLArtifact): ValidationRule<any>[]

  /**
   * Validate an artifact using all applicable rules
   * @param artifact - The artifact to validate
   * @param context - Optional execution context
   * @param options - Validation options
   * @returns Comprehensive validation result
   */
  validate(
    artifact: SOLArtifact,
    context?: ExecutionContext,
    options?: ValidationOptions
  ): Promise<ValidationResult>

  /**
   * Validate an artifact using specific rules
   * @param artifact - The artifact to validate
   * @param ruleIds - Array of rule IDs to apply
   * @param context - Optional execution context
   * @param options - Validation options
   * @returns Validation result
   */
  validateWithRules(
    artifact: SOLArtifact,
    ruleIds: string[],
    context?: ExecutionContext,
    options?: ValidationOptions
  ): Promise<ValidationResult>

  /**
   * Get all registered rules
   * @returns Array of all registered rules
   */
  getAllRules(): ValidationRule<any>[]

  /**
   * Get rules by category
   * @param category - The validation category
   * @returns Array of rules in the specified category
   */
  getRulesByCategory(category: ValidationCategory): ValidationRule<any>[]

  /**
   * Get rules by severity
   * @param severity - The validation severity
   * @returns Array of rules with the specified severity
   */
  getRulesBySeverity(severity: ValidationSeverity): ValidationRule<any>[]

  /**
   * Enable or disable a rule
   * @param ruleId - The rule ID
   * @param enabled - Whether to enable or disable the rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void

  /**
   * Check if a rule is enabled
   * @param ruleId - The rule ID
   * @returns True if the rule is enabled
   */
  isRuleEnabled(ruleId: string): boolean

  /**
   * Get validation statistics
   * @returns Validation statistics
   */
  getStatistics(): ValidationStatistics
}

/**
 * Validation options
 */
export interface ValidationOptions {
  /**
   * Whether to stop on first error
   */
  stopOnError?: boolean

  /**
   * Maximum number of issues to report
   */
  maxIssues?: number

  /**
   * Minimum severity level to report
   */
  minSeverity?: ValidationSeverity

  /**
   * Categories to include
   */
  includeCategories?: ValidationCategory[]

  /**
   * Categories to exclude
   */
  excludeCategories?: ValidationCategory[]

  /**
   * Rules to include
   */
  includeRules?: string[]

  /**
   * Rules to exclude
   */
  excludeRules?: string[]

  /**
   * Whether to include context in the result
   */
  includeContext?: boolean

  /**
   * Timeout in milliseconds
   */
  timeout?: number
}

/**
 * Validation statistics
 */
export interface ValidationStatistics {
  /**
   * Total number of registered rules
   */
  totalRules: number

  /**
   * Number of enabled rules
   */
  enabledRules: number

  /**
   * Rules by category
   */
  rulesByCategory: Record<ValidationCategory, number>

  /**
   * Rules by severity
   */
  rulesBySeverity: Record<ValidationSeverity, number>

  /**
   * Total validations performed
   */
  totalValidations: number

  /**
   * Total issues found
   */
  totalIssues: number

  /**
   * Issues by severity
   */
  issuesBySeverity: Record<ValidationSeverity, number>

  /**
   * Average validation time in milliseconds
   */
  averageValidationTime: number

  /**
   * Last validation time
   */
  lastValidationTime: Date
}

/**
 * Validation rule factory interface
 * Creates validation rule instances
 */
export interface ValidationRuleFactory {
  /**
   * Create a validation rule instance
   * @param config - Rule configuration
   * @returns Validation rule instance
   */
  create(config: ValidationRuleConfig): ValidationRule<any>

  /**
   * Get supported rule types
   * @returns Array of supported rule types
   */
  getSupportedTypes(): string[]

  /**
   * Get configuration schema for a rule type
   * @param type - Rule type
   * @returns Configuration schema
   */
  getConfigurationSchema(type: string): any
}

/**
 * Validation rule configuration
 */
export interface ValidationRuleConfig {
  /**
   * Rule type
   */
  type: string

  /**
   * Rule ID
   */
  id: string

  /**
   * Rule name
   */
  name: string

  /**
   * Rule description
   */
  description: string

  /**
   * Rule category
   */
  category: ValidationCategory

  /**
   * Rule severity
   */
  severity: ValidationSeverity

  /**
   * Applicable artifact types
   */
  applicableTypes: string[]

  /**
   * Whether enabled by default
   */
  enabledByDefault: boolean

  /**
   * Rule-specific configuration
   */
  configuration?: any
}
