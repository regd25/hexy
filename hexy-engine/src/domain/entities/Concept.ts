import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Concept SOL Artifact
 * Define nociones semánticas centrales, como entidades, roles, eventos o artefactos operacionales.
 * Permite reutilización transversal y reduce la ambigüedad léxica.
 */
export class Concept extends SOLArtifact {
  private readonly _description: string;
  private readonly _usedIn: Set<string>;

  constructor(id: string, description: string, vision?: string) {
    if (!id.trim()) {
      throw new Error('Concept ID cannot be empty');
    }
    if (!description.trim()) {
      throw new Error('Concept description cannot be empty');
    }

    super(id, vision);
    this._description = description.trim();
    this._usedIn = new Set<string>();
  }

  public get description(): string {
    return this._description;
  }

  public get usedIn(): string[] {
    return Array.from(this._usedIn);
  }

  /**
   * Add usage reference to track where this concept is used
   */
  public addUsage(reference: string): void {
    if (reference.trim()) {
      this._usedIn.add(reference.trim());
    }
  }

  /**
   * Remove usage reference
   */
  public removeUsage(reference: string): void {
    this._usedIn.delete(reference.trim());
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.CONCEPT;
  }

  public override validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation from parent
    const baseValidation = super.validate();
    errors.push(...baseValidation.errors);
    warnings.push(...baseValidation.warnings);

    // Concept-specific validation
    if (!this._description || this._description.trim().length === 0) {
      errors.push('Concept must have a description');
    }

    if (this._description && this._description.length < 10) {
      warnings.push('Concept description should be more descriptive (at least 10 characters)');
    }

    if (this._usedIn.size === 0) {
      warnings.push("Concept is not used anywhere - consider if it's needed");
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
      vision: this.vision,
      usedIn: this.usedIn,
      type: 'concept',
    };
  }

  public toJSON(): Record<string, unknown> {
    return this.toPlainObject();
  }

  public static fromPlainObject(obj: Record<string, unknown>): Concept {
    const concept = new Concept(obj.id as string, obj.description as string, obj.vision as string);

    // Restore usage references
    if (Array.isArray(obj.usedIn)) {
      obj.usedIn.forEach((usage) => {
        if (typeof usage === 'string') {
          concept.addUsage(usage);
        }
      });
    }

    return concept;
  }
}
