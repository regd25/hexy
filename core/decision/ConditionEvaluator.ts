/**
 * Condition Evaluator
 * Evaluates semantic conditions against context data
 */

import {
  SemanticCondition,
  ConditionOperator,
  ConditionEvaluationResult,
  SemanticContext,
} from "./types"

export class ConditionEvaluator {
  /**
   * Evaluate a single condition against the semantic context
   */
  async evaluateCondition(
    condition: SemanticCondition,
    context: SemanticContext
  ): Promise<ConditionEvaluationResult> {
    try {
      const actualValue = this.extractValue(condition.field, context)
      const matched = this.evaluateOperator(
        condition.operator,
        actualValue,
        condition.value
      )

      const confidence = this.calculateConfidence(
        condition,
        actualValue,
        matched
      )

      const reasoning = this.generateReasoning(condition, actualValue, matched)

      return {
        condition,
        matched,
        actualValue,
        expectedValue: condition.value,
        confidence,
        reasoning,
      }
    } catch (error) {
      return {
        condition,
        matched: false,
        actualValue: undefined,
        expectedValue: condition.value,
        confidence: 0,
        reasoning: `Evaluation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      }
    }
  }

  /**
   * Evaluate multiple conditions with AND logic
   */
  async evaluateConditions(
    conditions: SemanticCondition[],
    context: SemanticContext
  ): Promise<ConditionEvaluationResult[]> {
    const results = await Promise.all(
      conditions.map((condition) => this.evaluateCondition(condition, context))
    )

    return results
  }

  /**
   * Check if all conditions are met (AND logic)
   */
  allConditionsMet(results: ConditionEvaluationResult[]): boolean {
    return results.every((result) => result.matched)
  }

  /**
   * Check if any condition is met (OR logic)
   */
  anyConditionMet(results: ConditionEvaluationResult[]): boolean {
    return results.some((result) => result.matched)
  }

  /**
   * Calculate weighted confidence score
   */
  calculateWeightedConfidence(results: ConditionEvaluationResult[]): number {
    if (results.length === 0) return 0

    const totalWeight = results.reduce(
      (sum, result) => sum + (result.condition.weight || 1),
      0
    )

    const weightedSum = results.reduce(
      (sum, result) => sum + result.confidence * (result.condition.weight || 1),
      0
    )

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  /**
   * Extract value from context using field path
   */
  private extractValue(field: string, context: SemanticContext): any {
    const path = field.split(".")
    let value: any = context

    for (const segment of path) {
      if (value && typeof value === "object" && segment in value) {
        value = value[segment]
      } else {
        return undefined
      }
    }

    return value
  }

  /**
   * Evaluate condition operator
   */
  private evaluateOperator(
    operator: ConditionOperator,
    actualValue: any,
    expectedValue: any
  ): boolean {
    switch (operator) {
      case "equals":
        return actualValue === expectedValue

      case "not-equals":
        return actualValue !== expectedValue

      case "greater-than":
        return this.compareValues(actualValue, expectedValue) > 0

      case "less-than":
        return this.compareValues(actualValue, expectedValue) < 0

      case "contains":
        if (Array.isArray(actualValue)) {
          return actualValue.includes(expectedValue)
        }
        if (typeof actualValue === "string") {
          return actualValue.includes(expectedValue)
        }
        return false

      case "not-contains":
        if (Array.isArray(actualValue)) {
          return !actualValue.includes(expectedValue)
        }
        if (typeof actualValue === "string") {
          return !actualValue.includes(expectedValue)
        }
        return true

      case "matches-pattern":
        if (typeof actualValue === "string") {
          const regex = new RegExp(expectedValue)
          return regex.test(actualValue)
        }
        return false

      case "in-range":
        if (Array.isArray(expectedValue) && expectedValue.length === 2) {
          const [min, max] = expectedValue
          return (
            this.compareValues(actualValue, min) >= 0 &&
            this.compareValues(actualValue, max) <= 0
          )
        }
        return false

      case "exists":
        return actualValue !== undefined && actualValue !== null

      case "not-exists":
        return actualValue === undefined || actualValue === null

      default:
        throw new Error(`Unknown operator: ${operator}`)
    }
  }

  /**
   * Compare values with type handling
   */
  private compareValues(a: any, b: any): number {
    // Handle null/undefined
    if (a == null && b == null) return 0
    if (a == null) return -1
    if (b == null) return 1

    // Handle numbers
    if (typeof a === "number" && typeof b === "number") {
      return a - b
    }

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime()
    }

    // Handle strings
    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b)
    }

    // Convert to strings for comparison
    return String(a).localeCompare(String(b))
  }

  /**
   * Calculate confidence based on condition evaluation
   */
  private calculateConfidence(
    condition: SemanticCondition,
    actualValue: any,
    matched: boolean
  ): number {
    // Base confidence
    let confidence = matched ? 0.9 : 0.1

    // Adjust based on value certainty
    if (actualValue === undefined || actualValue === null) {
      confidence *= 0.5
    }

    // Adjust based on operator complexity
    switch (condition.operator) {
      case "equals":
      case "not-equals":
        confidence *= 1.0
        break
      case "contains":
      case "not-contains":
        confidence *= 0.9
        break
      case "matches-pattern":
        confidence *= 0.8
        break
      case "in-range":
        confidence *= 0.85
        break
      default:
        confidence *= 0.7
    }

    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    condition: SemanticCondition,
    actualValue: any,
    matched: boolean
  ): string {
    const operatorText = this.getOperatorText(condition.operator)
    const actualText = this.formatValue(actualValue)
    const expectedText = this.formatValue(condition.value)

    if (matched) {
      return `Condition '${condition.description}' matched: ${condition.field} (${actualText}) ${operatorText} ${expectedText}`
    } else {
      return `Condition '${condition.description}' failed: ${condition.field} (${actualText}) does not ${operatorText} ${expectedText}`
    }
  }

  /**
   * Get human-readable operator text
   */
  private getOperatorText(operator: ConditionOperator): string {
    const operatorMap: Record<ConditionOperator, string> = {
      equals: "equals",
      "not-equals": "not equal",
      "greater-than": "greater than",
      "less-than": "less than",
      contains: "contains",
      "not-contains": "does not contain",
      "matches-pattern": "matches pattern",
      "in-range": "is in range",
      exists: "exists",
      "not-exists": "does not exist",
    }

    return operatorMap[operator] || operator
  }

  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (value === null) return "null"
    if (value === undefined) return "undefined"
    if (typeof value === "string") return `"${value}"`
    if (Array.isArray(value)) return `[${value.join(", ")}]`
    if (value instanceof Date) return value.toISOString()
    return String(value)
  }
}
