/**
 * SOL Artifact - Base interface for all SOL artifacts
 * Represents the foundation for all semantic artifacts in the system
 */

// Basic SOL types
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

export interface Intent {
  metadata: Metadata
  statement: string
  mode: "declare" | "require" | "propose" | "prohibit"
  priority: "low" | "medium" | "high" | "critical"
}

export interface Context {
  metadata: Metadata
  scope: string
  stakeholders: string[]
}

export interface Authority {
  metadata: Metadata
  role: string
  permissions: string[]
  jurisdiction: string[]
  isActive: boolean
  validUntil?: Date
}

export interface Evaluation {
  metadata: Metadata
  expected: string
  method: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | string
  criteria: EvaluationCriteria
}

export interface EvaluationCriteria {
  qualitative?: EvaluationQualitativeCriteria[]
  quantitative?: EvaluationQuantitativeCriteria[]
}

export interface EvaluationQualitativeCriteria {
  metric: string
  assessment: string
  threshold: string
  evaluatedBy: string // Actor:Id reference
  weight: number
}

export interface EvaluationQuantitativeCriteria {
  metric: string
  threshold: number
  measurement: string // Indicator:Id reference
  weight: number
  target: string
  baseline: number
}

export interface Actor {
  metadata: Metadata
  name: string
  description: string
  area: string // Area:Id reference
  level: "strategic" | "tactical" | "operational"
  type: "internal" | "external" | "system"
  responsibilities: string[]
  capabilities: string[]
}

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

export interface SOLArtifact {
  // Core Properties
  type: SOLArtifactType
  metadata: Metadata

  // Semantic Composition (v2025.07)
  uses?: SOLArtifactUses

  // Hierarchical Organization
  organizational?: SOLArtifactOrganizational

  // Semantic Relationships
  relationships?: SOLArtifactRelationships

  // Artifact-specific content (varies by type)
  content: Record<string, any>

  // Validation State
  isValid?: boolean
  validationErrors?: string[]
  lastValidated?: Date

  // Execution State
  isExecutable?: boolean
  executionStrategy?: string
  executionDependencies?: string[]
}

export interface FoundationalArtifact extends SOLArtifact {
  type: "Intent" | "Context" | "Authority" | "Evaluation"
  // Foundational artifacts don't use other artifacts
  uses?: never
}

export interface CompositeArtifact extends SOLArtifact {
  type: Exclude<
    SOLArtifactType,
    "Intent" | "Context" | "Authority" | "Evaluation"
  >
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
}

export interface StrategicArtifact extends CompositeArtifact {
  type:
    | "Vision"
    | "Policy"
    | "Concept"
    | "Principle"
    | "Guideline"
    | "Indicator"
  organizational: Required<SOLArtifactOrganizational> & {
    level: "strategic"
  }
}

export interface OperationalArtifact extends CompositeArtifact {
  type: "Process" | "Procedure" | "Event" | "Result" | "Observation"
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  }
  // Operational artifacts have flow and lifecycle
  flow?: FlowDefinition
  lifecycle?: LifecycleDefinition
}

export interface OrganizationalArtifact extends CompositeArtifact {
  type: "Actor" | "Area"
  organizational: Required<SOLArtifactOrganizational>
}

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

// Utility type for artifact validation
export type ArtifactValidationRule = {
  name: string
  description: string
  validate: (artifact: SOLArtifact) => boolean
  errorMessage: string
}

// Utility type for artifact resolution
export type ArtifactReference = {
  type: SOLArtifactType
  id: string
  resolved?: SOLArtifact
}

// Type guards
export function isFoundationalArtifact(
  artifact: SOLArtifact
): artifact is FoundationalArtifact {
  return ["Intent", "Context", "Authority", "Evaluation"].includes(
    artifact.type
  )
}

export function isCompositeArtifact(
  artifact: SOLArtifact
): artifact is CompositeArtifact {
  return !isFoundationalArtifact(artifact)
}

export function isStrategicArtifact(
  artifact: SOLArtifact
): artifact is StrategicArtifact {
  return [
    "Vision",
    "Policy",
    "Concept",
    "Principle",
    "Guideline",
    "Indicator",
  ].includes(artifact.type)
}

export function isOperationalArtifact(
  artifact: SOLArtifact
): artifact is OperationalArtifact {
  return ["Process", "Procedure", "Event", "Result", "Observation"].includes(
    artifact.type
  )
}

export function isOrganizationalArtifact(
  artifact: SOLArtifact
): artifact is OrganizationalArtifact {
  return ["Actor", "Area"].includes(artifact.type)
}
