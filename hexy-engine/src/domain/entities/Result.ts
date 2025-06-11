import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Result entity represents the outcome of a process execution
 * Contains the final state and metadata about what was achieved
 */
export class Result extends SOLArtifact {
  private readonly _issuedBy: string;
  private readonly _outcome: string;
  private readonly _reason: string;
  private readonly _timestamp: Date;
  private readonly _processId: string | undefined;
  private readonly _status: ResultStatus;
  private readonly _data: Record<string, unknown> | undefined;

  constructor(
    id: string,
    issuedBy: string,
    outcome: string,
    reason: string,
    timestamp: Date = new Date(),
    processId?: string,
    status: ResultStatus = ResultStatus.SUCCESS,
    data?: Record<string, unknown>
  ) {
    super(id);
    this._issuedBy = issuedBy;
    this._outcome = outcome;
    this._reason = reason;
    this._timestamp = timestamp;
    this._processId = processId || undefined;
    this._status = status;
    this._data = data || undefined;
  }

  public get issuedBy(): string {
    return this._issuedBy;
  }

  public get outcome(): string {
    return this._outcome;
  }

  public get reason(): string {
    return this._reason;
  }

  public get timestamp(): Date {
    return this._timestamp;
  }

  public get processId(): string | undefined {
    return this._processId;
  }

  public get status(): ResultStatus {
    return this._status;
  }

  public get data(): Record<string, unknown> | undefined {
    return this._data;
  }

  public override validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Result must have an issuer
    if (!this._issuedBy || this._issuedBy.trim().length === 0) {
      errors.push('Result must specify who issued it');
    }

    // Result must have meaningful outcome
    if (!this._outcome || this._outcome.trim().length < 5) {
      errors.push('Result outcome must be at least 5 characters long');
    }

    // Result must have a reason
    if (!this._reason || this._reason.trim().length < 10) {
      errors.push('Result reason must be at least 10 characters long');
    }

    // Timestamp should not be in the future
    if (this._timestamp > new Date()) {
      warnings.push('Result timestamp should not be in the future');
    }

    // Process ID should be provided for process results
    if (!this._processId) {
      warnings.push('Result should reference the process ID that generated it');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.RESULT;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      issuedBy: this._issuedBy,
      outcome: this._outcome,
      reason: this._reason,
      timestamp: this._timestamp.toISOString(),
      processId: this._processId,
      status: this._status,
      data: this._data,
      type: this.getType(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Factory method to create Result from SOL YAML structure
   */
  public static fromSOL(data: SOLResultData): Result {
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const status = data.status
      ? ResultStatus[data.status.toUpperCase() as keyof typeof ResultStatus]
      : ResultStatus.SUCCESS;

    return new Result(
      data.id,
      data.issuedBy,
      data.outcome,
      data.reason,
      timestamp,
      data.processId,
      status,
      data.data
    );
  }

  /**
   * Check if the result indicates success
   */
  public isSuccess(): boolean {
    return this._status === ResultStatus.SUCCESS;
  }

  /**
   * Check if the result indicates failure
   */
  public isFailure(): boolean {
    return this._status === ResultStatus.FAILURE;
  }

  /**
   * Check if the result is still pending
   */
  public isPending(): boolean {
    return this._status === ResultStatus.PENDING;
  }

  /**
   * Create a summary of the result for logging/reporting
   */
  public getSummary(): string {
    return `Result ${this._id}: ${this._outcome} (${this._status}) - ${this._reason}`;
  }
}

export enum ResultStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
}

export interface SOLResultData {
  id: string;
  issuedBy: string;
  outcome: string;
  reason: string;
  timestamp?: string;
  processId?: string;
  status?: string;
  data?: Record<string, unknown>;
}
