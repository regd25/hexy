/**
 * Base abstract entity for all SOL (Semantic Orchestration Language) artifacts
 * Implements common properties and behaviors shared across all SOL entities
 */
export abstract class SOLArtifact {
  protected readonly _id: string;
  protected readonly _vision: string | undefined;
  protected readonly _createdAt: Date;
  protected readonly _updatedAt: Date;

  constructor(id: string, vision?: string) {
    this._id = id;
    this._vision = vision || undefined;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get vision(): string | undefined {
    return this._vision;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Base validation for all SOL artifacts
   * Can be extended by concrete implementations
   */
  public validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this._id || this._id.trim().length === 0) {
      errors.push('Artifact ID cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Abstract method to get the artifact type
   */
  public abstract getType(): SOLArtifactType;

  /**
   * Abstract method to serialize the artifact
   */
  public abstract toJSON(): Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export enum SOLArtifactType {
  VISION = 'VISION',
  CONCEPT = 'CONCEPT',
  DOMAIN = 'DOMAIN',
  POLICY = 'POLICY',
  PROCESS = 'PROCESS',
  ACTOR = 'ACTOR',
  INDICATOR = 'INDICATOR',
  SIGNAL = 'SIGNAL',
  OBSERVATION = 'OBSERVATION',
  RESULT = 'RESULT',
  AUTHORITY = 'AUTHORITY',
  PROTOCOL = 'PROTOCOL',
}
