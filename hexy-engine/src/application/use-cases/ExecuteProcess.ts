import {
  ExecutionEnginePort,
  ExecutionContext,
  ExecutionResult,
  ExecutionStatus,
  StepExecutionResult,
  ProcessExecutionState,
  ExecutionHistoryEntry,
  ActorAvailabilityResult,
  ExecutionPriority,
} from '../../ports/primary/ExecutionEnginePort';
import { Result } from '../../domain/entities/Result';
import { Process, ProcessStep } from '../../domain/entities/Process';
import { PersistencePort } from '../../ports/secondary/PersistencePort';
import { EventBus, EventTypes } from '../../infrastructure/events/EventBus';

/**
 * Use case for executing a SOL process
 * Orchestrates the execution of a process following SOL semantics
 */
export class ExecuteProcessUseCase implements ExecutionEnginePort {
  constructor(
    private readonly persistence: PersistencePort,
    private readonly eventBus: EventBus
  ) {}

  public async executeProcess(
    processId: string,
    context?: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Load process from persistence - using findArtifacts as getArtifact has typing issues
      const artifacts = await this.persistence.findArtifacts({ text: processId, limit: 1 });
      const processData = artifacts.find(a => a.id === processId);
      if (!processData) {
        throw new Error(`Process not found: ${processId}`);
      }

      // Create process instance from data
      const process = this.createProcessFromData(processData);

      const executionContext = context || {
        initiator: 'MotorHexy',
        priority: ExecutionPriority.NORMAL,
      };

      this.eventBus.emit(EventTypes.PROCESS_STARTED, {
        processId,
        initiator: executionContext.initiator,
      });

      // Execute all steps
      let stepsExecuted = 0;
      for (const step of process.steps) {
        const stepResult = await this.executeStep(step, executionContext);
        if (stepResult.status === ExecutionStatus.FAILED) {
          throw new Error(`Step failed: ${stepResult.error}`);
        }
        stepsExecuted++;
      }

      this.eventBus.emit(EventTypes.PROCESS_COMPLETED, {
        processId,
        status: ExecutionStatus.COMPLETED,
      });

      return {
        processId,
        status: ExecutionStatus.COMPLETED,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        stepsExecuted,
        totalSteps: process.steps.length,
      };
    } catch (error) {
      return {
        processId,
        status: ExecutionStatus.FAILED,
        error: (error as Error).message,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        stepsExecuted: 0,
        totalSteps: 0,
      };
    }
  }

  public async executeStep(
    step: ProcessStep,
    _context: ExecutionContext
  ): Promise<StepExecutionResult> {
    const startTime = Date.now();

    try {
      // Simulate step execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.eventBus.emit(EventTypes.PROCESS_STEP_EXECUTED, {
        step: step.action,
        actor: step.actor,
      });

      return {
        stepIndex: 0,
        status: ExecutionStatus.COMPLETED,
        output: `Step executed: ${step.action}`,
        executedAt: new Date(),
        duration: Date.now() - startTime,
        actor: step.actor,
      };
    } catch (error) {
      return {
        stepIndex: 0,
        status: ExecutionStatus.FAILED,
        error: (error as Error).message,
        executedAt: new Date(),
        duration: Date.now() - startTime,
        actor: step.actor,
      };
    }
  }

  public async getExecutionState(processId: string): Promise<ProcessExecutionState> {
    return {
      processId,
      status: ExecutionStatus.COMPLETED,
      currentStep: 0,
      totalSteps: 0,
      startedAt: new Date(),
      context: {
        initiator: 'MotorHexy',
        priority: ExecutionPriority.NORMAL,
      },
    };
  }

  public async pauseExecution(_processId: string): Promise<void> {
    // Implementation for pausing execution
  }

  public async resumeExecution(_processId: string): Promise<void> {
    // Implementation for resuming execution
  }

  public async cancelExecution(processId: string, _reason: string): Promise<void> {
    this.eventBus.emit(EventTypes.PROCESS_COMPLETED, {
      processId,
      status: ExecutionStatus.CANCELLED,
    });
  }

  public async getExecutionHistory(_processId: string): Promise<ExecutionHistoryEntry[]> {
    return [];
  }

  public async validateActorAvailability(actors: string[]): Promise<ActorAvailabilityResult> {
    return {
      allAvailable: true,
      availableActors: actors,
      unavailableActors: [],
    };
  }

  public async scheduleExecution(
    processId: string,
    _scheduledAt: Date,
    _context?: ExecutionContext
  ): Promise<string> {
    return `scheduled_${processId}_${Date.now()}`;
  }

  private createProcessFromData(data: any): Process {
    // Simple conversion from data to Process
    // In a real implementation, this would be more sophisticated
    return new Process(
      data.id,
      data.actors || ['MotorHexy'],
      data.steps?.map((s: any) => ProcessStep.fromString(s)) || [],
      data.vision
    );
  }
}

export interface ExecuteProcessRequest {
  processId: string;
  initiator: string;
  parameters?: Record<string, unknown>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
    exponentialBackoff: boolean;
  };
}

export interface ExecuteProcessResponse {
  success: boolean;
  processId: string;
  executionResult: ExecutionResult;
  result?: Result;
  warnings?: string[];
}

export class ExecuteProcessError extends Error {
  constructor(
    message: string,
    public readonly code: ExecuteProcessErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ExecuteProcessError';
  }
}

export type ExecuteProcessErrorCode =
  | 'INVALID_INPUT'
  | 'PROCESS_NOT_FOUND'
  | 'EXECUTION_BLOCKED'
  | 'EXECUTION_ERROR'
  | 'EXECUTION_NOT_FOUND'
  | 'INVALID_STATE';
