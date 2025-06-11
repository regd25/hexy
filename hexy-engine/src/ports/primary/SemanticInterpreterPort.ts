import { SOLArtifact, ValidationResult } from '../../domain/entities/SOLArtifact';

/**
 * Primary port for semantic interpretation operations
 * Defines the contract for interpreting and validating SOL artifacts
 */
export interface SemanticInterpreterPort {
  /**
   * Parse a SOL YAML document into domain entities
   */
  parseSOLDocument(yamlContent: string): Promise<SOLArtifact[]>;

  /**
   * Validate semantic coherence of an artifact
   */
  validateArtifact(artifact: SOLArtifact): Promise<ValidationResult>;

  /**
   * Validate coherence between multiple related artifacts
   */
  validateCoherence(artifacts: SOLArtifact[]): Promise<CoherenceValidationResult>;

  /**
   * Interpret a vision and extract actionable insights
   */
  interpretVision(visionId: string): Promise<VisionInterpretationResult>;

  /**
   * Check if a process is semantically valid for execution
   */
  canExecuteProcess(processId: string): Promise<ExecutabilityResult>;

  /**
   * Get semantic dependencies of an artifact
   */
  getDependencies(artifactId: string): Promise<string[]>;

  /**
   * Find artifacts that might conflict with the given one
   */
  findConflicts(artifact: SOLArtifact): Promise<ConflictAnalysisResult>;
}

export interface CoherenceValidationResult {
  isCoherent: boolean;
  narrativeGaps: string[];
  missingArtifacts: string[];
  recommendedActions: string[];
}

export interface VisionInterpretationResult {
  visionId: string;
  actionableInsights: string[];
  requiredCapabilities: string[];
  suggestedProcesses: string[];
  semanticThemes: string[];
}

export interface ExecutabilityResult {
  canExecute: boolean;
  blockers: string[];
  warnings: string[];
  missingActors: string[];
  missingPolicies: string[];
}

export interface ConflictAnalysisResult {
  hasConflicts: boolean;
  conflictingArtifacts: string[];
  conflictDescriptions: string[];
  resolutionSuggestions: string[];
} 