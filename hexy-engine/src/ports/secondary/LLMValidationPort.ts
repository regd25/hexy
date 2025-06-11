import { SOLArtifact } from '../../domain/entities/SOLArtifact'
import { Process } from '../../domain/entities/Process'
import { Policy } from '../../domain/entities/Policy'
import { Actor } from '../../domain/entities/Actor'

/**
 * Secondary port for LLM-based semantic validation
 * Defines the contract for AI model validation services
 */
export interface LLMValidationPort {
  /**
   * Validate a SOL artifact using semantic analysis
   */
  validateArtifact(artifact: SOLArtifact, context: ValidationContext): Promise<LLMValidationResult>

  /**
   * Evaluate a process for semantic coherence
   */
  validateProcess(process: Process, context: ValidationContext): Promise<ProcessValidationResult>

  /**
   * Evaluate a policy for semantic adequacy
   */
  validatePolicy(policy: Policy, context: ValidationContext): Promise<PolicyValidationResult>

  /**
   * Verify an actor definition
   */
  verifyActor(actor: Actor, context: ValidationContext): Promise<ActorValidationResult>

  /**
   * Check if the LLM service is available
   */
  isAvailable(): Promise<boolean>

  /**
   * Get LLM capabilities and model information
   */
  getCapabilities(): Promise<LLMCapabilities>
}

export interface ValidationContext {
  domainId?: string
  visionContext?: string
  relatedArtifacts?: SOLArtifact[]
  validationScope?: ValidationScope
  priority?: ValidationPriority
  timeout?: number
}

export interface LLMValidationResult {
  isValid: boolean
  confidence: number // 0-1 scale
  semanticScore: number // 0-100 scale
  errors: SemanticError[]
  warnings: SemanticWarning[]
  suggestions: string[]
  reasoning: string
  processingTime: number
}

export interface ProcessValidationResult extends LLMValidationResult {
  stepAnalysis: StepAnalysis[]
  actorCoherence: ActorCoherenceCheck[]
  visionAlignment: VisionAlignmentCheck
}

export interface PolicyValidationResult extends LLMValidationResult {
  premiseClarity: number // 0-100 scale
  enforceability: number // 0-100 scale
  contextualRelevance: number // 0-100 scale
}

export interface ActorValidationResult extends LLMValidationResult {
  capabilityCoherence: number // 0-100 scale
  typeAppropriatenesss: number // 0-100 scale
  domainFit: number // 0-100 scale
}

export interface StepAnalysis {
  stepIndex: number
  actor: string
  action: string
  semanticClarity: number
  executability: number
  issues: string[]
}

export interface ActorCoherenceCheck {
  actorId: string
  isPresent: boolean
  capabilityMatch: boolean
  availabilityAssumption: boolean
}

export interface VisionAlignmentCheck {
  isAligned: boolean
  alignmentScore: number // 0-100
  misalignmentReasons: string[]
}

export interface SemanticError {
  code: string
  message: string
  severity: ErrorSeverity
  location?: ArtifactLocation
  suggestion?: string
}

export interface SemanticWarning {
  code: string
  message: string
  impact: WarningImpact
  location?: ArtifactLocation
}

export interface ArtifactLocation {
  artifact: string
  section?: string
  line?: number
}

export interface LLMCapabilities {
  modelName: string
  version: string
  supportedLanguages: string[]
  maxTokens: number
  averageResponseTime: number
  confidence: number
  specializations: string[]
}

export enum ValidationScope {
  BASIC = 'basic',
  COMPREHENSIVE = 'comprehensive',
  DEEP_ANALYSIS = 'deep_analysis'
}

export enum ValidationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum WarningImpact {
  COSMETIC = 'cosmetic',
  MINOR = 'minor',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant'
}

export class LLMValidationError extends Error {
  constructor(
    message: string,
    public readonly code: LLMValidationErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'LLMValidationError'
  }
}

export type LLMValidationErrorCode = 
  | 'LLM_UNAVAILABLE'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AUTHENTICATION_FAILED'
  | 'UNSUPPORTED_ARTIFACT_TYPE' 