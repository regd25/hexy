/**
 * Semantic Decision Framework Types
 * Types and interfaces for structured semantic decision making
 */

import { SOLArtifact } from "../artifacts"
import { ExecutionContext } from "../context/ExecutionContext"
import { ValidationResult } from "../types/Result"

export type DecisionType =
  | "approval"
  | "rejection"
  | "escalation"
  | "delegation"
  | "conditional-approval"
  | "information-request"
  | "policy-enforcement"

export type PolicyCategory =
  | "authority-validation"
  | "business-rules"
  | "security-compliance"
  | "operational-workflow"
  | "quality-assurance"
  | "resource-allocation"
  | "escalation-management"

export type ConditionOperator =
  | "equals"
  | "not-equals"
  | "greater-than"
  | "less-than"
  | "contains"
  | "not-contains"
  | "matches-pattern"
  | "in-range"
  | "exists"
  | "not-exists"

export interface SemanticCondition {
  id: string
  field: string
  operator: ConditionOperator
  value: any
  description: string
  weight?: number
}

export interface SemanticAction {
  id: string
  type: string
  parameters: Record<string, any>
  description: string
  priority: number
  timeout?: number
  retryPolicy?: RetryPolicy
}

export interface RetryPolicy {
  maxAttempts: number
  backoffStrategy: "linear" | "exponential"
  initialDelay: number
  maxDelay: number
}

export interface SemanticPolicy {
  id: string
  name: string
  description: string
  category: PolicyCategory
  version: string
  enabled: boolean
  priority: number
  conditions: SemanticCondition[]
  actions: SemanticAction[]
  metadata?: Record<string, any>
  validFrom?: Date
  validUntil?: Date
}

export interface SemanticContext {
  artifact: SOLArtifact
  executionContext?: ExecutionContext
  validationResult?: ValidationResult
  userContext?: UserContext
  organizationalContext?: OrganizationalContext
  temporalContext?: TemporalContext
  metadata: Record<string, any>
}

export interface UserContext {
  userId: string
  roles: string[]
  authorities: AuthorityLevel[]
  department: string
  supervisor?: string
  permissions: string[]
}

export interface AuthorityLevel {
  domain: string
  level: number
  scope: string[]
  constraints?: Record<string, any>
}

export interface OrganizationalContext {
  department: string
  businessUnit: string
  region: string
  policies: string[]
  hierarchy: OrganizationalHierarchy
}

export interface OrganizationalHierarchy {
  currentLevel: number
  reportingChain: string[]
  approvalLimits: Record<string, number>
  escalationPaths: Record<string, string[]>
}

export interface TemporalContext {
  timestamp: Date
  businessHours: boolean
  timezone: string
  urgency: "low" | "medium" | "high" | "critical"
  deadline?: Date
}

export interface DecisionStep {
  id: string
  timestamp: Date
  stepType: "evaluation" | "condition-check" | "action-execution" | "escalation"
  description: string
  input: any
  output: any
  duration: number
  metadata?: Record<string, any>
}

export interface SemanticDecision {
  id: string
  type: DecisionType
  confidence: number
  reasoning: string[]
  policies: string[]
  conditions: SemanticCondition[]
  actions: SemanticAction[]
  alternatives?: SemanticDecision[]
  auditTrail: DecisionStep[]
  metadata: DecisionMetadata
  timestamp: Date
  executedBy: string
}

export interface DecisionMetadata {
  contextHash: string
  policyVersions: Record<string, string>
  executionTime: number
  complexity: "simple" | "moderate" | "complex"
  riskLevel: "low" | "medium" | "high" | "critical"
  reviewRequired: boolean
  escalationTriggered: boolean
}

export interface DecisionEvaluationResult {
  matched: boolean
  confidence: number
  reasoning: string[]
  conditions: ConditionEvaluationResult[]
  metadata?: Record<string, any>
}

export interface ConditionEvaluationResult {
  condition: SemanticCondition
  matched: boolean
  actualValue: any
  expectedValue: any
  confidence: number
  reasoning: string
}

export interface PolicyEvaluationResult {
  policy: SemanticPolicy
  applicable: boolean
  evaluation: DecisionEvaluationResult
  decision?: SemanticDecision
  executionTime: number
}

export interface ConflictResolution {
  conflictingPolicies: string[]
  resolutionStrategy: "priority" | "consensus" | "user-choice" | "escalation"
  resolvedDecision: SemanticDecision
  reasoning: string[]
}

export interface DecisionFrameworkConfig {
  enabledCategories: PolicyCategory[]
  defaultTimeout: number
  maxConcurrentEvaluations: number
  requireExplicitApproval: boolean
  auditLevel: "minimal" | "standard" | "comprehensive"
  conflictResolutionStrategy: "priority" | "consensus" | "escalation"
  cacheEnabled: boolean
  cacheTTL: number
}

export interface DecisionMetrics {
  policyId: string
  executionCount: number
  averageExecutionTime: number
  successRate: number
  conflictRate: number
  escalationRate: number
  lastExecuted: Date
  averageConfidence: number
}
