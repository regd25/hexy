import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

export type IndicatorStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

/**
 * Indicator SOL Artifact
 * Métrica formalizada que evalúa el desempeño del sistema o la efectividad de un dominio.
 * Permite el aprendizaje reflexivo y la evolución del modelo.
 */
export class Indicator extends SOLArtifact {
  private readonly _description: string;
  private readonly _measurement: string;
  private readonly _unit: string;
  private readonly _goal: number;
  private readonly _domain: string;
  private _warningThreshold?: number;
  private _criticalThreshold?: number;

  constructor(
    id: string,
    description: string,
    measurement: string,
    unit: string,
    goal: number,
    domain: string
  ) {
    if (!id.trim()) {
      throw new Error('Indicator ID cannot be empty');
    }
    if (!description.trim()) {
      throw new Error('Indicator description cannot be empty');
    }
    if (!measurement.trim()) {
      throw new Error('Indicator measurement cannot be empty');
    }
    if (!domain.trim()) {
      throw new Error('Indicator domain cannot be empty');
    }

    super(id);
    this._description = description.trim();
    this._measurement = measurement.trim();
    this._unit = unit.trim();
    this._goal = goal;
    this._domain = domain.trim();
  }

  public get description(): string {
    return this._description;
  }

  public get measurement(): string {
    return this._measurement;
  }

  public get unit(): string {
    return this._unit;
  }

  public get goal(): number {
    return this._goal;
  }

  public get domain(): string {
    return this._domain;
  }

  public get warningThreshold(): number | undefined {
    return this._warningThreshold;
  }

  public get criticalThreshold(): number | undefined {
    return this._criticalThreshold;
  }

  /**
   * Set warning threshold for the indicator
   */
  public setWarningThreshold(threshold: number): void {
    this._warningThreshold = threshold;
  }

  /**
   * Set critical threshold for the indicator
   */
  public setCriticalThreshold(threshold: number): void {
    this._criticalThreshold = threshold;
  }

  /**
   * Evaluate the status of a value against thresholds
   */
  public evaluateStatus(value: number): IndicatorStatus {
    if (this._criticalThreshold !== undefined && value <= this._criticalThreshold) {
      return 'critical';
    }
    if (this._warningThreshold !== undefined && value <= this._warningThreshold) {
      return 'warning';
    }
    if (this._warningThreshold !== undefined || this._criticalThreshold !== undefined) {
      return 'healthy';
    }
    return 'unknown';
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.INDICATOR;
  }

  public override validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation from parent
    const baseValidation = super.validate();
    errors.push(...baseValidation.errors);
    warnings.push(...baseValidation.warnings);

    // Indicator-specific validation
    if (!this._description || this._description.trim().length === 0) {
      errors.push('Indicator must have a description');
    }

    if (!this._measurement || this._measurement.trim().length === 0) {
      errors.push('Indicator must have a measurement definition');
    }

    if (!this._domain || this._domain.trim().length === 0) {
      errors.push('Indicator must be associated with a domain');
    }

    // Warnings
    if (this._warningThreshold === undefined && this._criticalThreshold === undefined) {
      warnings.push('Indicator has no warning or critical thresholds defined');
    }

    if (this._goal < 0) {
      warnings.push('Negative goal value may be intentional, please verify');
    }

    if (this._description && this._description.length < 20) {
      warnings.push('Indicator description should be more comprehensive (at least 20 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public toPlainObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {
      id: this.id,
      description: this._description,
      measurement: this._measurement,
      unit: this._unit,
      goal: this._goal,
      domain: this._domain,
      type: 'indicator',
    };

    if (this._warningThreshold !== undefined) {
      obj.warningThreshold = this._warningThreshold;
    }

    if (this._criticalThreshold !== undefined) {
      obj.criticalThreshold = this._criticalThreshold;
    }

    return obj;
  }

  public toJSON(): Record<string, unknown> {
    return this.toPlainObject();
  }

  public static fromPlainObject(obj: Record<string, unknown>): Indicator {
    const indicator = new Indicator(
      obj.id as string,
      obj.description as string,
      obj.measurement as string,
      obj.unit as string,
      obj.goal as number,
      obj.domain as string
    );

    if (typeof obj.warningThreshold === 'number') {
      indicator.setWarningThreshold(obj.warningThreshold);
    }

    if (typeof obj.criticalThreshold === 'number') {
      indicator.setCriticalThreshold(obj.criticalThreshold);
    }

    return indicator;
  }
}
