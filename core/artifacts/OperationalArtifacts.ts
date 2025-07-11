/**
 * Operational Artifacts - SOL artifacts for tactical and operational execution
 * Contains Process, Procedure, Event, Result, and Observation artifacts
 */

import {
  SOLArtifact,
  SOLArtifactUses,
  SOLArtifactOrganizational,
  SOLArtifactRelationships,
  FlowDefinition,
  LifecycleDefinition,
  WorkflowStep,
  Metadata,
} from "./BaseArtifact"

// ============================================================================
// OPERATIONAL ARTIFACT CONTENT SCHEMAS
// ============================================================================

export interface ProcessContent {
  name: string
  description: string
  steps: WorkflowStep[]
  actors: string[]
  conditions: string[]
  priority: "low" | "medium" | "high" | "critical"
  timeout?: number
  retryPolicy?: {
    maxRetries: number
    backoffDelay: number
  }
  parallelExecution?: boolean
  errorHandling?: "stop" | "continue" | "retry" | "escalate"
  flow?: FlowDefinition
  lifecycle?: LifecycleDefinition
}

export interface ProcedureContent {
  name: string
  description: string
  instructions: ProcedureStep[]
  requiredRoles: string[]
  tools?: string[]
  duration?: number
  complexity: "low" | "medium" | "high"
}

export interface ProcedureStep {
  step: number
  instruction: string
  requiredRole?: string
  tools?: string[]
  validationCriteria?: string[]
  outputs?: string[]
}

export interface EventContent {
  name: string
  description: string
  trigger: string
  conditions?: string[]
  actions: string[]
  frequency?: "once" | "recurring" | "on-demand"
  schedule?: string
  timeout?: number
}

export interface ResultContent {
  name: string
  description: string
  value: any
  unit?: string
  timestamp: Date
  source: string
  confidence?: number
  metadata?: Record<string, any>
}

export interface ObservationContent {
  name: string
  description: string
  observer: string
  observed: string
  timestamp: Date
  value: any
  context?: Record<string, any>
  reliability?: number
}

// ============================================================================
// OPERATIONAL ARTIFACT INTERFACES
// ============================================================================

export interface ProcessArtifact extends SOLArtifact<"Process"> {
  type: "Process"
  content: ProcessContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  }
  // Operational artifacts have flow and lifecycle
  flow?: FlowDefinition
  lifecycle?: LifecycleDefinition
}

export interface ProcedureArtifact extends SOLArtifact<"Procedure"> {
  type: "Procedure"
  content: ProcedureContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  }
  // Operational artifacts have flow and lifecycle
  flow?: FlowDefinition
  lifecycle?: LifecycleDefinition
}

export interface EventArtifact extends SOLArtifact<"Event"> {
  type: "Event"
  content: EventContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  }
  // Operational artifacts have flow and lifecycle
  flow?: FlowDefinition
  lifecycle?: LifecycleDefinition
}

export interface ResultArtifact extends SOLArtifact<"Result"> {
  type: "Result"
  content: ResultContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  }
  // Operational artifacts have flow and lifecycle
  flow?: FlowDefinition
  lifecycle?: LifecycleDefinition
}

export interface ObservationArtifact extends SOLArtifact<"Observation"> {
  type: "Observation"
  content: ObservationContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  }
  // Operational artifacts have flow and lifecycle
  flow?: FlowDefinition
  lifecycle?: LifecycleDefinition
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isProcessArtifact(
  artifact: SOLArtifact
): artifact is ProcessArtifact {
  return artifact.type === "Process"
}

export function isProcedureArtifact(
  artifact: SOLArtifact
): artifact is ProcedureArtifact {
  return artifact.type === "Procedure"
}

export function isEventArtifact(
  artifact: SOLArtifact
): artifact is EventArtifact {
  return artifact.type === "Event"
}

export function isResultArtifact(
  artifact: SOLArtifact
): artifact is ResultArtifact {
  return artifact.type === "Result"
}

export function isObservationArtifact(
  artifact: SOLArtifact
): artifact is ObservationArtifact {
  return artifact.type === "Observation"
}

export function isOperationalArtifact(
  artifact: SOLArtifact
): artifact is
  | ProcessArtifact
  | ProcedureArtifact
  | EventArtifact
  | ResultArtifact
  | ObservationArtifact {
  return ["Process", "Procedure", "Event", "Result", "Observation"].includes(
    artifact.type
  )
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createProcessArtifact(
  metadata: Metadata,
  content: ProcessContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  },
  options?: {
    relationships?: SOLArtifactRelationships
    flow?: FlowDefinition
    lifecycle?: LifecycleDefinition
  }
): ProcessArtifact {
  return {
    type: "Process",
    metadata,
    content,
    uses,
    organizational,
    ...(options?.relationships && { relationships: options.relationships }),
    ...(options?.flow && { flow: options.flow }),
    ...(options?.lifecycle && { lifecycle: options.lifecycle }),
    isValid: false,
    isExecutable: true,
  }
}

export function createProcedureArtifact(
  metadata: Metadata,
  content: ProcedureContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  },
  options?: {
    relationships?: SOLArtifactRelationships
    flow?: FlowDefinition
    lifecycle?: LifecycleDefinition
  }
): ProcedureArtifact {
  return {
    type: "Procedure",
    metadata,
    content,
    uses,
    organizational,
    ...(options?.relationships && { relationships: options.relationships }),
    ...(options?.flow && { flow: options.flow }),
    ...(options?.lifecycle && { lifecycle: options.lifecycle }),
    isValid: false,
    isExecutable: true,
  }
}

export function createEventArtifact(
  metadata: Metadata,
  content: EventContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  },
  options?: {
    relationships?: SOLArtifactRelationships
    flow?: FlowDefinition
    lifecycle?: LifecycleDefinition
  }
): EventArtifact {
  return {
    type: "Event",
    metadata,
    content,
    uses,
    organizational,
    ...(options?.relationships && { relationships: options.relationships }),
    ...(options?.flow && { flow: options.flow }),
    ...(options?.lifecycle && { lifecycle: options.lifecycle }),
    isValid: false,
    isExecutable: true,
  }
}

export function createResultArtifact(
  metadata: Metadata,
  content: ResultContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  },
  options?: {
    relationships?: SOLArtifactRelationships
    flow?: FlowDefinition
    lifecycle?: LifecycleDefinition
  }
): ResultArtifact {
  return {
    type: "Result",
    metadata,
    content,
    uses,
    organizational,
    ...(options?.relationships && { relationships: options.relationships }),
    ...(options?.flow && { flow: options.flow }),
    ...(options?.lifecycle && { lifecycle: options.lifecycle }),
    isValid: false,
    isExecutable: false,
  }
}

export function createObservationArtifact(
  metadata: Metadata,
  content: ObservationContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & {
    level: "tactical" | "operational"
  },
  options?: {
    relationships?: SOLArtifactRelationships
    flow?: FlowDefinition
    lifecycle?: LifecycleDefinition
  }
): ObservationArtifact {
  return {
    type: "Observation",
    metadata,
    content,
    uses,
    organizational,
    ...(options?.relationships && { relationships: options.relationships }),
    ...(options?.flow && { flow: options.flow }),
    ...(options?.lifecycle && { lifecycle: options.lifecycle }),
    isValid: false,
    isExecutable: false,
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateProcessContent(content: ProcessContent): boolean {
  return !!(
    content.name &&
    content.description &&
    Array.isArray(content.steps) &&
    content.steps.length > 0 &&
    Array.isArray(content.actors) &&
    content.actors.length > 0 &&
    Array.isArray(content.conditions) &&
    content.priority &&
    ["low", "medium", "high", "critical"].includes(content.priority)
  )
}

export function validateProcedureContent(content: ProcedureContent): boolean {
  return !!(
    content.name &&
    content.description &&
    Array.isArray(content.instructions) &&
    content.instructions.length > 0 &&
    Array.isArray(content.requiredRoles) &&
    content.complexity &&
    ["low", "medium", "high"].includes(content.complexity)
  )
}

export function validateEventContent(content: EventContent): boolean {
  return !!(
    content.name &&
    content.description &&
    content.trigger &&
    Array.isArray(content.actions) &&
    content.actions.length > 0
  )
}

export function validateResultContent(content: ResultContent): boolean {
  return !!(
    content.name &&
    content.description &&
    content.value !== undefined &&
    content.timestamp &&
    content.source
  )
}

export function validateObservationContent(
  content: ObservationContent
): boolean {
  return !!(
    content.name &&
    content.description &&
    content.observer &&
    content.observed &&
    content.timestamp &&
    content.value !== undefined
  )
}

// ============================================================================
// CONTENT TYPE MAPPING EXTENSION
// ============================================================================

declare module "./BaseArtifact" {
  interface SOLArtifactContentMap {
    Process: ProcessContent
    Procedure: ProcedureContent
    Event: EventContent
    Result: ResultContent
    Observation: ObservationContent
  }
}
