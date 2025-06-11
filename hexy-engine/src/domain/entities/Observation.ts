import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Observation SOL Artifact
 * Captura un evento perceptual generado por un actor sensor (humano, lógico o físico).
 * Puede ser utilizado como disparador de políticas o señales.
 */
export class Observation extends SOLArtifact {
  private readonly _observedBy: string;
  private readonly _value: unknown;
  private readonly _unit: string;
  private readonly _timestamp: Date;
  private readonly _domain: string;
  private readonly _confidence: number;
  private readonly _tags: string[];
  private readonly _metadata: Record<string, unknown>;

  constructor(
    id: string,
    observedBy: string,
    value: unknown,
    unit: string,
    timestamp: Date,
    domain: string,
    options?: {
      confidence?: number;
      tags?: string[];
      metadata?: Record<string, unknown>;
    }
  ) {
    if (!id.trim()) {
      throw new Error('Observation ID cannot be empty');
    }
    if (!observedBy.trim()) {
      throw new Error('Observation observedBy cannot be empty');
    }
    if (!domain.trim()) {
      throw new Error('Observation domain cannot be empty');
    }

    super(id);
    this._observedBy = observedBy.trim();
    this._value = value;
    this._unit = unit.trim();
    this._timestamp = new Date(timestamp);
    this._domain = domain.trim();
    this._confidence = options?.confidence ?? 1.0;
    this._tags = options?.tags ? [...options.tags] : [];
    this._metadata = options?.metadata ? { ...options.metadata } : {};
  }

  public get observedBy(): string {
    return this._observedBy;
  }

  public get value(): unknown {
    return this._value;
  }

  public get unit(): string {
    return this._unit;
  }

  public get timestamp(): Date {
    return new Date(this._timestamp);
  }

  public get domain(): string {
    return this._domain;
  }

  public get confidence(): number {
    return this._confidence;
  }

  public get tags(): string[] {
    return [...this._tags];
  }

  public get metadata(): Record<string, unknown> {
    return { ...this._metadata };
  }

  /**
   * Check if observation was made recently within the given threshold
   * @param thresholdMs - Time threshold in milliseconds (default: 5 minutes)
   */
  public isRecent(thresholdMs: number = 5 * 60 * 1000): boolean {
    const ageMs = this.getAgeInMilliseconds();
    return ageMs <= thresholdMs;
  }

  /**
   * Get the age of the observation in milliseconds
   */
  public getAgeInMilliseconds(): number {
    return Date.now() - this._timestamp.getTime();
  }

  /**
   * Check if observation has a specific tag
   */
  public hasTag(tag: string): boolean {
    return this._tags.includes(tag);
  }

  public validate(): ValidationResult {
    const baseValidation = super.validate();
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Check confidence range
    if (this._confidence < 0 || this._confidence > 1) {
      errors.push('Observation confidence must be between 0 and 1');
    }

    // Warn about low confidence
    if (this._confidence < 0.5) {
      warnings.push('Observation confidence is below 50%');
    }

    // Check timestamp constraints
    if (this._timestamp > new Date()) {
      warnings.push('Observation timestamp is in the future');
    }

    // Check required fields
    if (!this._observedBy.trim()) {
      errors.push('Observation observedBy cannot be empty');
    }

    if (!this._domain.trim()) {
      errors.push('Observation domain cannot be empty');
    }

    // Check unit is provided
    if (!this._unit.trim()) {
      warnings.push('Observation unit is empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.OBSERVATION;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      observedBy: this._observedBy,
      value: this._value,
      unit: this._unit,
      timestamp: this._timestamp.toISOString(),
      domain: this._domain,
      confidence: this._confidence,
      tags: this._tags,
      metadata: this._metadata,
      artifactType: this.getType(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Create Observation from plain object (deserialization)
   */
  public static fromPlainObject(obj: Record<string, unknown>): Observation {
    return new Observation(
      obj.id as string,
      obj.observedBy as string,
      obj.value,
      obj.unit as string,
      new Date(obj.timestamp as string),
      obj.domain as string,
      {
        confidence: (obj.confidence as number) ?? 1.0,
        tags: (obj.tags as string[]) ?? [],
        metadata: (obj.metadata as Record<string, unknown>) ?? {},
      }
    );
  }

  /**
   * Factory method to create Observation from SOL YAML structure
   */
  public static fromSOL(data: SOLObservationData): Observation {
    return new Observation(
      data.id,
      data.observedBy,
      data.value,
      data.unit,
      new Date(data.timestamp),
      data.domain,
      {
        confidence: data.confidence,
        tags: data.tags,
        metadata: data.metadata,
      }
    );
  }
}

export interface SOLObservationData {
  id: string;
  observedBy: string;
  value: unknown;
  unit: string;
  timestamp: string;
  domain: string;
  confidence?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
} 