import { Process, ProcessStatus, ProcessStepType, ProcessStep } from './Process';

describe('Process Entity', () => {
  describe('Constructor and Basic Properties', () => {
    it('should create Process with required properties', () => {
      const stepStrings = [
        'actor1 → First step',
        'actor2 → Second step validation'
      ];
      
      const process = new Process(
        'TestProcess',
        ['actor1', 'actor2'],
        stepStrings,
        'TestVision'
      );

      expect(process.id).toBe('TestProcess');
      expect(process.steps).toHaveLength(2);
      expect(process.steps[0].actor).toBe('actor1');
      expect(process.steps[0].action).toBe('First step');
      expect(process.steps[1].actor).toBe('actor2');
      expect(process.steps[1].action).toBe('Second step validation');
      expect(process.actors).toEqual(['actor1', 'actor2']);
      expect(process.vision).toBe('TestVision');
      expect(process.status).toBe(ProcessStatus.PENDING);
      expect(process.getType()).toBe('PROCESS');
    });

    it('should create Process with optional metadata', () => {
      const metadata = { priority: 'high', category: 'business' };
      const stepStrings = ['actor1 → Test step'];
      
      const process = new Process(
        'TestProcess',
        ['actor1'],
        stepStrings,
        'TestVision',
        metadata
      );

      expect(process.metadata).toEqual(metadata);
    });

    it('should create Process with ProcessStep objects', () => {
      const steps = [
        ProcessStep.fromString('MotorHexy → Initialize system'),
        ProcessStep.fromString('ValidatorAgent → Validate configuration')
      ];
      
      const process = new Process(
        'ProcessStepTest',
        ['MotorHexy', 'ValidatorAgent'],
        steps,
        'TestVision'
      );

      expect(process.steps).toHaveLength(2);
      expect(process.steps[0].actor).toBe('MotorHexy');
      expect(process.steps[1].actor).toBe('ValidatorAgent');
    });
  });

  describe('Process Steps Management', () => {
    let process: Process;

    beforeEach(() => {
      const stepStrings = [
        'actor1 → First step',
        'actor2 → Second step'
      ];
      process = new Process('TestProcess', ['actor1', 'actor2'], stepStrings, 'TestVision');
    });

    it('should add new step', () => {
      const newStep = ProcessStep.fromString('actor3 → Third step');
      
      process.addStep(newStep);
      expect(process.steps).toHaveLength(3);
      expect(process.steps[2].actor).toBe('actor3');
      expect(process.steps[2].action).toBe('Third step');
    });

    it('should remove step by id', () => {
      const stepId = process.steps[0].id;
      process.removeStep(stepId);
      expect(process.steps).toHaveLength(1);
      expect(process.steps[0].actor).toBe('actor2');
    });

    it('should handle removing non-existent step', () => {
      const initialLength = process.steps.length;
      process.removeStep('nonexistent');
      expect(process.steps).toHaveLength(initialLength);
    });

    it('should get step by id', () => {
      const stepId = process.steps[0].id;
      const step = process.getStep(stepId);
      expect(step).toBeDefined();
      expect(step?.id).toBe(stepId);
      expect(step?.actor).toBe('actor1');
    });

    it('should return undefined for non-existent step', () => {
      const step = process.getStep('nonexistent');
      expect(step).toBeUndefined();
    });

    it('should update step description', () => {
      const stepId = process.steps[0].id;
      process.updateStepDescription(stepId, 'Updated description');
      const step = process.getStep(stepId);
      expect(step?.description).toBe('Updated description');
    });

    it('should not update description for non-existent step', () => {
      process.updateStepDescription('nonexistent', 'New description');
      // Should not throw error, just ignore
      expect(process.steps).toHaveLength(2);
    });
  });

  describe('Process Status Management', () => {
    let process: Process;

    beforeEach(() => {
      const stepStrings = ['actor1 → Test step'];
      process = new Process('TestProcess', ['actor1'], stepStrings, 'TestVision');
    });

    it('should start process', () => {
      process.start();
      expect(process.status).toBe(ProcessStatus.RUNNING);
    });

    it('should complete process', () => {
      process.start();
      process.complete();
      expect(process.status).toBe(ProcessStatus.COMPLETED);
    });

    it('should fail process', () => {
      process.start();
      process.fail('Test error');
      expect(process.status).toBe(ProcessStatus.FAILED);
    });

    it('should pause running process', () => {
      process.start();
      process.pause();
      expect(process.status).toBe(ProcessStatus.PAUSED);
    });

    it('should resume paused process', () => {
      process.start();
      process.pause();
      process.resume();
      expect(process.status).toBe(ProcessStatus.RUNNING);
    });

    it('should reset process to pending', () => {
      process.start();
      process.complete();
      process.reset();
      expect(process.status).toBe(ProcessStatus.PENDING);
    });

    it('should mark step as completed', () => {
      const stepId = process.steps[0].id;
      process.markStepCompleted(stepId);
      expect(process.getProgress()).toBe(100);
    });

    it('should calculate progress correctly', () => {
      const multiStepProcess = new Process(
        'ProgressTest',
        ['actor1', 'actor2', 'actor3'],
        [
          'actor1 → Step 1',
          'actor2 → Step 2', 
          'actor3 → Step 3'
        ],
        'ProgressVision'
      );

      expect(multiStepProcess.getProgress()).toBe(0);
      
      multiStepProcess.markStepCompleted(multiStepProcess.steps[0].id);
      expect(multiStepProcess.getProgress()).toBe(33);
      
      multiStepProcess.markStepCompleted(multiStepProcess.steps[1].id);
      expect(multiStepProcess.getProgress()).toBe(67);
      
      multiStepProcess.markStepCompleted(multiStepProcess.steps[2].id);
      expect(multiStepProcess.getProgress()).toBe(100);
    });
  });

  describe('Process Validation', () => {
    it('should validate process with valid data', () => {
      const stepStrings = [
        'actor1 → Valid step',
        'actor2 → Another valid step',
        'actor3 → Third valid step'
      ];
      
      const process = new Process('ValidProcess', ['actor1', 'actor2', 'actor3'], stepStrings, 'TestVision');
      const result = process.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate and return errors for invalid process', () => {
      // Empty process with no steps
      const process = new Process('', [], [], '');
      const result = process.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('ID'))).toBe(true);
      expect(result.errors.some(e => e.includes('steps'))).toBe(true);
      expect(result.errors.some(e => e.includes('vision'))).toBe(true);
    });

    it('should validate minimum steps requirement', () => {
      const stepStrings = ['actor1 → Only step'];
      
      const process = new Process('TestProcess', ['actor1'], stepStrings, 'TestVision');
      const result = process.validate();
      
      expect(result.warnings.some(w => w.includes('steps'))).toBe(true);
    });

    it('should validate duplicate step IDs', () => {
      // This is handled automatically by ProcessStep.fromString which generates unique IDs
      const stepStrings = [
        'actor1 → Duplicate action',
        'actor1 → Duplicate action'
      ];
      
      const process = new Process('DuplicateTest', ['actor1'], stepStrings, 'TestVision');
      const result = process.validate();
      
      // Should be valid since IDs are automatically unique, but may have warnings
      expect(result.isValid).toBe(result.errors.length === 0);
    });

    it('should warn about actors not in actor list', () => {
      const stepStrings = [
        'actor1 → Valid step',
        'undeclaredActor → Invalid step'
      ];
      
      const process = new Process('ActorTest', ['actor1'], stepStrings, 'TestVision');
      const result = process.validate();
      
      expect(result.warnings.some(w => w.includes('undeclaredActor'))).toBe(true);
    });
  });

  describe('Process Execution Context', () => {
    let process: Process;

    beforeEach(() => {
      const stepStrings = ['actor1 → Test step', 'actor2 → Another step'];
      process = new Process('TestProcess', ['actor1', 'actor2'], stepStrings, 'TestVision');
    });

    it('should check if actor can execute process', () => {
      expect(process.canBeExecutedBy('actor1')).toBe(true);
      expect(process.canBeExecutedBy('actor2')).toBe(true);
      expect(process.canBeExecutedBy('unknownActor')).toBe(false);
    });

    it('should get current step when process is running', () => {
      process.start();
      const currentStep = process.getCurrentStep();
      expect(currentStep).toBeDefined();
      expect(currentStep?.actor).toBe('actor1');
    });

    it('should return undefined for current step when not running', () => {
      const currentStep = process.getCurrentStep();
      expect(currentStep).toBeUndefined();
    });

    it('should return undefined for current step when completed', () => {
      process.start();
      process.complete();
      const currentStep = process.getCurrentStep();
      expect(currentStep).toBeUndefined();
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const stepStrings = ['actor1 → Test step'];
      
      const process = new Process('SerialProcess', ['actor1'], stepStrings, 'TestVision');
      const json = process.toJSON();
      
      expect(json.id).toBe('SerialProcess');
      expect(json.type).toBe('PROCESS');
      expect(json.steps).toHaveLength(1);
      expect(json.actors).toEqual(['actor1']);
      expect(json.vision).toBe('TestVision');
      expect(json.status).toBe(ProcessStatus.PENDING);
      expect(json.createdAt).toBeDefined();
      expect(json.updatedAt).toBeDefined();
    });

    it('should create Process from JSON data', () => {
      const jsonData = {
        id: 'JSONProcess',
        actors: ['actor1', 'actor2'],
        steps: ['actor1 → JSON step 1', 'actor2 → JSON step 2'],
        vision: 'JSONVision',
        status: ProcessStatus.RUNNING,
        metadata: { source: 'json' }
      };

      const process = Process.fromJSON(jsonData);
      
      expect(process.id).toBe('JSONProcess');
      expect(process.actors).toEqual(['actor1', 'actor2']);
      expect(process.steps).toHaveLength(2);
      expect(process.steps[0].actor).toBe('actor1');
      expect(process.steps[1].actor).toBe('actor2');
      expect(process.vision).toBe('JSONVision');
      expect(process.status).toBe(ProcessStatus.RUNNING);
      expect(process.metadata).toEqual({ source: 'json' });
    });
  });

  describe('Process Step Types', () => {
    it('should handle all step types correctly', () => {
      const stepStrings = [
        'actor1 → Execute action',
        'actor2 → Validate input data',
        'actor3 → Decide next course',
        'actor4 → Check policy compliance'
      ];
      
      const process = new Process('StepTypeTest', ['actor1', 'actor2', 'actor3', 'actor4'], stepStrings, 'TestVision');
      
      expect(process.steps[0].type).toBe(ProcessStepType.ACTION);
      expect(process.steps[1].type).toBe(ProcessStepType.POLICY_CHECK); // Contains 'validate'
      expect(process.steps[2].type).toBe(ProcessStepType.DECISION); // Contains 'decide'
      expect(process.steps[3].type).toBe(ProcessStepType.POLICY_CHECK); // Contains 'policy'
    });

    it('should handle malformed step strings gracefully', () => {
      const stepStrings = [
        'NoArrow',
        'actor → Valid step',
        ''
      ];
      
      const process = new Process('MalformedTest', ['actor'], stepStrings, 'TestVision');
      
      expect(process.steps).toHaveLength(3);
      expect(process.steps[0].actor).toBe('UnknownActor'); // Malformed step
      expect(process.steps[1].actor).toBe('actor'); // Valid step
      expect(process.steps[2].actor).toBe('UnknownActor'); // Empty step
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle steps with empty descriptions', () => {
      const stepStrings = ['actor1 → '];
      
      const process = new Process('EmptyDesc', ['actor1'], stepStrings, 'TestVision');
      const validation = process.validate();
      
      // Should handle gracefully - empty action becomes 'Unknown action'
      expect(process.steps).toHaveLength(1);
      expect(process.steps[0].action).toBe('Unknown action');
    });

    it('should handle duplicate actor IDs in actor list', () => {
      const stepStrings = ['actor1 → Test step'];
      
      const process = new Process('TestProcess', ['actor1', 'actor1'], stepStrings, 'TestVision');
      expect(process.actors).toEqual(['actor1', 'actor1']); // Should preserve as-is
    });

    it('should handle process state transitions edge cases', () => {
      const process = new Process('EdgeCase', ['actor1'], ['actor1 → Test'], 'TestVision');
      
      // Try to complete without starting
      process.complete();
      expect(process.status).toBe(ProcessStatus.PENDING); // Should remain pending
      
      // Try to pause without starting
      process.pause();
      expect(process.status).toBe(ProcessStatus.PENDING); // Should remain pending
      
      // Try to resume without pausing
      process.start();
      process.resume();
      expect(process.status).toBe(ProcessStatus.RUNNING); // Should remain running
    });

    it('should handle empty step arrays', () => {
      const process = new Process('EmptySteps', ['actor1'], [], 'TestVision');
      
      expect(process.steps).toHaveLength(0);
      expect(process.getProgress()).toBe(0);
      expect(process.getCurrentStep()).toBeUndefined();
    });

    it('should handle very long step descriptions', () => {
      const longDescription = 'A'.repeat(1000);
      const stepStrings = [`actor1 → ${longDescription}`];
      
      const process = new Process('LongDesc', ['actor1'], stepStrings, 'TestVision');
      
      expect(process.steps[0].action).toBe(longDescription);
      expect(process.steps[0].description).toBe(longDescription);
    });

    it('should handle special characters in step descriptions', () => {
      const specialStep = 'actor1 → Step with special chars: @#$%^&*()[]{}|\\:";\'<>?,./';
      
      const process = new Process('SpecialChars', ['actor1'], [specialStep], 'TestVision');
      
      expect(process.steps[0].action).toContain('special chars');
      expect(process.steps[0].actor).toBe('actor1');
    });
  });

  describe('Integration with ProcessStep', () => {
    it('should work with ProcessStep.fromString', () => {
      const step1 = ProcessStep.fromString('MotorHexy → Initialize system');
      const step2 = ProcessStep.fromString('ValidatorAgent → Validate configuration');
      
      const process = new Process('Integration', ['MotorHexy', 'ValidatorAgent'], [step1, step2], 'TestVision');
      
      expect(process.steps).toHaveLength(2);
      expect(process.steps[0].toString()).toBe('MotorHexy → Initialize system');
      expect(process.steps[1].toString()).toBe('ValidatorAgent → Validate configuration');
    });

    it('should handle mixed string and ProcessStep inputs', () => {
      const step1 = 'actor1 → String step';
      const step2 = ProcessStep.fromString('actor2 → ProcessStep step');
      const mixedSteps: (string | ProcessStep)[] = [step1, step2];
      
      const process = new Process('Mixed', ['actor1', 'actor2'], mixedSteps as any, 'TestVision');
      
      expect(process.steps).toHaveLength(2);
      expect(process.steps[0].actor).toBe('actor1');
      expect(process.steps[1].actor).toBe('actor2');
    });

    it('should preserve ProcessStep properties', () => {
      const step = ProcessStep.fromString('TestActor → Validate policy compliance');
      const process = new Process('PolicyTest', ['TestActor'], [step], 'TestVision');
      
      expect(process.steps[0].type).toBe(ProcessStepType.POLICY_CHECK);
      expect(process.steps[0].actorId).toBe('TestActor');
      expect(process.steps[0].actor).toBe('TestActor');
      expect(process.steps[0].action).toBe('Validate policy compliance');
    });
  });
}); 