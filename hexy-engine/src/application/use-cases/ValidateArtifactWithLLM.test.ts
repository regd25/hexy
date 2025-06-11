import { ValidateArtifactWithLLMUseCase, ValidateWithLLMError, ValidateWithLLMRequest, TimeRange } from './ValidateArtifactWithLLM';
import { PersistencePort } from '../../ports/secondary/PersistencePort';
import { LLMValidationPort, LLMValidationResult, ValidationContext, ValidationScope, ValidationPriority, ErrorSeverity } from '../../ports/secondary/LLMValidationPort';
import { EventBus, EventTypes } from '../../infrastructure/events/EventBus';
import { SOLArtifact, SOLArtifactType } from '../../domain/entities/SOLArtifact';
import { Vision } from '../../domain/entities/Vision';
import { Policy } from '../../domain/entities/Policy';
import { Process } from '../../domain/entities/Process';
import { Actor, ActorType } from '../../domain/entities/Actor';
import { Result, ResultStatus } from '../../domain/entities/Result';

describe('ValidateArtifactWithLLMUseCase', () => {
  let useCase: ValidateArtifactWithLLMUseCase;
  let mockPersistence: jest.Mocked<PersistencePort>;
  let mockLLMValidation: jest.Mocked<LLMValidationPort>;
  let mockEventBus: jest.Mocked<EventBus>;

  // Mock artifacts for testing
  const mockVision = new Vision('test-vision', 'Test Vision Content with enough text to avoid warnings about length', 'Test Author', 'TestDomain');
  const mockPolicy = new Policy('test-policy', 'Test policy premise debe cumplirse', 'test-vision');
  const mockProcess = new Process('test-process', ['actor1'], ['actor1 → step1', 'actor1 → step2'], 'test-vision');
  const mockActor = new Actor('test-actor', ActorType.SYSTEM, ['validarProcess'], 'TestDomain');

  const mockLLMResult: LLMValidationResult = {
    isValid: true,
    confidence: 0.85,
    semanticScore: 90,
    reasoning: 'Artifact is semantically coherent and well-structured',
    errors: [],
    warnings: [],
    processingTime: 450,
    suggestions: []
  };

  const mockResult = new Result(
    'test-result',
    'ValidadorSemanticoLLM',
    'Test outcome',
    'Test reason',
    new Date(),
    'ValidarArtefactoSOL',
    ResultStatus.SUCCESS
  );

  beforeEach(() => {
    mockPersistence = {
      saveArtifact: jest.fn(),
      findArtifacts: jest.fn(),
      updateArtifact: jest.fn(),
      deleteArtifact: jest.fn(),
      getArtifactsByVision: jest.fn(),
      getArtifact: jest.fn(),
      getArtifactsByType: jest.fn(),
      saveExecutionState: jest.fn(),
      getExecutionState: jest.fn(),
      saveExecutionHistory: jest.fn(),
      getExecutionHistory: jest.fn(),
      transaction: jest.fn(),
      exists: jest.fn(),
      getRelationships: jest.fn(),
      saveRelationship: jest.fn()
    };

    mockLLMValidation = {
      isAvailable: jest.fn(),
      validateArtifact: jest.fn(),
      validateProcess: jest.fn(),
      validatePolicy: jest.fn(),
      verifyActor: jest.fn(),
      getCapabilities: jest.fn()
    };

    mockEventBus = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      once: jest.fn(),
      removeAllListeners: jest.fn(),
      listenerCount: jest.fn(),
      listeners: jest.fn()
    };

    useCase = new ValidateArtifactWithLLMUseCase(mockPersistence, mockLLMValidation, mockEventBus);
  });

  describe('constructor', () => {
    it('should create ValidateArtifactWithLLMUseCase with dependencies', () => {
      expect(useCase).toBeInstanceOf(ValidateArtifactWithLLMUseCase);
    });
  });

  describe('execute', () => {
    describe('happy path', () => {
      it('should execute validation successfully for Vision artifact', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([mockPolicy, mockProcess]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.validateArtifact.mockResolvedValue(mockLLMResult);
        mockPersistence.saveArtifact.mockResolvedValue();

        // Act
        const result = await useCase.execute(request);

        // Assert
        expect(result.success).toBe(true);
        expect(result.artifactId).toBe('test-vision');
        expect(result.artifactType).toBe(SOLArtifactType.VISION);
        expect(result.llmValidationResult).toBe(mockLLMResult);
        expect(result.confidence).toBe(0.85);
        expect(result.processingTime).toBe(450);

        // Check event emissions
        expect(mockEventBus.emit).toHaveBeenCalledWith(EventTypes.ARTIFACT_VALIDATED, {
          artifactId: 'test-vision',
          step: 'artifact_detected',
          type: SOLArtifactType.VISION
        });
        expect(mockEventBus.emit).toHaveBeenCalledWith(EventTypes.PROCESS_STEP_EXECUTED, {
          processId: 'ValidarArtefactoSOL',
          step: 'llm_invocation_started',
          actor: 'MotorHexy'
        });
        expect(mockEventBus.emit).toHaveBeenCalledWith(EventTypes.RESULT_EMITTED, expect.objectContaining({
          artifactId: 'test-vision',
          isApproved: true
        }));
      });

      it('should execute validation successfully for Process artifact', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-process',
          initiator: 'TestUser',
          scope: ValidationScope.DEEP_ANALYSIS,
          priority: 'HIGH',
          timeout: 10000
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockProcess]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([mockVision]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.validateProcess.mockResolvedValue(mockLLMResult);
        mockPersistence.saveArtifact.mockResolvedValue();

        // Act
        const result = await useCase.execute(request);

        // Assert
        expect(result.success).toBe(true);
        expect(result.artifactType).toBe(SOLArtifactType.PROCESS);
        expect(mockLLMValidation.validateProcess).toHaveBeenCalledWith(
          mockProcess,
          expect.objectContaining({
            domainId: 'HexyEngine',
            validationScope: ValidationScope.DEEP_ANALYSIS,
            priority: ValidationPriority.HIGH,
            timeout: 10000,
            visionContext: 'test-vision'
          })
        );
      });

      it('should execute validation successfully for Policy artifact', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-policy',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockPolicy]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([mockVision]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.validatePolicy.mockResolvedValue(mockLLMResult);
        mockPersistence.saveArtifact.mockResolvedValue();

        // Act
        const result = await useCase.execute(request);

        // Assert
        expect(result.success).toBe(true);
        expect(result.artifactType).toBe(SOLArtifactType.POLICY);
        expect(mockLLMValidation.validatePolicy).toHaveBeenCalledWith(mockPolicy, expect.any(Object));
      });

      it('should execute validation successfully for Actor artifact', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-actor',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockActor]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.verifyActor.mockResolvedValue(mockLLMResult);
        mockPersistence.saveArtifact.mockResolvedValue();

        // Act
        const result = await useCase.execute(request);

        // Assert
        expect(result.success).toBe(true);
        expect(result.artifactType).toBe(SOLArtifactType.ACTOR);
        expect(mockLLMValidation.verifyActor).toHaveBeenCalledWith(mockActor, expect.any(Object));
      });

      it('should handle failed validation gracefully', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser'
        };

        const failedLLMResult: LLMValidationResult = {
          isValid: false,
          confidence: 0.3,
          semanticScore: 45,
          reasoning: 'Artifact lacks semantic coherence',
          errors: [{ message: 'Missing required field', severity: ErrorSeverity.HIGH, code: 'MISSING_FIELD' }],
          warnings: [],
          processingTime: 320,
          suggestions: ['Add more descriptive content']
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.validateArtifact.mockResolvedValue(failedLLMResult);
        mockPersistence.saveArtifact.mockResolvedValue();

        // Act
        const result = await useCase.execute(request);

        // Assert
        expect(result.success).toBe(false);
        expect(result.llmValidationResult.isValid).toBe(false);
        expect(result.llmValidationResult.errors).toHaveLength(1);
        expect(result.confidence).toBe(0.3);
      });

      it('should handle priority conversion correctly', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser',
          priority: 'CRITICAL'
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.validateArtifact.mockResolvedValue(mockLLMResult);
        mockPersistence.saveArtifact.mockResolvedValue();

        // Act
        await useCase.execute(request);

        // Assert
        expect(mockLLMValidation.validateArtifact).toHaveBeenCalledWith(
          mockVision,
          expect.objectContaining({
            priority: ValidationPriority.CRITICAL
          })
        );
      });

      it('should handle default validation context correctly', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([mockPolicy]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.validateArtifact.mockResolvedValue(mockLLMResult);
        mockPersistence.saveArtifact.mockResolvedValue();

        // Act
        await useCase.execute(request);

        // Assert
        expect(mockLLMValidation.validateArtifact).toHaveBeenCalledWith(
          mockVision,
          expect.objectContaining({
            domainId: 'HexyEngine',
            validationScope: ValidationScope.COMPREHENSIVE,
            timeout: 5000,
            relatedArtifacts: [mockPolicy]
          })
        );
      });
    });

    describe('error cases', () => {
      it('should throw error for missing artifact ID', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: '',
          initiator: 'TestUser'
        };

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(ValidateWithLLMError);
        await expect(useCase.execute(request)).rejects.toThrow('Artifact ID is required');
      });

      it('should throw error for non-existent artifact', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'non-existent',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockResolvedValue([]);

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(ValidateWithLLMError);
        await expect(useCase.execute(request)).rejects.toThrow('Artifact with ID non-existent not found');
      });

      it('should throw error when LLM is unavailable', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([]);
        mockLLMValidation.isAvailable.mockResolvedValue(false);

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(ValidateWithLLMError);
        await expect(useCase.execute(request)).rejects.toThrow('ValidadorSemanticoLLM is not available');
      });

      it('should handle persistence errors during artifact detection', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(ValidateWithLLMError);
        await expect(useCase.execute(request)).rejects.toThrow('Unexpected error during LLM validation');
      });

      it('should handle LLM validation errors', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.validateArtifact.mockRejectedValue(new Error('LLM API error'));

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(ValidateWithLLMError);
        await expect(useCase.execute(request)).rejects.toThrow('Unexpected error during LLM validation');
      });

      it('should handle result saving errors', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser'
        };

        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockPersistence.getArtifactsByVision.mockResolvedValue([]);
        mockLLMValidation.isAvailable.mockResolvedValue(true);
        mockLLMValidation.validateArtifact.mockResolvedValue(mockLLMResult);
        mockPersistence.saveArtifact.mockRejectedValue(new Error('Save error'));

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(ValidateWithLLMError);
        await expect(useCase.execute(request)).rejects.toThrow('Unexpected error during LLM validation');
      });

      it('should propagate ValidateWithLLMError without wrapping', async () => {
        // Arrange
        const request: ValidateWithLLMRequest = {
          artifactId: 'test-vision',
          initiator: 'TestUser'
        };

        const originalError = new ValidateWithLLMError('Original error', 'ARTIFACT_NOT_FOUND');
        mockPersistence.findArtifacts.mockRejectedValue(originalError);

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(originalError);
      });
    });
  });

  describe('getValidationMetrics', () => {
    describe('happy path', () => {
      it('should calculate validation metrics correctly', async () => {
        // Arrange
        const timeRange: TimeRange = {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        };

        const mockResults = [
          {
            toJSON: () => ({
              issuedBy: 'ValidadorSemanticoLLM',
              data: { processingTime: 400 }
            })
          },
          {
            toJSON: () => ({
              issuedBy: 'ValidadorSemanticoLLM',
              data: { processingTime: 600 }
            })
          },
          {
            toJSON: () => ({
              issuedBy: 'OtherValidator',
              data: { processingTime: 300 }
            })
          }
        ] as any[];

        // Mock successful results
        mockResults[0].isSuccess = jest.fn().mockReturnValue(true);
        mockResults[1].isSuccess = jest.fn().mockReturnValue(false);
        mockResults[2].isSuccess = jest.fn().mockReturnValue(true);

        mockPersistence.findArtifacts.mockResolvedValue(mockResults);

        // Act
        const metrics = await useCase.getValidationMetrics(timeRange);

        // Assert
        expect(metrics.totalValidations).toBe(2); // Only LLM validations
        expect(metrics.acceptedValidations).toBe(1); // Only first one succeeded
        expect(metrics.acceptanceRate).toBe(50); // 1/2 * 100
        expect(metrics.averageResponseTime).toBe(500); // (400 + 600) / 2
        expect(metrics.timeRange).toBe(timeRange);
      });

      it('should handle empty validation results', async () => {
        // Arrange
        const timeRange: TimeRange = {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        };

        mockPersistence.findArtifacts.mockResolvedValue([]);

        // Act
        const metrics = await useCase.getValidationMetrics(timeRange);

        // Assert
        expect(metrics.totalValidations).toBe(0);
        expect(metrics.acceptedValidations).toBe(0);
        expect(metrics.acceptanceRate).toBe(0);
        expect(metrics.averageResponseTime).toBe(0);
      });

      it('should handle results without processing time', async () => {
        // Arrange
        const timeRange: TimeRange = {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        };

        const mockResult = {
          toJSON: () => ({
            issuedBy: 'ValidadorSemanticoLLM',
            data: {} // No processing time
          })
        } as any;
        mockResult.isSuccess = jest.fn().mockReturnValue(true);

        mockPersistence.findArtifacts.mockResolvedValue([mockResult]);

        // Act
        const metrics = await useCase.getValidationMetrics(timeRange);

        // Assert
        expect(metrics.totalValidations).toBe(1);
        expect(metrics.acceptedValidations).toBe(1);
        expect(metrics.acceptanceRate).toBe(100);
        expect(metrics.averageResponseTime).toBe(0); // No valid processing times
      });
    });

    describe('error cases', () => {
      it('should handle persistence errors in metrics collection', async () => {
        // Arrange
        const timeRange: TimeRange = {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        };

        mockPersistence.findArtifacts.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(useCase.getValidationMetrics(timeRange)).rejects.toThrow('Database error');
      });
    });
  });

  describe('ValidateWithLLMError', () => {
    it('should create error with message, code and details', () => {
      // Arrange
      const message = 'Test error';
      const code = 'VALIDATION_ERROR';
      const details = { field: 'test' };

      // Act
      const error = new ValidateWithLLMError(message, code, details);

      // Assert
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.details).toBe(details);
      expect(error.name).toBe('ValidateWithLLMError');
    });

    it('should create error without details', () => {
      // Arrange
      const message = 'Test error';
      const code = 'LLM_UNAVAILABLE';

      // Act
      const error = new ValidateWithLLMError(message, code);

      // Assert
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.details).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle artifact without vision', async () => {
      // Arrange
      const actorWithoutVision = new Actor('test-actor-2', ActorType.HUMAN, [], 'TestDomain');
      const request: ValidateWithLLMRequest = {
        artifactId: 'test-actor-2',
        initiator: 'TestUser'
      };

      mockPersistence.findArtifacts.mockResolvedValue([actorWithoutVision]);
      mockPersistence.getArtifactsByVision.mockResolvedValue([]);
      mockLLMValidation.isAvailable.mockResolvedValue(true);
      mockLLMValidation.verifyActor.mockResolvedValue(mockLLMResult);
      mockPersistence.saveArtifact.mockResolvedValue();

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(mockPersistence.getArtifactsByVision).toHaveBeenCalledWith('DesarrolloProcesosOrganizacionalesConHexy');
    });

    it('should handle unknown priority gracefully', async () => {
      // Arrange
      const request: ValidateWithLLMRequest = {
        artifactId: 'test-vision',
        initiator: 'TestUser',
        priority: 'UNKNOWN' as any
      };

      mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
      mockPersistence.getArtifactsByVision.mockResolvedValue([]);
      mockLLMValidation.isAvailable.mockResolvedValue(true);
      mockLLMValidation.validateArtifact.mockResolvedValue(mockLLMResult);
      mockPersistence.saveArtifact.mockResolvedValue();

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLLMValidation.validateArtifact).toHaveBeenCalledWith(
        mockVision,
        expect.objectContaining({
          priority: ValidationPriority.NORMAL // Default value
        })
      );
    });

    it('should handle large number of related artifacts', async () => {
      // Arrange
      const request: ValidateWithLLMRequest = {
        artifactId: 'test-vision',
        initiator: 'TestUser'
      };

      const largeRelatedArtifacts = Array.from({ length: 100 }, (_, i) =>
        new Policy(`policy-${i}`, `Policy ${i} debe cumplirse`, 'test-vision')
      );

      mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
      mockPersistence.getArtifactsByVision.mockResolvedValue(largeRelatedArtifacts);
      mockLLMValidation.isAvailable.mockResolvedValue(true);
      mockLLMValidation.validateArtifact.mockResolvedValue(mockLLMResult);
      mockPersistence.saveArtifact.mockResolvedValue();

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(mockLLMValidation.validateArtifact).toHaveBeenCalledWith(
        mockVision,
        expect.objectContaining({
          relatedArtifacts: largeRelatedArtifacts
        })
      );
    });

    it('should handle special characters in artifact IDs', async () => {
      // Arrange
      const specialId = 'test-artifact-with-$pecial-ch@r$';
      const specialVision = new Vision(specialId, 'Test Content with enough text', 'Test Author', 'TestDomain');
      const request: ValidateWithLLMRequest = {
        artifactId: specialId,
        initiator: 'TestUser'
      };

      mockPersistence.findArtifacts.mockResolvedValue([specialVision]);
      mockPersistence.getArtifactsByVision.mockResolvedValue([]);
      mockLLMValidation.isAvailable.mockResolvedValue(true);
      mockLLMValidation.validateArtifact.mockResolvedValue(mockLLMResult);
      mockPersistence.saveArtifact.mockResolvedValue();

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.artifactId).toBe(specialId);
    });

    it('should handle very long processing times', async () => {
      // Arrange
      const request: ValidateWithLLMRequest = {
        artifactId: 'test-vision',
        initiator: 'TestUser',
        timeout: 30000
      };

      const longProcessingResult: LLMValidationResult = {
        ...mockLLMResult,
        processingTime: 25000
      };

      mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
      mockPersistence.getArtifactsByVision.mockResolvedValue([]);
      mockLLMValidation.isAvailable.mockResolvedValue(true);
      mockLLMValidation.validateArtifact.mockResolvedValue(longProcessingResult);
      mockPersistence.saveArtifact.mockResolvedValue();

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.processingTime).toBe(25000);
    });
  });
}); 