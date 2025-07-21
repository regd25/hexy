/**
 * Artifacts Index
 * Centralized exports for all artifacts types and utilities
 */

// Core artifact types
export type {
  ArtifactType,
  ArtifactUses,
  ArtifactRelationships,
  ArtifactOrganizational,
  ArtifactContentMap,
  Artifact,
  Metadata,
  ValidationResult
} from './BaseArtifact'

// Foundational artifacts
export type {
  IntentArtifact,
  ContextArtifact,
  AuthorityArtifact,
  EvaluationArtifact
} from './FoundationalArtifacts'

// Strategic artifacts
export type {
  VisionArtifact,
  PolicyArtifact,
  ConceptArtifact,
  PrincipleArtifact,
  GuidelineArtifact,
  IndicatorArtifact
} from './StrategicArtifacts'

// Operational artifacts
export type {
  ProcessArtifact,
  ProcedureArtifact,
  EventArtifact,
  ObservationArtifact,
  ResultArtifact
} from './OperationalArtifacts'

// Organizational artifacts
export type {
  ActorArtifact,
  AreaArtifact
} from './OrganizationalArtifacts'

// Utility functions
export {
  isFoundationalArtifact,
  isStrategicArtifact,
  isOperationalArtifact,
  isOrganizationalArtifact,
  getArtifactType,
  validateArtifactStructure,
  createArtifactReference,
  parseArtifactReference
} from './BaseArtifact'

// Validation utilities
export {
  validateSemanticReferences,
  validateCompositionStructure,
  validateHierarchyRules,
  validateFlowSemantics
} from '../validation/ValidationRuleEngine'

// Interpreter utilities
export {
  interpretArtifact,
  interpretIntent,
  interpretContext,
  interpretAuthority,
  interpretEvaluation,
  interpretVision,
  interpretPolicy,
  interpretProcess,
  interpretActor
} from '../interpreters'

// Repository utilities
export {
  ArtifactRepository,
  InMemoryArtifactRepository,
  FileSystemArtifactRepository
} from '../repositories/ArtifactRepository'

// Plugin system
export {
  PluginManager,
  PluginCapability,
  PluginCapabilityRegistry
} from '../plugins'

// Engine system
export {
  SemanticEngine,
  OrchestrationMode,
  OrchestrationStrategy,
  OrchestrationModeFactory,
  OrchestrationStrategyRegistry
} from '../engine'

// Decision framework
export {
  SemanticDecisionFramework,
  ConditionEvaluator,
  DecisionResult
} from '../decision'

// Event system
export {
  EventSystem,
  EventHandler,
  EventEmitter
} from '../events'

/**
 * Artifacts Architecture Summary
 * 
 * This module provides a complete, modular architecture for artifacts:
 * 
 * 🧱 **Foundational Layer** (BaseArtifact.ts)
 * - Core artifact interface and metadata
 * - Type definitions and validation utilities
 * - Reference parsing and creation
 * 
 * 🏗️ **Strategic Layer** (StrategicArtifacts.ts)
 * - Vision, Policy, Concept artifacts
 * - Strategic planning and governance
 * - Business rules and principles
 * 
 * ⚡ **Operational Layer** (OperationalArtifacts.ts)
 * - Process, Procedure, Event artifacts
 * - Workflow and execution logic
 * - Event-driven architecture
 * 
 * 🏢 **Organizational Layer** (OrganizationalArtifacts.ts)
 * - Actor, Area artifacts
 * - Roles and responsibilities
 * - Organizational structure
 * 
 * 🔧 **Supporting Systems**
 * - Validation: Semantic and structural validation
 * - Interpretation: Artifact processing and analysis
 * - Repository: Storage and retrieval
 * - Plugins: Extensibility system
 * - Engine: Execution orchestration
 * - Events: Event-driven communication
 * - Decisions: Semantic decision framework
 * 
 * **Key Principles:**
 * - Composition over inheritance
 * - Semantic coherence
 * - Traceability to vision
 * - Modular extensibility
 * - Type safety throughout
 */
