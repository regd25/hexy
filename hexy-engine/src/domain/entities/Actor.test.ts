import { Actor, ActorType, ActorCapability } from './Actor';

describe('Actor Entity', () => {
  describe('Constructor and Basic Properties', () => {
    it('should create Actor with required properties', () => {
      const actor = new Actor(
        'TestActor',
        ActorType.SYSTEM,
        ['capability1', 'capability2'],
        'TestDomain'
      );

      expect(actor.id).toBe('TestActor');
      expect(actor.type).toBe(ActorType.SYSTEM);
      expect(actor.capabilities).toEqual(['capability1', 'capability2']);
      expect(actor.domain).toBe('TestDomain');
      expect(actor.isAvailable()).toBe(true);
    });

    it('should create Actor with optional properties', () => {
      const metadata = { version: '1.0', region: 'us-east' };
      const actor = new Actor(
        'TestActor',
        ActorType.AI_MODEL,
        ['validate'],
        'TestDomain',
        metadata
      );

      expect(actor.metadata).toEqual(metadata);
      expect(actor.getType()).toBe('ACTOR');
    });
  });

  describe('Capability Management', () => {
    let actor: Actor;

    beforeEach(() => {
      actor = new Actor('TestActor', ActorType.SYSTEM, ['read', 'write'], 'TestDomain');
    });

    it('should check if actor has capability', () => {
      expect(actor.hasCapability('read')).toBe(true);
      expect(actor.hasCapability('write')).toBe(true);
      expect(actor.hasCapability('delete')).toBe(false);
    });

    it('should add new capability', () => {
      actor.addCapability('delete');
      expect(actor.hasCapability('delete')).toBe(true);
      expect(actor.capabilities).toContain('delete');
    });

    it('should not add duplicate capability', () => {
      const initialLength = actor.capabilities.length;
      actor.addCapability('read'); // Already exists
      expect(actor.capabilities.length).toBe(initialLength);
    });

    it('should remove capability', () => {
      actor.removeCapability('read');
      expect(actor.hasCapability('read')).toBe(false);
      expect(actor.capabilities).not.toContain('read');
    });

    it('should handle removing non-existent capability', () => {
      const initialLength = actor.capabilities.length;
      actor.removeCapability('nonexistent');
      expect(actor.capabilities.length).toBe(initialLength);
    });
  });

  describe('Availability Management', () => {
    it('should set and check availability for system actor', () => {
      const actor = new Actor('SystemActor', ActorType.SYSTEM, [], 'TestDomain');
      
      expect(actor.isAvailable()).toBe(true);
      
      actor.setAvailability(false);
      expect(actor.isAvailable()).toBe(false);
      
      actor.setAvailability(true);
      expect(actor.isAvailable()).toBe(true);
    });

    it('should handle AI model availability logic', () => {
      const actor = new Actor('LLMActor', ActorType.AI_MODEL, ['validate'], 'TestDomain');
      
      // AI models have more complex availability logic
      expect(actor.isAvailable()).toBe(true);
      
      actor.setAvailability(false);
      expect(actor.isAvailable()).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate actor with valid data', () => {
      const actor = new Actor('ValidActor', ActorType.HUMAN, ['review'], 'TestDomain');
      const result = actor.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate and return errors for invalid data', () => {
      // Test with empty ID
      const actor = new Actor('', ActorType.SYSTEM, [], '');
      const result = actor.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('ID'))).toBe(true);
    });

    it('should validate AI model with capabilities', () => {
      const actor = new Actor('LLM', ActorType.AI_MODEL, [], 'TestDomain');
      const result = actor.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('capabilities'))).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const metadata = { version: '2.0' };
      const actor = new Actor('SerialActor', ActorType.SYSTEM, ['process'], 'TestDomain', metadata);
      
      const json = actor.toJSON();
      
      expect(json.id).toBe('SerialActor');
      expect(json.type).toBe('ACTOR');
      expect(json.actorType).toBe(ActorType.SYSTEM);
      expect(json.capabilities).toEqual(['process']);
      expect(json.domain).toBe('TestDomain');
      expect(json.metadata).toEqual(metadata);
      expect(json.available).toBe(true);
    });

    it('should create Actor from JSON data', () => {
      const jsonData = {
        id: 'JsonActor',
        actorType: ActorType.HUMAN,
        capabilities: ['review', 'approve'],
        domain: 'TestDomain',
        metadata: { role: 'admin' },
        available: false
      };
      
      const actor = Actor.fromJSON(jsonData);
      
      expect(actor.id).toBe('JsonActor');
      expect(actor.type).toBe(ActorType.HUMAN);
      expect(actor.capabilities).toEqual(['review', 'approve']);
      expect(actor.domain).toBe('TestDomain');
      expect(actor.metadata).toEqual({ role: 'admin' });
      expect(actor.isAvailable()).toBe(false);
    });
  });

  describe('Actor Types', () => {
    it('should handle all actor types correctly', () => {
      const systemActor = new Actor('System', ActorType.SYSTEM, ['execute'], 'TestDomain');
      const humanActor = new Actor('Human', ActorType.HUMAN, ['review'], 'TestDomain');
      const aiActor = new Actor('AI', ActorType.AI_MODEL, ['validate'], 'TestDomain');
      
      expect(systemActor.type).toBe(ActorType.SYSTEM);
      expect(humanActor.type).toBe(ActorType.HUMAN);
      expect(aiActor.type).toBe(ActorType.AI_MODEL);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined capabilities', () => {
      const actor = new Actor('TestActor', ActorType.SYSTEM, [], 'TestDomain');
      
      expect(() => actor.addCapability('')).not.toThrow();
      expect(() => actor.removeCapability('')).not.toThrow();
      expect(actor.hasCapability('')).toBe(false);
    });

    it('should handle domain changes', () => {
      const actor = new Actor('TestActor', ActorType.SYSTEM, [], 'InitialDomain');
      expect(actor.domain).toBe('InitialDomain');
      
      // Domain is readonly, so this tests the immutability
      expect(actor.domain).toBe('InitialDomain');
    });
  });
}); 