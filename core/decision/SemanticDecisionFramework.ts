/**
 * Semantic Decision Framework
 * Main engine for structured semantic decision making
 * Follows SOLID principles and framework conventions
 */

import { SOLArtifact } from "../artifacts"
import { ExecutionContext } from "../context/ExecutionContext"
import { ValidationResult } from "../types/Result"
import { ConditionEvaluator } from "./ConditionEvaluator"
import {
  SemanticDecision,
  SemanticPolicy,
  SemanticContext,
  DecisionType,
  PolicyCategory,
  DecisionFrameworkConfig,
  DecisionMetrics,
  PolicyEvaluationResult,
  ConflictResolution,
  DecisionEvaluationResult,
  DecisionStep,
  DecisionMetadata,
  UserContext,
  OrganizationalContext,
  TemporalContext,
} from "./types"

export interface SemanticDecisionFrameworkInterface {
  /**
   * Register a semantic policy
   */
  registerPolicy(policy: SemanticPolicy): void

  /**
   * Make a decision based on semantic context
   */
  makeDecision(context: SemanticContext): Promise<SemanticDecision>

  /**
   * Evaluate a specific policy against context
   */
  evaluatePolicy(
    policy: SemanticPolicy,
    context: SemanticContext
  ): Promise<PolicyEvaluationResult>

  /**
   * Resolve conflicts between multiple applicable policies
   */
  resolveConflicts(
    conflictingResults: PolicyEvaluationResult[]
  ): Promise<ConflictResolution>

  /**
   * Get all registered policies
   */
  getPolicies(): SemanticPolicy[]

  /**
   * Get policies by category
   */
  getPoliciesByCategory(category: PolicyCategory): SemanticPolicy[]

  /**
   * Get decision metrics
   */
  getDecisionMetrics(): DecisionMetrics[]
}

export class SemanticDecisionFramework
  implements SemanticDecisionFrameworkInterface
{
  private policies = new Map<string, SemanticPolicy>()
  private conditionEvaluator = new ConditionEvaluator()
  private decisionMetrics = new Map<string, DecisionMetrics>()
  private config: DecisionFrameworkConfig

  constructor(config: Partial<DecisionFrameworkConfig> = {}) {
    this.config = {
      enabledCategories: [
        "authority-validation",
        "business-rules",
        "security-compliance",
        "operational-workflow",
        "quality-assurance",
        "resource-allocation",
        "escalation-management",
      ],
      defaultTimeout: 10000,
      maxConcurrentEvaluations: 5,
      requireExplicitApproval: false,
      auditLevel: "standard",
      conflictResolutionStrategy: "priority",
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      ...config,
    }
  }

  registerPolicy(policy: SemanticPolicy): void {
    if (this.policies.has(policy.id)) {
      throw new Error(`Policy '${policy.id}' is already registered`)
    }

    // Validate policy
    this.validatePolicy(policy)

    this.policies.set(policy.id, policy)

    // Initialize metrics
    this.decisionMetrics.set(policy.id, {
      policyId: policy.id,
      executionCount: 0,
      averageExecutionTime: 0,
      successRate: 0,
      conflictRate: 0,
      escalationRate: 0,
      lastExecuted: new Date(),
      averageConfidence: 0,
    })
  }

  async makeDecision(context: SemanticContext): Promise<SemanticDecision> {
    const auditTrail: DecisionStep[] = []

    try {
      // Step 1: Find applicable policies
      auditTrail.push(
        this.createDecisionStep(
          "evaluation",
          "Finding applicable policies",
          context,
          null
        )
      )

      const applicablePolicies = this.findApplicablePolicies(context)

      if (applicablePolicies.length === 0) {
        return this.createDefaultDecision(
          context,
          auditTrail,
          "No applicable policies found"
        )
      }

      // Step 2: Evaluate policies
      auditTrail.push(
        this.createDecisionStep(
          "evaluation",
          "Evaluating policies",
          { count: applicablePolicies.length },
          null
        )
      )

      const evaluationResults = await this.evaluatePolicies(
        applicablePolicies,
        context
      )

      // Step 3: Handle conflicts if any
      const applicableResults = evaluationResults.filter(
        (result) => result.applicable && result.evaluation.matched
      )

      if (applicableResults.length === 0) {
        return this.createDefaultDecision(
          context,
          auditTrail,
          "No policies matched conditions"
        )
      }

      if (applicableResults.length === 1) {
        // Single policy - create decision
        const result = applicableResults[0]
        return this.createDecisionFromPolicy(result, context, auditTrail)
      }

      // Multiple policies - resolve conflicts
      auditTrail.push(
        this.createDecisionStep(
          "evaluation",
          "Resolving policy conflicts",
          { conflicts: applicableResults.length },
          null
        )
      )

      const conflictResolution = await this.resolveConflicts(applicableResults)

      auditTrail.push(
        this.createDecisionStep(
          "evaluation",
          "Conflict resolved",
          conflictResolution,
          conflictResolution.resolvedDecision
        )
      )

      return {
        ...conflictResolution.resolvedDecision,
        auditTrail: [
          ...auditTrail,
          ...conflictResolution.resolvedDecision.auditTrail,
        ],
      }
    } catch (error) {
      auditTrail.push(
        this.createDecisionStep(
          "evaluation",
          "Decision failed",
          { error: error instanceof Error ? error.message : "Unknown error" },
          null
        )
      )

      return this.createErrorDecision(
        context,
        auditTrail,
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }

  async evaluatePolicy(
    policy: SemanticPolicy,
    context: SemanticContext
  ): Promise<PolicyEvaluationResult> {
    const startTime = Date.now()

    try {
      // Check if policy is applicable to this context
      const applicable = this.isPolicyApplicable(policy, context)

      if (!applicable) {
        return {
          policy,
          applicable: false,
          evaluation: {
            matched: false,
            confidence: 0,
            reasoning: ["Policy not applicable to current context"],
            conditions: [],
          },
          executionTime: Date.now() - startTime,
        }
      }

      // Evaluate conditions
      const conditionResults = await this.conditionEvaluator.evaluateConditions(
        policy.conditions,
        context
      )

      const matched = this.conditionEvaluator.allConditionsMet(conditionResults)
      const confidence =
        this.conditionEvaluator.calculateWeightedConfidence(conditionResults)

      const reasoning = this.generatePolicyReasoning(
        policy,
        conditionResults,
        matched
      )

      // Update metrics
      this.updatePolicyMetrics(
        policy.id,
        Date.now() - startTime,
        matched,
        confidence
      )

      const evaluation: DecisionEvaluationResult = {
        matched,
        confidence,
        reasoning,
        conditions: conditionResults,
        metadata: {
          executionTime: Date.now() - startTime,
          conditionsEvaluated: conditionResults.length,
        },
      }

      return {
        policy,
        applicable: true,
        evaluation,
        executionTime: Date.now() - startTime,
      }
    } catch (error) {
      this.updatePolicyMetrics(policy.id, Date.now() - startTime, false, 0)

      return {
        policy,
        applicable: true,
        evaluation: {
          matched: false,
          confidence: 0,
          reasoning: [
            `Policy evaluation failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          ],
          conditions: [],
        },
        executionTime: Date.now() - startTime,
      }
    }
  }

  async resolveConflicts(
    conflictingResults: PolicyEvaluationResult[]
  ): Promise<ConflictResolution> {
    const conflictingPolicies = conflictingResults.map((r) => r.policy.id)

    switch (this.config.conflictResolutionStrategy) {
      case "priority":
        return this.resolvePriorityConflict(conflictingResults)

      case "consensus":
        return this.resolveConsensusConflict(conflictingResults)

      case "escalation":
        return this.resolveEscalationConflict(conflictingResults)

      default:
        throw new Error(
          `Unknown conflict resolution strategy: ${this.config.conflictResolutionStrategy}`
        )
    }
  }

  getPolicies(): SemanticPolicy[] {
    return Array.from(this.policies.values()).filter((policy) => policy.enabled)
  }

  getPoliciesByCategory(category: PolicyCategory): SemanticPolicy[] {
    return this.getPolicies().filter((policy) => policy.category === category)
  }

  getDecisionMetrics(): DecisionMetrics[] {
    return Array.from(this.decisionMetrics.values())
  }

  /**
   * Create semantic context from artifact and execution context
   */
  createSemanticContext(
    artifact: SOLArtifact,
    executionContext?: ExecutionContext,
    validationResult?: ValidationResult,
    userContext?: UserContext,
    organizationalContext?: OrganizationalContext
  ): SemanticContext {
    const temporalContext: TemporalContext = {
      timestamp: new Date(),
      businessHours: this.isBusinessHours(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      urgency: this.determineUrgency(artifact, validationResult),
    }

    return {
      artifact,
      executionContext,
      validationResult,
      userContext,
      organizationalContext,
      temporalContext,
      metadata: {
        contextCreated: new Date().toISOString(),
        frameworkVersion: "1.0.0",
      },
    }
  }

  private validatePolicy(policy: SemanticPolicy): void {
    if (!policy.id || !policy.name || !policy.category) {
      throw new Error("Policy must have id, name, and category")
    }

    if (!this.config.enabledCategories.includes(policy.category)) {
      throw new Error(`Policy category '${policy.category}' is not enabled`)
    }

    if (policy.conditions.length === 0) {
      throw new Error("Policy must have at least one condition")
    }

    if (policy.actions.length === 0) {
      throw new Error("Policy must have at least one action")
    }
  }

  private findApplicablePolicies(context: SemanticContext): SemanticPolicy[] {
    return this.getPolicies()
      .filter((policy) => this.isPolicyApplicable(policy, context))
      .sort((a, b) => b.priority - a.priority) // Higher priority first
  }

  private isPolicyApplicable(
    policy: SemanticPolicy,
    context: SemanticContext
  ): boolean {
    // Check if policy is enabled
    if (!policy.enabled) return false

    // Check category enablement
    if (!this.config.enabledCategories.includes(policy.category)) return false

    // Check validity period
    const now = new Date()
    if (policy.validFrom && now < policy.validFrom) return false
    if (policy.validUntil && now > policy.validUntil) return false

    // Additional context-specific checks can be added here
    return true
  }

  private async evaluatePolicies(
    policies: SemanticPolicy[],
    context: SemanticContext
  ): Promise<PolicyEvaluationResult[]> {
    // Evaluate policies in chunks to respect concurrency limits
    const results: PolicyEvaluationResult[] = []
    const chunkSize = this.config.maxConcurrentEvaluations

    for (let i = 0; i < policies.length; i += chunkSize) {
      const chunk = policies.slice(i, i + chunkSize)
      const chunkResults = await Promise.all(
        chunk.map((policy) => this.evaluatePolicy(policy, context))
      )
      results.push(...chunkResults)
    }

    return results
  }

  private resolvePriorityConflict(
    conflictingResults: PolicyEvaluationResult[]
  ): ConflictResolution {
    // Sort by priority (highest first), then by confidence
    const sorted = conflictingResults.sort((a, b) => {
      const priorityDiff = b.policy.priority - a.policy.priority
      if (priorityDiff !== 0) return priorityDiff
      return b.evaluation.confidence - a.evaluation.confidence
    })

    const winner = sorted[0]
    const decision = this.createDecisionFromPolicyResult(winner)

    return {
      conflictingPolicies: conflictingResults.map((r) => r.policy.id),
      resolutionStrategy: "priority",
      resolvedDecision: decision,
      reasoning: [
        `Resolved by priority: Policy '${winner.policy.id}' (priority: ${winner.policy.priority}) selected`,
        `Conflicts with: ${sorted
          .slice(1)
          .map((r) => `${r.policy.id} (priority: ${r.policy.priority})`)
          .join(", ")}`,
      ],
    }
  }

  private resolveConsensusConflict(
    conflictingResults: PolicyEvaluationResult[]
  ): ConflictResolution {
    // Find common actions across policies
    const allActions = conflictingResults.flatMap((r) => r.policy.actions)
    const actionCounts = new Map<string, number>()

    allActions.forEach((action) => {
      actionCounts.set(action.type, (actionCounts.get(action.type) || 0) + 1)
    })

    // Create consensus decision
    const consensusActions = Array.from(actionCounts.entries())
      .filter(([, count]) => count > conflictingResults.length / 2)
      .map(
        ([actionType]) =>
          allActions.find((action) => action.type === actionType)!
      )

    const decision = this.createConsensusDecision(
      conflictingResults,
      consensusActions
    )

    return {
      conflictingPolicies: conflictingResults.map((r) => r.policy.id),
      resolutionStrategy: "consensus",
      resolvedDecision: decision,
      reasoning: [
        `Resolved by consensus: ${consensusActions.length} common actions found`,
        `Participating policies: ${conflictingResults
          .map((r) => r.policy.id)
          .join(", ")}`,
      ],
    }
  }

  private resolveEscalationConflict(
    conflictingResults: PolicyEvaluationResult[]
  ): ConflictResolution {
    const decision = this.createEscalationDecision(conflictingResults)

    return {
      conflictingPolicies: conflictingResults.map((r) => r.policy.id),
      resolutionStrategy: "escalation",
      resolvedDecision: decision,
      reasoning: [
        `Escalated due to policy conflicts`,
        `Conflicting policies: ${conflictingResults
          .map((r) => r.policy.id)
          .join(", ")}`,
        `Manual resolution required`,
      ],
    }
  }

  private createDecisionFromPolicy(
    result: PolicyEvaluationResult,
    context: SemanticContext,
    auditTrail: DecisionStep[]
  ): SemanticDecision {
    const decisionType = this.determineDecisionType(result.policy.actions)

    const metadata: DecisionMetadata = {
      contextHash: this.generateContextHash(context),
      policyVersions: { [result.policy.id]: result.policy.version },
      executionTime: result.executionTime,
      complexity: this.determineComplexity(result.policy),
      riskLevel: this.determineRiskLevel(result.policy, context),
      reviewRequired: this.requiresReview(result.policy, context),
      escalationTriggered: decisionType === "escalation",
    }

    return {
      id: this.generateDecisionId(),
      type: decisionType,
      confidence: result.evaluation.confidence,
      reasoning: result.evaluation.reasoning,
      policies: [result.policy.id],
      conditions: result.policy.conditions,
      actions: result.policy.actions,
      auditTrail,
      metadata,
      timestamp: new Date(),
      executedBy: "semantic-decision-framework",
    }
  }

  private createDecisionFromPolicyResult(
    result: PolicyEvaluationResult
  ): SemanticDecision {
    return this.createDecisionFromPolicy(result, {} as SemanticContext, [])
  }

  private createConsensusDecision(
    results: PolicyEvaluationResult[],
    actions: any[]
  ): SemanticDecision {
    const avgConfidence =
      results.reduce((sum, r) => sum + r.evaluation.confidence, 0) /
      results.length

    return {
      id: this.generateDecisionId(),
      type: "conditional-approval",
      confidence: avgConfidence,
      reasoning: ["Consensus decision from multiple policies"],
      policies: results.map((r) => r.policy.id),
      conditions: [],
      actions,
      auditTrail: [],
      metadata: {
        contextHash: "",
        policyVersions: {},
        executionTime: 0,
        complexity: "moderate",
        riskLevel: "medium",
        reviewRequired: true,
        escalationTriggered: false,
      },
      timestamp: new Date(),
      executedBy: "semantic-decision-framework",
    }
  }

  private createEscalationDecision(
    results: PolicyEvaluationResult[]
  ): SemanticDecision {
    return {
      id: this.generateDecisionId(),
      type: "escalation",
      confidence: 0.5,
      reasoning: ["Multiple conflicting policies require manual resolution"],
      policies: results.map((r) => r.policy.id),
      conditions: [],
      actions: [
        {
          id: "escalate",
          type: "escalation",
          parameters: {
            reason: "policy-conflict",
            conflictingPolicies: results.map((r) => r.policy.id),
          },
          description: "Escalate for manual resolution",
          priority: 1,
        },
      ],
      auditTrail: [],
      metadata: {
        contextHash: "",
        policyVersions: {},
        executionTime: 0,
        complexity: "complex",
        riskLevel: "high",
        reviewRequired: true,
        escalationTriggered: true,
      },
      timestamp: new Date(),
      executedBy: "semantic-decision-framework",
    }
  }

  private createDefaultDecision(
    context: SemanticContext,
    auditTrail: DecisionStep[],
    reason: string
  ): SemanticDecision {
    return {
      id: this.generateDecisionId(),
      type: "information-request",
      confidence: 0.1,
      reasoning: [reason, "No applicable policies found"],
      policies: [],
      conditions: [],
      actions: [
        {
          id: "no-action",
          type: "no-action",
          parameters: { reason },
          description: "No action taken - insufficient policy coverage",
          priority: 1,
        },
      ],
      auditTrail,
      metadata: {
        contextHash: this.generateContextHash(context),
        policyVersions: {},
        executionTime: 0,
        complexity: "simple",
        riskLevel: "low",
        reviewRequired: false,
        escalationTriggered: false,
      },
      timestamp: new Date(),
      executedBy: "semantic-decision-framework",
    }
  }

  private createErrorDecision(
    context: SemanticContext,
    auditTrail: DecisionStep[],
    error: string
  ): SemanticDecision {
    return {
      id: this.generateDecisionId(),
      type: "rejection",
      confidence: 0,
      reasoning: [`Decision failed: ${error}`],
      policies: [],
      conditions: [],
      actions: [
        {
          id: "error-action",
          type: "error",
          parameters: { error },
          description: "Error occurred during decision making",
          priority: 1,
        },
      ],
      auditTrail,
      metadata: {
        contextHash: this.generateContextHash(context),
        policyVersions: {},
        executionTime: 0,
        complexity: "simple",
        riskLevel: "critical",
        reviewRequired: true,
        escalationTriggered: true,
      },
      timestamp: new Date(),
      executedBy: "semantic-decision-framework",
    }
  }

  private createDecisionStep(
    stepType: DecisionStep["stepType"],
    description: string,
    input: any,
    output: any
  ): DecisionStep {
    return {
      id: this.generateStepId(),
      timestamp: new Date(),
      stepType,
      description,
      input,
      output,
      duration: 0,
    }
  }

  private generatePolicyReasoning(
    policy: SemanticPolicy,
    conditionResults: any[],
    matched: boolean
  ): string[] {
    const reasoning = [`Policy '${policy.name}' evaluation:`]

    conditionResults.forEach((result) => {
      reasoning.push(`  - ${result.reasoning}`)
    })

    reasoning.push(
      `Result: ${matched ? "All conditions met" : "Some conditions failed"}`
    )

    return reasoning
  }

  private updatePolicyMetrics(
    policyId: string,
    executionTime: number,
    success: boolean,
    confidence: number
  ): void {
    const metrics = this.decisionMetrics.get(policyId)
    if (!metrics) return

    metrics.executionCount++
    metrics.averageExecutionTime =
      (metrics.averageExecutionTime * (metrics.executionCount - 1) +
        executionTime) /
      metrics.executionCount
    metrics.lastExecuted = new Date()

    if (success) {
      metrics.successRate =
        (metrics.successRate * (metrics.executionCount - 1) + 1) /
        metrics.executionCount
    } else {
      metrics.successRate =
        (metrics.successRate * (metrics.executionCount - 1)) /
        metrics.executionCount
    }

    metrics.averageConfidence =
      (metrics.averageConfidence * (metrics.executionCount - 1) + confidence) /
      metrics.executionCount
  }

  private determineDecisionType(actions: any[]): DecisionType {
    const actionTypes = actions.map((action) => action.type)

    if (actionTypes.includes("approve")) return "approval"
    if (actionTypes.includes("reject")) return "rejection"
    if (actionTypes.includes("escalate")) return "escalation"
    if (actionTypes.includes("delegate")) return "delegation"
    if (actionTypes.includes("conditional")) return "conditional-approval"

    return "information-request"
  }

  private determineComplexity(
    policy: SemanticPolicy
  ): "simple" | "moderate" | "complex" {
    const conditionCount = policy.conditions.length
    const actionCount = policy.actions.length

    if (conditionCount <= 2 && actionCount <= 2) return "simple"
    if (conditionCount <= 5 && actionCount <= 5) return "moderate"
    return "complex"
  }

  private determineRiskLevel(
    policy: SemanticPolicy,
    context: SemanticContext
  ): "low" | "medium" | "high" | "critical" {
    // Risk assessment based on policy category and context
    if (policy.category === "security-compliance") return "high"
    if (policy.category === "authority-validation") return "medium"
    return "low"
  }

  private requiresReview(
    policy: SemanticPolicy,
    context: SemanticContext
  ): boolean {
    return (
      policy.category === "security-compliance" ||
      this.config.requireExplicitApproval
    )
  }

  private generateContextHash(context: SemanticContext): string {
    // Simple hash of context for tracking
    const contextString = JSON.stringify({
      artifactId: context.artifact.metadata.id,
      artifactType: context.artifact.type,
      timestamp: context.temporalContext?.timestamp.getTime(),
    })
    return btoa(contextString).substring(0, 16)
  }

  private generateDecisionId(): string {
    return `decision_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`
  }

  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private isBusinessHours(): boolean {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17
  }

  private determineUrgency(
    artifact: SOLArtifact,
    validationResult?: ValidationResult
  ): "low" | "medium" | "high" | "critical" {
    if (validationResult?.errors.some((e) => e.severity === "critical")) {
      return "critical"
    }
    if (artifact.type === "Intent" && artifact.content.includes("urgent")) {
      return "high"
    }
    return "medium"
  }
}
