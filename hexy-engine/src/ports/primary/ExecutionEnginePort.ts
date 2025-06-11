import { ProcessStep } from '../../domain/entities/Process';
import { Result } from '../../domain/entities/Result';

/**
 * Primary port for process execution operations
 * Defines the contract for executing SOL processes
 */
export interface ExecutionEnginePort {
  /**
   * Execute a process by its ID
   */
  executeProcess(processId: string, context?: ExecutionContext): Promise<ExecutionResult>;

  /**
   * Execute a single step of a process
   */
  executeStep(step: ProcessStep, context: ExecutionContext): Promise<StepExecutionResult>;

  /**
   * Get the current execution state of a process
   */
  getExecutionState(processId: string): Promise<ProcessExecutionState>;

  /**
   * Pause an ongoing process execution
   */
  pauseExecution(processId: string): Promise<void>;

  /**
   * Resume a paused process execution
   */
  resumeExecution(processId: string): Promise<void>;

  /**
   * Cancel a process execution
   */
  cancelExecution(processId: string, reason: string): Promise<void>;

  /**
   * Get execution history of a process
   */
  getExecutionHistory(processId: string): Promise<ExecutionHistoryEntry[]>;

  /**
   * Validate that all required actors are available for execution
   */
  validateActorAvailability(actors: string[]): Promise<ActorAvailabilityResult>;

  /**
   * Schedule a process for future execution
   */
  scheduleExecution(processId: string, scheduledAt: Date, context?: ExecutionContext): Promise<string>;
}

export interface ExecutionContext {
  initiator: string;
  parameters?: Record<string, unknown>;
  priority?: ExecutionPriority;
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

export interface ExecutionResult {
  processId: string;
  status: ExecutionStatus;
  result?: Result;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  stepsExecuted: number;
  totalSteps: number;
}

export interface StepExecutionResult {
  stepIndex: number;
  status: ExecutionStatus;
  output?: unknown;
  error?: string;
  executedAt: Date;
  duration: number;
  actor: string;
}

export interface ProcessExecutionState {
  processId: string;
  status: ExecutionStatus;
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  pausedAt?: Date;
  estimatedCompletion?: Date;
  context: ExecutionContext;
}

export interface ExecutionHistoryEntry {
  timestamp: Date;
  event: ExecutionEvent;
  details: string;
  stepIndex?: number;
  actor?: string;
}

export interface ActorAvailabilityResult {
  allAvailable: boolean;
  availableActors: string[];
  unavailableActors: string[];
  estimatedAvailability?: Record<string, Date>;
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum ExecutionPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ExecutionEvent {
  STARTED = 'STARTED',
  STEP_STARTED = 'STEP_STARTED',
  STEP_COMPLETED = 'STEP_COMPLETED',
  STEP_FAILED = 'STEP_FAILED',
  PAUSED = 'PAUSED',
  RESUMED = 'RESUMED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
} 