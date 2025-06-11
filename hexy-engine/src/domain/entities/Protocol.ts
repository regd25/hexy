import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Protocol SOL Artifact
 * Define una coreografía de interacción entre actores en el tiempo.
 * Formaliza turnos, respuestas esperadas y condiciones de corte o desvío.
 */
export class Protocol extends SOLArtifact {
  private readonly _description: string;
  private readonly _steps: ProtocolStep[];
  private readonly _timeout?: number;
  private readonly _fallback?: string;
  private readonly _version: string;

  constructor(
    id: string,
    description: string,
    steps: (ProtocolStep | string)[],
    options?: {
      timeout?: number;
      fallback?: string;
      version?: string;
    }
  ) {
    if (!id.trim()) {
      throw new Error('Protocol ID cannot be empty');
    }
    if (!description.trim()) {
      throw new Error('Protocol description cannot be empty');
    }
    if (!steps || steps.length === 0) {
      throw new Error('Protocol must have at least one step');
    }

    super(id);
    this._description = description.trim();
    this._steps = steps.map((step, index) => {
      if (typeof step === 'string') {
        // Check for empty step string before parsing
        if (!step.trim()) {
          throw new Error(`Protocol step ${index + 1} cannot be empty`);
        }
        return ProtocolStep.fromString(step, index + 1);
      }
      return step;
    });
    this._timeout = options?.timeout;
    this._fallback = options?.fallback?.trim();
    this._version = options?.version || '1.0.0';
  }

  public get description(): string {
    return this._description;
  }

  public get steps(): ProtocolStep[] {
    return [...this._steps];
  }

  public get timeout(): number | undefined {
    return this._timeout;
  }

  public get fallback(): string | undefined {
    return this._fallback;
  }

  public get version(): string {
    return this._version;
  }

  /**
   * Get a specific step by its index
   */
  public getStepByIndex(index: number): ProtocolStep | undefined {
    return this._steps[index];
  }

  /**
   * Get all steps performed by a specific actor
   */
  public getStepsByActor(actor: string): ProtocolStep[] {
    return this._steps.filter(step => step.actor === actor);
  }

  /**
   * Check if a specific actor is involved in this protocol
   */
  public hasActor(actor: string): boolean {
    return this._steps.some(step => step.actor === actor);
  }

  /**
   * Check if protocol has expired based on start time and timeout
   */
  public isExpired(startTime: Date): boolean {
    if (!this._timeout) {
      return false;
    }

    const expirationTime = new Date(startTime.getTime() + this._timeout * 1000);
    return new Date() > expirationTime;
  }

  public validate(): ValidationResult {
    const baseValidation = super.validate();
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Check timeout constraints
    if (this._timeout !== undefined && this._timeout <= 0) {
      errors.push('Protocol timeout must be positive when specified');
    }

    // Check if there are too many steps
    if (this._steps.length > 20) {
      warnings.push('Protocol has many steps (>20), consider breaking into sub-protocols');
    }

    // Validate each step
    for (let i = 0; i < this._steps.length; i++) {
      const step = this._steps[i];
      if (!step.actor.trim() || !step.action.trim()) {
        errors.push(`Protocol step ${i + 1} has invalid format or empty actor`);
      }
    }

    // Validate version format (semantic versioning)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(this._version)) {
      errors.push('Protocol version must follow semantic versioning (x.y.z)');
    }

    // Check required fields
    if (!this._description.trim()) {
      errors.push('Protocol description cannot be empty');
    }

    if (this._steps.length === 0) {
      errors.push('Protocol must have at least one step');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.PROTOCOL;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      description: this._description,
      steps: this._steps.map(step => step.toString()),
      timeout: this._timeout,
      fallback: this._fallback,
      version: this._version,
      artifactType: this.getType(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Create Protocol from plain object (deserialization)
   */
  public static fromPlainObject(obj: Record<string, unknown>): Protocol {
    return new Protocol(
      obj.id as string,
      obj.description as string,
      obj.steps as string[],
      {
        timeout: obj.timeout as number | undefined,
        fallback: obj.fallback as string | undefined,
        version: (obj.version as string) || '1.0.0',
      }
    );
  }

  /**
   * Factory method to create Protocol from SOL YAML structure
   */
  public static fromSOL(data: SOLProtocolData): Protocol {
    return new Protocol(
      data.id,
      data.description,
      data.steps,
      {
        timeout: data.timeout,
        fallback: data.fallback,
        version: data.version,
      }
    );
  }
}

/**
 * Represents a single step in a protocol
 */
export class ProtocolStep {
  public readonly actor: string;
  public readonly action: string;
  public readonly order: number;
  public readonly condition?: string;

  constructor(actor: string, action: string, order: number, condition?: string) {
    this.actor = actor.trim();
    this.action = action.trim();
    this.order = order;
    this.condition = condition?.trim();
  }

  /**
   * Parse a protocol step from string format: "Actor: action" or "Actor: action si condition"
   */
  public static fromString(stepString: string, order: number): ProtocolStep {
    const trimmed = stepString.trim();
    
    // Check for basic "Actor: action" format
    if (!trimmed.includes(':')) {
      throw new Error('Invalid protocol step format: missing ":" separator');
    }

    const [actorPart, ...actionParts] = trimmed.split(':');
    if (!actorPart.trim() || actionParts.length === 0) {
      throw new Error('Invalid protocol step format');
    }

    const actor = actorPart.trim();
    const actionAndCondition = actionParts.join(':').trim();
    
    // Check for condition (look for "si" keyword)
    const siIndex = actionAndCondition.toLowerCase().indexOf(' si ');
    if (siIndex !== -1) {
      const action = actionAndCondition.substring(0, siIndex).trim();
      const condition = actionAndCondition.substring(siIndex + 1).trim().replace(/\s+/g, ' '); // Normalize spaces
      return new ProtocolStep(actor, action, order, condition);
    } else {
      return new ProtocolStep(actor, actionAndCondition, order);
    }
  }

  /**
   * Convert step back to string format
   */
  public toString(): string {
    if (this.condition) {
      return `${this.actor}: ${this.action} ${this.condition}`;
    }
    return `${this.actor}: ${this.action}`;
  }
}

export interface SOLProtocolData {
  id: string;
  description: string;
  steps: string[];
  timeout?: number;
  fallback?: string;
  version?: string;
} 