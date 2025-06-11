import { SOLArtifact, SOLArtifactType, ValidationResult } from "./SOLArtifact"

/**
 * Actor entity represents an agent that can execute process steps
 * Can be either human or system type
 */
export class Actor extends SOLArtifact {
  private readonly _type: ActorType
  private _capabilities: string[]
  private readonly _domain: string
  private readonly _metadata?: Record<string, unknown>
  private _available: boolean = true

  constructor(
    id: string,
    type: ActorType,
    capabilities: string[] = [],
    domain: string,
    metadata?: Record<string, unknown>
  ) {
    super(id)
    this._type = type
    this._capabilities = [...capabilities]
    this._domain = domain
    this._metadata = metadata
    this._available = true
  }

  public get type(): ActorType {
    return this._type
  }

  public get capabilities(): readonly string[] {
    return this._capabilities
  }

  public get domain(): string {
    return this._domain
  }

  public get metadata(): Record<string, unknown> | undefined {
    return this._metadata
  }

  /**
   * Check if actor has a specific capability
   */
  public hasCapability(capability: string): boolean {
    return this._capabilities.includes(capability)
  }

  /**
   * Add a new capability to the actor
   */
  public addCapability(capability: string): void {
    if (capability && capability.trim() && !this._capabilities.includes(capability)) {
      this._capabilities.push(capability)
    }
  }

  /**
   * Remove a capability from the actor
   */
  public removeCapability(capability: string): void {
    const index = this._capabilities.indexOf(capability)
    if (index > -1) {
      this._capabilities.splice(index, 1)
    }
  }

  /**
   * Set actor availability
   */
  public setAvailability(available: boolean): void {
    this._available = available
  }

  public override validate(): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate ID
    if (!this._id || this._id.trim() === '') {
      errors.push("Actor ID is required and cannot be empty")
    }

    // Validate domain
    if (!this._domain || this._domain.trim() === '') {
      errors.push("Actor domain is required and cannot be empty")
    }

    // Actor must have a valid type
    if (!Object.values(ActorType).includes(this._type)) {
      errors.push("Actor must have a valid type (human, system, or aiModel)")
    }

    // AI models must have capabilities
    if (this._type === ActorType.AI_MODEL && this._capabilities.length === 0) {
      errors.push("AI model actors must have defined capabilities")
    }

    // System actors should have defined capabilities
    if (this._type === ActorType.SYSTEM && this._capabilities.length === 0) {
      warnings.push("System actors should have defined capabilities for better semantic understanding")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.ACTOR
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      type: 'ACTOR',
      actorType: this._type,
      capabilities: this._capabilities,
      domain: this._domain,
      metadata: this._metadata,
      available: this._available,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    }
  }

  /**
   * Create Actor from JSON data
   */
  public static fromJSON(data: any): Actor {
    const actor = new Actor(
      data.id,
      data.actorType,
      data.capabilities || [],
      data.domain,
      data.metadata
    )
    if (data.available !== undefined) {
      actor.setAvailability(data.available)
    }
    return actor
  }

  /**
   * Factory method to create Actor from SOL YAML structure
   */
  public static fromSOL(data: SOLActorData): Actor {
    let type: ActorType
    switch (data.type) {
      case "human":
        type = ActorType.HUMAN
        break
      case "aiModel":
        type = ActorType.AI_MODEL
        break
      default:
        type = ActorType.SYSTEM
    }
    return new Actor(data.id, type, data.capabilities, data.description)
  }

  /**
   * Check if actor can perform a specific capability
   */
  public canPerform(capability: string): boolean {
    if (!this._capabilities) {
      // If no capabilities defined, assume actor can perform any action
      return true
    }
    return this._capabilities.includes(capability)
  }

  /**
   * Check if actor is available for execution
   */
  public isAvailable(): boolean {
    return this._available
  }
}

export enum ActorType {
  HUMAN = "human",
  SYSTEM = "system",
  AI_MODEL = "aiModel",
}

export type ActorCapability = string;

export interface SOLActorData {
  id: string
  type: "human" | "system" | "aiModel"
  capabilities?: string[] | undefined
  description?: string | undefined
}
