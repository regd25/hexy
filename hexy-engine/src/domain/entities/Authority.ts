import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Authority SOL Artifact
 * Rol de validación y gobierno que aprueba, rechaza o inmoviliza ciertas políticas
 * dentro de un dominio o proceso.
 */
export class Authority extends SOLArtifact {
  private readonly _role: AuthorityRole;
  private readonly _approves: string[];
  private readonly _scope: string;
  private readonly _delegates: string[];
  private readonly _escalationMatrix: Record<string, string>;

  constructor(
    id: string,
    role: AuthorityRole,
    approves: string[],
    scope: string,
    options?: {
      delegates?: string[];
      escalationMatrix?: Record<string, string>;
    }
  ) {
    if (!id.trim()) {
      throw new Error('Authority ID cannot be empty');
    }
    if (!scope.trim()) {
      throw new Error('Authority scope cannot be empty');
    }
    if (!approves || approves.length === 0) {
      throw new Error('Authority must approve at least one policy or entity');
    }

    super(id);
    this._role = role;
    this._approves = [...approves];
    this._scope = scope.trim();
    this._delegates = options?.delegates ? [...options.delegates] : [];
    this._escalationMatrix = options?.escalationMatrix ? { ...options.escalationMatrix } : {};
  }

  public get role(): AuthorityRole {
    return this._role;
  }

  public get approves(): string[] {
    return [...this._approves];
  }

  public get scope(): string {
    return this._scope;
  }

  public get delegates(): string[] {
    return [...this._delegates];
  }

  public get escalationMatrix(): Record<string, string> {
    return { ...this._escalationMatrix };
  }

  /**
   * Check if this authority can approve a specific entity or policy
   */
  public canApprove(entityId: string): boolean {
    return this._approves.includes(entityId);
  }

  /**
   * Check if a specific delegate exists
   */
  public hasDelegate(delegateId: string): boolean {
    return this._delegates.includes(delegateId);
  }

  /**
   * Get escalation target for a specific severity level
   */
  public getEscalationTarget(severity: string): string | undefined {
    return this._escalationMatrix[severity];
  }

  /**
   * Add a new approval to the authority
   */
  public addApproval(entityId: string): void {
    if (!entityId.trim()) {
      throw new Error('Approval cannot be empty');
    }

    if (!this._approves.includes(entityId)) {
      this._approves.push(entityId);
    }
  }

  public validate(): ValidationResult {
    const baseValidation = super.validate();
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Check approvals are not empty
    if (this._approves.some(approval => !approval.trim())) {
      errors.push('Authority approvals cannot contain empty values');
    }

    // Check if there are too many delegates
    if (this._delegates.length > 10) {
      warnings.push('Authority has many delegates (>10), consider reorganizing');
    }

    // Check escalation matrix format
    for (const [key, value] of Object.entries(this._escalationMatrix)) {
      if (!key.trim() || !value.trim()) {
        errors.push('Escalation matrix cannot have empty keys or values');
        break;
      }
    }

    // Check required fields
    if (!this._scope.trim()) {
      errors.push('Authority scope cannot be empty');
    }

    if (this._approves.length === 0) {
      errors.push('Authority must approve at least one policy or entity');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.AUTHORITY;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      role: this._role,
      approves: this._approves,
      scope: this._scope,
      delegates: this._delegates,
      escalationMatrix: this._escalationMatrix,
      artifactType: this.getType(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Create Authority from plain object (deserialization)
   */
  public static fromPlainObject(obj: Record<string, unknown>): Authority {
    return new Authority(
      obj.id as string,
      obj.role as AuthorityRole,
      obj.approves as string[],
      obj.scope as string,
      {
        delegates: (obj.delegates as string[]) ?? [],
        escalationMatrix: (obj.escalationMatrix as Record<string, string>) ?? {},
      }
    );
  }

  /**
   * Factory method to create Authority from SOL YAML structure
   */
  public static fromSOL(data: SOLAuthorityData): Authority {
    return new Authority(
      data.id,
      data.role,
      data.approves,
      data.scope,
      {
        delegates: data.delegates,
        escalationMatrix: data.escalationMatrix,
      }
    );
  }
}

export enum AuthorityRole {
  APPROVER = 'approver',
  AUDITOR = 'auditor',
  VALIDATOR = 'validator',
  GOVERNOR = 'governor',
  REVIEWER = 'reviewer',
}

export interface SOLAuthorityData {
  id: string;
  role: AuthorityRole;
  approves: string[];
  scope: string;
  delegates?: string[];
  escalationMatrix?: Record<string, string>;
} 