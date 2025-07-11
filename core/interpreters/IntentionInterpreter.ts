/**
 * Intention Artifact Interpreter
 * Interprets SOL Intent artifacts and produces semantic decisions
 */

import { ArtifactInterpreter } from "../types/ArtifactInterpreter"
import { SOLArtifact, IntentArtifact, isIntentArtifact } from "../artifacts"
import { ExecutionContext } from "../context/ExecutionContext"
import { SemanticDecision } from "../types/SemanticDecision"
import { PluginCapability } from "../types/PluginCapability"

/**
 * Intention interpreter implementation
 * Uses standard SOL IntentArtifact interface
 */
export class IntentionInterpreter
  implements ArtifactInterpreter<IntentArtifact>
{
  private readonly supportedType = "Intent"

  canInterpret(artifact: SOLArtifact): artifact is IntentArtifact {
    return isIntentArtifact(artifact)
  }

  async interpret(
    artifact: IntentArtifact,
    _context: ExecutionContext
  ): Promise<SemanticDecision> {
    try {
      if (!this.validateArtifact(artifact)) {
        throw new Error(`Invalid intent artifact: ${artifact.metadata.id}`)
      }

      const decision: SemanticDecision = {
        artifact: artifact,
        executionStrategy: "intention-execution",
        requiredPlugins: ["intention-execution"],
        semanticReferences: {},
        validationResult: {
          isValid: true,
          errors: [],
          warnings: [],
          suggestions: [],
          score: 100,
          timestamp: new Date(),
          validator: "IntentionInterpreter",
        },
        confidence: this.calculateConfidence(artifact),
        reasoning: this.generateReasoning(artifact),
        timestamp: new Date(),
      }

      return decision
    } catch (error) {
      const decision: SemanticDecision = {
        artifact: artifact,
        executionStrategy: "intention-execution",
        requiredPlugins: ["intention-execution"],
        semanticReferences: {},
        validationResult: {
          isValid: false,
          errors: [
            {
              code: "INTERPRETATION_ERROR",
              message: error instanceof Error ? error.message : String(error),
              severity: "critical",
              rule: "IntentionInterpreter",
            },
          ],
          warnings: [],
          suggestions: [],
          score: 0,
          timestamp: new Date(),
          validator: "IntentionInterpreter",
        },
        confidence: 0.0,
        reasoning: [
          `Failed to interpret intent: ${
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
        id: "intention-execution",
        name: "intention-execution",
        description: "Capability to execute intention artifacts",
        version: "1.0.0",
        requiredMethods: ["execute", "validate"],
        optionalMethods: ["preview", "rollback"],
        dependencies: [],
        tags: ["execution", "intention", "foundational"],
      },
    ]
  }

  getSupportedType(): string {
    return this.supportedType
  }

  validateArtifact(artifact: IntentArtifact): boolean {
    // Basic validation
    if (!artifact.metadata.id || !artifact.content.statement) {
      return false
    }

    // Validate mode
    const validModes = ["declare", "require", "propose", "prohibit"]
    if (!validModes.includes(artifact.content.mode)) {
      return false
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "critical"]
    if (!validPriorities.includes(artifact.content.priority)) {
      return false
    }

    return true
  }

  private calculateConfidence(artifact: IntentArtifact): number {
    let confidence = 0.7 // Base confidence for intent artifacts

    // Increase confidence for more complete artifacts
    if (artifact.content.actor) confidence += 0.1
    if (artifact.content.target) confidence += 0.1
    if (artifact.content.action) confidence += 0.1
    if (artifact.content.conditions && artifact.content.conditions.length > 0)
      confidence += 0.05

    // Adjust based on priority
    switch (artifact.content.priority) {
      case "critical":
        confidence += 0.1
        break
      case "high":
        confidence += 0.05
        break
      case "low":
        confidence -= 0.05
        break
    }

    return Math.min(1.0, confidence)
  }

  private generateReasoning(artifact: IntentArtifact): string[] {
    const reasoning = [
      `Intent "${artifact.metadata.id}" interpreted successfully`,
      `Statement: ${artifact.content.statement}`,
      `Mode: ${artifact.content.mode}`,
      `Priority: ${artifact.content.priority}`,
    ]

    if (artifact.content.actor) {
      reasoning.push(`Actor: ${artifact.content.actor}`)
    }

    if (artifact.content.target) {
      reasoning.push(`Target: ${artifact.content.target}`)
    }

    if (artifact.content.action) {
      reasoning.push(`Action: ${artifact.content.action}`)
    }

    if (artifact.content.conditions && artifact.content.conditions.length > 0) {
      reasoning.push(
        `Conditions: ${artifact.content.conditions.length} defined`
      )
    }

    return reasoning
  }
}
