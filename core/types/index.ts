/**
 * Core Abstractions Index
 * Exports all stable abstractions for the Hexy Framework
 * These interfaces form the foundation of the extensible architecture
 */

// Artifact Interpretation Abstractions
export type {
  ArtifactInterpreter,
  ArtifactInterpreterRegistry,
} from "./ArtifactInterpreter"

// Orchestration Strategy Abstractions
export type {
  OrchestrationStrategy,
  OrchestrationStrategyRegistry,
  OrchestrationMetrics,
} from "./OrchestrationStrategy"

// Plugin System Abstractions
export type {
  PluginCapability,
  Plugin,
  PluginHealthStatus,
  PluginCapabilityRegistry,
  PluginMetrics,
} from "./PluginCapability"

// Repository Abstractions
export type {
  ArtifactRepository,
  QueryCriteria,
  QueryResult,
  RepositoryStatistics,
  IntegrityValidationResult,
  RepositoryFactory,
  RepositoryConfig,
} from "./ArtifactRepository"

// Validation Abstractions
export type {
  ValidationRule,
  ValidationRuleEngine,
  ValidationIssue,
  ValidationSeverity,
  ValidationCategory,
  ValidationOptions,
  ValidationStatistics,
  ValidationRuleFactory,
  ValidationRuleConfig,
} from "./ValidationRule"

// Validation and Execution Result Types
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion,
  ValidationLocation,
  ValidationContext,
  ValidationConfig,
  ValidationReport,
  ValidationSummary,
  SemanticValidationResult,
  FlowValidationResult,
  AuthorityValidationResult,
  ExecutionResult,
  ExecutionMetadata,
  AsyncValidationResult,
  ReferenceValidationBatch,
} from "./Result"

export {
  createValidationResult,
  calculateValidationScore,
  isValidationSuccessful,
  hasCriticalErrors,
} from "./Result"

// Semantic Decision Types
export type {
  SemanticDecision,
  DecisionContext,
  DecisionCriteria,
  DecisionWeight,
  DecisionOutcome,
  DecisionStrategy,
  DecisionEngine,
} from "./SemanticDecision"

// Orchestration Mode Types
export type {
  OrchestrationMode,
  OrchestrationConfig,
  RetryStrategy,
  MonitoringConfig,
  OrchestrationResult,
} from "./OrchestrationMode"

/**
 * Core architecture principles enforced by these abstractions:
 *
 * 1. Open/Closed Principle - Interfaces are closed for modification, open for extension
 * 2. Dependency Inversion - High-level modules depend on abstractions, not concretions
 * 3. Interface Segregation - Clients depend only on interfaces they use
 * 4. Liskov Substitution - Implementations can be substituted without breaking functionality
 * 5. Single Responsibility - Each abstraction has one reason to change
 */

/**
 * Extension Guidelines:
 *
 * - To add new artifact types: Implement ArtifactInterpreter<T>
 * - To add new orchestration modes: Implement OrchestrationStrategy
 * - To add new plugins: Implement Plugin interface
 * - To add new storage backends: Implement ArtifactRepository<T>
 * - To add new validation rules: Implement ValidationRule<T>
 *
 * These abstractions ensure that the framework can grow from 3 to 20+ artifact types,
 * 1 to 5+ orchestration modes, and 1 to 50+ plugins without breaking existing code.
 */
