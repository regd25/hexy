/**
 * Validation Result Types
 * Represents the outcome of semantic validation processes
 */

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  score: number // 0-100 validation score
  timestamp: Date
  validator: string // Name of validator that produced this result
}

export interface ValidationError {
  code: string
  message: string
  severity: "critical" | "high" | "medium" | "low"
  location?: ValidationLocation
  rule: string
  remediation?: string
  relatedArtifacts?: string[]
}

export interface ValidationWarning {
  code: string
  message: string
  location?: ValidationLocation
  rule: string
  suggestion?: string
  impact: "performance" | "maintainability" | "compliance" | "usability"
}

export interface ValidationSuggestion {
  code: string
  message: string
  location?: ValidationLocation
  improvement: string
  benefit: string
  effort: "low" | "medium" | "high"
}

export interface ValidationLocation {
  artifact: string
  section?: string
  line?: number
  column?: number
  path?: string
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  category: ValidationCategory
  severity: "critical" | "high" | "medium" | "low"
  applicableArtifacts: string[]
  validate: (
    artifact: any,
    context?: ValidationContext
  ) => ValidationRuleResult | Promise<ValidationRuleResult>
  autoFix?: (artifact: any) => any
  requiresRepository?: boolean
  cacheable?: boolean
}

export interface ValidationRuleResult {
  passed: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  metadata?: Record<string, any>
}

export type ValidationCategory =
  | "semantic-coherence"
  | "reference-integrity"
  | "hierarchical-compliance"
  | "composition-correctness"
  | "flow-validity"
  | "authority-consistency"
  | "intent-alignment"
  | "context-appropriateness"
  | "evaluation-completeness"
  | "anti-pattern-detection"

export interface ValidationContext {
  artifactRegistry: Map<string, any>
  validationRules: ValidationRule[]
  validationConfig: ValidationConfig
  currentArtifact: any
  relatedArtifacts: any[]
  referenceCache: Map<string, boolean>
  repository?: any
}

export interface ValidationConfig {
  strictMode: boolean
  enableAutoFix: boolean
  skipWarnings: boolean
  customRules: ValidationRule[]
  excludeRules: string[]
  validationLevel: "basic" | "standard" | "comprehensive"
}

export interface ValidationReport {
  summary: ValidationSummary
  artifactResults: Map<string, ValidationResult>
  overallScore: number
  recommendations: string[]
  criticalIssues: ValidationError[]
  timestamp: Date
  duration: number
}

export interface ValidationSummary {
  totalArtifacts: number
  validArtifacts: number
  invalidArtifacts: number
  totalErrors: number
  totalWarnings: number
  totalSuggestions: number
  averageScore: number
  compliancePercentage: number
}

// Specific validation result types for different contexts
export interface SemanticValidationResult extends ValidationResult {
  semanticCoherence: number
  referenceIntegrity: number
  compositionCorrectness: number
  hierarchicalCompliance: number
}

export interface FlowValidationResult extends ValidationResult {
  flowCompleteness: number
  actorConsistency: number
  stepLogic: number
  errorHandling: number
}

export interface AuthorityValidationResult extends ValidationResult {
  authorityScope: number
  permissionConsistency: number
  jurisdictionValidity: number
  escalationPaths: number
}

// Utility functions
export function createValidationResult(
  isValid: boolean,
  errors: ValidationError[] = [],
  warnings: ValidationWarning[] = [],
  suggestions: ValidationSuggestion[] = []
): ValidationResult {
  const score = calculateValidationScore(errors, warnings, suggestions)

  return {
    isValid,
    errors,
    warnings,
    suggestions,
    score,
    timestamp: new Date(),
    validator: "semantic-engine",
  }
}

export function calculateValidationScore(
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: ValidationSuggestion[]
): number {
  let score = 100

  // Deduct points for errors
  errors.forEach((error) => {
    switch (error.severity) {
      case "critical":
        score -= 25
        break
      case "high":
        score -= 15
        break
      case "medium":
        score -= 10
        break
      case "low":
        score -= 5
        break
    }
  })

  // Deduct points for warnings
  warnings.forEach((warning) => {
    score -= 2
  })

  return Math.max(0, score)
}

export function isValidationSuccessful(result: ValidationResult): boolean {
  return result.isValid && result.errors.length === 0
}

export function hasCriticalErrors(result: ValidationResult): boolean {
  return result.errors.some((error) => error.severity === "critical")
}

// ✅ Nuevos tipos para manejo asíncrono
export interface AsyncValidationResult extends ValidationResult {
  pendingValidations: Promise<ValidationRuleResult>[]
  cacheHits: number
  cacheMisses: number
  totalQueries: number
}

export interface ReferenceValidationBatch {
  references: string[]
  results: Map<string, boolean>
  errors: ValidationError[]
  executionTime: number
}

// ✅ Generic ExecutionResult following SOL artifact principles
export interface ExecutionResult<T = any> {
  /**
   * Whether the execution was successful
   */
  success: boolean

  /**
   * The result data from the execution
   */
  result?: T

  /**
   * Execution errors if any
   */
  errors: ValidationError[]

  /**
   * Execution warnings if any
   */
  warnings: ValidationWarning[]

  /**
   * Execution metadata
   */
  metadata: ExecutionMetadata

  /**
   * Execution duration in milliseconds
   */
  duration: number

  /**
   * Timestamp when execution started
   */
  startTime: Date

  /**
   * Timestamp when execution ended
   */
  endTime: Date
}

export interface ExecutionMetadata {
  /**
   * Execution strategy used
   */
  strategy: string

  /**
   * Artifact type being executed
   */
  artifactType: string

  /**
   * Artifact identifier
   */
  artifactId: string

  /**
   * Execution context information
   */
  context: Record<string, any>

  /**
   * Performance metrics
   */
  metrics: {
    memoryUsage: number
    cpuTime: number
    operationCount: number
    cacheHits: number
    cacheMisses: number
  }

  /**
   * Additional custom metadata
   */
  custom?: Record<string, any>
}
