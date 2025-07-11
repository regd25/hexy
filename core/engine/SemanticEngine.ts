/**
 * Semantic Engine - Core orchestration engine for SOL artifacts
 * Interprets SOL artifacts and orchestrates their execution
 */

import { ExecutionContext } from "../context/ExecutionContext"
import { ArtifactRepository } from "../repositories/ArtifactRepository"
import { ValidationSystem } from "../validation/ValidationSystem"
import { PluginManager } from "../plugins/PluginManager"
import {
  EventPriority,
  EventSystem,
  SemanticEvent,
} from "../events/EventSystem"
import { OrchestrationMode } from "../types/OrchestrationMode"
import {
  SOLArtifact,
  OperationalArtifact,
  FlowStep,
} from "../artifacts/SOLArtifact"
import { SemanticDecision } from "../types/SemanticDecision"

export class SemanticEngine {
  private readonly artifactRepository: ArtifactRepository
  private readonly validationSystem: ValidationSystem
  private readonly pluginManager: PluginManager
  private readonly eventSystem: EventSystem

  constructor(
    artifactRepository: ArtifactRepository,
    validationSystem: ValidationSystem,
    pluginManager: PluginManager,
    eventSystem: EventSystem
  ) {
    this.artifactRepository = artifactRepository
    this.validationSystem = validationSystem
    this.pluginManager = pluginManager
    this.eventSystem = eventSystem
  }

  /**
   * Interprets a SOL artifact and determines execution strategy
   */
  async interpretArtifact(
    artifact: SOLArtifact,
    context: ExecutionContext
  ): Promise<SemanticDecision> {
    // Validate artifact semantic coherence
    const validationResult = await this.validationSystem.validateArtifact(
      artifact
    )

    if (!validationResult.isValid) {
      throw new Error(
        `Semantic validation failed: ${validationResult.errors.join(", ")}`
      )
    }

    // Determine execution strategy based on artifact type and context
    const executionStrategy = this.determineExecutionStrategy(artifact, context)

    return {
      artifact,
      executionStrategy,
      requiredPlugins: this.identifyRequiredPlugins(artifact),
      semanticReferences: await this.resolveSemanticReferences(artifact),
      validationResult,
      confidence: 0.95,
      reasoning: [
        `Semantic interpretation based on ${artifact.type} artifact structure`,
      ],
      timestamp: new Date(),
    }
  }

  /**
   * Orchestrates execution of a process using semantic decisions
   */
  async orchestrate(
    decision: SemanticDecision,
    context: ExecutionContext,
    mode: OrchestrationMode = OrchestrationMode.ORCHESTRATOR
  ): Promise<ExecutionContext> {
    switch (mode) {
      case OrchestrationMode.ORCHESTRATOR:
        return this.orchestratorMode(decision, context)

      case OrchestrationMode.REACTIVE:
        return this.reactiveMode(decision, context)

      case OrchestrationMode.CHOREOGRAPHED:
        return this.choreographedMode(decision, context)

      default:
        throw new Error(`Unsupported orchestration mode: ${mode}`)
    }
  }

  /**
   * Orchestrator mode: Step-by-step execution with semantic condition evaluation
   */
  private async orchestratorMode(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    const { artifact } = decision

    // Update context with semantic metadata
    context.updateSemanticState({
      currentArtifact: artifact,
      orchestrationMode: OrchestrationMode.ORCHESTRATOR,
      startTime: new Date(),
    })

    // Execute through plugins
    for (const pluginName of decision.requiredPlugins) {
      const plugin = this.pluginManager.getPlugin(pluginName)
      context = await plugin.execute(context)

      // Evaluate semantic conditions between steps
      const shouldContinue = await this.evaluateSemanticConditions(context)
      if (!shouldContinue) {
        break
      }
    }

    return context
  }

  /**
   * Reactive mode: Listen to system events and validate coherence
   */
  private async reactiveMode(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    // Subscribe to relevant events
    const relevantEvents = this.getRelevantEvents(decision.artifact)
    const subscription = {
      id: `reactive-${decision.artifact.metadata.id}-${Date.now()}`,
      subscriberId: context.getActor().metadata.id,
      eventTypes: relevantEvents,
      filters: [],
      handler: async (event: SemanticEvent) => {
        const isCoherent = await this.validateEventCoherence(event, context)
        if (!isCoherent) {
          await this.handleIncoherentEvent(event, context)
        }
        return { success: true }
      },
      isActive: true,
      metadata: {
        created: new Date(),
        triggerCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
      },
    }

    await this.eventSystem.subscribe(subscription)

    return context
  }

  /**
   * Choreographed mode: Coordinate distributed execution
   */
  private async choreographedMode(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    const { artifact } = decision

    // Update context for choreographed mode
    context.updateSemanticState({
      currentArtifact: artifact,
      orchestrationMode: OrchestrationMode.CHOREOGRAPHED,
      startTime: new Date(),
    })

    // In choreographed mode, each participant knows its role and coordinates independently
    if (this.isOperationalArtifact(artifact)) {
      // Extract flow definition for choreography
      const flow = artifact.flow
      if (flow?.steps) {
        // Create choreography plan with step assignments
        const choreographyPlan = this.createChoreographyPlan(
          flow.steps,
          context
        )

        // Publish choreography initiation event
        await this.eventSystem.publish({
          id: `choreography-init-${artifact.metadata.id}-${Date.now()}`,
          type: "choreography.initiated",
          source: "semantic-engine",
          timestamp: new Date(),
          payload: {
            artifactId: artifact.metadata.id,
            plan: choreographyPlan,
            participants: choreographyPlan.participants,
          },
          metadata: {
            version: "1.0",
            format: "json",
            classification: "internal",
          },
          context: context.getContext().metadata.id,
          intent: context.getIntent().metadata.id,
          priority: EventPriority.NORMAL,
          correlationId: context.getId(),
        })

        // Enable distributed coordination through events
        await this.enableDistributedCoordination(choreographyPlan, context)
      }
    }

    // Return updated context with choreography state
    const updatedContext = context.clone()
    updatedContext.updateSemanticState({
      ...updatedContext.getSemanticState(),
      coordinationMode: "distributed",
    })
    return updatedContext
  }

  private determineExecutionStrategy(
    artifact: SOLArtifact,
    context: ExecutionContext
  ): string {
    // Determine strategy based on artifact type and context
    if (artifact.type === "Process") {
      return "sequential-flow"
    } else if (artifact.type === "Event") {
      return "event-driven"
    } else if (artifact.type === "Policy") {
      return "validation-only"
    }
    return "semantic-interpretation"
  }

  private identifyRequiredPlugins(artifact: SOLArtifact): string[] {
    // Identify plugins needed based on artifact requirements
    const plugins: string[] = []

    if (artifact.metadata.tags?.includes("aws")) {
      plugins.push("aws-step-functions")
    }

    if (artifact.metadata.tags?.includes("jira")) {
      plugins.push("jira-integration")
    }

    return plugins
  }

  private async resolveSemanticReferences(
    artifact: SOLArtifact
  ): Promise<Record<string, SOLArtifact>> {
    const references: Record<string, SOLArtifact> = {}

    try {
      // Resolve foundational artifact references from 'uses' property
      if (artifact.uses) {
        if (artifact.uses.intent) {
          const intentArtifact = await this.artifactRepository.findById(
            artifact.uses.intent
          )
          if (intentArtifact) {
            references[`Intent:${artifact.uses.intent}`] = intentArtifact
          }
        }

        if (artifact.uses.context) {
          const contextArtifact = await this.artifactRepository.findById(
            artifact.uses.context
          )
          if (contextArtifact) {
            references[`Context:${artifact.uses.context}`] = contextArtifact
          }
        }

        if (artifact.uses.authority) {
          const authorityArtifact = await this.artifactRepository.findById(
            artifact.uses.authority
          )
          if (authorityArtifact) {
            references[`Authority:${artifact.uses.authority}`] =
              authorityArtifact
          }
        }

        if (artifact.uses.evaluation) {
          const evaluationArtifact = await this.artifactRepository.findById(
            artifact.uses.evaluation
          )
          if (evaluationArtifact) {
            references[`Evaluation:${artifact.uses.evaluation}`] =
              evaluationArtifact
          }
        }
      }

      // Resolve relationship references
      if (artifact.relationships) {
        // Resolve dependencies
        if (artifact.relationships.dependsOn) {
          for (const depId of artifact.relationships.dependsOn) {
            const depArtifact = await this.artifactRepository.findById(depId)
            if (depArtifact) {
              references[`Dependency:${depId}`] = depArtifact
            }
          }
        }

        // Resolve supports relationships
        if (artifact.relationships.supports) {
          for (const supportId of artifact.relationships.supports) {
            const supportArtifact = await this.artifactRepository.findById(
              supportId
            )
            if (supportArtifact) {
              references[`Supports:${supportId}`] = supportArtifact
            }
          }
        }

        // Resolve measurement indicators
        if (artifact.relationships.measuredBy) {
          for (const indicatorId of artifact.relationships.measuredBy) {
            const indicatorArtifact = await this.artifactRepository.findById(
              indicatorId
            )
            if (indicatorArtifact) {
              references[`Indicator:${indicatorId}`] = indicatorArtifact
            }
          }
        }
      }

      // Resolve organizational area reference
      if (artifact.organizational?.area) {
        const areaArtifact = await this.artifactRepository.findById(
          artifact.organizational.area
        )
        if (areaArtifact) {
          references[`Area:${artifact.organizational.area}`] = areaArtifact
        }
      }

      // For operational artifacts, resolve actor references in flow steps
      if (this.isOperationalArtifact(artifact) && artifact.flow?.steps) {
        for (const step of artifact.flow.steps) {
          if (step.actor) {
            const actorArtifact = await this.artifactRepository.findById(
              step.actor
            )
            if (actorArtifact) {
              references[`Actor:${step.actor}`] = actorArtifact
            }
          }
        }
      }
    } catch (error) {
      console.warn(
        `Failed to resolve some semantic references for artifact ${artifact.metadata.id}:`,
        error
      )
    }

    return references
  }

  private async evaluateSemanticConditions(
    context: ExecutionContext
  ): Promise<boolean> {
    try {
      const currentArtifact = context.getSemanticState()?.currentArtifact
      if (!currentArtifact) {
        return true // No artifact to evaluate, continue
      }

      // Check if artifact dependencies are satisfied
      if (currentArtifact.relationships?.dependsOn) {
        const dependencyCheck = await this.validateDependencies(
          currentArtifact.relationships.dependsOn,
          context
        )
        if (!dependencyCheck) {
          return false
        }
      }

      // Evaluate execution conditions based on artifact type
      if (this.isOperationalArtifact(currentArtifact)) {
        return await this.evaluateOperationalConditions(
          currentArtifact,
          context
        )
      }

      // Evaluate foundational artifact constraints
      if (currentArtifact.uses?.authority) {
        const authorityValid = await this.validateAuthority(
          currentArtifact.uses.authority,
          context
        )
        if (!authorityValid) {
          return false
        }
      }

      // Check context constraints
      if (currentArtifact.uses?.context) {
        const contextValid = await this.validateContextConstraints(
          currentArtifact.uses.context,
          context
        )
        if (!contextValid) {
          return false
        }
      }

      // Validate intent alignment
      if (currentArtifact.uses?.intent) {
        const intentAligned = await this.validateIntentAlignment(
          currentArtifact.uses.intent,
          context
        )
        if (!intentAligned) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error evaluating semantic conditions:", error)
      return false // Fail safe - stop execution on evaluation errors
    }
  }

  private getRelevantEvents(artifact: SOLArtifact): string[] {
    const events: string[] = []

    // Base events for all artifacts
    events.push(`artifact.${artifact.type.toLowerCase()}.updated`)
    events.push(`artifact.${artifact.metadata.id}.changed`)

    // Events based on artifact type
    switch (artifact.type) {
      case "Process":
      case "Procedure":
        events.push(
          "process.step.completed",
          "process.error",
          "process.timeout"
        )
        break

      case "Event":
        events.push("event.triggered", "event.completed", "event.failed")
        break

      case "Policy":
      case "Principle":
        events.push("policy.violation", "compliance.check", "audit.required")
        break

      case "Actor":
        events.push(
          "actor.status.changed",
          "actor.capability.updated",
          "actor.assignment.changed"
        )
        break

      case "Indicator":
        events.push(
          "measurement.taken",
          "threshold.crossed",
          "evaluation.triggered"
        )
        break
    }

    // Events based on relationships
    if (artifact.relationships?.dependsOn) {
      artifact.relationships.dependsOn.forEach((depId) => {
        events.push(`dependency.${depId}.changed`)
      })
    }

    // Events based on organizational level
    if (artifact.organizational?.level) {
      events.push(`${artifact.organizational.level}.directive.issued`)
    }

    // Events based on area
    if (artifact.organizational?.area) {
      events.push(`area.${artifact.organizational.area}.event`)
    }

    return events
  }

  private async validateEventCoherence(
    event: SemanticEvent,
    context: ExecutionContext
  ): Promise<boolean> {
    try {
      const currentArtifact = context.getSemanticState()?.currentArtifact
      if (!currentArtifact) {
        return true // No current artifact context, event is coherent by default
      }

      // Validate event source authority
      if (event.metadata?.sourceArtifactId) {
        const sourceArtifact = await this.artifactRepository.findById(
          event.metadata.sourceArtifactId
        )
        if (
          sourceArtifact &&
          !(await this.validateEventSourceAuthority(
            sourceArtifact,
            event,
            context
          ))
        ) {
          return false
        }
      }

      // Check if event aligns with current execution context
      const contextAlignment = await this.validateEventContextAlignment(
        event,
        context
      )
      if (!contextAlignment) {
        return false
      }

      // Validate event timing and sequence
      const sequenceValid = await this.validateEventSequence(event, context)
      if (!sequenceValid) {
        return false
      }

      // Check semantic consistency with current artifact
      if (
        currentArtifact.type === "Process" ||
        currentArtifact.type === "Procedure"
      ) {
        return await this.validateProcessEventCoherence(
          event,
          currentArtifact,
          context
        )
      }

      // Validate policy compliance for policy artifacts
      if (
        currentArtifact.type === "Policy" ||
        currentArtifact.type === "Principle"
      ) {
        return await this.validatePolicyEventCoherence(
          event,
          currentArtifact,
          context
        )
      }

      return true
    } catch (error) {
      console.error("Error validating event coherence:", error)
      return false // Fail safe - treat as incoherent on validation errors
    }
  }

  private async handleIncoherentEvent(
    event: SemanticEvent,
    context: ExecutionContext
  ): Promise<void> {
    try {
      const incoherenceDetails = {
        eventType: event.type,
        timestamp: event.timestamp,
        source: event.source,
        contextId: context.getExecutionId(),
        artifactId: context.getSemanticState()?.currentArtifact?.metadata.id,
      }

      // Log the incoherent event
      console.warn("Incoherent event detected:", incoherenceDetails)

      // Publish incoherence alert
      await this.eventSystem.publish({
        id: `incoherence-${event.id || "unknown"}-${Date.now()}`,
        type: "semantic.incoherence.detected",
        source: "semantic-engine",
        payload: {
          originalEvent: event,
          incoherenceReason: await this.analyzeIncoherenceReason(
            event,
            context
          ),
          context: incoherenceDetails,
          suggestedActions: await this.generateIncoherenceActions(
            event,
            context
          ),
        },
        timestamp: new Date(),
        metadata: {
          version: "1.0",
          format: "json",
          classification: "internal",
          severity: "high",
          correlationId: context.getCorrelationId(),
          requiresResponse: await this.requiresManualIntervention(
            event,
            context
          ),
        },
        context: context.getContext().metadata.id,
        intent: context.getIntent().metadata.id,
        priority: EventPriority.CRITICAL,
      })

      // Take corrective action based on event type and severity
      await this.takeCorrectiveAction(event, context, incoherenceDetails)
    } catch (error: unknown) {
      console.error("Error handling incoherent event:", error)

      // Fallback: Publish critical error event
      await this.eventSystem.publish({
        id: `error-critical-${Date.now()}`,
        type: "semantic.error.critical",
        source: "semantic-engine",
        payload: {
          error: (error as Error).message,
          originalEvent: event,
          context: context.getExecutionId(),
        },
        timestamp: new Date(),
        metadata: {
          version: "1.0",
          format: "json",
          classification: "internal",
          severity: "critical",
        },
        context: context.getContext().metadata.id,
        intent: context.getIntent().metadata.id,
        priority: EventPriority.CRITICAL,
      })
    }
  }

  // Helper methods for new implementations
  private isOperationalArtifact(
    artifact: SOLArtifact
  ): artifact is OperationalArtifact {
    return ["Process", "Procedure", "Event", "Result", "Observation"].includes(
      artifact.type
    )
  }

  private createChoreographyPlan(steps: any[], context: ExecutionContext) {
    return {
      steps: steps.map((step) => ({
        id: step.id,
        actor: step.actor,
        dependencies: step.conditions || [],
        triggers: [`step.${step.id}.ready`],
        completionEvent: `step.${step.id}.completed`,
      })),
      participants: [...new Set(steps.map((step) => step.actor))],
      coordinationEvents: steps.map((step) => `step.${step.id}.ready`),
    }
  }

  private async enableDistributedCoordination(
    plan: any,
    context: ExecutionContext
  ): Promise<void> {
    // Subscribe to coordination events for each step
    for (const step of plan.steps) {
      await this.eventSystem.subscribe({
        id: `choreography-${step.id}-${Date.now()}`,
        subscriberId: "semantic-engine",
        eventTypes: [step.completionEvent],
        filters: [],
        handler: async (event) => {
          // Trigger next steps in choreography
          await this.triggerNextChoreographySteps(step, plan, context)
          return { success: true }
        },
        isActive: true,
        metadata: {
          created: new Date(),
          triggerCount: 0,
          maxRetries: 3,
          retryDelay: 1000,
          choreographyId: plan.id,
        },
      })
    }
  }

  private async triggerNextChoreographySteps(
    completedStep: any,
    plan: any,
    context: ExecutionContext
  ): Promise<void> {
    // Find steps that depend on the completed step
    const nextSteps = plan.steps.filter((step: any) =>
      step.dependencies.includes(completedStep.id)
    )

    // Trigger ready events for next steps
    for (const nextStep of nextSteps) {
      await this.eventSystem.publish({
        id: `step-trigger-${nextStep.id}-${Date.now()}`,
        type: nextStep.triggers[0],
        source: "semantic-engine",
        payload: { stepId: nextStep.id, triggeredBy: completedStep.id },
        timestamp: new Date(),
        metadata: {
          version: "1.0",
          format: "json",
          classification: "internal",
          severity: "low",
          choreographyId: plan.id,
        },
        context: context.getContext().metadata.id,
        intent: context.getIntent().metadata.id,
        priority: EventPriority.NORMAL,
      })
    }
  }

  private async validateDependencies(
    dependencies: string[],
    context: ExecutionContext
  ): Promise<boolean> {
    for (const depId of dependencies) {
      const depArtifact = await this.artifactRepository.findById(depId)
      if (!depArtifact) {
        return false
      }

      // Check if dependency is in valid state for current execution
      const validationResult = await this.validationSystem.validateArtifact(
        depArtifact
      )
      if (!validationResult.isValid) {
        return false
      }
    }
    return true
  }

  private async evaluateOperationalConditions(
    artifact: OperationalArtifact,
    context: ExecutionContext
  ): Promise<boolean> {
    // Check if all required actors are available
    if (artifact.flow?.steps) {
      for (const step of artifact.flow.steps) {
        const actor = await this.artifactRepository.findById(step.actor)
        if (!actor || !this.isActorAvailable(actor, context)) {
          return false
        }
      }
    }
    return true
  }

  private isActorAvailable(
    actor: SOLArtifact,
    context: ExecutionContext
  ): boolean {
    // Simple availability check - can be enhanced with more sophisticated logic
    return actor.metadata.status === "active"
  }

  private async validateAuthority(
    authorityId: string,
    context: ExecutionContext
  ): Promise<boolean> {
    const authority = await this.artifactRepository.findById(authorityId)
    if (!authority) return false

    // Check if authority is active and valid
    return (
      authority.metadata.status === "active" &&
      (!authority.content.validUntil ||
        new Date(authority.content.validUntil) > new Date())
    )
  }

  private async validateContextConstraints(
    contextId: string,
    context: ExecutionContext
  ): Promise<boolean> {
    const contextArtifact = await this.artifactRepository.findById(contextId)
    if (!contextArtifact) return false

    // Validate scope and stakeholder constraints
    const currentActor = context.getActor()
    return (
      contextArtifact.content.stakeholders?.includes(
        currentActor.metadata.id
      ) ?? true
    )
  }

  private async validateIntentAlignment(
    intentId: string,
    context: ExecutionContext
  ): Promise<boolean> {
    const intent = await this.artifactRepository.findById(intentId)
    if (!intent) return false

    // Check intent mode compatibility with current execution
    const intentMode = intent.content.mode
    return intentMode !== "prohibit" // Simple check - can be enhanced
  }

  private async validateEventSourceAuthority(
    sourceArtifact: SOLArtifact,
    event: SemanticEvent,
    context: ExecutionContext
  ): Promise<boolean> {
    if (sourceArtifact.type === "Authority") {
      return sourceArtifact.content.permissions?.includes(event.type) ?? false
    }
    return true // Non-authority artifacts can emit events by default
  }

  private async validateEventContextAlignment(
    event: SemanticEvent,
    context: ExecutionContext
  ): Promise<boolean> {
    // Check if event aligns with current execution context
    const correlationId = context.getCorrelationId()
    return (
      !event.metadata?.correlationId ||
      event.metadata.correlationId === correlationId
    )
  }

  private async validateEventSequence(
    event: SemanticEvent,
    context: ExecutionContext
  ): Promise<boolean> {
    // Validate event timing and sequence
    const executionStart = context.getSemanticState()?.startTime
    return !executionStart || event.timestamp >= executionStart
  }

  private async validateProcessEventCoherence(
    event: SemanticEvent,
    artifact: OperationalArtifact,
    context: ExecutionContext
  ): Promise<boolean> {
    if (event.type.startsWith("process.") && artifact.flow?.steps) {
      const currentStepId = context.getSemanticState()?.currentStepId
      if (currentStepId) {
        const currentStep = artifact.flow.steps.find(
          (step) => step.id === currentStepId
        )
        return (
          currentStep?.outputs?.some((output) => event.type.includes(output)) ??
          true
        )
      }
    }
    return true
  }

  private async validatePolicyEventCoherence(
    event: SemanticEvent,
    artifact: SOLArtifact,
    context: ExecutionContext
  ): Promise<boolean> {
    if (event.type === "policy.violation") {
      return false
    }
    return true
  }

  private async analyzeIncoherenceReason(
    event: SemanticEvent,
    context: ExecutionContext
  ): Promise<string> {
    // Analyze why the event is incoherent
    const reasons = []

    if (
      event.timestamp < (context.getSemanticState()?.startTime || new Date(0))
    ) {
      reasons.push("Event timestamp predates execution start")
    }

    if (
      event.metadata?.correlationId &&
      event.metadata.correlationId !== context.getCorrelationId()
    ) {
      reasons.push("Event correlation ID mismatch")
    }

    return reasons.join("; ") || "Unknown incoherence reason"
  }

  private async generateIncoherenceActions(
    event: SemanticEvent,
    context: ExecutionContext
  ): Promise<string[]> {
    const actions = []

    if (event.type.includes("error")) {
      actions.push("Review error handling procedures")
      actions.push("Check system health")
    }

    if (event.type.includes("policy.violation")) {
      actions.push("Audit compliance status")
      actions.push("Review authorization chain")
    }

    actions.push("Log for manual review")
    return actions
  }

  private async requiresManualIntervention(
    event: SemanticEvent,
    context: ExecutionContext
  ): Promise<boolean> {
    // Determine if incoherent event requires manual intervention
    return (
      event.type.includes("critical") ||
      event.type.includes("security") ||
      event.type.includes("policy.violation")
    )
  }

  private async takeCorrectiveAction(
    event: SemanticEvent,
    context: ExecutionContext,
    details: any
  ): Promise<void> {
    if (event.type.includes("error")) {
      // Implement error recovery logic
      await this.eventSystem.publish({
        id: `recovery-initiated-${Date.now()}`,
        type: "system.recovery.initiated",
        source: "semantic-engine",
        payload: { originalEvent: event, context: details },
        timestamp: new Date(),
        metadata: {
          version: "1.0",
          format: "json",
          classification: "internal",
          severity: "low", // Default severity for recovery
          automated: true,
        },
        context: context.getContext().metadata.id,
        intent: context.getIntent().metadata.id,
        priority: EventPriority.NORMAL,
      })
    }

    if (await this.requiresManualIntervention(event, context)) {
      // Alert system administrators
      await this.eventSystem.publish({
        id: `manual-intervention-alert-${Date.now()}`,
        type: "system.alert.manual_intervention_required",
        source: "semantic-engine",
        payload: { event, context: details, priority: "high" },
        timestamp: new Date(),
        metadata: {
          version: "1.0",
          format: "json",
          classification: "restricted", // Restricted as it's an alert
          severity: "critical",
          requiresResponse: true,
        },
        context: context.getContext().metadata.id,
        intent: context.getIntent().metadata.id,
        priority: EventPriority.EMERGENCY,
      })
    }
  }
}
