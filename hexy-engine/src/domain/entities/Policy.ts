import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Policy entity represents a business rule or constraint
 * that guides decision-making and validation in processes
 */
export class Policy extends SOLArtifact {
  private _premise: string;
  private readonly _metadata?: Record<string, unknown> | undefined;

  constructor(
    id: string,
    premise: string,
    vision: string,
    metadata?: Record<string, unknown> | undefined
  ) {
    super(id, vision);
    this._premise = premise;
    this._metadata = metadata;
  }

  public get premise(): string {
    return this._premise;
  }

  public get metadata(): Record<string, unknown> | undefined {
    return this._metadata;
  }

  /**
   * Update the policy premise
   */
  public updatePremise(newPremise: string): void {
    if (newPremise && newPremise.trim()) {
      this._premise = newPremise.trim();
    }
  }

  /**
   * Link policy to a vision
   */
  public linkToVision(visionId: string): void {
    if (visionId && visionId.trim()) {
      // @ts-ignore: Vision can be updated
      this._vision = visionId;
    }
  }

  public override validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate ID
    if (!this._id || this._id.trim() === '') {
      errors.push('Policy ID is required and cannot be empty');
    }

    // Validate premise
    if (!this._premise || this._premise.trim() === '') {
      errors.push('Policy premise is required and cannot be empty');
    } else if (this._premise.trim().length < 10) {
      warnings.push('Policy premise should be more descriptive (at least 10 characters)');
    }

    // Validate vision
    if (!this._vision || this._vision.trim() === '') {
      errors.push('Policy vision is required and cannot be empty');
    }

    // Check premise clarity
    const unclearWords = ['maybe', 'possibly', 'perhaps', 'might', 'could'];
    const hasUnclearWords = unclearWords.some((word) => this._premise.toLowerCase().includes(word));
    if (hasUnclearWords) {
      warnings.push('Policy premise contains unclear language that may affect clarity');
    }

    // Check premise length
    if (this._premise && this._premise.length > 500) {
      warnings.push('Policy premise length is very long and may affect readability');
    }

    // Premise should contain condition/requirement keywords
    const hasRequirement =
      /\b(debe|deben|requer|obligator|necesario|tiene que|must|should|require)\b/i.test(
        this._premise
      );
    if (!hasRequirement) {
      warnings.push(
        'Policy premise should express a clear requirement using words like "debe", "requiere", etc.'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.POLICY;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      type: 'POLICY',
      premise: this._premise,
      vision: this._vision,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Create Policy from JSON data
   */
  public static fromJSON(data: any): Policy {
    const policy = new Policy(data.id, data.premise, data.vision, data.metadata);

    if (data.createdAt) {
      // @ts-ignore: Set creation date
      policy._createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt) {
      // @ts-ignore: Set update date
      policy._updatedAt = new Date(data.updatedAt);
    }

    return policy;
  }

  /**
   * Evaluate if a given context violates this policy
   * This is a semantic evaluation method that can be extended
   */
  public evaluate(context: PolicyEvaluationContext): PolicyEvaluationResult {
    return {
      policyId: this._id,
      compliant: true,
      evaluatedAt: new Date(),
      context: context,
      message: `Policy ${this._id} evaluation completed`,
    };
  }
}

export interface PolicyEvaluationContext {
  artifactId: string;
  artifactType: string;
  data: any;
  actor: string;
  timestamp: Date;
}

export interface PolicyEvaluationResult {
  policyId: string;
  compliant: boolean;
  evaluatedAt: Date;
  context: PolicyEvaluationContext;
  message?: string;
  details?: Record<string, unknown>;
}
