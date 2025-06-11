/**
 * Tests for Protocol SOL Artifact
 * Define una coreografía de interacción entre actores en el tiempo.
 * Formaliza turnos, respuestas esperadas y condiciones de corte o desvío.
 */

import { Protocol, ProtocolStep } from './Protocol';
import { SOLArtifactType } from './SOLArtifact';

describe('Protocol Entity', () => {
  const validProtocolData = {
    id: 'IntervencionEmocional',
    description: 'Secuencia de atención progresiva entre IA y psicólogo humano.',
    steps: [
      'IAChatbot: saludoEmpatico',
      'IAChatbot: evaluacionInicial',
      'PsicologoHumano: intervencionManual si RiesgoAlto'
    ],
    timeout: 3600, // 1 hour
    fallback: 'EscalarASupervisor',
    version: '1.2.0'
  };

  describe('constructor', () => {
    it('should create Protocol with all properties', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps,
        {
          timeout: validProtocolData.timeout,
          fallback: validProtocolData.fallback,
          version: validProtocolData.version
        }
      );

      expect(protocol.id).toBe(validProtocolData.id);
      expect(protocol.description).toBe(validProtocolData.description);
      expect(protocol.steps).toHaveLength(3);
      expect(protocol.timeout).toBe(validProtocolData.timeout);
      expect(protocol.fallback).toBe(validProtocolData.fallback);
      expect(protocol.version).toBe(validProtocolData.version);
    });

    it('should create Protocol with minimal required data', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      expect(protocol.id).toBe(validProtocolData.id);
      expect(protocol.description).toBe(validProtocolData.description);
      expect(protocol.steps).toHaveLength(3);
      expect(protocol.timeout).toBeUndefined();
      expect(protocol.fallback).toBeUndefined();
      expect(protocol.version).toBe('1.0.0'); // Default version
    });

    it('should throw error for empty ID', () => {
      expect(() => new Protocol(
        '',
        validProtocolData.description,
        validProtocolData.steps
      )).toThrow('Protocol ID cannot be empty');
    });

    it('should throw error for empty description', () => {
      expect(() => new Protocol(
        validProtocolData.id,
        '',
        validProtocolData.steps
      )).toThrow('Protocol description cannot be empty');
    });

    it('should throw error for empty steps array', () => {
      expect(() => new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        []
      )).toThrow('Protocol must have at least one step');
    });

    it('should parse ProtocolStep objects from strings', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      const firstStep = protocol.steps[0];
      expect(firstStep.actor).toBe('IAChatbot');
      expect(firstStep.action).toBe('saludoEmpatico');
      expect(firstStep.condition).toBeUndefined();

      const thirdStep = protocol.steps[2];
      expect(thirdStep.actor).toBe('PsicologoHumano');
      expect(thirdStep.action).toBe('intervencionManual');
      expect(thirdStep.condition).toBe('si RiesgoAlto');
    });

    it('should handle ProtocolStep objects directly', () => {
      const steps = [
        new ProtocolStep('TestActor', 'testAction', 1),
        new ProtocolStep('TestActor2', 'testAction2', 2, 'si condicion')
      ];

      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        steps
      );

      expect(protocol.steps).toHaveLength(2);
      expect(protocol.steps[0].actor).toBe('TestActor');
      expect(protocol.steps[1].condition).toBe('si condicion');
    });
  });

  describe('validation', () => {
    it('should validate successfully with all required fields', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      const validation = protocol.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should error on negative timeout', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps,
        {
          timeout: -100
        }
      );

      const validation = protocol.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Protocol timeout must be positive when specified');
    });

    it('should warn about excessive steps', () => {
      const manySteps = Array.from({ length: 25 }, (_, i) => `Actor${i}: action${i}`);
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        manySteps
      );

      const validation = protocol.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Protocol has many steps (>20), consider breaking into sub-protocols');
    });

    it('should validate steps have valid actors', () => {
      expect(() => new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        ['', 'ValidActor: validAction']
      )).toThrow('Protocol step 1 cannot be empty');
    });

    it('should validate version format', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps,
        {
          version: 'invalid-version'
        }
      );

      const validation = protocol.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Protocol version must follow semantic versioning (x.y.z)');
    });
  });

  describe('getType', () => {
    it('should return correct SOL artifact type', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      expect(protocol.getType()).toBe(SOLArtifactType.PROTOCOL);
    });
  });

  describe('getStepByIndex', () => {
    it('should return correct step by index', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      const firstStep = protocol.getStepByIndex(0);
      expect(firstStep?.actor).toBe('IAChatbot');
      expect(firstStep?.action).toBe('saludoEmpatico');

      const nonExistentStep = protocol.getStepByIndex(10);
      expect(nonExistentStep).toBeUndefined();
    });
  });

  describe('getStepsByActor', () => {
    it('should return all steps for a specific actor', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      const chatbotSteps = protocol.getStepsByActor('IAChatbot');
      expect(chatbotSteps).toHaveLength(2);
      expect(chatbotSteps[0].action).toBe('saludoEmpatico');
      expect(chatbotSteps[1].action).toBe('evaluacionInicial');

      const humanSteps = protocol.getStepsByActor('PsicologoHumano');
      expect(humanSteps).toHaveLength(1);
      expect(humanSteps[0].action).toBe('intervencionManual');

      const unknownSteps = protocol.getStepsByActor('UnknownActor');
      expect(unknownSteps).toHaveLength(0);
    });
  });

  describe('hasActor', () => {
    it('should return true for actors involved in the protocol', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      expect(protocol.hasActor('IAChatbot')).toBe(true);
      expect(protocol.hasActor('PsicologoHumano')).toBe(true);
      expect(protocol.hasActor('UnknownActor')).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return false when no timeout is set', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      expect(protocol.isExpired(new Date())).toBe(false);
    });

    it('should return true when protocol has expired', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps,
        {
          timeout: 3600 // 1 hour
        }
      );

      const pastStartTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      expect(protocol.isExpired(pastStartTime)).toBe(true);
    });

    it('should return false when protocol has not expired', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps,
        {
          timeout: 3600 // 1 hour
        }
      );

      const recentStartTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      expect(protocol.isExpired(recentStartTime)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize all properties correctly', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps,
        {
          timeout: validProtocolData.timeout,
          fallback: validProtocolData.fallback,
          version: validProtocolData.version
        }
      );

      const json = protocol.toJSON();

      expect(json).toMatchObject({
        id: validProtocolData.id,
        description: validProtocolData.description,
        steps: expect.any(Array),
        timeout: validProtocolData.timeout,
        fallback: validProtocolData.fallback,
        version: validProtocolData.version,
        artifactType: 'PROTOCOL'
      });

      expect(json.steps).toHaveLength(3);
    });

    it('should handle default values correctly', () => {
      const protocol = new Protocol(
        validProtocolData.id,
        validProtocolData.description,
        validProtocolData.steps
      );

      const json = protocol.toJSON();

      expect(json.timeout).toBeUndefined();
      expect(json.fallback).toBeUndefined();
      expect(json.version).toBe('1.0.0');
    });
  });

  describe('fromPlainObject', () => {
    it('should reconstruct Protocol from plain object', () => {
      const plainObject = {
        id: validProtocolData.id,
        description: validProtocolData.description,
        steps: validProtocolData.steps,
        timeout: validProtocolData.timeout,
        fallback: validProtocolData.fallback,
        version: validProtocolData.version,
      };

      const protocol = Protocol.fromPlainObject(plainObject);

      expect(protocol.id).toBe(validProtocolData.id);
      expect(protocol.description).toBe(validProtocolData.description);
      expect(protocol.steps).toHaveLength(3);
      expect(protocol.timeout).toBe(validProtocolData.timeout);
      expect(protocol.fallback).toBe(validProtocolData.fallback);
      expect(protocol.version).toBe(validProtocolData.version);
    });

    it('should handle missing optional properties', () => {
      const plainObject = {
        id: validProtocolData.id,
        description: validProtocolData.description,
        steps: validProtocolData.steps,
      };

      const protocol = Protocol.fromPlainObject(plainObject);

      expect(protocol.timeout).toBeUndefined();
      expect(protocol.fallback).toBeUndefined();
      expect(protocol.version).toBe('1.0.0');
    });
  });

  describe('ProtocolStep', () => {
    describe('fromString', () => {
      it('should parse simple actor:action format', () => {
        const step = ProtocolStep.fromString('TestActor: testAction', 1);
        
        expect(step.actor).toBe('TestActor');
        expect(step.action).toBe('testAction');
        expect(step.order).toBe(1);
        expect(step.condition).toBeUndefined();
      });

      it('should parse actor:action with condition', () => {
        const step = ProtocolStep.fromString('TestActor: testAction si condicion', 1);
        
        expect(step.actor).toBe('TestActor');
        expect(step.action).toBe('testAction');
        expect(step.order).toBe(1);
        expect(step.condition).toBe('si condicion');
      });

      it('should handle extra whitespace', () => {
        const step = ProtocolStep.fromString('  TestActor :  testAction  si  condicion  ', 1);
        
        expect(step.actor).toBe('TestActor');
        expect(step.action).toBe('testAction');
        expect(step.condition).toBe('si condicion');
      });

      it('should throw error for invalid format', () => {
        expect(() => ProtocolStep.fromString('InvalidFormat', 1))
          .toThrow('Invalid protocol step format');
      });
    });

    describe('toString', () => {
      it('should format step without condition', () => {
        const step = new ProtocolStep('TestActor', 'testAction', 1);
        expect(step.toString()).toBe('TestActor: testAction');
      });

      it('should format step with condition', () => {
        const step = new ProtocolStep('TestActor', 'testAction', 1, 'si condicion');
        expect(step.toString()).toBe('TestActor: testAction si condicion');
      });
    });
  });
}); 