/**
 * Tests for Observation SOL Artifact
 * Captura un evento perceptual generado por un actor sensor (humano, lógico o físico).
 * Puede ser utilizado como disparador de políticas o señales.
 */

import { Observation } from './Observation';
import { SOLArtifactType } from './SOLArtifact';

describe('Observation Entity', () => {
  const validObservationData = {
    id: 'TemperaturaAlta',
    observedBy: 'Sensor:TempSensor01',
    value: 260,
    unit: '°C',
    timestamp: new Date('2025-05-28T14:10:45Z'),
    domain: 'ControlTemperatura',
    confidence: 0.95,
    tags: ['critical', 'temperature'],
    metadata: { sensorLocation: 'Engine Room', calibrationDate: '2025-01-01' }
  };

  describe('constructor', () => {
    it('should create Observation with all properties', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain,
        {
          confidence: validObservationData.confidence,
          tags: validObservationData.tags,
          metadata: validObservationData.metadata
        }
      );

      expect(observation.id).toBe(validObservationData.id);
      expect(observation.observedBy).toBe(validObservationData.observedBy);
      expect(observation.value).toBe(validObservationData.value);
      expect(observation.unit).toBe(validObservationData.unit);
      expect(observation.timestamp).toEqual(validObservationData.timestamp);
      expect(observation.domain).toBe(validObservationData.domain);
      expect(observation.confidence).toBe(validObservationData.confidence);
      expect(observation.tags).toEqual(validObservationData.tags);
      expect(observation.metadata).toEqual(validObservationData.metadata);
    });

    it('should create Observation with minimal required data', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain
      );

      expect(observation.id).toBe(validObservationData.id);
      expect(observation.observedBy).toBe(validObservationData.observedBy);
      expect(observation.value).toBe(validObservationData.value);
      expect(observation.unit).toBe(validObservationData.unit);
      expect(observation.timestamp).toEqual(validObservationData.timestamp);
      expect(observation.domain).toBe(validObservationData.domain);
      expect(observation.confidence).toBe(1.0); // Default confidence
      expect(observation.tags).toEqual([]);
      expect(observation.metadata).toEqual({});
    });

    it('should throw error for empty ID', () => {
      expect(() => new Observation(
        '',
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain
      )).toThrow('Observation ID cannot be empty');
    });

    it('should throw error for empty observedBy', () => {
      expect(() => new Observation(
        validObservationData.id,
        '',
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain
      )).toThrow('Observation observedBy cannot be empty');
    });

    it('should throw error for empty domain', () => {
      expect(() => new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        ''
      )).toThrow('Observation domain cannot be empty');
    });

    it('should handle different value types', () => {
      const stringObservation = new Observation(
        'StringObs',
        'HumanObserver',
        'temperature_critical',
        'status',
        new Date(),
        'TestDomain'
      );

      const booleanObservation = new Observation(
        'BoolObs',
        'AutomatedSystem',
        true,
        'boolean',
        new Date(),
        'TestDomain'
      );

      expect(stringObservation.value).toBe('temperature_critical');
      expect(booleanObservation.value).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate successfully with all required fields', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain
      );

      const validation = observation.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should error on invalid confidence range', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain,
        {
          confidence: 1.5 // Invalid confidence > 1.0
        }
      );

      const validation = observation.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Observation confidence must be between 0 and 1');
    });

    it('should error on negative confidence', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain,
        {
          confidence: -0.1
        }
      );

      const validation = observation.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Observation confidence must be between 0 and 1');
    });

    it('should warn about future timestamps', () => {
      const futureTimestamp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours in future
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        futureTimestamp,
        validObservationData.domain
      );

      const validation = observation.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Observation timestamp is in the future');
    });

    it('should warn about low confidence', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain,
        {
          confidence: 0.3 // Low confidence
        }
      );

      const validation = observation.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Observation confidence is below 50%');
    });
  });

  describe('getType', () => {
    it('should return correct SOL artifact type', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain
      );

      expect(observation.getType()).toBe(SOLArtifactType.OBSERVATION);
    });
  });

  describe('isRecent', () => {
    it('should return true for recent observations', () => {
      const recentTimestamp = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        recentTimestamp,
        validObservationData.domain
      );

      expect(observation.isRecent(10 * 60 * 1000)).toBe(true); // Within 10 minutes
    });

    it('should return false for old observations', () => {
      const oldTimestamp = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        oldTimestamp,
        validObservationData.domain
      );

      expect(observation.isRecent(10 * 60 * 1000)).toBe(false); // Not within 10 minutes
    });

    it('should use default threshold when none provided', () => {
      const recentTimestamp = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        recentTimestamp,
        validObservationData.domain
      );

      expect(observation.isRecent()).toBe(true); // Default threshold is 5 minutes
    });
  });

  describe('hasTag', () => {
    it('should return true when tag exists', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain,
        {
          tags: ['critical', 'temperature']
        }
      );

      expect(observation.hasTag('critical')).toBe(true);
      expect(observation.hasTag('temperature')).toBe(true);
      expect(observation.hasTag('normal')).toBe(false);
    });

    it('should return false when no tags are set', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain
      );

      expect(observation.hasTag('critical')).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize all properties correctly', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain,
        {
          confidence: validObservationData.confidence,
          tags: validObservationData.tags,
          metadata: validObservationData.metadata
        }
      );

      const json = observation.toJSON();

      expect(json).toMatchObject({
        id: validObservationData.id,
        observedBy: validObservationData.observedBy,
        value: validObservationData.value,
        unit: validObservationData.unit,
        timestamp: validObservationData.timestamp.toISOString(),
        domain: validObservationData.domain,
        confidence: validObservationData.confidence,
        tags: validObservationData.tags,
        metadata: validObservationData.metadata,
        artifactType: 'OBSERVATION'
      });
    });

    it('should handle default values correctly', () => {
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        validObservationData.timestamp,
        validObservationData.domain
      );

      const json = observation.toJSON();

      expect(json.confidence).toBe(1.0);
      expect(json.tags).toEqual([]);
      expect(json.metadata).toEqual({});
    });
  });

  describe('fromPlainObject', () => {
    it('should reconstruct Observation from plain object', () => {
      const plainObject = {
        id: validObservationData.id,
        observedBy: validObservationData.observedBy,
        value: validObservationData.value,
        unit: validObservationData.unit,
        timestamp: validObservationData.timestamp.toISOString(),
        domain: validObservationData.domain,
        confidence: validObservationData.confidence,
        tags: validObservationData.tags,
        metadata: validObservationData.metadata,
      };

      const observation = Observation.fromPlainObject(plainObject);

      expect(observation.id).toBe(validObservationData.id);
      expect(observation.observedBy).toBe(validObservationData.observedBy);
      expect(observation.value).toBe(validObservationData.value);
      expect(observation.unit).toBe(validObservationData.unit);
      expect(observation.timestamp).toEqual(validObservationData.timestamp);
      expect(observation.domain).toBe(validObservationData.domain);
      expect(observation.confidence).toBe(validObservationData.confidence);
      expect(observation.tags).toEqual(validObservationData.tags);
      expect(observation.metadata).toEqual(validObservationData.metadata);
    });

    it('should handle missing optional properties', () => {
      const plainObject = {
        id: validObservationData.id,
        observedBy: validObservationData.observedBy,
        value: validObservationData.value,
        unit: validObservationData.unit,
        timestamp: validObservationData.timestamp.toISOString(),
        domain: validObservationData.domain,
      };

      const observation = Observation.fromPlainObject(plainObject);

      expect(observation.confidence).toBe(1.0);
      expect(observation.tags).toEqual([]);
      expect(observation.metadata).toEqual({});
    });
  });

  describe('age calculation', () => {
    it('should calculate age correctly', () => {
      const pastTimestamp = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const observation = new Observation(
        validObservationData.id,
        validObservationData.observedBy,
        validObservationData.value,
        validObservationData.unit,
        pastTimestamp,
        validObservationData.domain
      );

      const ageInMs = observation.getAgeInMilliseconds();
      expect(ageInMs).toBeGreaterThan(29 * 60 * 1000); // At least 29 minutes
      expect(ageInMs).toBeLessThan(31 * 60 * 1000); // Less than 31 minutes
    });
  });
}); 