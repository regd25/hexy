import { Result, ResultStatus } from './Result';

describe('Result Entity', () => {
  describe('Constructor and Basic Properties', () => {
    it('should create Result with required properties', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z');
      const result = new Result(
        'TestResult',
        'MotorHexy',
        'Process completed successfully',
        'All validation steps passed without errors',
        timestamp
      );

      expect(result.id).toBe('TestResult');
      expect(result.issuedBy).toBe('MotorHexy');
      expect(result.outcome).toBe('Process completed successfully');
      expect(result.reason).toBe('All validation steps passed without errors');
      expect(result.timestamp).toEqual(timestamp);
      expect(result.status).toBe(ResultStatus.SUCCESS);
      expect(result.processId).toBeUndefined();
      expect(result.data).toBeUndefined();
      expect(result.getType()).toBe('RESULT');
    });

    it('should create Result with all optional properties', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z');
      const data = { metrics: { duration: 1500, steps: 5 }, artifacts: ['file1', 'file2'] };
      
      const result = new Result(
        'CompleteResult',
        'ValidatorAgent',
        'Validation completed with warnings',
        'Some non-critical issues were found during validation',
        timestamp,
        'process-123',
        ResultStatus.PARTIAL,
        data
      );

      expect(result.id).toBe('CompleteResult');
      expect(result.issuedBy).toBe('ValidatorAgent');
      expect(result.outcome).toBe('Validation completed with warnings');
      expect(result.reason).toBe('Some non-critical issues were found during validation');
      expect(result.timestamp).toEqual(timestamp);
      expect(result.processId).toBe('process-123');
      expect(result.status).toBe(ResultStatus.PARTIAL);
      expect(result.data).toEqual(data);
    });

    it('should create Result with default timestamp when not provided', () => {
      const beforeCreation = new Date();
      const result = new Result(
        'DefaultTimestamp',
        'TestActor',
        'Default outcome',
        'Default reason for testing'
      );
      const afterCreation = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('Result Status Methods', () => {
    let successResult: Result;
    let failureResult: Result;
    let pendingResult: Result;
    let partialResult: Result;

    beforeEach(() => {
      const timestamp = new Date();
      successResult = new Result('success', 'actor', 'success outcome', 'success reason', timestamp, 'proc-1', ResultStatus.SUCCESS);
      failureResult = new Result('failure', 'actor', 'failure outcome', 'failure reason', timestamp, 'proc-2', ResultStatus.FAILURE);
      pendingResult = new Result('pending', 'actor', 'pending outcome', 'pending reason', timestamp, 'proc-3', ResultStatus.PENDING);
      partialResult = new Result('partial', 'actor', 'partial outcome', 'partial reason', timestamp, 'proc-4', ResultStatus.PARTIAL);
    });

    it('should correctly identify success status', () => {
      expect(successResult.isSuccess()).toBe(true);
      expect(successResult.isFailure()).toBe(false);
      expect(successResult.isPending()).toBe(false);
    });

    it('should correctly identify failure status', () => {
      expect(failureResult.isSuccess()).toBe(false);
      expect(failureResult.isFailure()).toBe(true);
      expect(failureResult.isPending()).toBe(false);
    });

    it('should correctly identify pending status', () => {
      expect(pendingResult.isSuccess()).toBe(false);
      expect(pendingResult.isFailure()).toBe(false);
      expect(pendingResult.isPending()).toBe(true);
    });

    it('should correctly identify partial status', () => {
      expect(partialResult.isSuccess()).toBe(false);
      expect(partialResult.isFailure()).toBe(false);
      expect(partialResult.isPending()).toBe(false);
    });
  });

  describe('Result Summary', () => {
    it('should generate correct summary for success result', () => {
      const result = new Result(
        'TestResult',
        'MotorHexy',
        'Architecture defined successfully',
        'Hexagonal pattern applied with full validation',
        new Date(),
        'arch-process-1',
        ResultStatus.SUCCESS
      );

      const summary = result.getSummary();
      expect(summary).toBe('Result TestResult: Architecture defined successfully (SUCCESS) - Hexagonal pattern applied with full validation');
    });

    it('should generate correct summary for failure result', () => {
      const result = new Result(
        'FailedResult',
        'ValidationAgent',
        'Validation failed',
        'Critical errors found in policy compliance',
        new Date(),
        'validation-process-2',
        ResultStatus.FAILURE
      );

      const summary = result.getSummary();
      expect(summary).toBe('Result FailedResult: Validation failed (FAILURE) - Critical errors found in policy compliance');
    });
  });

  describe('Result Validation', () => {
    it('should validate result with valid data', () => {
      const result = new Result(
        'ValidResult',
        'MotorHexy',
        'Valid outcome description',
        'Valid reason with sufficient detail',
        new Date(),
        'process-123'
      );

      const validation = result.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should validate and return errors for invalid result', () => {
      const result = new Result(
        'InvalidResult',
        '', // Empty issuer
        'Bad', // Too short outcome
        'Short', // Too short reason
        new Date()
      );

      const validation = result.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.includes('issued'))).toBe(true);
      expect(validation.errors.some(e => e.includes('outcome'))).toBe(true);
      expect(validation.errors.some(e => e.includes('reason'))).toBe(true);
    });

    it('should warn about future timestamp', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      
      const result = new Result(
        'FutureResult',
        'MotorHexy',
        'Future outcome',
        'This result has a future timestamp',
        futureDate
      );

      const validation = result.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings.some(w => w.includes('future'))).toBe(true);
    });

    it('should warn about missing process ID', () => {
      const result = new Result(
        'NoProcessResult',
        'MotorHexy',
        'Outcome without process',
        'This result has no process ID'
      );

      const validation = result.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings.some(w => w.includes('process ID'))).toBe(true);
    });

    it('should validate minimum length requirements', () => {
      const result = new Result(
        'LengthTest',
        'Actor',
        'X', // 1 character - too short
        'Y', // 1 character - too short
        new Date()
      );

      const validation = result.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('5 characters'))).toBe(true);
      expect(validation.errors.some(e => e.includes('10 characters'))).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON with all properties', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z');
      const data = { metrics: { score: 95 }, notes: 'Excellent performance' };
      
      const result = new Result(
        'SerialResult',
        'TestAgent',
        'Serialization test completed',
        'All properties correctly serialized',
        timestamp,
        'serial-process-1',
        ResultStatus.SUCCESS,
        data
      );

      const json = result.toJSON();
      
      expect(json.id).toBe('SerialResult');
      expect(json.type).toBe('RESULT');
      expect(json.issuedBy).toBe('TestAgent');
      expect(json.outcome).toBe('Serialization test completed');
      expect(json.reason).toBe('All properties correctly serialized');
      expect(json.timestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(json.processId).toBe('serial-process-1');
      expect(json.status).toBe(ResultStatus.SUCCESS);
      expect(json.data).toEqual(data);
      expect(json.createdAt).toBeDefined();
      expect(json.updatedAt).toBeDefined();
    });

    it('should serialize to JSON with minimal properties', () => {
      const result = new Result(
        'MinimalResult',
        'MinimalAgent',
        'Minimal outcome',
        'Minimal reason for testing'
      );

      const json = result.toJSON();
      
      expect(json.id).toBe('MinimalResult');
      expect(json.issuedBy).toBe('MinimalAgent');
      expect(json.processId).toBeUndefined();
      expect(json.data).toBeUndefined();
      expect(json.status).toBe(ResultStatus.SUCCESS);
    });
  });

  describe('SOL Factory Method', () => {
    it('should create Result from SOL data with all fields', () => {
      const solData = {
        id: 'SOLResult',
        issuedBy: 'SOLAgent',
        outcome: 'SOL parsing completed successfully',
        reason: 'All SOL artifacts processed without errors',
        timestamp: '2024-01-15T10:30:00Z',
        processId: 'sol-process-1',
        status: 'SUCCESS',
        data: { artifacts: 5, warnings: 0 }
      };

      const result = Result.fromSOL(solData);
      
      expect(result.id).toBe('SOLResult');
      expect(result.issuedBy).toBe('SOLAgent');
      expect(result.outcome).toBe('SOL parsing completed successfully');
      expect(result.reason).toBe('All SOL artifacts processed without errors');
      expect(result.timestamp).toEqual(new Date('2024-01-15T10:30:00Z'));
      expect(result.processId).toBe('sol-process-1');
      expect(result.status).toBe(ResultStatus.SUCCESS);
      expect(result.data).toEqual({ artifacts: 5, warnings: 0 });
    });

    it('should create Result from SOL data with minimal fields', () => {
      const solData = {
        id: 'MinimalSOL',
        issuedBy: 'MinimalAgent',
        outcome: 'Minimal outcome',
        reason: 'Minimal reason for SOL testing'
      };

      const result = Result.fromSOL(solData);
      
      expect(result.id).toBe('MinimalSOL');
      expect(result.issuedBy).toBe('MinimalAgent');
      expect(result.status).toBe(ResultStatus.SUCCESS); // Default
      expect(result.processId).toBeUndefined();
      expect(result.data).toBeUndefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle different status values from SOL', () => {
      const failureData = {
        id: 'FailureSOL',
        issuedBy: 'SOLAgent',
        outcome: 'SOL processing failed',
        reason: 'Critical validation errors found',
        status: 'FAILURE'
      };

      const result = Result.fromSOL(failureData);
      expect(result.status).toBe(ResultStatus.FAILURE);
      expect(result.isFailure()).toBe(true);
    });

    it('should handle invalid status and default to SUCCESS', () => {
      const invalidStatusData = {
        id: 'InvalidStatus',
        issuedBy: 'TestAgent',
        outcome: 'Testing invalid status',
        reason: 'Status should default to SUCCESS',
        status: 'INVALID_STATUS'
      };

      const result = Result.fromSOL(invalidStatusData);
      expect(result.status).toBe(ResultStatus.SUCCESS);
    });
  });

  describe('Result Status Enum', () => {
    it('should have all expected status values', () => {
      expect(ResultStatus.SUCCESS).toBe('SUCCESS');
      expect(ResultStatus.FAILURE).toBe('FAILURE');
      expect(ResultStatus.PENDING).toBe('PENDING');
      expect(ResultStatus.PARTIAL).toBe('PARTIAL');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty strings in constructor', () => {
      const result = new Result(
        'EmptyTest',
        '',
        '',
        '',
        new Date()
      );

      expect(result.issuedBy).toBe('');
      expect(result.outcome).toBe('');
      expect(result.reason).toBe('');
      
      const validation = result.validate();
      expect(validation.isValid).toBe(false);
    });

    it('should handle special characters in strings', () => {
      const specialChars = 'Result with special chars: @#$%^&*()[]{}|\\:";\'<>?,./';
      const result = new Result(
        'SpecialChars',
        'TestAgent',
        specialChars,
        'Reason with special characters: ñáéíóú',
        new Date()
      );

      expect(result.outcome).toBe(specialChars);
      expect(result.reason).toBe('Reason with special characters: ñáéíóú');
    });

    it('should handle very long strings', () => {
      const longOutcome = 'A'.repeat(1000);
      const longReason = 'B'.repeat(1000);
      
      const result = new Result(
        'LongStrings',
        'TestAgent',
        longOutcome,
        longReason,
        new Date()
      );

      expect(result.outcome).toBe(longOutcome);
      expect(result.reason).toBe(longReason);
      
      const validation = result.validate();
      expect(validation.isValid).toBe(true); // Should be valid if over minimum length
    });

    it('should handle null/undefined data gracefully', () => {
      const result = new Result(
        'NullData',
        'TestAgent',
        'Outcome with null data',
        'Testing null data handling',
        new Date(),
        'process-1',
        ResultStatus.SUCCESS,
        undefined
      );

      expect(result.data).toBeUndefined();
      expect(() => result.toJSON()).not.toThrow();
    });

    it('should handle complex nested data objects', () => {
      const complexData = {
        metrics: {
          performance: { score: 95, benchmark: 'high' },
          quality: { score: 87, issues: [] }
        },
        artifacts: [
          { name: 'file1.ts', size: 1024, valid: true },
          { name: 'file2.ts', size: 2048, valid: false }
        ],
        metadata: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          tools: ['typescript', 'jest', 'eslint']
        }
      };

      const result = new Result(
        'ComplexData',
        'TestAgent',
        'Complex data test completed',
        'All nested data structures processed correctly',
        new Date(),
        'complex-process-1',
        ResultStatus.SUCCESS,
        complexData
      );

      expect(result.data).toEqual(complexData);
      expect(result.toJSON().data).toEqual(complexData);
    });
  });
}); 