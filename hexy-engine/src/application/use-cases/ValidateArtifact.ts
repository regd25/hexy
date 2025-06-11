import { SOLArtifact, ValidationResult, SOLArtifactType } from '../../domain/entities/SOLArtifact';
import { SemanticInterpreterPort, CoherenceValidationResult } from '../../ports/primary/SemanticInterpreterPort';
import { PersistencePort } from '../../ports/secondary/PersistencePort';

/**
 * Use case for validating SOL artifacts
 * Performs semantic validation and coherence checking
 */
export class ValidateArtifactUseCase {
  constructor(
    private readonly semanticInterpreter: SemanticInterpreterPort,
    private readonly persistence: PersistencePort
  ) {}

  /**
   * Validate a single artifact
   */
  public async validateSingle(request: ValidateSingleRequest): Promise<ValidateSingleResponse> {
    if (!request.artifactId) {
      throw new ValidateArtifactError('Artifact ID is required', 'INVALID_INPUT');
    }

    try {
      // 1. Load the artifact
      const artifact = await this.loadArtifact(request.artifactId);
      if (!artifact) {
        throw new ValidateArtifactError(
          `Artifact with ID ${request.artifactId} not found`,
          'ARTIFACT_NOT_FOUND'
        );
      }

      // 2. Perform basic validation
      const basicValidation = artifact.validate();

      // 3. Perform semantic validation
      const semanticValidation = await this.semanticInterpreter.validateArtifact(artifact);

      // 4. Check for conflicts
      const conflictAnalysis = await this.semanticInterpreter.findConflicts(artifact);

      // 5. Combine results
      const overallValid = basicValidation.isValid && semanticValidation.isValid && !conflictAnalysis.hasConflicts;

      return {
        valid: overallValid,
        artifactId: request.artifactId,
        basicValidation,
        semanticValidation,
        conflictAnalysis,
        recommendations: this.generateRecommendations(basicValidation, semanticValidation, conflictAnalysis)
      };

    } catch (error) {
      if (error instanceof ValidateArtifactError) {
        throw error;
      }
      
      throw new ValidateArtifactError(
        `Unexpected error during artifact validation: ${(error as Error).message}`,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Validate coherence between multiple artifacts
   */
  public async validateCoherence(request: ValidateCoherenceRequest): Promise<ValidateCoherenceResponse> {
    if (!request.artifactIds || request.artifactIds.length === 0) {
      throw new ValidateArtifactError('At least one artifact ID is required', 'INVALID_INPUT');
    }

    try {
      // 1. Load all artifacts
      const artifacts: SOLArtifact[] = [];
      for (const artifactId of request.artifactIds) {
        const artifact = await this.loadArtifact(artifactId);
        if (!artifact) {
          throw new ValidateArtifactError(
            `Artifact with ID ${artifactId} not found`,
            'ARTIFACT_NOT_FOUND'
          );
        }
        artifacts.push(artifact);
      }

      // 2. Validate individual artifacts first
      const individualValidations: Record<string, ValidationResult> = {};
      for (const artifact of artifacts) {
        individualValidations[artifact.id] = artifact.validate();
      }

      // 3. Perform coherence validation
      const coherenceResult = await this.semanticInterpreter.validateCoherence(artifacts);

      // 4. Analyze domain consistency
      const domainConsistency = this.analyzeDomainConsistency(artifacts);

      return {
        coherent: coherenceResult.isCoherent && domainConsistency.consistent,
        artifactIds: request.artifactIds,
        individualValidations,
        coherenceResult,
        domainConsistency,
        recommendations: [
          ...coherenceResult.recommendedActions,
          ...domainConsistency.recommendations
        ]
      };

    } catch (error) {
      if (error instanceof ValidateArtifactError) {
        throw error;
      }
      
      throw new ValidateArtifactError(
        `Unexpected error during coherence validation: ${(error as Error).message}`,
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Validate all artifacts in a domain
   */
  public async validateDomain(domainId: string): Promise<ValidateDomainResponse> {
    try {
      // 1. Load all artifacts for the domain
      const artifacts = await this.persistence.findArtifacts({
        text: domainId, // Assuming domain is stored in artifact content
        limit: 1000
      });

      if (artifacts.length === 0) {
        return {
          valid: true,
          domainId,
          artifactCount: 0,
          validationResults: [],
          coherenceResult: {
            isCoherent: true,
            narrativeGaps: [],
            missingArtifacts: [],
            recommendedActions: []
          },
          recommendations: []
        };
      }

      // 2. Validate coherence
      const coherenceRequest: ValidateCoherenceRequest = {
        artifactIds: artifacts.map(a => a.id)
      };
      const coherenceResponse = await this.validateCoherence(coherenceRequest);

      // 3. Check for missing essential artifacts
      const missingEssentials = this.checkMissingEssentialArtifacts(artifacts);

      return {
        valid: coherenceResponse.coherent && missingEssentials.length === 0,
        domainId,
        artifactCount: artifacts.length,
        validationResults: Object.values(coherenceResponse.individualValidations),
        coherenceResult: coherenceResponse.coherenceResult,
        missingEssentialArtifacts: missingEssentials,
        recommendations: [
          ...coherenceResponse.recommendations,
          ...missingEssentials.map(type => `Consider adding a ${type} artifact to complete the domain`)
        ]
      };

    } catch (error) {
      throw new ValidateArtifactError(
        `Unexpected error during domain validation: ${(error as Error).message}`,
        'VALIDATION_ERROR'
      );
    }
  }

  private async loadArtifact(artifactId: string): Promise<SOLArtifact | undefined> {
    // Try to load as different types since we don't know the type upfront
    const artifact = await this.persistence.findArtifacts({
      text: artifactId,
      limit: 1
    });
    
    return artifact.length > 0 ? artifact[0] : undefined;
  }

  private generateRecommendations(
    basic: ValidationResult,
    semantic: ValidationResult,
    conflicts: any
  ): string[] {
    const recommendations: string[] = [];
    
    if (basic.errors.length > 0) {
      recommendations.push('Resolve basic validation errors to ensure artifact integrity');
    }
    
    if (semantic.errors.length > 0) {
      recommendations.push('Address semantic validation issues to improve coherence');
    }
    
    if (conflicts.hasConflicts) {
      recommendations.push('Resolve conflicts with other artifacts in the domain');
    }
    
    if (basic.warnings.length > 0 || semantic.warnings.length > 0) {
      recommendations.push('Consider addressing validation warnings to improve quality');
    }
    
    return recommendations;
  }

  private analyzeDomainConsistency(artifacts: SOLArtifact[]): DomainConsistencyResult {
    const visions = artifacts.filter(a => a.getType() === SOLArtifactType.VISION);
    const policies = artifacts.filter(a => a.getType() === SOLArtifactType.POLICY);
    // const processes = artifacts.filter(a => a.getType() === SOLArtifactType.PROCESS);
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check vision consistency
    if (visions.length === 0) {
      issues.push('No vision found in domain');
      recommendations.push('Add a vision to provide strategic direction');
    }
    
    // Check policy alignment
    if (policies.length > 0 && visions.length > 0) {
      const unlinkedPolicies = policies.filter(p => !p.vision);
      if (unlinkedPolicies.length > 0) {
        issues.push(`${unlinkedPolicies.length} policies not linked to vision`);
        recommendations.push('Link policies to vision for better coherence');
      }
    }
    
    return {
      consistent: issues.length === 0,
      issues,
      recommendations
    };
  }

  private checkMissingEssentialArtifacts(artifacts: SOLArtifact[]): string[] {
    const types = new Set(artifacts.map(a => a.getType()));
    const essential = [SOLArtifactType.VISION, SOLArtifactType.PROCESS, SOLArtifactType.ACTOR];
    
    return essential.filter(type => !types.has(type));
  }
}

// Interfaces and types
export interface ValidateSingleRequest {
  artifactId: string;
}

export interface ValidateSingleResponse {
  valid: boolean;
  artifactId: string;
  basicValidation: ValidationResult;
  semanticValidation: ValidationResult;
  conflictAnalysis: any;
  recommendations: string[];
}

export interface ValidateCoherenceRequest {
  artifactIds: string[];
}

export interface ValidateCoherenceResponse {
  coherent: boolean;
  artifactIds: string[];
  individualValidations: Record<string, ValidationResult>;
  coherenceResult: CoherenceValidationResult;
  domainConsistency: DomainConsistencyResult;
  recommendations: string[];
}

export interface ValidateDomainResponse {
  valid: boolean;
  domainId: string;
  artifactCount: number;
  validationResults: ValidationResult[];
  coherenceResult: CoherenceValidationResult;
  missingEssentialArtifacts?: string[];
  recommendations: string[];
}

export interface DomainConsistencyResult {
  consistent: boolean;
  issues: string[];
  recommendations: string[];
}

export class ValidateArtifactError extends Error {
  constructor(
    message: string,
    public readonly code: ValidateArtifactErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidateArtifactError';
  }
}

export type ValidateArtifactErrorCode = 
  | 'INVALID_INPUT'
  | 'ARTIFACT_NOT_FOUND'
  | 'VALIDATION_ERROR'; 