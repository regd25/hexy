import {
  ExecuteProcessUseCase,
  ExecuteProcessRequest,
  ExecuteProcessResponse,
  ExecuteProcessError,
} from './ExecuteProcess';
import {
  ExecutionEnginePort,
  ExecutionContext,
  ExecutionResult,
  ExecutionStatus,
  ExecutionPriority,
} from '../../ports/primary/ExecutionEnginePort';
import { PersistencePort } from '../../ports/secondary/PersistencePort';
import { EventBus, EventTypes } from '../../infrastructure/events/EventBus';
import { Process, ProcessStep, ProcessStepType } from '../../domain/entities/Process';

// Mock implementations for testing
class MockPersistencePort implements PersistencePort {
  private artifacts: any[] = [];

  async saveArtifact(artifact: any): Promise<void> {
    this.artifacts.push(artifact);
  }

  async findArtifacts(criteria: any): Promise<any[]> {
    if (criteria.text) {
      return this.artifacts.filter(a => a.id === criteria.text);
    }
    return this.artifacts;
  }

  async deleteArtifact(id: string): Promise<void> {
    this.artifacts = this.artifacts.filter(a => a.id !== id);
  }

  // Add predefined test processes
  public addTestProcess(processData: any): void {
    this.artifacts.push(processData);
  }

  public clear(): void {
    this.artifacts = [];
  }
}

class MockEventBus implements EventBus {
  private events: Array<{ type: string; data: any }> = [];

  emit(eventType: string, data: any): void {
    this.events.push({ type: eventType, data });
  }

  on(eventType: string, _handler: (data: any) => void): void {
    // Mock implementation
  }

  off(eventType: string, _handler: (data: any) => void): void {
    // Mock implementation
  }

  getEmittedEvents(): Array<{ type: string; data: any }> {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

describe('ExecuteProcessUseCase', () => {
  let executeProcessUseCase: ExecuteProcessUseCase;
  let mockPersistence: MockPersistencePort;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockPersistence = new MockPersistencePort();
    mockEventBus = new MockEventBus();
    executeProcessUseCase = new ExecuteProcessUseCase(mockPersistence, mockEventBus);
  });

  describe('Constructor and Initialization', () => {
    it('should create ExecuteProcessUseCase with dependencies', () => {
      expect(executeProcessUseCase).toBeInstanceOf(ExecuteProcessUseCase);
      expect(executeProcessUseCase).toHaveProperty('executeProcess');
      expect(executeProcessUseCase).toHaveProperty('executeStep');
      expect(executeProcessUseCase).toHaveProperty('getExecutionState');
    });

    it('should implement ExecutionEnginePort interface', () => {
      const port: ExecutionEnginePort = executeProcessUseCase;
      expect(port.executeProcess).toBeDefined();
      expect(port.executeStep).toBeDefined();
      expect(port.getExecutionState).toBeDefined();
      expect(port.pauseExecution).toBeDefined();
      expect(port.resumeExecution).toBeDefined();
      expect(port.cancelExecution).toBeDefined();
    });
  });

  describe('Process Execution - Happy Path', () => {
    beforeEach(() => {
      // Add a test process to persistence
      const testProcess = {
        id: 'test-process-1',
        actors: ['MotorHexy', 'TestActor'],
        steps: [
          'MotorHexy → Load configuration',
          'TestActor → Validate inputs',
          'MotorHexy → Execute main logic',
          'MotorHexy → Generate report'
        ],
        vision: 'TestVision'
      };
      mockPersistence.addTestProcess(testProcess);
    });

    it('should execute a process successfully', async () => {
      const result = await executeProcessUseCase.executeProcess('test-process-1');

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.processId).toBe('test-process-1');
      expect(result.stepsExecuted).toBe(4);
      expect(result.totalSteps).toBe(4);
      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should emit process started and completed events', async () => {
      await executeProcessUseCase.executeProcess('test-process-1');

      const events = mockEventBus.getEmittedEvents();
      expect(events.some(e => e.type === EventTypes.PROCESS_STARTED)).toBe(true);
      expect(events.some(e => e.type === EventTypes.PROCESS_COMPLETED)).toBe(true);
      expect(events.some(e => e.type === EventTypes.PROCESS_STEP_EXECUTED)).toBe(true);
    });

    it('should execute process with custom execution context', async () => {
      const context: ExecutionContext = {
        initiator: 'CustomInitiator',
        priority: ExecutionPriority.HIGH,
        metadata: { customKey: 'customValue' }
      };

      const result = await executeProcessUseCase.executeProcess('test-process-1', context);

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      
      const startedEvent = mockEventBus.getEmittedEvents()
        .find(e => e.type === EventTypes.PROCESS_STARTED);
      expect(startedEvent?.data.initiator).toBe('CustomInitiator');
    });

    it('should handle process with no steps', async () => {
      const emptyProcess = {
        id: 'empty-process',
        actors: ['MotorHexy'],
        steps: [],
        vision: 'TestVision'
      };
      mockPersistence.addTestProcess(emptyProcess);

      const result = await executeProcessUseCase.executeProcess('empty-process');

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.stepsExecuted).toBe(0);
      expect(result.totalSteps).toBe(0);
    });
  });

  describe('Process Execution - Error Cases', () => {
    it('should handle process not found', async () => {
      const result = await executeProcessUseCase.executeProcess('non-existent-process');

      expect(result.status).toBe(ExecutionStatus.FAILED);
      expect(result.error).toContain('Process not found');
      expect(result.processId).toBe('non-existent-process');
      expect(result.stepsExecuted).toBe(0);
      expect(result.totalSteps).toBe(0);
    });

    it('should handle persistence errors', async () => {
      // Mock persistence to throw error
      jest.spyOn(mockPersistence, 'findArtifacts').mockRejectedValue(new Error('Database error'));

      const result = await executeProcessUseCase.executeProcess('test-process');

      expect(result.status).toBe(ExecutionStatus.FAILED);
      expect(result.error).toContain('Database error');
    });

    it('should handle invalid process data', async () => {
      const invalidProcess = {
        id: 'invalid-process',
        // Missing required fields
      };
      mockPersistence.addTestProcess(invalidProcess);

      const result = await executeProcessUseCase.executeProcess('invalid-process');

      expect(result.status).toBe(ExecutionStatus.COMPLETED); // Should handle gracefully
      expect(result.stepsExecuted).toBe(0); // No steps to execute
    });
  });

  describe('Step Execution', () => {
    it('should execute a single step successfully', async () => {
      const step = ProcessStep.fromString('MotorHexy → Test action');
      const context: ExecutionContext = {
        initiator: 'TestInitiator',
        priority: ExecutionPriority.NORMAL,
      };

      const result = await executeProcessUseCase.executeStep(step, context);

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.output).toContain('Step executed');
      expect(result.actor).toBe('MotorHexy');
      expect(result.executedAt).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should emit step executed event', async () => {
      const step = ProcessStep.fromString('TestActor → Execute test step');
      const context: ExecutionContext = {
        initiator: 'TestInitiator',
        priority: ExecutionPriority.NORMAL,
      };

      await executeProcessUseCase.executeStep(step, context);

      const events = mockEventBus.getEmittedEvents();
      const stepEvent = events.find(e => e.type === EventTypes.PROCESS_STEP_EXECUTED);
      expect(stepEvent).toBeDefined();
      expect(stepEvent?.data.actor).toBe('TestActor');
      expect(stepEvent?.data.step).toBe('Execute test step');
    });

    it('should handle step execution errors gracefully', async () => {
      // Create a step that might cause issues
      const problematicStep = ProcessStep.fromString('ErrorActor → Problematic action');
      
      // Mock setTimeout to reject
      const originalSetTimeout = setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        throw new Error('Step execution failed');
      });

      const context: ExecutionContext = {
        initiator: 'TestInitiator',
        priority: ExecutionPriority.NORMAL,
      };

      const result = await executeProcessUseCase.executeStep(problematicStep, context);

      expect(result.status).toBe(ExecutionStatus.FAILED);
      expect(result.error).toContain('Step execution failed');
      expect(result.actor).toBe('ErrorActor');

      // Restore setTimeout
      jest.spyOn(global, 'setTimeout').mockImplementation(originalSetTimeout);
    });
  });

  describe('Process State Management', () => {
    it('should get execution state', async () => {
      const state = await executeProcessUseCase.getExecutionState('test-process');

      expect(state.processId).toBe('test-process');
      expect(state.status).toBe(ExecutionStatus.COMPLETED);
      expect(state.currentStep).toBe(0);
      expect(state.totalSteps).toBe(0);
      expect(state.startedAt).toBeInstanceOf(Date);
      expect(state.context.initiator).toBe('MotorHexy');
      expect(state.context.priority).toBe(ExecutionPriority.NORMAL);
    });

    it('should pause execution', async () => {
      await expect(executeProcessUseCase.pauseExecution('test-process')).resolves.toBeUndefined();
    });

    it('should resume execution', async () => {
      await expect(executeProcessUseCase.resumeExecution('test-process')).resolves.toBeUndefined();
    });

    it('should cancel execution with event emission', async () => {
      await executeProcessUseCase.cancelExecution('test-process', 'User requested cancellation');

      const events = mockEventBus.getEmittedEvents();
      const cancelEvent = events.find(e => e.type === EventTypes.PROCESS_COMPLETED);
      expect(cancelEvent).toBeDefined();
      expect(cancelEvent?.data.processId).toBe('test-process');
      expect(cancelEvent?.data.status).toBe(ExecutionStatus.CANCELLED);
    });

    it('should get empty execution history', async () => {
      const history = await executeProcessUseCase.getExecutionHistory('test-process');
      expect(history).toEqual([]);
    });
  });

  describe('Actor Management', () => {
    it('should validate actor availability - all available', async () => {
      const actors = ['MotorHexy', 'TestActor', 'ValidatorAgent'];
      
      const result = await executeProcessUseCase.validateActorAvailability(actors);

      expect(result.allAvailable).toBe(true);
      expect(result.availableActors).toEqual(actors);
      expect(result.unavailableActors).toEqual([]);
    });

    it('should validate actor availability with empty list', async () => {
      const result = await executeProcessUseCase.validateActorAvailability([]);

      expect(result.allAvailable).toBe(true);
      expect(result.availableActors).toEqual([]);
      expect(result.unavailableActors).toEqual([]);
    });
  });

  describe('Process Scheduling', () => {
    it('should schedule execution for future date', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const context: ExecutionContext = {
        initiator: 'Scheduler',
        priority: ExecutionPriority.LOW,
      };

      const scheduledId = await executeProcessUseCase.scheduleExecution(
        'scheduled-process',
        futureDate,
        context
      );

      expect(scheduledId).toMatch(/^scheduled_scheduled-process_\d+$/);
    });

    it('should schedule execution without context', async () => {
      const futureDate = new Date(Date.now() + 1000);

      const scheduledId = await executeProcessUseCase.scheduleExecution(
        'simple-scheduled-process',
        futureDate
      );

      expect(scheduledId).toMatch(/^scheduled_simple-scheduled-process_\d+$/);
    });
  });

  describe('Process Data Conversion', () => {
    it('should handle process data with minimal fields', async () => {
      const minimalProcess = {
        id: 'minimal-process'
        // No actors, steps, or vision
      };
      mockPersistence.addTestProcess(minimalProcess);

      const result = await executeProcessUseCase.executeProcess('minimal-process');

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.processId).toBe('minimal-process');
    });

    it('should handle process data with complex steps', async () => {
      const complexProcess = {
        id: 'complex-process',
        actors: ['MotorHexy', 'ValidatorAgent', 'ReportGenerator'],
        steps: [
          'MotorHexy → Initialize system',
          'ValidatorAgent → Perform validation with complex rules',
          'ReportGenerator → Generate detailed report with metrics',
          'MotorHexy → Finalize and cleanup resources'
        ],
        vision: 'ComplexProcessVision',
        metadata: {
          priority: 'HIGH',
          timeout: 30000,
          retryCount: 3
        }
      };
      mockPersistence.addTestProcess(complexProcess);

      const result = await executeProcessUseCase.executeProcess('complex-process');

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.stepsExecuted).toBe(4);
      expect(result.totalSteps).toBe(4);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent process execution', async () => {
      const testProcess = {
        id: 'concurrent-process',
        actors: ['MotorHexy'],
        steps: ['MotorHexy → Concurrent operation'],
        vision: 'ConcurrentVision'
      };
      mockPersistence.addTestProcess(testProcess);

      const promises = [
        executeProcessUseCase.executeProcess('concurrent-process'),
        executeProcessUseCase.executeProcess('concurrent-process'),
        executeProcessUseCase.executeProcess('concurrent-process'),
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.status).toBe(ExecutionStatus.COMPLETED);
        expect(result.processId).toBe('concurrent-process');
      });
    });

    it('should handle very long process execution', async () => {
      const longProcess = {
        id: 'long-process',
        actors: ['MotorHexy'],
        steps: Array.from({ length: 10 }, (_, i) => `MotorHexy → Step ${i + 1}`),
        vision: 'LongProcessVision'
      };
      mockPersistence.addTestProcess(longProcess);

      const result = await executeProcessUseCase.executeProcess('long-process');

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.stepsExecuted).toBe(10);
      expect(result.totalSteps).toBe(10);
      expect(result.duration).toBeGreaterThan(1000); // Should take at least 1 second
    });

    it('should handle malformed step strings', async () => {
      const malformedProcess = {
        id: 'malformed-process',
        actors: ['MotorHexy'],
        steps: [
          'Invalid step format',
          'Another invalid step',
          'MotorHexy → Valid step'
        ],
        vision: 'MalformedVision'
      };
      mockPersistence.addTestProcess(malformedProcess);

      const result = await executeProcessUseCase.executeProcess('malformed-process');

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.stepsExecuted).toBe(3); // Should handle all steps
      expect(result.totalSteps).toBe(3);
    });

    it('should handle null/undefined process fields', async () => {
      const nullFieldsProcess = {
        id: 'null-fields-process',
        actors: null,
        steps: null,
        vision: undefined
      };
      mockPersistence.addTestProcess(nullFieldsProcess);

      const result = await executeProcessUseCase.executeProcess('null-fields-process');

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.stepsExecuted).toBe(0);
      expect(result.totalSteps).toBe(0);
    });
  });

  describe('Performance and Timing', () => {
    it('should measure execution duration accurately', async () => {
      const testProcess = {
        id: 'timing-process',
        actors: ['MotorHexy'],
        steps: ['MotorHexy → Timed operation'],
        vision: 'TimingVision'
      };
      mockPersistence.addTestProcess(testProcess);

      const startTime = Date.now();
      const result = await executeProcessUseCase.executeProcess('timing-process');
      const endTime = Date.now();

      expect(result.duration).toBeGreaterThan(0);
      expect(result.duration).toBeLessThanOrEqual(endTime - startTime + 50); // Allow 50ms tolerance
      expect(result.startedAt.getTime()).toBeCloseTo(startTime, -2); // Within 100ms
      expect(result.completedAt.getTime()).toBeCloseTo(endTime, -2);
    });

    it('should handle timeout scenarios gracefully', (done) => {
      const timeoutTest = async () => {
        const testProcess = {
          id: 'timeout-process',
          actors: ['MotorHexy'],
          steps: ['MotorHexy → Quick operation'],
          vision: 'TimeoutVision'
        };
        mockPersistence.addTestProcess(testProcess);

        // Execute with a very short timeout expectation
        const result = await executeProcessUseCase.executeProcess('timeout-process');
        
        expect(result.status).toBe(ExecutionStatus.COMPLETED);
        expect(result.duration).toBeGreaterThan(0);
        done();
      };

      timeoutTest().catch(done);
    });
  });

  describe('Integration with Domain Entities', () => {
    it('should work with real Process entity instances', async () => {
      // Create a real Process entity
      const realProcess = new Process(
        'real-process-entity',
        ['MotorHexy', 'TestActor'],
        [
          ProcessStep.fromString('MotorHexy → Initialize'),
          ProcessStep.fromString('TestActor → Execute'),
          ProcessStep.fromString('MotorHexy → Finalize')
        ],
        'RealProcessVision'
      );

      // Add the serialized version to persistence
      mockPersistence.addTestProcess({
        id: 'real-process-entity',
        actors: realProcess.actors,
        steps: realProcess.steps.map(s => s.toString()),
        vision: realProcess.vision
      });

      const result = await executeProcessUseCase.executeProcess('real-process-entity');

      expect(result.status).toBe(ExecutionStatus.COMPLETED);
      expect(result.stepsExecuted).toBe(3);
      expect(result.totalSteps).toBe(3);
    });
  });
});

describe('ExecuteProcessError', () => {
  it('should create error with code and details', () => {
    const error = new ExecuteProcessError(
      'Process execution failed',
      'EXECUTION_ERROR',
      { processId: 'failed-process', step: 2 }
    );

    expect(error.message).toBe('Process execution failed');
    expect(error.code).toBe('EXECUTION_ERROR');
    expect(error.details).toEqual({ processId: 'failed-process', step: 2 });
    expect(error.name).toBe('ExecuteProcessError');
  });

  it('should create error without details', () => {
    const error = new ExecuteProcessError('Simple error', 'INVALID_INPUT');

    expect(error.message).toBe('Simple error');
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.details).toBeUndefined();
  });

  it('should have all expected error codes', () => {
    const codes = [
      'INVALID_INPUT',
      'PROCESS_NOT_FOUND',
      'EXECUTION_BLOCKED',
      'EXECUTION_ERROR',
      'EXECUTION_NOT_FOUND',
      'INVALID_STATE'
    ];

    codes.forEach(code => {
      const error = new ExecuteProcessError('Test error', code as any);
      expect(error.code).toBe(code);
    });
  });
}); 