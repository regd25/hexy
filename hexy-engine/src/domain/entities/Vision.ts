import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Vision entity represents the strategic vision of a domain or system
 * Contains the aspirational content that guides all other artifacts
 */
export class Vision extends SOLArtifact {
  private readonly _content: string;
  private readonly _author: string;
  private readonly _domain: string | undefined;

  constructor(id: string, content: string, author: string, domain?: string) {
    if (!id.trim()) {
      throw new Error('Vision ID cannot be empty');
    }
    if (!content.trim()) {
      throw new Error('Vision content cannot be empty');
    }
    if (!author.trim()) {
      throw new Error('Vision author cannot be empty');
    }

    super(id);
    this._content = content.trim();
    this._author = author.trim();
    this._domain = domain?.trim() || undefined;
  }

  public get content(): string {
    return this._content;
  }

  public get author(): string {
    return this._author;
  }

  public get domain(): string | undefined {
    return this._domain;
  }

  public override validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation from parent
    const baseValidation = super.validate();
    errors.push(...baseValidation.errors);
    warnings.push(...baseValidation.warnings);

    // Vision-specific validation
    if (!this._content || this._content.trim().length === 0) {
      errors.push('Vision must have content');
    }

    if (!this._author || this._author.trim().length === 0) {
      errors.push('Vision must have an author');
    }

    // Warnings
    if (this._content && this._content.length < 50) {
      warnings.push('Vision content should be more comprehensive (at least 50 characters)');
    }

    if (!this._domain) {
      warnings.push('Vision should specify a domain for better contextualization');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.VISION;
  }

  public toPlainObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {
      id: this.id,
      content: this._content,
      author: this._author,
      type: 'vision',
    };

    if (this._domain !== undefined) {
      obj.domain = this._domain;
    }

    return obj;
  }

  public toJSON(): Record<string, unknown> {
    return this.toPlainObject();
  }

  public static fromPlainObject(obj: Record<string, unknown>): Vision {
    return new Vision(
      obj.id as string,
      obj.content as string,
      obj.author as string,
      obj.domain as string | undefined
    );
  }

  /**
   * Factory method to create Vision from SOL YAML structure
   */
  public static fromSOL(data: SOLVisionData): Vision {
    return new Vision(data.id, data.content, data.author || 'Unknown', data.domain);
  }
}

export interface SOLVisionData {
  id: string;
  content: string;
  author?: string;
  domain?: string;
}
