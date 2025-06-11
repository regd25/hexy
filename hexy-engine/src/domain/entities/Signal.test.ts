/**
 * Tests for Signal SOL Artifact
 * Artefacto que transmite información entre actores o procesos como consecuencia de una observación o condición cumplida
 */

import { Signal, SignalType, SignalChannel } from './Signal';
import { SOLArtifactType } from './SOLArtifact';

describe('Signal Entity', () => {
  const validSignalData = {
    id: 'AlertaEmocionalAlta',
    sentBy: 'Actor:IAChatbot',
    sentTo: 'Authority:PsicologoTurno',
    basedOn: 'Observation:NivelEmocionalAlto',
    channel: SignalChannel.SMS,
    type: SignalType.ALERT_CRITICAL,
    timestamp: new Date('2025-05-28T02:31:00Z'),
    priority: 'HIGH' as const,
    ackRequired: true,
    ttl: 3600 // 1 hour in seconds
  };

  describe('constructor', () => {
    it('should create Signal with valid data', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp,
        {
          priority: validSignalData.priority,
          ackRequired: validSignalData.ackRequired,
          ttl: validSignalData.ttl
        }
      );

      expect(signal.id).toBe(validSignalData.id);
      expect(signal.sentBy).toBe(validSignalData.sentBy);
      expect(signal.sentTo).toBe(validSignalData.sentTo);
      expect(signal.basedOn).toBe(validSignalData.basedOn);
      expect(signal.channel).toBe(validSignalData.channel);
      expect(signal.type).toBe(validSignalData.type);
      expect(signal.timestamp).toEqual(validSignalData.timestamp);
      expect(signal.priority).toBe(validSignalData.priority);
      expect(signal.ackRequired).toBe(validSignalData.ackRequired);
      expect(signal.ttl).toBe(validSignalData.ttl);
    });

    it('should throw error for empty ID', () => {
      expect(() => new Signal(
        '',
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp
      )).toThrow('Signal ID cannot be empty');
    });

    it('should throw error for empty sentBy', () => {
      expect(() => new Signal(
        validSignalData.id,
        '',
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp
      )).toThrow('Signal sentBy cannot be empty');
    });

    it('should throw error for empty sentTo', () => {
      expect(() => new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        '',
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp
      )).toThrow('Signal sentTo cannot be empty');
    });

    it('should work with minimal required data', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp
      );

      expect(signal.priority).toBe('NORMAL');
      expect(signal.ackRequired).toBe(false);
      expect(signal.ttl).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should validate successfully with all required fields', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp
      );

      const validation = signal.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should warn about future timestamps', () => {
      const futureTimestamp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours in future
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        futureTimestamp
      );

      const validation = signal.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Signal timestamp is in the future');
    });

    it('should validate TTL constraints', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp,
        {
          ttl: -100 // Negative TTL
        }
      );

      const validation = signal.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Signal TTL must be positive when specified');
    });
  });

  describe('getType', () => {
    it('should return correct SOL artifact type', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp
      );

      expect(signal.getType()).toBe(SOLArtifactType.SIGNAL);
    });
  });

  describe('isExpired', () => {
    it('should return false when no TTL is set', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp
      );

      expect(signal.isExpired()).toBe(false);
    });

    it('should return true when TTL has expired', () => {
      const pastTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        pastTimestamp,
        {
          ttl: 3600 // 1 hour TTL
        }
      );

      expect(signal.isExpired()).toBe(true);
    });

    it('should return false when TTL has not expired', () => {
      const recentTimestamp = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        recentTimestamp,
        {
          ttl: 3600 // 1 hour TTL
        }
      );

      expect(signal.isExpired()).toBe(false);
    });
  });

  describe('markAsAcknowledged', () => {
    it('should mark signal as acknowledged', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp,
        {
          ackRequired: true
        }
      );

      expect(signal.isAcknowledged()).toBe(false);
      
      signal.markAsAcknowledged();
      
      expect(signal.isAcknowledged()).toBe(true);
      expect(signal.acknowledgedAt).toBeInstanceOf(Date);
    });

    it('should do nothing when acknowledgment is not required', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp,
        {
          ackRequired: false
        }
      );

      signal.markAsAcknowledged();
      
      expect(signal.isAcknowledged()).toBe(false);
      expect(signal.acknowledgedAt).toBeUndefined();
    });
  });

  describe('toJSON', () => {
    it('should serialize all properties correctly', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp,
        {
          priority: validSignalData.priority,
          ackRequired: validSignalData.ackRequired,
          ttl: validSignalData.ttl
        }
      );

      const json = signal.toJSON();

      expect(json).toMatchObject({
        id: validSignalData.id,
        sentBy: validSignalData.sentBy,
        sentTo: validSignalData.sentTo,
        basedOn: validSignalData.basedOn,
        channel: validSignalData.channel,
        type: validSignalData.type,
        timestamp: validSignalData.timestamp.toISOString(),
        priority: validSignalData.priority,
        ackRequired: validSignalData.ackRequired,
        ttl: validSignalData.ttl,
        artifactType: 'SIGNAL'
      });
    });

    it('should handle optional properties correctly', () => {
      const signal = new Signal(
        validSignalData.id,
        validSignalData.sentBy,
        validSignalData.sentTo,
        validSignalData.basedOn,
        validSignalData.channel,
        validSignalData.type,
        validSignalData.timestamp
      );

      const json = signal.toJSON();

      expect(json.priority).toBe('NORMAL');
      expect(json.ackRequired).toBe(false);
      expect(json.ttl).toBeUndefined();
    });
  });

  describe('fromPlainObject', () => {
    it('should reconstruct Signal from plain object', () => {
      const plainObject = {
        id: validSignalData.id,
        sentBy: validSignalData.sentBy,
        sentTo: validSignalData.sentTo,
        basedOn: validSignalData.basedOn,
        channel: validSignalData.channel,
        type: validSignalData.type,
        timestamp: validSignalData.timestamp.toISOString(),
        priority: validSignalData.priority,
        ackRequired: validSignalData.ackRequired,
        ttl: validSignalData.ttl
      };

      const signal = Signal.fromPlainObject(plainObject);

      expect(signal.id).toBe(validSignalData.id);
      expect(signal.sentBy).toBe(validSignalData.sentBy);
      expect(signal.sentTo).toBe(validSignalData.sentTo);
      expect(signal.basedOn).toBe(validSignalData.basedOn);
      expect(signal.channel).toBe(validSignalData.channel);
      expect(signal.type).toBe(validSignalData.type);
      expect(signal.timestamp).toEqual(validSignalData.timestamp);
      expect(signal.priority).toBe(validSignalData.priority);
      expect(signal.ackRequired).toBe(validSignalData.ackRequired);
      expect(signal.ttl).toBe(validSignalData.ttl);
    });
  });

  describe('Signal Channel and Type enums', () => {
    it('should provide all expected signal channels', () => {
      expect(SignalChannel.EMAIL).toBe('email');
      expect(SignalChannel.SMS).toBe('sms');
      expect(SignalChannel.WEBHOOK).toBe('webhook');
      expect(SignalChannel.INTERNAL).toBe('internal');
      expect(SignalChannel.PUSH_NOTIFICATION).toBe('push_notification');
    });

    it('should provide all expected signal types', () => {
      expect(SignalType.INFO).toBe('info');
      expect(SignalType.WARNING).toBe('warning');
      expect(SignalType.ALERT_CRITICAL).toBe('alert_critical');
      expect(SignalType.STATUS_UPDATE).toBe('status_update');
      expect(SignalType.COMMAND).toBe('command');
    });
  });
}); 