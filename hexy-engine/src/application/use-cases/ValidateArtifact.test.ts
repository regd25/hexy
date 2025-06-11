import { ValidateArtifactUseCase, ValidateArtifactError, ValidateSingleRequest, ValidateCoherenceRequest } from './ValidateArtifact';
import { SemanticInterpreterPort, CoherenceValidationResult, ConflictAnalysisResult } from '../../ports/primary/SemanticInterpreterPort';
import { PersistencePort } from '../../ports/secondary/PersistencePort';
import { SOLArtifact, ValidationResult, SOLArtifactType } from '../../domain/entities/SOLArtifact';
import { Vision } from '../../domain/entities/Vision';
import { Policy } from '../../domain/entities/Policy';
import { Process } from '../../domain/entities/Process';
import { Actor, ActorType } from '../../domain/entities/Actor';

describe('ValidateArtifactUseCase', () => {
  let useCase: ValidateArtifactUseCase;
  let mockSemanticInterpreter: jest.Mocked<SemanticInterpreterPort>;
  let mockPersistence: jest.Mocked<PersistencePort>;

  // Mock artifacts for testing
  const mockVision = new Vision('test-vision', 'Test Vision Content with enough text to avoid warnings about length', 'Test Author', 'TestDomain');
  const mockPolicy = new Policy('test-policy', 'Test policy premise debe cumplirse', 'test-vision');
  const mockProcess = new Process('test-process', ['actor1'], ['actor1 → step1', 'actor1 → step2'], 'test-vision');
  const mockActor = new Actor('test-actor', ActorType.SYSTEM, [], 'TestDomain');

  const mockValidationResult: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const mockSemanticValidationResult: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const mockConflictAnalysis: ConflictAnalysisResult = {
    hasConflicts: false,
    conflictingArtifacts: [],
    conflictDescriptions: [],
    resolutionSuggestions: []
  };

  const mockCoherenceResult: CoherenceValidationResult = {
    isCoherent: true,
    narrativeGaps: [],
    missingArtifacts: [],
    recommendedActions: []
  };

  beforeEach(() => {
    mockSemanticInterpreter = {
      parseSOLDocument: jest.fn(),
      validateArtifact: jest.fn(),
      validateCoherence: jest.fn(),
      interpretVision: jest.fn(),
      canExecuteProcess: jest.fn(),
      getDependencies: jest.fn(),
      findConflicts: jest.fn()
    };

    mockPersistence = {
      saveArtifact: jest.fn(),
      findArtifacts: jest.fn(),
      updateArtifact: jest.fn(),
      deleteArtifact: jest.fn()
    };

    useCase = new ValidateArtifactUseCase(mockSemanticInterpreter, mockPersistence);
  });

  describe('constructor', () => {
    it('should create ValidateArtifactUseCase with dependencies', () => {
      expect(useCase).toBeInstanceOf(ValidateArtifactUseCase);
    });
  });

  describe('validateSingle', () => {
    describe('happy path', () => {
      it('should validate a single artifact successfully', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'test-vision' };
        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockSemanticInterpreter.validateArtifact.mockResolvedValue(mockSemanticValidationResult);
        mockSemanticInterpreter.findConflicts.mockResolvedValue(mockConflictAnalysis);

        // Act
        const result = await useCase.validateSingle(request);

        // Assert
        expect(result.valid).toBe(true);
        expect(result.artifactId).toBe('test-vision');
        expect(result.basicValidation).toBeDefined();
        expect(result.semanticValidation).toBeDefined();
        expect(result.conflictAnalysis).toBeDefined();
        expect(result.recommendations).toEqual([]);
        expect(mockPersistence.findArtifacts).toHaveBeenCalledWith({
          text: 'test-vision',
          limit: 1
        });
        expect(mockSemanticInterpreter.validateArtifact).toHaveBeenCalledWith(mockVision);
        expect(mockSemanticInterpreter.findConflicts).toHaveBeenCalledWith(mockVision);
      });

      it('should handle artifact with basic validation errors', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'test-vision' };
        // Create a vision that will have validation errors by using empty content
        let invalidVision: Vision;
        try {
          invalidVision = new Vision('test-id', '', 'Test Author', 'TestDomain'); // Empty content triggers validation error
        } catch (error) {
          // If constructor throws, create with empty content after construction
          invalidVision = new Vision('test-id', 'temp', 'Test Author', 'TestDomain');
          // @ts-ignore: Force empty content for testing
          invalidVision._content = '';
        }
        
        mockPersistence.findArtifacts.mockResolvedValue([invalidVision]);
        mockSemanticInterpreter.validateArtifact.mockResolvedValue(mockSemanticValidationResult);
        mockSemanticInterpreter.findConflicts.mockResolvedValue(mockConflictAnalysis);

        // Act
        const result = await useCase.validateSingle(request);

        // Assert
        expect(result.valid).toBe(false);
        expect(result.recommendations).toContain('Resolve basic validation errors to ensure artifact integrity');
      });

      it('should handle artifact with semantic validation errors', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'test-vision' };
        const semanticErrorResult: ValidationResult = {
          isValid: false,
          errors: ['Semantic coherence issue'],
          warnings: []
        };
        
        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockSemanticInterpreter.validateArtifact.mockResolvedValue(semanticErrorResult);
        mockSemanticInterpreter.findConflicts.mockResolvedValue(mockConflictAnalysis);

        // Act
        const result = await useCase.validateSingle(request);

        // Assert
        expect(result.valid).toBe(false);
        expect(result.recommendations).toContain('Address semantic validation issues to improve coherence');
      });

      it('should handle artifact with conflicts', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'test-vision' };
        const conflictResult: ConflictAnalysisResult = {
          hasConflicts: true,
          conflictingArtifacts: ['other-artifact'],
          conflictDescriptions: ['Conflicting vision'],
          resolutionSuggestions: ['Resolve conflict']
        };
        
        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockSemanticInterpreter.validateArtifact.mockResolvedValue(mockSemanticValidationResult);
        mockSemanticInterpreter.findConflicts.mockResolvedValue(conflictResult);

        // Act
        const result = await useCase.validateSingle(request);

        // Assert
        expect(result.valid).toBe(false);
        expect(result.recommendations).toContain('Resolve conflicts with other artifacts in the domain');
      });

      it('should handle warnings in validation results', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'test-vision' };
        const warningResult: ValidationResult = {
          isValid: true,
          errors: [],
          warnings: ['Minor warning']
        };
        
        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockSemanticInterpreter.validateArtifact.mockResolvedValue(warningResult);
        mockSemanticInterpreter.findConflicts.mockResolvedValue(mockConflictAnalysis);

        // Act
        const result = await useCase.validateSingle(request);

        // Assert
        expect(result.valid).toBe(true);
        expect(result.recommendations).toContain('Consider addressing validation warnings to improve quality');
      });
    });

    describe('error cases', () => {
      it('should throw error for missing artifact ID', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: '' };

        // Act & Assert
        await expect(useCase.validateSingle(request)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateSingle(request)).rejects.toThrow('Artifact ID is required');
      });

      it('should throw error for non-existent artifact', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'non-existent' };
        mockPersistence.findArtifacts.mockResolvedValue([]);

        // Act & Assert
        await expect(useCase.validateSingle(request)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateSingle(request)).rejects.toThrow('Artifact with ID non-existent not found');
      });

      it('should handle persistence errors', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'test-vision' };
        mockPersistence.findArtifacts.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(useCase.validateSingle(request)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateSingle(request)).rejects.toThrow('Unexpected error during artifact validation');
      });

      it('should handle semantic interpreter errors', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'test-vision' };
        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockSemanticInterpreter.validateArtifact.mockRejectedValue(new Error('Interpreter error'));

        // Act & Assert
        await expect(useCase.validateSingle(request)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateSingle(request)).rejects.toThrow('Unexpected error during artifact validation');
      });

      it('should propagate ValidateArtifactError without wrapping', async () => {
        // Arrange
        const request: ValidateSingleRequest = { artifactId: 'test-vision' };
        const originalError = new ValidateArtifactError('Original error', 'ARTIFACT_NOT_FOUND');
        mockPersistence.findArtifacts.mockRejectedValue(originalError);

        // Act & Assert
        await expect(useCase.validateSingle(request)).rejects.toThrow(originalError);
      });
    });
  });

  describe('validateCoherence', () => {
    describe('happy path', () => {
      it('should validate coherence between multiple artifacts successfully', async () => {
        // Arrange
        const request: ValidateCoherenceRequest = { 
          artifactIds: ['test-vision', 'test-policy'] 
        };
        mockPersistence.findArtifacts
          .mockResolvedValueOnce([mockVision])
          .mockResolvedValueOnce([mockPolicy]);
        mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

        // Act
        const result = await useCase.validateCoherence(request);

        // Assert
        expect(result.coherent).toBe(true);
        expect(result.artifactIds).toEqual(['test-vision', 'test-policy']);
        expect(result.individualValidations).toBeDefined();
        expect(result.coherenceResult).toBe(mockCoherenceResult);
        expect(result.domainConsistency).toBeDefined();
        expect(mockSemanticInterpreter.validateCoherence).toHaveBeenCalledWith([mockVision, mockPolicy]);
      });

      it('should handle incoherent artifacts', async () => {
        // Arrange
        const request: ValidateCoherenceRequest = { 
          artifactIds: ['test-vision', 'test-policy'] 
        };
        const incoherentResult: CoherenceValidationResult = {
          isCoherent: false,
          narrativeGaps: ['Gap in narrative'],
          missingArtifacts: ['missing-actor'],
          recommendedActions: ['Add missing actor']
        };
        
        mockPersistence.findArtifacts
          .mockResolvedValueOnce([mockVision])
          .mockResolvedValueOnce([mockPolicy]);
        mockSemanticInterpreter.validateCoherence.mockResolvedValue(incoherentResult);

        // Act
        const result = await useCase.validateCoherence(request);

        // Assert
        expect(result.coherent).toBe(false);
        expect(result.recommendations).toContain('Add missing actor');
      });

      it('should analyze domain consistency for vision and policies', async () => {
        // Arrange
        const request: ValidateCoherenceRequest = { 
          artifactIds: ['test-vision', 'test-policy'] 
        };
        mockPersistence.findArtifacts
          .mockResolvedValueOnce([mockVision])
          .mockResolvedValueOnce([mockPolicy]);
        mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

        // Act
        const result = await useCase.validateCoherence(request);

        // Assert
        expect(result.domainConsistency.consistent).toBe(true);
        expect(result.domainConsistency.issues).toEqual([]);
      });

      it('should detect unlinked policies', async () => {
        // Arrange
        const policyWithoutVision = new Policy('unlinked-policy', 'Test premise debe cumplirse', '');
        const request: ValidateCoherenceRequest = { 
          artifactIds: ['test-vision', 'unlinked-policy'] 
        };
        mockPersistence.findArtifacts
          .mockResolvedValueOnce([mockVision])
          .mockResolvedValueOnce([policyWithoutVision]);
        mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

        // Act
        const result = await useCase.validateCoherence(request);

        // Assert
        expect(result.domainConsistency.consistent).toBe(false);
        expect(result.domainConsistency.issues).toContain('1 policies not linked to vision');
        expect(result.domainConsistency.recommendations).toContain('Link policies to vision for better coherence');
      });

      it('should detect missing vision in domain', async () => {
        // Arrange
        const request: ValidateCoherenceRequest = { 
          artifactIds: ['test-policy'] 
        };
        mockPersistence.findArtifacts.mockResolvedValueOnce([mockPolicy]);
        mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

        // Act
        const result = await useCase.validateCoherence(request);

        // Assert
        expect(result.domainConsistency.consistent).toBe(false);
        expect(result.domainConsistency.issues).toContain('No vision found in domain');
        expect(result.domainConsistency.recommendations).toContain('Add a vision to provide strategic direction');
      });
    });

    describe('error cases', () => {
      it('should throw error for empty artifact IDs array', async () => {
        // Arrange
        const request: ValidateCoherenceRequest = { artifactIds: [] };

        // Act & Assert
        await expect(useCase.validateCoherence(request)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateCoherence(request)).rejects.toThrow('At least one artifact ID is required');
      });

      it('should throw error for missing artifact IDs', async () => {
        // Arrange
        const request: ValidateCoherenceRequest = { artifactIds: undefined as any };

        // Act & Assert
        await expect(useCase.validateCoherence(request)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateCoherence(request)).rejects.toThrow('At least one artifact ID is required');
      });

      it('should throw error when artifact not found', async () => {
        // Arrange
        const request: ValidateCoherenceRequest = { artifactIds: ['non-existent'] };
        mockPersistence.findArtifacts.mockResolvedValue([]);

        // Act & Assert
        await expect(useCase.validateCoherence(request)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateCoherence(request)).rejects.toThrow('Artifact with ID non-existent not found');
      });

      it('should handle coherence validation errors', async () => {
        // Arrange
        const request: ValidateCoherenceRequest = { artifactIds: ['test-vision'] };
        mockPersistence.findArtifacts.mockResolvedValue([mockVision]);
        mockSemanticInterpreter.validateCoherence.mockRejectedValue(new Error('Coherence error'));

        // Act & Assert
        await expect(useCase.validateCoherence(request)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateCoherence(request)).rejects.toThrow('Unexpected error during coherence validation');
      });
    });
  });

  describe('validateDomain', () => {
    describe('happy path', () => {
      it('should validate domain with artifacts successfully', async () => {
        // Arrange
        const domainId = 'test-domain';
        const artifacts = [mockVision, mockPolicy, mockProcess, mockActor];
        mockPersistence.findArtifacts.mockResolvedValue(artifacts);
        mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

        // Act
        const result = await useCase.validateDomain(domainId);

        // Assert
        expect(result.valid).toBe(true);
        expect(result.domainId).toBe(domainId);
        expect(result.artifactCount).toBe(4);
        expect(result.validationResults).toBeDefined();
        expect(result.coherenceResult).toBe(mockCoherenceResult);
        expect(result.missingEssentialArtifacts).toEqual([]);
        expect(mockPersistence.findArtifacts).toHaveBeenCalledWith({
          text: domainId,
          limit: 1000
        });
      });

      it('should handle empty domain gracefully', async () => {
        // Arrange
        const domainId = 'empty-domain';
        mockPersistence.findArtifacts.mockResolvedValue([]);

        // Act
        const result = await useCase.validateDomain(domainId);

        // Assert
        expect(result.valid).toBe(true);
        expect(result.domainId).toBe(domainId);
        expect(result.artifactCount).toBe(0);
        expect(result.validationResults).toEqual([]);
        expect(result.coherenceResult.isCoherent).toBe(true);
        expect(result.recommendations).toEqual([]);
      });

      it('should detect missing essential artifacts', async () => {
        // Arrange
        const domainId = 'incomplete-domain';
        const artifacts = [mockPolicy]; // Missing vision, process, actor
        mockPersistence.findArtifacts.mockResolvedValue(artifacts);
        mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

        // Act
        const result = await useCase.validateDomain(domainId);

        // Assert
        expect(result.valid).toBe(false);
        expect(result.missingEssentialArtifacts).toContain('VISION');
        expect(result.missingEssentialArtifacts).toContain('PROCESS');
        expect(result.missingEssentialArtifacts).toContain('ACTOR');
        expect(result.recommendations).toContain('Consider adding a VISION artifact to complete the domain');
        expect(result.recommendations).toContain('Consider adding a PROCESS artifact to complete the domain');
        expect(result.recommendations).toContain('Consider adding a ACTOR artifact to complete the domain');
      });

      it('should handle domain with all essential artifacts', async () => {
        // Arrange
        const domainId = 'complete-domain';
        const artifacts = [mockVision, mockProcess, mockActor];
        mockPersistence.findArtifacts.mockResolvedValue(artifacts);
        mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

        // Act
        const result = await useCase.validateDomain(domainId);

        // Assert
        expect(result.valid).toBe(true);
        expect(result.missingEssentialArtifacts).toEqual([]);
      });
    });

    describe('error cases', () => {
      it('should handle persistence errors', async () => {
        // Arrange
        const domainId = 'test-domain';
        mockPersistence.findArtifacts.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(useCase.validateDomain(domainId)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateDomain(domainId)).rejects.toThrow('Unexpected error during domain validation');
      });

      it('should handle coherence validation errors in domain', async () => {
        // Arrange
        const domainId = 'test-domain';
        const artifacts = [mockVision, mockPolicy];
        mockPersistence.findArtifacts.mockResolvedValue(artifacts);
        mockSemanticInterpreter.validateCoherence.mockRejectedValue(new Error('Coherence error'));

        // Act & Assert
        await expect(useCase.validateDomain(domainId)).rejects.toThrow(ValidateArtifactError);
        await expect(useCase.validateDomain(domainId)).rejects.toThrow('Unexpected error during domain validation');
      });
    });
  });

  describe('ValidateArtifactError', () => {
    it('should create error with message, code and details', () => {
      // Arrange
      const message = 'Test error';
      const code = 'VALIDATION_ERROR';
      const details = { field: 'test' };

      // Act
      const error = new ValidateArtifactError(message, code, details);

      // Assert
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.details).toBe(details);
      expect(error.name).toBe('ValidateArtifactError');
    });

    it('should create error without details', () => {
      // Arrange
      const message = 'Test error';
      const code = 'INVALID_INPUT';

      // Act
      const error = new ValidateArtifactError(message, code);

      // Assert
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.details).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle large number of artifacts in coherence validation', async () => {
      // Arrange
      const largeArtifactList = Array.from({ length: 50 }, (_, i) => 
        new Vision(`vision-${i}`, `Vision ${i}`, 'Test Author', 'TestDomain')
      );
      const request: ValidateCoherenceRequest = { 
        artifactIds: largeArtifactList.map(a => a.id) 
      };
      
      mockPersistence.findArtifacts.mockImplementation(({ text }) => 
        Promise.resolve(largeArtifactList.filter(a => a.id === text))
      );
      mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

      // Act
      const result = await useCase.validateCoherence(request);

      // Assert
      expect(result.coherent).toBe(true);
      expect(result.artifactIds).toHaveLength(50);
      expect(mockSemanticInterpreter.validateCoherence).toHaveBeenCalledWith(largeArtifactList);
    });

    it('should handle special characters in artifact IDs', async () => {
      // Arrange
      const specialId = 'test-artifact-with-$pecial-ch@r$';
      const request: ValidateSingleRequest = { artifactId: specialId };
      const specialVision = new Vision(specialId, 'Test Content', 'Test Author', 'TestDomain');
      
      mockPersistence.findArtifacts.mockResolvedValue([specialVision]);
      mockSemanticInterpreter.validateArtifact.mockResolvedValue(mockSemanticValidationResult);
      mockSemanticInterpreter.findConflicts.mockResolvedValue(mockConflictAnalysis);

      // Act
      const result = await useCase.validateSingle(request);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.artifactId).toBe(specialId);
    });

    it('should handle domain validation with maximum artifact limit', async () => {  
      // Arrange
      const domainId = 'large-domain';
      const maxArtifacts = Array.from({ length: 1000 }, (_, i) => 
        new Vision(`vision-${i}`, `Vision ${i}`, 'Test Author', 'TestDomain')
      );
      
      mockPersistence.findArtifacts.mockResolvedValue(maxArtifacts);
      mockSemanticInterpreter.validateCoherence.mockResolvedValue(mockCoherenceResult);

      // Act
      const result = await useCase.validateDomain(domainId);

      // Assert
      expect(result.artifactCount).toBe(1000);
      expect(mockPersistence.findArtifacts).toHaveBeenCalledWith({
        text: domainId,
        limit: 1000
      });
    });
  });
}); 