/**
 * Process Artifact Interpreter
 * Interprets SOL Process artifacts and produces semantic decisions
 */

import { ArtifactInterpreter } from "../types/ArtifactInterpreter"
import { SOLArtifact, ProcessArtifact, isProcessArtifact } from "../artifacts"
import { ExecutionContext } from "../context/ExecutionContext"
import { SemanticDecision } from "../types/SemanticDecision"
import { PluginCapability } from "../types/PluginCapability"

/**
 * Process interpreter implementation
 * Uses standard SOL ProcessArtifact interface
 */
export class ProcessInterpreter
  implements ArtifactInterpreter<ProcessArtifact>
{
  private readonly supportedType = "Process"

  canInterpret(artifact: SOLArtifact): artifact is ProcessArtifact {
    return isProcessArtifact(artifact)
  }

  async interpret(
    artifact: ProcessArtifact,
    _context: ExecutionContext
  ): Promise<SemanticDecision> {
    try {
      if (!this.validateArtifact(artifact)) {
        throw new Error(`Invalid process artifact: ${artifact.metadata.id}`)
      }

      const decision: SemanticDecision = {
        artifact: artifact,
        executionStrategy: "process-execution",
        requiredPlugins: ["process-execution"],
        semanticReferences: {},
        validationResult: {
          isValid: true,
          errors: [],
          warnings: [],
          suggestions: [],
          score: 100,
          timestamp: new Date(),
          validator: "ProcessInterpreter",
        },
        confidence: this.calculateConfidence(artifact),
        reasoning: this.generateReasoning(artifact),
        timestamp: new Date(),
      }

      return decision
    } catch (error) {
      const decision: SemanticDecision = {
        artifact: artifact,
        executionStrategy: "process-execution",
        requiredPlugins: ["process-execution"],
        semanticReferences: {},
        validationResult: {
          isValid: false,
          errors: [
            {
              code: "INTERPRETATION_ERROR",
              message: error instanceof Error ? error.message : String(error),
              severity: "critical",
              rule: "ProcessInterpreter",
            },
          ],
          warnings: [],
          suggestions: [],
          score: 0,
          timestamp: new Date(),
          validator: "ProcessInterpreter",
        },
        confidence: 0.0,
        reasoning: [
          `Failed to interpret process: ${
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
        id: "process-execution",
        name: "process-execution",
        description: "Capability to execute process artifacts",
        version: "1.0.0",
        requiredMethods: ["execute", "validate", "step"],
        optionalMethods: ["preview", "rollback", "pause", "resume"],
        dependencies: ["intention-execution", "condition-evaluation"],
        tags: ["execution", "process", "operational"],
      },
    ]
  }

  getSupportedType(): string {
    return this.supportedType
  }

  validateArtifact(artifact: ProcessArtifact): boolean {
    // Basic validation
    if (
      !artifact.metadata.id ||
      !artifact.content.name ||
      !artifact.content.steps ||
      !artifact.content.actors
    ) {
      return false
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "critical"]
    if (!validPriorities.includes(artifact.content.priority)) {
      return false
    }

    // Validate steps
    if (
      !Array.isArray(artifact.content.steps) ||
      artifact.content.steps.length === 0
    ) {
      return false
    }

    // Validate each step
    for (const step of artifact.content.steps) {
      if (!step.id || !step.name || !step.actor || !step.action) {
        return false
      }
    }

    // Validate actors array
    if (
      !Array.isArray(artifact.content.actors) ||
      artifact.content.actors.length === 0
    ) {
      return false
    }

    return true
  }

  private calculateConfidence(artifact: ProcessArtifact): number {
    let confidence = 0.7 // Base confidence for process artifacts

    // Increase confidence for more complete artifacts
    if (artifact.content.description) confidence += 0.1
    if (artifact.content.conditions && artifact.content.conditions.length > 0)
      confidence += 0.05
    if (artifact.content.errorHandling) confidence += 0.05

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

    // Adjust based on complexity (number of steps)
    const stepCount = artifact.content.steps.length
    if (stepCount > 10) {
      confidence -= 0.1
    } else if (stepCount > 5) {
      confidence -= 0.05
    }

    return Math.min(1.0, Math.max(0.0, confidence))
  }

  private generateReasoning(artifact: ProcessArtifact): string[] {
    const reasoning = [
      `Process "${artifact.metadata.id}" interpreted successfully`,
      `Name: ${artifact.content.name}`,
      `Steps: ${artifact.content.steps.length}`,
      `Actors: ${artifact.content.actors.join(", ")}`,
      `Priority: ${artifact.content.priority}`,
    ]

    if (artifact.content.description) {
      reasoning.push(`Description: ${artifact.content.description}`)
    }

    if (artifact.content.conditions && artifact.content.conditions.length > 0) {
      reasoning.push(
        `Conditions: ${artifact.content.conditions.length} defined`
      )
    }

    if (artifact.content.errorHandling) {
      reasoning.push(`Error handling: ${artifact.content.errorHandling}`)
    }

    return reasoning
  }
}
