import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Domain SOL Artifact
 * Agrupador semántico de artefactos orientados a una misma visión.
 * Delimita el alcance contextual donde se definen y operan políticas, procesos e indicadores coherentes entre sí.
 */
export class Domain extends SOLArtifact {
  private readonly _description: string;
  private readonly _visionId: string;
  private readonly _policies: Set<string>;
  private readonly _processes: Set<string>;
  private readonly _indicators: Set<string>;

  constructor(id: string, description: string, visionId: string) {
    if (!id.trim()) {
      throw new Error('Domain ID cannot be empty');
    }
    if (!description.trim()) {
      throw new Error('Domain description cannot be empty');
    }
    if (!visionId.trim()) {
      throw new Error('Domain vision cannot be empty');
    }

    super(id, visionId);
    this._description = description.trim();
    this._visionId = visionId.trim();
    this._policies = new Set<string>();
    this._processes = new Set<string>();
    this._indicators = new Set<string>();
  }

  public get description(): string {
    return this._description;
  }

  public get visionId(): string {
    return this._visionId;
  }

  public get policies(): string[] {
    return Array.from(this._policies);
  }

  public get processes(): string[] {
    return Array.from(this._processes);
  }

  public get indicators(): string[] {
    return Array.from(this._indicators);
  }

  /**
   * Add a policy to this domain
   */
  public addPolicy(policyId: string): void {
    if (policyId.trim()) {
      this._policies.add(policyId.trim());
    }
  }

  /**
   * Remove a policy from this domain
   */
  public removePolicy(policyId: string): void {
    this._policies.delete(policyId.trim());
  }

  /**
   * Add a process to this domain
   */
  public addProcess(processId: string): void {
    if (processId.trim()) {
      this._processes.add(processId.trim());
    }
  }

  /**
   * Remove a process from this domain
   */
  public removeProcess(processId: string): void {
    this._processes.delete(processId.trim());
  }

  /**
   * Add an indicator to this domain
   */
  public addIndicator(indicatorId: string): void {
    if (indicatorId.trim()) {
      this._indicators.add(indicatorId.trim());
    }
  }

  /**
   * Remove an indicator from this domain
   */
  public removeIndicator(indicatorId: string): void {
    this._indicators.delete(indicatorId.trim());
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.DOMAIN;
  }

  public override validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation from parent
    const baseValidation = super.validate();
    errors.push(...baseValidation.errors);
    warnings.push(...baseValidation.warnings);

    // Domain-specific validation
    if (!this._description || this._description.trim().length === 0) {
      errors.push('Domain must have a description');
    }

    if (!this._visionId || this._visionId.trim().length === 0) {
      errors.push('Domain must reference a vision');
    }

    if (this._policies.size === 0 && this._processes.size === 0 && this._indicators.size === 0) {
      warnings.push('Domain has no policies, processes, or indicators defined');
    }

    if (this._description && this._description.length < 20) {
      warnings.push('Domain description should be more comprehensive (at least 20 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      description: this._description,
      vision: this._visionId,
      policies: this.policies,
      processes: this.processes,
      indicators: this.indicators,
      type: 'domain',
    };
  }

  public toJSON(): Record<string, unknown> {
    return this.toPlainObject();
  }

  public static fromPlainObject(obj: Record<string, unknown>): Domain {
    const domain = new Domain(obj.id as string, obj.description as string, obj.vision as string);

    // Restore artifact references
    if (Array.isArray(obj.policies)) {
      obj.policies.forEach((policy) => {
        if (typeof policy === 'string') {
          domain.addPolicy(policy);
        }
      });
    }

    if (Array.isArray(obj.processes)) {
      obj.processes.forEach((process) => {
        if (typeof process === 'string') {
          domain.addProcess(process);
        }
      });
    }

    if (Array.isArray(obj.indicators)) {
      obj.indicators.forEach((indicator) => {
        if (typeof indicator === 'string') {
          domain.addIndicator(indicator);
        }
      });
    }

    return domain;
  }
}
