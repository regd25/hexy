/**
 * Base Artifact - Foundation interfaces for all SOL artifacts
 * Contains common types, metadata, and base interfaces
 */

// ============================================================================
// METADATA AND COMMON TYPES
// ============================================================================

export interface Metadata {
  id: string
  version: string
  created: Date
  lastModified: Date
  status: string
  author: string
  reviewedBy: string[]
  tags: string[]
}

export interface SOLArtifactUses {
  intent?: string // Reference to Intent:Id
  context?: string // Reference to Context:Id
  authority?: string // Reference to Authority:Id
  evaluation?: string // Reference to Evaluation:Id
}

export interface SOLArtifactRelationships {
  dependsOn?: string[] // Other artifacts this depends on
  supports?: string[] // Other artifacts this supports
  implements?: string[] // Other artifacts this implements
  measuredBy?: string[] // Indicators that measure this
  composedOf?: string[] // Sub-artifacts that compose this
}

export interface SOLArtifactOrganizational {
  area?: string // Area:Id reference
  level: "strategic" | "tactical" | "operational"
  canReference?: string[] // What this artifact can reference
}

// ============================================================================
// ARTIFACT TYPES
// ============================================================================

export type SOLArtifactType =
  // Foundational Artifacts
  | "Intent"
  | "Context"
  | "Authority"
  | "Evaluation"
  // Strategic Artifacts
  | "Vision"
  | "Policy"
  | "Concept"
  | "Principle"
  | "Guideline"
  | "Indicator"
  // Operational Artifacts
  | "Process"
  | "Procedure"
  | "Event"
  | "Result"
  | "Observation"
  // Organizational Artifacts
  | "Actor"
  | "Area"

// ============================================================================
// FLOW AND LIFECYCLE DEFINITIONS
// ============================================================================

export interface FlowDefinition {
  steps: FlowStep[]
  errorHandling?: ErrorHandling
  parallelism?: ParallelismConfig
}

export interface FlowStep {
  id: string
  actor: string // Actor:Id reference
  action: string // Human-readable action
  inputs?: string[] // Expected inputs
  outputs?: string[] // Expected outputs
  conditions?: string[] // Conditions for execution
  timeout?: number
  retryConfig?: RetryConfig
}

export interface ErrorHandling {
  onError: "stop" | "continue" | "retry" | "escalate"
  escalationPath?: string[]
  fallbackActions?: string[]
}

export interface ParallelismConfig {
  maxConcurrency: number
  parallelSteps?: string[][]
  synchronizationPoints?: string[]
}

export interface RetryConfig {
  maxRetries: number
  backoffStrategy: "linear" | "exponential"
  retryConditions?: string[]
}

export interface LifecycleDefinition {
  states: string[]
  transitions: LifecycleTransition[]
  initialState: string
  finalStates: string[]
}

export interface LifecycleTransition {
  from: string
  to: string
  trigger: string
  conditions?: string[]
  actions?: string[]
}

// ============================================================================
// WORKFLOW STEP DEFINITION
// ============================================================================

export interface WorkflowStep {
  id: string
  name: string
  actor: string
  action: string
  inputs?: string[]
  outputs?: string[]
  conditions?: string[]
  timeout?: number
  retryConfig?: {
    maxRetries: number
    backoffDelay: number
  }
}

// ============================================================================
// CONTENT TYPE MAPPING (will be extended by specific artifact files)
// ============================================================================

export interface SOLArtifactContentMap {
  // Will be populated by specific artifact files
  [key: string]: any
}

// ============================================================================
// BASE SOL ARTIFACT INTERFACE
// ============================================================================

export interface SOLArtifact<T extends SOLArtifactType = SOLArtifactType> {
  // Core Properties
  type: T
  metadata: Metadata

  // Semantic Composition (v2025.07)
  uses?: SOLArtifactUses

  // Hierarchical Organization
  organizational?: SOLArtifactOrganizational

  // Semantic Relationships
  relationships?: SOLArtifactRelationships

  // Type-safe content based on artifact type
  content: T extends keyof SOLArtifactContentMap
    ? SOLArtifactContentMap[T]
    : Record<string, any>

  // Validation State
  isValid?: boolean
  validationErrors?: string[]
  lastValidated?: Date

  // Execution State
  isExecutable?: boolean
  executionStrategy?: string
  executionDependencies?: string[]
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ArtifactValidationRule = {
  name: string
  description: string
  validate: (artifact: SOLArtifact) => boolean
  errorMessage: string
}

export type ArtifactReference = {
  type: SOLArtifactType
  id: string
  resolved?: SOLArtifact
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTypedContent<T extends SOLArtifactType>(
  artifact: SOLArtifact<T>
): T extends keyof SOLArtifactContentMap
  ? SOLArtifactContentMap[T]
  : Record<string, any> {
  return artifact.content as any
}

export function createArtifact<T extends SOLArtifactType>(
  type: T,
  metadata: Metadata,
  content: T extends keyof SOLArtifactContentMap
    ? SOLArtifactContentMap[T]
    : Record<string, any>,
  options?: {
    uses?: SOLArtifactUses
    organizational?: SOLArtifactOrganizational
    relationships?: SOLArtifactRelationships
  }
): SOLArtifact<T> {
  return {
    type,
    metadata,
    content,
    uses: options?.uses,
    organizational: options?.organizational,
    relationships: options?.relationships,
    isValid: false,
    isExecutable: false,
  } as SOLArtifact<T>
}
