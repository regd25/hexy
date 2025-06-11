import { SOLArtifact, SOLArtifactType, ValidationResult } from './SOLArtifact';

/**
 * Process entity represents an executable sequence of steps
 * involving one or more actors to achieve a specific outcome
 */
export class Process extends SOLArtifact {
  private readonly _actors: string[];
  private _steps: ProcessStep[];
  private _status: ProcessStatus = ProcessStatus.PENDING;
  private _currentStepIndex: number = 0;
  private _completedSteps: Set<string> = new Set();
  private readonly _metadata?: Record<string, unknown> | undefined;

  constructor(
    id: string, 
    actors: string[], 
    steps: ProcessStep[] | string[], 
    vision: string,
    metadata?: Record<string, unknown> | undefined
  ) {
    super(id, vision);
    this._actors = [...actors];
    // Convert string steps to ProcessStep objects
    this._steps = steps.map(step => 
      typeof step === 'string' ? ProcessStep.fromString(step) : step
    );
    this._metadata = metadata;
  }

  public get actors(): readonly string[] {
    return this._actors;
  }

  public get steps(): readonly ProcessStep[] {
    return this._steps;
  }

  public get status(): ProcessStatus {
    return this._status;
  }

  public get metadata(): Record<string, unknown> | undefined {
    return this._metadata;
  }

  // Process lifecycle methods
  public start(): void {
    if (this._status === ProcessStatus.PENDING) {
      this._status = ProcessStatus.RUNNING;
      this._currentStepIndex = 0;
    }
  }

  public complete(): void {
    if (this._status === ProcessStatus.RUNNING) {
      this._status = ProcessStatus.COMPLETED;
    }
  }

  public fail(reason?: string): void {
    if (this._status === ProcessStatus.RUNNING) {
      this._status = ProcessStatus.FAILED;
      // Could store reason in metadata
    }
  }

  public pause(): void {
    if (this._status === ProcessStatus.RUNNING) {
      this._status = ProcessStatus.PAUSED;
    }
  }

  public resume(): void {
    if (this._status === ProcessStatus.PAUSED) {
      this._status = ProcessStatus.RUNNING;
    }
  }

  public reset(): void {
    this._status = ProcessStatus.PENDING;
    this._currentStepIndex = 0;
    this._completedSteps.clear();
  }

  // Step management methods
  public addStep(step: ProcessStep): void {
    this._steps.push(step);
  }

  public removeStep(stepId: string): void {
    const index = this._steps.findIndex(step => step.id === stepId);
    if (index > -1) {
      this._steps.splice(index, 1);
    }
  }

  public getStep(stepId: string): ProcessStep | undefined {
    return this._steps.find(step => step.id === stepId);
  }

  public updateStepDescription(stepId: string, newDescription: string): void {
    const step = this.getStep(stepId);
    if (step && step.updateDescription) {
      step.updateDescription(newDescription);
    }
  }

  public getCurrentStep(): ProcessStep | undefined {
    if (this._status !== ProcessStatus.RUNNING || this._currentStepIndex >= this._steps.length) {
      return undefined;
    }
    return this._steps[this._currentStepIndex];
  }

  public markStepCompleted(stepId: string): void {
    this._completedSteps.add(stepId);
  }

  public getProgress(): number {
    if (this._steps.length === 0) return 0;
    return Math.round((this._completedSteps.size / this._steps.length) * 100);
  }

  // Process execution context
  public canBeExecutedBy(actorId: string): boolean {
    return this._actors.includes(actorId);
  }

  public override validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate ID
    if (!this._id || this._id.trim() === '') {
      errors.push('Process ID is required and cannot be empty');
    }

    // Validate vision
    if (!this._vision || this._vision.trim() === '') {
      errors.push('Process vision is required and cannot be empty');
    }

    // Process must have steps
    if (this._steps.length === 0) {
      errors.push('Process must contain at least one steps');
    }

    // Warn if less than 3 steps (Policy: ValidacionMinimaProceso)
    if (this._steps.length < 3) {
      warnings.push('Process should have at least 3 steps for better semantic structure');
    }

    // Validate step IDs are unique
    const stepIds = this._steps.map(step => step.id);
    const duplicateIds = stepIds.filter((id, index) => stepIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Process contains duplicate step IDs: ${duplicateIds.join(', ')}`);
    }

    // Validate each step
    this._steps.forEach((step, index) => {
      if (!step.description || step.description.trim() === '') {
        warnings.push(`Step ${index + 1} should have a meaningful description`);
      }
      
      if (!this._actors.includes(step.actorId)) {
        warnings.push(`Step ${index + 1}: actor "${step.actorId}" not declared in process actors`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public getType(): SOLArtifactType {
    return SOLArtifactType.PROCESS;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      type: 'PROCESS',
      steps: this._steps,
      actors: this._actors,
      vision: this._vision,
      status: this._status,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  /**
   * Create Process from JSON data
   */
  public static fromJSON(data: any): Process {
    const process = new Process(
      data.id,
      data.actors || [],
      data.steps || [],
      data.vision,
      data.metadata
    );
    
    if (data.status) {
      process._status = data.status;
    }
    
    return process;
  }
}

/**
 * Represents a single step in a process execution
 */
export interface ProcessStep {
  id: string;
  description: string;
  type: ProcessStepType;
  actorId: string;
  action: string;
  actor: string;
  updateDescription?(newDescription: string): void;
  toString(): string;
}

export class ProcessStepImpl implements ProcessStep {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly type: ProcessStepType,
    public readonly actorId: string,
    public readonly action: string,
    public readonly actor: string
  ) {}

  updateDescription(newDescription: string): void {
    // Create a new instance with updated description
    Object.assign(this, { description: newDescription });
  }

  toString(): string {
    return `${this.actor} → ${this.action}`;
  }

  static fromString(stepString: string): ProcessStep {
    // Parse format: "Actor → Action"
    const parts = stepString.split('→').map(s => s.trim());
    
    if (parts.length < 2) {
      // Handle malformed steps gracefully
      return new ProcessStepImpl(
        `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        stepString,
        ProcessStepType.ACTION,
        'UnknownActor',
        stepString,
        'UnknownActor'
      );
    }

    const actor = parts[0] || 'UnknownActor';
    const action = parts.slice(1).join('→').trim() || 'Unknown action';
    
    // Determine step type based on action content
    let stepType = ProcessStepType.ACTION;
    if (action.toLowerCase().includes('policy') || action.toLowerCase().includes('validate')) {
      stepType = ProcessStepType.POLICY_CHECK;
    } else if (action.toLowerCase().includes('decide') || action.toLowerCase().includes('choose')) {
      stepType = ProcessStepType.DECISION;
    } else if (action.toLowerCase().includes('check') || action.toLowerCase().includes('verify')) {
      stepType = ProcessStepType.VALIDATION;
    }

    return new ProcessStepImpl(
      `${actor.toLowerCase().replace(/\s+/g, '-')}-${action.toLowerCase().replace(/\s+/g, '-').substring(0, 20)}-${Date.now()}`,
      action,
      stepType,
      actor,
      action,
      actor
    );
  }
}

// Export static method for backwards compatibility
export const ProcessStep = ProcessStepImpl;

export enum ProcessStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum ProcessStepType {
  ACTION = 'ACTION',
  VALIDATION = 'VALIDATION', 
  DECISION = 'DECISION',
  POLICY_CHECK = 'POLICY_CHECK'
}

export interface SOLProcessData {
  id: string;
  actors: string[];
  steps: string[];
  vision?: string;
} 