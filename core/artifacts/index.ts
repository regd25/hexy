/**
 * SOL Artifacts Index
 * Centralized exports for all SOL artifact types and utilities
 */

// ============================================================================
// BASE ARTIFACT EXPORTS
// ============================================================================

export type {
  Metadata,
  SOLArtifactType,
  SOLArtifactUses,
  SOLArtifactRelationships,
  SOLArtifactOrganizational,
  SOLArtifactContentMap,
  SOLArtifact,
  ArtifactValidationRule,
  ArtifactReference,
  FlowDefinition,
  FlowStep,
  ErrorHandling,
  ParallelismConfig,
  RetryConfig,
  LifecycleDefinition,
  LifecycleTransition,
  WorkflowStep,
} from "./BaseArtifact"

export { getTypedContent, createArtifact } from "./BaseArtifact"

// ============================================================================
// FOUNDATIONAL ARTIFACTS
// ============================================================================

export type {
  IntentContent,
  ContextContent,
  AuthorityContent,
  EvaluationContent,
  EvaluationCriteria,
  EvaluationQualitativeCriteria,
  EvaluationQuantitativeCriteria,
  IntentArtifact,
  ContextArtifact,
  AuthorityArtifact,
  EvaluationArtifact,
} from "./FoundationalArtifacts"

export {
  isIntentArtifact,
  isContextArtifact,
  isAuthorityArtifact,
  isEvaluationArtifact,
  isFoundationalArtifact,
  createIntentArtifact,
  createContextArtifact,
  createAuthorityArtifact,
  createEvaluationArtifact,
} from "./FoundationalArtifacts"

// ============================================================================
// ORGANIZATIONAL ARTIFACTS
// ============================================================================

export type {
  ActorContent,
  AreaContent,
  ActorArtifact,
  AreaArtifact,
} from "./OrganizationalArtifacts"

export {
  isActorArtifact,
  isAreaArtifact,
  isOrganizationalArtifact,
  createActorArtifact,
  createAreaArtifact,
  validateActorContent,
  validateAreaContent,
} from "./OrganizationalArtifacts"

// ============================================================================
// OPERATIONAL ARTIFACTS
// ============================================================================

export type {
  ProcessContent,
  ProcedureContent,
  ProcedureStep,
  EventContent,
  ResultContent,
  ObservationContent,
  ProcessArtifact,
  ProcedureArtifact,
  EventArtifact,
  ResultArtifact,
  ObservationArtifact,
} from "./OperationalArtifacts"

export {
  isProcessArtifact,
  isProcedureArtifact,
  isEventArtifact,
  isResultArtifact,
  isObservationArtifact,
  isOperationalArtifact,
  createProcessArtifact,
  createProcedureArtifact,
  createEventArtifact,
  createResultArtifact,
  createObservationArtifact,
  validateProcessContent,
  validateProcedureContent,
  validateEventContent,
  validateResultContent,
  validateObservationContent,
} from "./OperationalArtifacts"

// ============================================================================
// STRATEGIC ARTIFACTS
// ============================================================================

export type {
  VisionContent,
  PolicyContent,
  PolicyRule,
  PolicyException,
  ConceptContent,
  PrincipleContent,
  GuidelineContent,
  IndicatorContent,
  VisionArtifact,
  PolicyArtifact,
  ConceptArtifact,
  PrincipleArtifact,
  GuidelineArtifact,
  IndicatorArtifact,
} from "./StrategicArtifacts"

export {
  isVisionArtifact,
  isPolicyArtifact,
  isConceptArtifact,
  isPrincipleArtifact,
  isGuidelineArtifact,
  isIndicatorArtifact,
  isStrategicArtifact,
  createVisionArtifact,
  createPolicyArtifact,
  createConceptArtifact,
  createPrincipleArtifact,
  createGuidelineArtifact,
  createIndicatorArtifact,
  validateVisionContent,
  validatePolicyContent,
  validateConceptContent,
  validatePrincipleContent,
  validateGuidelineContent,
  validateIndicatorContent,
} from "./StrategicArtifacts"

// ============================================================================
// ARTIFACT STATISTICS
// ============================================================================

export const ARTIFACT_STATS = {
  foundational: 4,
  organizational: 2,
  operational: 5,
  strategic: 6,
  total: 17,
} as const

export const ARTIFACT_TYPES_BY_CATEGORY = {
  foundational: ["Intent", "Context", "Authority", "Evaluation"] as const,
  organizational: ["Actor", "Area"] as const,
  operational: [
    "Process",
    "Procedure",
    "Event",
    "Result",
    "Observation",
  ] as const,
  strategic: [
    "Vision",
    "Policy",
    "Concept",
    "Principle",
    "Guideline",
    "Indicator",
  ] as const,
} as const

/**
 * SOL Artifacts Architecture Summary
 *
 * This module provides a complete, modular architecture for SOL artifacts:
 *
 * 📁 BaseArtifact.ts - Common interfaces and utilities
 * 📁 FoundationalArtifacts.ts - Core artifacts (4 types)
 * 📁 OrganizationalArtifacts.ts - Structure artifacts (2 types)
 * 📁 OperationalArtifacts.ts - Execution artifacts (5 types)
 * 📁 StrategicArtifacts.ts - Planning artifacts (6 types)
 * 📁 index.ts - Centralized exports
 *
 * Total: 17 artifact types with dedicated interfaces
 *
 * Each file follows the Single Responsibility Principle:
 * - One responsibility per file
 * - Clear separation of concerns
 * - Extensible without modification
 * - Type-safe throughout
 */
