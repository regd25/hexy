/**
 * Foundational Artifacts - Core SOL artifacts that don't depend on others
 * Contains Intent, Context, Authority, and Evaluation artifacts
 */

import { SOLArtifact, Metadata } from "./BaseArtifact"

// ============================================================================
// FOUNDATIONAL ARTIFACT CONTENT SCHEMAS
// ============================================================================

export interface IntentContent {
  statement: string
  mode: "declare" | "require" | "propose" | "prohibit"
  priority: "low" | "medium" | "high" | "critical"
  actor?: string
  target?: string
  action?: string
  conditions?: string[]
  timeout?: number
  retryPolicy?: {
    maxRetries: number
    backoffDelay: number
  }
}

export interface ContextContent {
  scope: string
  stakeholders: string[]
  boundaries?: string[]
  constraints?: string[]
  environment?: Record<string, any>
}

export interface AuthorityContent {
  role: string
  permissions: string[]
  jurisdiction: string[]
  isActive: boolean
  validUntil?: Date
  delegationRules?: string[]
  escalationPath?: string[]
}

export interface EvaluationContent {
  expected: string
  method: string
  frequency:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "yearly"
    | "on-demand"
    | string
  criteria: EvaluationCriteria
  expression?: string
  variables?: Record<string, any>
  operators?: string[]
  expectedResult?: boolean
  severity?: "info" | "warning" | "error" | "critical"
  timeout?: number
  dependencies?: string[]
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

// ============================================================================
// FOUNDATIONAL ARTIFACT INTERFACES
// ============================================================================

export interface IntentArtifact extends SOLArtifact<"Intent"> {
  type: "Intent"
  content: IntentContent
  // Foundational artifacts don't use other artifacts
  uses?: never
}

export interface ContextArtifact extends SOLArtifact<"Context"> {
  type: "Context"
  content: ContextContent
  // Foundational artifacts don't use other artifacts
  uses?: never
}

export interface AuthorityArtifact extends SOLArtifact<"Authority"> {
  type: "Authority"
  content: AuthorityContent
  // Foundational artifacts don't use other artifacts
  uses?: never
}

export interface EvaluationArtifact extends SOLArtifact<"Evaluation"> {
  type: "Evaluation"
  content: EvaluationContent
  // Foundational artifacts don't use other artifacts
  uses?: never
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isIntentArtifact(
  artifact: SOLArtifact
): artifact is IntentArtifact {
  return artifact.type === "Intent"
}

export function isContextArtifact(
  artifact: SOLArtifact
): artifact is ContextArtifact {
  return artifact.type === "Context"
}

export function isAuthorityArtifact(
  artifact: SOLArtifact
): artifact is AuthorityArtifact {
  return artifact.type === "Authority"
}

export function isEvaluationArtifact(
  artifact: SOLArtifact
): artifact is EvaluationArtifact {
  return artifact.type === "Evaluation"
}

export function isFoundationalArtifact(
  artifact: SOLArtifact
): artifact is
  | IntentArtifact
  | ContextArtifact
  | AuthorityArtifact
  | EvaluationArtifact {
  return ["Intent", "Context", "Authority", "Evaluation"].includes(
    artifact.type
  )
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createIntentArtifact(
  metadata: Metadata,
  content: IntentContent
): IntentArtifact {
  return {
    type: "Intent",
    metadata,
    content,
    isValid: false,
    isExecutable: true,
  }
}

export function createContextArtifact(
  metadata: Metadata,
  content: ContextContent
): ContextArtifact {
  return {
    type: "Context",
    metadata,
    content,
    isValid: false,
    isExecutable: false,
  }
}

export function createAuthorityArtifact(
  metadata: Metadata,
  content: AuthorityContent
): AuthorityArtifact {
  return {
    type: "Authority",
    metadata,
    content,
    isValid: false,
    isExecutable: false,
  }
}

export function createEvaluationArtifact(
  metadata: Metadata,
  content: EvaluationContent
): EvaluationArtifact {
  return {
    type: "Evaluation",
    metadata,
    content,
    isValid: false,
    isExecutable: true,
  }
}

// ============================================================================
// CONTENT TYPE MAPPING EXTENSION
// ============================================================================

declare module "./BaseArtifact" {
  interface SOLArtifactContentMap {
    Intent: IntentContent
    Context: ContextContent
    Authority: AuthorityContent
    Evaluation: EvaluationContent
  }
}
