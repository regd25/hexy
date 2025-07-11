/**
 * Deterministic Orchestration Strategy
 * Executes semantic decisions in a deterministic, sequential manner
 */

import { OrchestrationStrategy } from "../../types/OrchestrationStrategy"
import { SemanticDecision } from "../../types/SemanticDecision"
import { ExecutionContext } from "../../context/ExecutionContext"
import { ExecutionResult } from "../../types/Result"
import { PluginCapability } from "../../types/PluginCapability"

export class DeterministicOrchestrationStrategy
  implements OrchestrationStrategy
{
  readonly name = "deterministic"
  readonly description =
    "Executes semantic decisions in a deterministic, sequential manner"
  readonly supportedArtifactTypes = ["Intent", "Evaluation", "Process"]
  readonly priority = 100 // High priority as the default strategy

  canHandle(decision: SemanticDecision, context: ExecutionContext): boolean {
    // Can handle any artifact type in the supported list
    return this.supportedArtifactTypes.includes(decision.artifact.type)
  }

  async execute(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now()

    try {
      // Validate context before execution
      if (!this.validateContext(context)) {
        throw new Error(
          "Invalid execution context for deterministic orchestration"
        )
      }

      // Execute based on artifact type
      let result: ExecutionResult

      switch (decision.artifact.type) {
        case "Intent":
          result = await this.executeIntent(decision, context)
          break
        case "Evaluation":
          result = await this.executeEvaluation(decision, context)
          break
        case "Process":
          result = await this.executeProcess(decision, context)
          break
        default:
          throw new Error(
            `Unsupported artifact type: ${decision.artifact.type}`
          )
      }

      // Add execution metadata
      result.metadata = {
        ...result.metadata,
        strategy: this.name,
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
      }

      return result
    } catch (error) {
      return {
        success: false,
        context,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          strategy: this.name,
          executionTime: Date.now() - startTime,
          timestamp: new Date(),
        },
      }
    }
  }

  getRequiredCapabilities(decision: SemanticDecision): PluginCapability[] {
    // Return capabilities based on artifact type and content
    const capabilities: PluginCapability[] = []

    // Base capabilities for all artifacts
    capabilities.push({
      id: "execution-logging",
      name: "Execution Logging",
      description: "Log execution steps and results",
      version: "1.0.0",
      requiredMethods: ["log"],
      optionalMethods: ["logError", "logWarning"],
      dependencies: [],
      tags: ["logging", "monitoring"],
    })

    // Add specific capabilities based on artifact type
    switch (decision.artifact.type) {
      case "Intent":
        capabilities.push({
          id: "intent-execution",
          name: "Intent Execution",
          description: "Execute intent-based decisions",
          version: "1.0.0",
          requiredMethods: ["executeIntent"],
          optionalMethods: ["validateIntent"],
          dependencies: [],
          tags: ["intent", "execution"],
        })
        break
      case "Evaluation":
        capabilities.push({
          id: "evaluation-execution",
          name: "Evaluation Execution",
          description: "Execute evaluation-based decisions",
          version: "1.0.0",
          requiredMethods: ["evaluateCondition"],
          optionalMethods: ["validateEvaluation"],
          dependencies: [],
          tags: ["evaluation", "condition"],
        })
        break
      case "Process":
        capabilities.push({
          id: "process-execution",
          name: "Process Execution",
          description: "Execute process-based decisions",
          version: "1.0.0",
          requiredMethods: ["executeProcess"],
          optionalMethods: ["validateProcess"],
          dependencies: [],
          tags: ["process", "workflow"],
        })
        break
    }

    return capabilities
  }

  getConfigurationSchema(): any {
    return {
      type: "object",
      properties: {
        timeout: {
          type: "number",
          description: "Execution timeout in milliseconds",
          default: 30000,
          minimum: 1000,
        },
        retryPolicy: {
          type: "object",
          properties: {
            maxRetries: {
              type: "number",
              description: "Maximum number of retries",
              default: 3,
              minimum: 0,
            },
            backoffDelay: {
              type: "number",
              description: "Delay between retries in milliseconds",
              default: 1000,
              minimum: 100,
            },
          },
        },
        enableParallelExecution: {
          type: "boolean",
          description: "Enable parallel execution of independent steps",
          default: false,
        },
      },
    }
  }

  validateContext(context: ExecutionContext): boolean {
    // Basic validation - context must have required properties
    return !!(context && context.actor && context.context && context.authority)
  }

  estimateExecutionTime(
    decision: SemanticDecision,
    context: ExecutionContext
  ): number {
    // Simple estimation based on artifact type and complexity
    let baseTime = 1000 // 1 second base

    switch (decision.artifact.type) {
      case "Intent":
        baseTime = 2000 // Intents typically take longer
        break
      case "Evaluation":
        baseTime = 500 // Evaluations are usually quick
        break
      case "Process":
        baseTime = 5000 // Processes can be complex
        break
    }

    // Add complexity factors
    const complexityFactor = this.calculateComplexityFactor(decision)

    return Math.round(baseTime * complexityFactor)
  }

  private async executeIntent(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Intent execution logic
    const intentContent = decision.artifact.content as any

    // Simulate intent execution
    await this.delay(100)

    return {
      success: true,
      context: {
        ...context,
        executionHistory: [
          ...(context.executionHistory || []),
          {
            step: "intent-execution",
            timestamp: new Date(),
            result: `Intent executed: ${intentContent.statement}`,
            metadata: { mode: intentContent.mode },
          },
        ],
      },
      result: {
        type: "intent-result",
        value: `Intent "${intentContent.statement}" executed successfully`,
        metadata: { mode: intentContent.mode },
      },
    }
  }

  private async executeEvaluation(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Evaluation execution logic
    const evaluationContent = decision.artifact.content as any

    // Simulate evaluation execution
    await this.delay(50)

    return {
      success: true,
      context: {
        ...context,
        executionHistory: [
          ...(context.executionHistory || []),
          {
            step: "evaluation-execution",
            timestamp: new Date(),
            result: `Evaluation executed: ${evaluationContent.condition}`,
            metadata: { result: evaluationContent.expected },
          },
        ],
      },
      result: {
        type: "evaluation-result",
        value: evaluationContent.expected,
        metadata: { condition: evaluationContent.condition },
      },
    }
  }

  private async executeProcess(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Process execution logic
    const processContent = decision.artifact.content as any

    // Simulate process execution
    await this.delay(200)

    return {
      success: true,
      context: {
        ...context,
        executionHistory: [
          ...(context.executionHistory || []),
          {
            step: "process-execution",
            timestamp: new Date(),
            result: `Process executed: ${processContent.name}`,
            metadata: { steps: processContent.steps?.length || 0 },
          },
        ],
      },
      result: {
        type: "process-result",
        value: `Process "${processContent.name}" completed successfully`,
        metadata: {
          steps: processContent.steps?.length || 0,
          duration: processContent.estimatedDuration,
        },
      },
    }
  }

  private calculateComplexityFactor(decision: SemanticDecision): number {
    let factor = 1.0

    // Factor based on artifact content complexity
    const content = decision.artifact.content as any

    if (content.conditions && Array.isArray(content.conditions)) {
      factor += content.conditions.length * 0.1
    }

    if (content.steps && Array.isArray(content.steps)) {
      factor += content.steps.length * 0.2
    }

    if (content.dependencies && Array.isArray(content.dependencies)) {
      factor += content.dependencies.length * 0.15
    }

    return Math.max(factor, 0.5) // Minimum factor of 0.5
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
