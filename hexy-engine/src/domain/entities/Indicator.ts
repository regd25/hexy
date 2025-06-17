import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

export type IndicatorStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

/**
 * Measurement definition for an indicator
 * Represents a specific measurement within an indicator
 */
export interface IndicatorMeasurement {
  id: string;
  description: string;
  measurement: string; // Formula or calculation method
  unit: string;
  goal: number;
  domain: string;
  warning?: number;
  critical?: number;
}

/**
 * Indicator SOL Artifact
 * Métrica formalizada que evalúa el desempeño del sistema o la efectividad de un dominio.
 * Permite el aprendizaje reflexivo y la evolución del modelo.
 * 
 * Estructura SOL:
 * Indicator:
 *   description: string
 *   id: string
 *   measurement: IndicatorMeasurement[] | string
 */
export class Indicator extends SOLArtifact {
  private readonly _description: string;
  private readonly _measurement: IndicatorMeasurement[] | string;
  private readonly _unit: string | undefined;
  private readonly _goal: number | undefined;
  private readonly _domain: string | undefined;
  private _warningThreshold?: number;
  private _criticalThreshold?: number;

  constructor(
    id: string,
    description: string,
    measurement: IndicatorMeasurement[] | string,
    unit?: string,
    goal?: number,
    domain?: string
  ) {
    if (!id.trim()) {
      throw new Error('Indicator ID cannot be empty');
    }
    if (!description.trim()) {
      throw new Error('Indicator description cannot be empty');
    }

    super(id);
    this._description = description.trim();
    this._measurement = measurement;
    this._unit = unit?.trim() || undefined;
    this._goal = goal || undefined;
    this._domain = domain?.trim() || undefined;
  }

  public get description(): string {
    return this._description;
  }

  public get measurement(): IndicatorMeasurement[] | string {
    return this._measurement;
  }

  public get unit(): string | undefined {
    return this._unit;
  }

  public get goal(): number | undefined {
    return this._goal;
  }

  public get domain(): string | undefined {
    return this._domain;
  }

  public get warningThreshold(): number | undefined {
    return this._warningThreshold;
  }

  public get criticalThreshold(): number | undefined {
    return this._criticalThreshold;
  }

  /**
   * Get all measurements as array (handles both single string and array cases)
   */
  public getMeasurements(): IndicatorMeasurement[] {
    if (typeof this._measurement === 'string') {
      return [{
        id: `${this.id}_measurement`,
        description: this._description,
        measurement: this._measurement,
        unit: this._unit || '',
        goal: this._goal || 0,
        domain: this._domain || 'DefaultDomain'
      }];
    }
    return this._measurement;
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

    if (!this._measurement) {
      errors.push('Indicator must have a measurement definition');
    }

    // Validate measurement array if it's an array
    if (Array.isArray(this._measurement)) {
      this._measurement.forEach((measurement, index) => {
        if (!measurement.id || measurement.id.trim().length === 0) {
          errors.push(`Measurement at index ${index} must have an ID`);
        }
        if (!measurement.description || measurement.description.trim().length === 0) {
          errors.push(`Measurement at index ${index} must have a description`);
        }
        if (!measurement.measurement || measurement.measurement.trim().length === 0) {
          errors.push(`Measurement at index ${index} must have a measurement formula`);
        }
        if (!measurement.domain || measurement.domain.trim().length === 0) {
          errors.push(`Measurement at index ${index} must have a domain`);
        }
      });
    }

    // Warnings
    if (this._warningThreshold === undefined && this._criticalThreshold === undefined) {
      warnings.push('Indicator has no warning or critical thresholds defined');
    }

    if (this._goal !== undefined && this._goal < 0) {
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
      type: 'indicator',
    };

    if (this._unit !== undefined) {
      obj.unit = this._unit;
    }

    if (this._goal !== undefined) {
      obj.goal = this._goal;
    }

    if (this._domain !== undefined) {
      obj.domain = this._domain;
    }

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

  /**
   * Create Indicator from SOL YAML structure
   */
  public static fromSOL(data: SOLIndicatorData): Indicator {
    const indicator = new Indicator(
      data.id,
      data.description,
      data.measurement,
      data.unit,
      data.goal,
      data.domain
    );

    if (data.warning !== undefined) {
      indicator.setWarningThreshold(data.warning);
    }

    if (data.critical !== undefined) {
      indicator.setCriticalThreshold(data.critical);
    }

    return indicator;
  }

  public static fromPlainObject(obj: Record<string, unknown>): Indicator {
    const indicator = new Indicator(
      obj.id as string,
      obj.description as string,
      obj.measurement as IndicatorMeasurement[] | string,
      obj.unit as string | undefined,
      obj.goal as number | undefined,
      obj.domain as string | undefined
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

/**
 * SOL Indicator Data structure that matches the YAML format
 */
export interface SOLIndicatorData {
  id: string;
  description: string;
  measurement: IndicatorMeasurement[] | string;
  unit?: string;
  goal?: number;
  domain?: string;
  warning?: number;
  critical?: number;
}
