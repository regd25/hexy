/**
 * Semantic Decision Framework
 * Main exports and factory functions
 */

// Core framework exports
export { SemanticDecisionFramework } from "./SemanticDecisionFramework"
export type { SemanticDecisionFrameworkInterface } from "./SemanticDecisionFramework"
export { ConditionEvaluator } from "./ConditionEvaluator"

// Types exports
export * from "./types"

// Example policies
export * from "./policies/ExamplePolicies"

// Factory function for creating a configured decision framework
export function createSemanticDecisionFramework(
  config?: Partial<import("./types").DecisionFrameworkConfig>
): SemanticDecisionFramework {
  return new SemanticDecisionFramework(config)
}

// Factory function with example policies pre-loaded
export function createSemanticDecisionFrameworkWithExamples(
  config?: Partial<import("./types").DecisionFrameworkConfig>
): SemanticDecisionFramework {
  const framework = new SemanticDecisionFramework(config)

  // Register example policies
  const { EXAMPLE_POLICIES } = require("./policies/ExamplePolicies")
  EXAMPLE_POLICIES.forEach((policy: import("./types").SemanticPolicy) => {
    framework.registerPolicy(policy)
  })

  return framework
}

// Utility functions
export function createUserContext(
  userId: string,
  roles: string[],
  department: string,
  authorities?: import("./types").AuthorityLevel[]
): import("./types").UserContext {
  return {
    userId,
    roles,
    authorities: authorities || [],
    department,
    permissions: roles, // Simple mapping for demo
  }
}

export function createOrganizationalContext(
  department: string,
  businessUnit: string,
  region: string = "default"
): import("./types").OrganizationalContext {
  return {
    department,
    businessUnit,
    region,
    policies: [],
    hierarchy: {
      currentLevel: 1,
      reportingChain: [],
      approvalLimits: {},
      escalationPaths: {},
    },
  }
}

// Helper for creating simple semantic conditions
export function createCondition(
  id: string,
  field: string,
  operator: import("./types").ConditionOperator,
  value: any,
  description: string,
  weight: number = 1.0
): import("./types").SemanticCondition {
  return {
    id,
    field,
    operator,
    value,
    description,
    weight,
  }
}

// Helper for creating semantic actions
export function createAction(
  id: string,
  type: string,
  description: string,
  parameters: Record<string, any> = {},
  priority: number = 1
): import("./types").SemanticAction {
  return {
    id,
    type,
    parameters,
    description,
    priority,
  }
}

// Helper for creating semantic policies
export function createPolicy(
  id: string,
  name: string,
  description: string,
  category: import("./types").PolicyCategory,
  conditions: import("./types").SemanticCondition[],
  actions: import("./types").SemanticAction[],
  priority: number = 50,
  version: string = "1.0.0"
): import("./types").SemanticPolicy {
  return {
    id,
    name,
    description,
    category,
    version,
    enabled: true,
    priority,
    conditions,
    actions,
  }
}

// Decision framework utilities
export class DecisionFrameworkUtils {
  /**
   * Create a complete semantic context for testing
   */
  static createTestContext(
    artifact: import("../artifacts").SOLArtifact,
    userRole: string = "user",
    department: string = "default",
    businessHours: boolean = true
  ): import("./types").SemanticContext {
    const userContext = createUserContext("test-user", [userRole], department)

    const organizationalContext = createOrganizationalContext(
      department,
      "test-unit"
    )

    const temporalContext: import("./types").TemporalContext = {
      timestamp: new Date(),
      businessHours,
      timezone: "UTC",
      urgency: "medium",
    }

    return {
      artifact,
      userContext,
      organizationalContext,
      temporalContext,
      metadata: {
        testContext: true,
        createdAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Analyze decision outcome
   */
  static analyzeDecision(decision: import("./types").SemanticDecision): {
    summary: string
    riskLevel: string
    recommendedActions: string[]
    auditPoints: string[]
  } {
    const summary = `Decision ${decision.id}: ${
      decision.type
    } with ${Math.round(decision.confidence * 100)}% confidence`

    const riskLevel = decision.metadata.riskLevel

    const recommendedActions = decision.actions.map(
      (action) => `${action.type}: ${action.description}`
    )

    const auditPoints = decision.auditTrail.map(
      (step) => `${step.stepType}: ${step.description}`
    )

    return {
      summary,
      riskLevel,
      recommendedActions,
      auditPoints,
    }
  }

  /**
   * Validate decision framework health
   */
  static validateFrameworkHealth(framework: SemanticDecisionFramework): {
    healthy: boolean
    issues: string[]
    metrics: any
  } {
    const issues: string[] = []
    const policies = framework.getPolicies()
    const metrics = framework.getDecisionMetrics()

    if (policies.length === 0) {
      issues.push("No policies registered")
    }

    const enabledPolicies = policies.filter((p) => p.enabled)
    if (enabledPolicies.length < policies.length) {
      issues.push(
        `${policies.length - enabledPolicies.length} policies disabled`
      )
    }

    const categoryCoverage = new Set(policies.map((p) => p.category))
    if (categoryCoverage.size < 3) {
      issues.push("Limited policy category coverage")
    }

    return {
      healthy: issues.length === 0,
      issues,
      metrics: {
        totalPolicies: policies.length,
        enabledPolicies: enabledPolicies.length,
        categoriesCovered: categoryCoverage.size,
        metricsCollected: metrics.length,
      },
    }
  }
}

// Constants for common use cases
export const COMMON_CONDITIONS = {
  BUSINESS_HOURS: createCondition(
    "business-hours",
    "temporalContext.businessHours",
    "equals",
    true,
    "During business hours"
  ),
  HIGH_URGENCY: createCondition(
    "high-urgency",
    "temporalContext.urgency",
    "in-range",
    ["high", "critical"],
    "High or critical urgency"
  ),
  MANAGER_AUTHORITY: createCondition(
    "manager-auth",
    "userContext.roles",
    "contains",
    "manager",
    "User has manager role"
  ),
  GOOD_VALIDATION_SCORE: createCondition(
    "good-validation",
    "validationResult.score",
    "greater-than",
    75,
    "Validation score above 75"
  ),
}

export const COMMON_ACTIONS = {
  APPROVE: createAction("approve", "approve", "Approve the request"),
  REJECT: createAction("reject", "reject", "Reject the request"),
  ESCALATE_TO_MANAGER: createAction(
    "escalate-manager",
    "escalate",
    "Escalate to manager",
    { escalateTo: "manager" }
  ),
  REQUEST_MORE_INFO: createAction(
    "request-info",
    "information-request",
    "Request additional information"
  ),
}
