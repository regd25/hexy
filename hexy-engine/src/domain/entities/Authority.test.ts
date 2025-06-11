/**
 * Tests for Authority SOL Artifact
 * Rol de validación y gobierno que aprueba, rechaza o inmoviliza ciertas políticas
 * dentro de un dominio o proceso.
 */

import { Authority, AuthorityRole } from './Authority';
import { SOLArtifactType } from './SOLArtifact';

describe('Authority Entity', () => {
  const validAuthorityData = {
    id: 'JefeCalidad',
    role: AuthorityRole.AUDITOR,
    approves: ['Policy:CriteriosMinimosEntrega', 'Policy:ValidacionCalidad'],
    scope: 'ValidacionEntregaFinal',
    delegates: ['SubordinateQA1', 'SubordinateQA2'],
    escalationMatrix: { 
      'critical': 'SupervisorGeneral',
      'high': 'JefeDepto' 
    }
  };

  describe('constructor', () => {
    it('should create Authority with all properties', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope,
        {
          delegates: validAuthorityData.delegates,
          escalationMatrix: validAuthorityData.escalationMatrix
        }
      );

      expect(authority.id).toBe(validAuthorityData.id);
      expect(authority.role).toBe(validAuthorityData.role);
      expect(authority.approves).toEqual(validAuthorityData.approves);
      expect(authority.scope).toBe(validAuthorityData.scope);
      expect(authority.delegates).toEqual(validAuthorityData.delegates);
      expect(authority.escalationMatrix).toEqual(validAuthorityData.escalationMatrix);
    });

    it('should create Authority with minimal required data', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      expect(authority.id).toBe(validAuthorityData.id);
      expect(authority.role).toBe(validAuthorityData.role);
      expect(authority.approves).toEqual(validAuthorityData.approves);
      expect(authority.scope).toBe(validAuthorityData.scope);
      expect(authority.delegates).toEqual([]);
      expect(authority.escalationMatrix).toEqual({});
    });

    it('should throw error for empty ID', () => {
      expect(() => new Authority(
        '',
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      )).toThrow('Authority ID cannot be empty');
    });

    it('should throw error for empty scope', () => {
      expect(() => new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        ''
      )).toThrow('Authority scope cannot be empty');
    });

    it('should throw error for empty approves array', () => {
      expect(() => new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        [],
        validAuthorityData.scope
      )).toThrow('Authority must approve at least one policy or entity');
    });

    it('should handle different authority roles', () => {
      const approver = new Authority(
        'TestApprover',
        AuthorityRole.APPROVER,
        ['Policy:TestPolicy'],
        'TestScope'
      );

      const validator = new Authority(
        'TestValidator',
        AuthorityRole.VALIDATOR,
        ['Process:TestProcess'],
        'TestScope'
      );

      const governor = new Authority(
        'TestGovernor',
        AuthorityRole.GOVERNOR,
        ['Domain:TestDomain'],
        'TestScope'
      );

      expect(approver.role).toBe(AuthorityRole.APPROVER);
      expect(validator.role).toBe(AuthorityRole.VALIDATOR);
      expect(governor.role).toBe(AuthorityRole.GOVERNOR);
    });
  });

  describe('validation', () => {
    it('should validate successfully with all required fields', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      const validation = authority.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should error when no approvals are specified', () => {
      const authority = new Authority(
        'TestAuthority',
        AuthorityRole.APPROVER,
        [''], // Empty approval item
        'TestScope'
      );

      const validation = authority.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Authority approvals cannot contain empty values');
    });

    it('should warn about excessive delegations', () => {
      const manyDelegates = Array.from({ length: 15 }, (_, i) => `Delegate${i}`);
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope,
        {
          delegates: manyDelegates
        }
      );

      const validation = authority.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain('Authority has many delegates (>10), consider reorganizing');
    });

    it('should validate escalation matrix format', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope,
        {
          escalationMatrix: { 
            '': 'EmptyKey' // Invalid empty key
          }
        }
      );

      const validation = authority.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Escalation matrix cannot have empty keys or values');
    });
  });

  describe('getType', () => {
    it('should return correct SOL artifact type', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      expect(authority.getType()).toBe(SOLArtifactType.AUTHORITY);
    });
  });

  describe('canApprove', () => {
    it('should return true for approved entities', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      expect(authority.canApprove('Policy:CriteriosMinimosEntrega')).toBe(true);
      expect(authority.canApprove('Policy:ValidacionCalidad')).toBe(true);
      expect(authority.canApprove('Policy:UnknownPolicy')).toBe(false);
    });

    it('should handle case-insensitive matching', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      expect(authority.canApprove('policy:criteriosminosentrega')).toBe(false); // Should be exact match
    });
  });

  describe('hasDelegate', () => {
    it('should return true for existing delegates', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope,
        {
          delegates: validAuthorityData.delegates
        }
      );

      expect(authority.hasDelegate('SubordinateQA1')).toBe(true);
      expect(authority.hasDelegate('SubordinateQA2')).toBe(true);
      expect(authority.hasDelegate('UnknownDelegate')).toBe(false);
    });

    it('should return false when no delegates are set', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      expect(authority.hasDelegate('AnyDelegate')).toBe(false);
    });
  });

  describe('getEscalationTarget', () => {
    it('should return correct escalation target for severity level', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope,
        {
          escalationMatrix: validAuthorityData.escalationMatrix
        }
      );

      expect(authority.getEscalationTarget('critical')).toBe('SupervisorGeneral');
      expect(authority.getEscalationTarget('high')).toBe('JefeDepto');
      expect(authority.getEscalationTarget('medium')).toBeUndefined();
    });

    it('should return undefined when no escalation matrix is set', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      expect(authority.getEscalationTarget('critical')).toBeUndefined();
    });
  });

  describe('addApproval', () => {
    it('should add new approval to the list', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      const initialLength = authority.approves.length;
      authority.addApproval('Policy:NewPolicy');

      expect(authority.approves).toHaveLength(initialLength + 1);
      expect(authority.canApprove('Policy:NewPolicy')).toBe(true);
    });

    it('should not add duplicate approvals', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      const initialLength = authority.approves.length;
      authority.addApproval('Policy:CriteriosMinimosEntrega'); // Already exists

      expect(authority.approves).toHaveLength(initialLength);
    });

    it('should throw error for empty approval', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      expect(() => authority.addApproval('')).toThrow('Approval cannot be empty');
    });
  });

  describe('toJSON', () => {
    it('should serialize all properties correctly', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope,
        {
          delegates: validAuthorityData.delegates,
          escalationMatrix: validAuthorityData.escalationMatrix
        }
      );

      const json = authority.toJSON();

      expect(json).toMatchObject({
        id: validAuthorityData.id,
        role: validAuthorityData.role,
        approves: validAuthorityData.approves,
        scope: validAuthorityData.scope,
        delegates: validAuthorityData.delegates,
        escalationMatrix: validAuthorityData.escalationMatrix,
        artifactType: 'AUTHORITY'
      });
    });

    it('should handle default values correctly', () => {
      const authority = new Authority(
        validAuthorityData.id,
        validAuthorityData.role,
        validAuthorityData.approves,
        validAuthorityData.scope
      );

      const json = authority.toJSON();

      expect(json.delegates).toEqual([]);
      expect(json.escalationMatrix).toEqual({});
    });
  });

  describe('fromPlainObject', () => {
    it('should reconstruct Authority from plain object', () => {
      const plainObject = {
        id: validAuthorityData.id,
        role: validAuthorityData.role,
        approves: validAuthorityData.approves,
        scope: validAuthorityData.scope,
        delegates: validAuthorityData.delegates,
        escalationMatrix: validAuthorityData.escalationMatrix,
      };

      const authority = Authority.fromPlainObject(plainObject);

      expect(authority.id).toBe(validAuthorityData.id);
      expect(authority.role).toBe(validAuthorityData.role);
      expect(authority.approves).toEqual(validAuthorityData.approves);
      expect(authority.scope).toBe(validAuthorityData.scope);
      expect(authority.delegates).toEqual(validAuthorityData.delegates);
      expect(authority.escalationMatrix).toEqual(validAuthorityData.escalationMatrix);
    });

    it('should handle missing optional properties', () => {
      const plainObject = {
        id: validAuthorityData.id,
        role: validAuthorityData.role,
        approves: validAuthorityData.approves,
        scope: validAuthorityData.scope,
      };

      const authority = Authority.fromPlainObject(plainObject);

      expect(authority.delegates).toEqual([]);
      expect(authority.escalationMatrix).toEqual({});
    });
  });

  describe('Authority Role enum', () => {
    it('should provide all expected authority roles', () => {
      expect(AuthorityRole.APPROVER).toBe('approver');
      expect(AuthorityRole.AUDITOR).toBe('auditor');
      expect(AuthorityRole.VALIDATOR).toBe('validator');
      expect(AuthorityRole.GOVERNOR).toBe('governor');
      expect(AuthorityRole.REVIEWER).toBe('reviewer');
    });
  });
}); 