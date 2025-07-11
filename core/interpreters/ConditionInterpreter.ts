/**
 * Condition Artifact Interpreter
 * Interprets SOL Evaluation artifacts and produces semantic decisions
 */

import { ArtifactInterpreter } from "../types/ArtifactInterpreter"
import {
  SOLArtifact,
  EvaluationArtifact,
  isEvaluationArtifact,
} from "../artifacts"
import { ExecutionContext } from "../context/ExecutionContext"
import { SemanticDecision } from "../types/SemanticDecision"
import { PluginCapability } from "../types/PluginCapability"

/**
 * Condition interpreter implementation
 * Uses standard SOL EvaluationArtifact interface
 */
export class ConditionInterpreter
  implements ArtifactInterpreter<EvaluationArtifact>
{
  private readonly supportedType = "Evaluation"

  canInterpret(artifact: SOLArtifact): artifact is EvaluationArtifact {
    return isEvaluationArtifact(artifact)
  }

  async interpret(
    artifact: EvaluationArtifact,
    _context: ExecutionContext
  ): Promise<SemanticDecision> {
    try {
      // Validate artifact structure
      if (!this.validateArtifact(artifact)) {
        throw new Error(`Invalid evaluation artifact: ${artifact.metadata.id}`)
      }

      // Create semantic decision
      const decision: SemanticDecision = {
        artifact: artifact,
        executionStrategy: "condition-evaluation",
        requiredPlugins: ["condition-evaluation"],
        semanticReferences: this.buildSemanticReferences(artifact),
        validationResult: {
          isValid: true,
          errors: [],
          warnings: [],
          suggestions: [],
          score: 100,
          timestamp: new Date(),
          validator: "ConditionInterpreter",
        },
        confidence: this.calculateConfidence(artifact),
        reasoning: this.generateReasoning(artifact),
        timestamp: new Date(),
      }

      return decision
    } catch (error) {
      const decision: SemanticDecision = {
        artifact: artifact,
        executionStrategy: "condition-evaluation",
        requiredPlugins: ["condition-evaluation"],
        semanticReferences: {},
        validationResult: {
          isValid: false,
          errors: [
            {
              code: "INTERPRETATION_ERROR",
              message: error instanceof Error ? error.message : String(error),
              severity: "critical",
              rule: "ConditionInterpreter",
            },
          ],
          warnings: [],
          suggestions: [],
          score: 0,
          timestamp: new Date(),
          validator: "ConditionInterpreter",
        },
        confidence: 0.0,
        reasoning: [
          `Failed to interpret evaluation: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
        timestamp: new Date(),
      }

      return decision
    }
  }

  getRequiredCapabilities(): PluginCapability[] {
    return [
      {
        id: "condition-evaluation",
        name: "condition-evaluation",
        description: "Capability to evaluate condition artifacts",
        version: "1.0.0",
        requiredMethods: ["evaluate", "validate"],
        optionalMethods: ["preview", "simulate"],
        dependencies: [],
        tags: ["evaluation", "condition", "foundational"],
      },
    ]
  }

  getSupportedType(): string {
    return this.supportedType
  }

  validateArtifact(artifact: EvaluationArtifact): boolean {
    // Basic validation
    if (
      !artifact.metadata.id ||
      !artifact.content.expected ||
      !artifact.content.method
    ) {
      return false
    }

    // Validate frequency
    const validFrequencies = [
      "daily",
      "weekly",
      "monthly",
      "quarterly",
      "yearly",
      "on-demand",
    ]
    if (
      !validFrequencies.includes(artifact.content.frequency) &&
      typeof artifact.content.frequency !== "string"
    ) {
      return false
    }

    // Validate severity if provided
    if (artifact.content.severity) {
      const validSeverities = ["info", "warning", "error", "critical"]
      if (!validSeverities.includes(artifact.content.severity)) {
        return false
      }
    }

    // Validate expected result if provided
    if (
      artifact.content.expectedResult !== undefined &&
      typeof artifact.content.expectedResult !== "boolean"
    ) {
      return false
    }

    // Validate timeout if provided
    if (
      artifact.content.timeout !== undefined &&
      artifact.content.timeout <= 0
    ) {
      return false
    }

    // Validate operators array if provided
    if (
      artifact.content.operators &&
      (!Array.isArray(artifact.content.operators) ||
        artifact.content.operators.length === 0)
    ) {
      return false
    }

    // Validate dependencies if provided
    if (
      artifact.content.dependencies &&
      !Array.isArray(artifact.content.dependencies)
    ) {
      return false
    }

    return true
  }

  private calculateConfidence(artifact: EvaluationArtifact): number {
    let confidence = 0.7 // Base confidence for evaluation artifacts

    // Increase confidence for more complete artifacts
    if (artifact.content.expression) confidence += 0.1
    if (
      artifact.content.variables &&
      Object.keys(artifact.content.variables).length > 0
    )
      confidence += 0.05
    if (artifact.content.operators && artifact.content.operators.length > 0)
      confidence += 0.05
    if (artifact.content.expectedResult !== undefined) confidence += 0.05
    if (
      artifact.content.dependencies &&
      artifact.content.dependencies.length > 0
    )
      confidence += 0.05

    // Adjust based on severity
    if (artifact.content.severity) {
      switch (artifact.content.severity) {
        case "critical":
          confidence += 0.1
          break
        case "error":
          confidence += 0.05
          break
        case "info":
          confidence -= 0.05
          break
      }
    }

    return Math.min(1.0, confidence)
  }

  private generateReasoning(artifact: EvaluationArtifact): string[] {
    const reasoning = [
      `Evaluation "${artifact.metadata.id}" interpreted successfully`,
      `Expected: ${artifact.content.expected}`,
      `Method: ${artifact.content.method}`,
      `Frequency: ${artifact.content.frequency}`,
    ]

    if (artifact.content.expression) {
      reasoning.push(`Expression: ${artifact.content.expression}`)
    }

    if (artifact.content.expectedResult !== undefined) {
      reasoning.push(`Expected Result: ${artifact.content.expectedResult}`)
    }

    if (artifact.content.severity) {
      reasoning.push(`Severity: ${artifact.content.severity}`)
    }

    if (
      artifact.content.dependencies &&
      artifact.content.dependencies.length > 0
    ) {
      reasoning.push(
        `Dependencies: ${artifact.content.dependencies.length} defined`
      )
    }

    if (artifact.content.operators && artifact.content.operators.length > 0) {
      reasoning.push(`Operators: ${artifact.content.operators.join(", ")}`)
    }

    return reasoning
  }

  private buildSemanticReferences(
    artifact: EvaluationArtifact
  ): Record<string, SOLArtifact> {
    const references: Record<string, SOLArtifact> = {}

    // Create a reference to the evaluation itself for semantic linking
    references.evaluation = {
      type: "Evaluation",
      metadata: {
        id: `${artifact.metadata.id}-reference`,
        version: "1.0",
        created: new Date(),
        lastModified: new Date(),
        status: "active",
        author: "system",
        reviewedBy: [],
        tags: [],
      },
      content: {
        expected: artifact.content.expected,
        method: artifact.content.method,
        frequency: "on-demand",
        criteria: artifact.content.criteria,
      },
    }

    return references
  }
}
