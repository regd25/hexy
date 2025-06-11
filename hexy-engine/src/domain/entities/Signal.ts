import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Signal SOL Artifact
 * Artefacto que transmite información entre actores o procesos como consecuencia de una observación o condición cumplida.
 * Facilita reacciones asincrónicas.
 */
export class Signal extends SOLArtifact {
  private readonly _sentBy: string;
  private readonly _sentTo: string;
  private readonly _basedOn: string;
  private readonly _channel: SignalChannel;
  private readonly _type: SignalType;
  private readonly _timestamp: Date;
  private readonly _priority: SignalPriority;
  private readonly _ackRequired: boolean;
  private readonly _ttl?: number;
  private _acknowledgedAt?: Date;

  constructor(
    id: string,
    sentBy: string,
    sentTo: string,
    basedOn: string,
    channel: SignalChannel,
    type: SignalType,
    timestamp: Date,
    options?: {
      priority?: SignalPriority;
      ackRequired?: boolean;
      ttl?: number;
    }
  ) {
    if (!id.trim()) {
      throw new Error('Signal ID cannot be empty');
    }
    if (!sentBy.trim()) {
      throw new Error('Signal sentBy cannot be empty');
    }
    if (!sentTo.trim()) {
      throw new Error('Signal sentTo cannot be empty');
    }

    super(id);
    this._sentBy = sentBy.trim();
    this._sentTo = sentTo.trim();
    this._basedOn = basedOn.trim();
    this._channel = channel;
    this._type = type;
    this._timestamp = new Date(timestamp);
    this._priority = options?.priority || 'NORMAL';
    this._ackRequired = options?.ackRequired || false;
    this._ttl = options?.ttl;
  }

  public get sentBy(): string {
    return this._sentBy;
  }

  public get sentTo(): string {
    return this._sentTo;
  }

  public get basedOn(): string {
    return this._basedOn;
  }

  public get channel(): SignalChannel {
    return this._channel;
  }

  public get type(): SignalType {
    return this._type;
  }

  public get timestamp(): Date {
    return new Date(this._timestamp);
  }

  public get priority(): SignalPriority {
    return this._priority;
  }

  public get ackRequired(): boolean {
    return this._ackRequired;
  }

  public get ttl(): number | undefined {
    return this._ttl;
  }

  public get acknowledgedAt(): Date | undefined {
    return this._acknowledgedAt ? new Date(this._acknowledgedAt) : undefined;
  }

  /**
   * Check if signal has expired based on TTL
   */
  public isExpired(): boolean {
    if (!this._ttl) {
      return false;
    }

    const expirationTime = new Date(this._timestamp.getTime() + this._ttl * 1000);
    return new Date() > expirationTime;
  }

  /**
   * Check if signal has been acknowledged
   */
  public isAcknowledged(): boolean {
    return this._acknowledgedAt !== undefined;
  }

  /**
   * Mark signal as acknowledged
   */
  public markAsAcknowledged(): void {
    if (this._ackRequired) {
      this._acknowledgedAt = new Date();
    }
  }

  public validate(): ValidationResult {
    const baseValidation = super.validate();
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Check TTL constraints
    if (this._ttl !== undefined && this._ttl <= 0) {
      errors.push('Signal TTL must be positive when specified');
    }

    // Check timestamp constraints
    if (this._timestamp > new Date()) {
      warnings.push('Signal timestamp is in the future');
    }

    // Check required fields
    if (!this._sentBy.trim()) {
      errors.push('Signal sentBy cannot be empty');
    }

    if (!this._sentTo.trim()) {
      errors.push('Signal sentTo cannot be empty');
    }

    if (!this._basedOn.trim()) {
      errors.push('Signal basedOn cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.SIGNAL;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      sentBy: this._sentBy,
      sentTo: this._sentTo,
      basedOn: this._basedOn,
      channel: this._channel,
      type: this._type,
      timestamp: this._timestamp.toISOString(),
      priority: this._priority,
      ackRequired: this._ackRequired,
      ttl: this._ttl,
      acknowledgedAt: this._acknowledgedAt?.toISOString(),
      artifactType: this.getType(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Create Signal from plain object (deserialization)
   */
  public static fromPlainObject(obj: Record<string, unknown>): Signal {
    const signal = new Signal(
      obj.id as string,
      obj.sentBy as string,
      obj.sentTo as string,
      obj.basedOn as string,
      obj.channel as SignalChannel,
      obj.type as SignalType,
      new Date(obj.timestamp as string),
      {
        priority: (obj.priority as SignalPriority) || 'NORMAL',
        ackRequired: (obj.ackRequired as boolean) || false,
        ttl: obj.ttl as number | undefined,
      }
    );

    // Restore acknowledgement state
    if (obj.acknowledgedAt) {
      signal._acknowledgedAt = new Date(obj.acknowledgedAt as string);
    }

    return signal;
  }

  /**
   * Factory method to create Signal from SOL YAML structure
   */
  public static fromSOL(data: SOLSignalData): Signal {
    return new Signal(
      data.id,
      data.sentBy,
      data.sentTo,
      data.basedOn,
      data.channel,
      data.type,
      new Date(data.timestamp),
      {
        priority: data.priority,
        ackRequired: data.ackRequired,
        ttl: data.ttl,
      }
    );
  }
}

export enum SignalChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  INTERNAL = 'internal',
  PUSH_NOTIFICATION = 'push_notification',
}

export enum SignalType {
  INFO = 'info',
  WARNING = 'warning',
  ALERT_CRITICAL = 'alert_critical',
  STATUS_UPDATE = 'status_update',
  COMMAND = 'command',
}

export type SignalPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface SOLSignalData {
  id: string;
  sentBy: string;
  sentTo: string;
  basedOn: string;
  channel: SignalChannel;
  type: SignalType;
  timestamp: string;
  priority?: SignalPriority;
  ackRequired?: boolean;
  ttl?: number;
} 