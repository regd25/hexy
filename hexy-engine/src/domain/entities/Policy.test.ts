import { Policy, PolicyEvaluationContext, PolicyEvaluationResult } from './Policy';

describe('Policy Entity', () => {
  describe('Constructor and Basic Properties', () => {
    it('should create Policy with required properties', () => {
      const policy = new Policy(
        'TestPolicy',
        'All tests must pass before deployment',
        'QualityAssurance'
      );

      expect(policy.id).toBe('TestPolicy');
      expect(policy.premise).toBe('All tests must pass before deployment');
      expect(policy.vision).toBe('QualityAssurance');
      expect(policy.getType()).toBe('POLICY');
    });

    it('should create Policy with optional metadata', () => {
      const metadata = { priority: 'high', category: 'security' };
      const policy = new Policy(
        'SecurityPolicy',
        'All data must be encrypted',
        'DataProtection',
        metadata
      );

      expect(policy.metadata).toEqual(metadata);
    });
  });

  describe('Premise Management', () => {
    let policy: Policy;

    beforeEach(() => {
      policy = new Policy(
        'TestPolicy',
        'Original premise',
        'TestVision'
      );
    });

    it('should update premise', () => {
      const newPremise = 'Updated premise with new requirements';
      policy.updatePremise(newPremise);
      
      expect(policy.premise).toBe(newPremise);
    });

    it('should not update premise with empty string', () => {
      const originalPremise = policy.premise;
      policy.updatePremise('');
      
      expect(policy.premise).toBe(originalPremise);
    });

    it('should not update premise with whitespace only', () => {
      const originalPremise = policy.premise;
      policy.updatePremise('   \n\t   ');
      
      expect(policy.premise).toBe(originalPremise);
    });
  });

  describe('Policy Evaluation', () => {
    let policy: Policy;
    let context: PolicyEvaluationContext;

    beforeEach(() => {
      policy = new Policy(
        'ValidationPolicy',
        'All artifacts must have valid structure',
        'QualityAssurance'
      );

      context = {
        artifactId: 'test-artifact',
        artifactType: 'PROCESS',
        data: { valid: true, structure: 'hexagonal' },
        actor: 'MotorHexy',
        timestamp: new Date()
      };
    });

    it('should evaluate policy and return compliant result', () => {
      const result: PolicyEvaluationResult = policy.evaluate(context);
      
      expect(result.compliant).toBe(true);
      expect(result.policyId).toBe('ValidationPolicy');
      expect(result.evaluatedAt).toBeInstanceOf(Date);
      expect(result.context).toEqual(context);
    });

    it('should evaluate policy with different context', () => {
      const invalidContext = {
        ...context,
        data: { valid: false, structure: 'invalid' }
      };

      const result = policy.evaluate(invalidContext);
      
      expect(result.policyId).toBe('ValidationPolicy');
      expect(result.context).toEqual(invalidContext);
    });

    it('should handle policy evaluation with missing data', () => {
      const emptyContext = {
        ...context,
        data: {}
      };

      const result = policy.evaluate(emptyContext);
      
      expect(result).toBeDefined();
      expect(result.policyId).toBe('ValidationPolicy');
    });
  });

  describe('Vision Association', () => {
    it('should link policy to vision', () => {
      const policy = new Policy(
        'VisionPolicy',
        'Support the strategic vision',
        'StrategicVision'
      );

      policy.linkToVision('NewVision');
      expect(policy.vision).toBe('NewVision');
    });

    it('should not link to empty vision', () => {
      const policy = new Policy(
        'VisionPolicy',
        'Support the strategic vision',
        'OriginalVision'
      );

      policy.linkToVision('');
      expect(policy.vision).toBe('OriginalVision');
    });
  });

  describe('Validation', () => {
    it('should validate policy with valid data', () => {
      const policy = new Policy(
        'ValidPolicy',
        'This policy must be implemented with sufficient detail and requirements',
        'TestVision'
      );

      const result = policy.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate and return errors for invalid policy', () => {
      const policy = new Policy('', '', '');
      const result = policy.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check for specific validation errors
      expect(result.errors.some(e => e.includes('ID'))).toBe(true);
      expect(result.errors.some(e => e.includes('premise'))).toBe(true);
      expect(result.errors.some(e => e.includes('vision'))).toBe(true);
    });

    it('should validate premise length', () => {
      const shortPremise = 'Too short';
      const policy = new Policy('TestPolicy', shortPremise, 'TestVision');
      const result = policy.validate();
      
      expect(result.warnings.some(w => w.includes('premise'))).toBe(true);
    });

    it('should validate premise clarity', () => {
      const unclearPremise = 'This maybe should possibly do something perhaps';
      const policy = new Policy('TestPolicy', unclearPremise, 'TestVision');
      const result = policy.validate();
      
      expect(result.warnings.some(w => w.includes('clarity'))).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const metadata = { priority: 'critical', enforced: true };
      const policy = new Policy(
        'SerialPolicy',
        'This policy must be serializable',
        'TestVision',
        metadata
      );
      
      const json = policy.toJSON();
      
      expect(json.id).toBe('SerialPolicy');
      expect(json.type).toBe('POLICY');
      expect(json.premise).toBe('This policy must be serializable');
      expect(json.vision).toBe('TestVision');
      expect(json.metadata).toEqual(metadata);
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });

    it('should create Policy from JSON data', () => {
      const jsonData = {
        id: 'JsonPolicy',
        premise: 'Policy created from JSON',
        vision: 'JsonVision',
        metadata: { source: 'json' },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };
      
      const policy = Policy.fromJSON(jsonData);
      
      expect(policy.id).toBe('JsonPolicy');
      expect(policy.premise).toBe('Policy created from JSON');
      expect(policy.vision).toBe('JsonVision');
      expect(policy.metadata).toEqual({ source: 'json' });
      expect(policy.createdAt).toEqual(new Date('2023-01-01'));
      expect(policy.updatedAt).toEqual(new Date('2023-01-02'));
    });
  });

  describe('Policy Compliance Tracking', () => {
    let policy: Policy;

    beforeEach(() => {
      policy = new Policy(
        'CompliancePolicy',
        'Track compliance with this policy',
        'ComplianceVision'
      );
    });

    it('should track compliance evaluations', () => {
      const context1: PolicyEvaluationContext = {
        artifactId: 'artifact1',
        artifactType: 'PROCESS',
        data: { compliant: true },
        actor: 'TestActor',
        timestamp: new Date()
      };

      const context2: PolicyEvaluationContext = {
        artifactId: 'artifact2',
        artifactType: 'POLICY',
        data: { compliant: false },
        actor: 'TestActor',
        timestamp: new Date()
      };

      const result1 = policy.evaluate(context1);
      const result2 = policy.evaluate(context2);

      expect(result1.policyId).toBe('CompliancePolicy');
      expect(result2.policyId).toBe('CompliancePolicy');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined values gracefully', () => {
      expect(() => {
        new Policy('test', 'premise', 'vision', undefined);
      }).not.toThrow();
    });

    it('should handle special characters in premise', () => {
      const premiseWithSpecialChars = 'Policy with special chars: @#$%^&*()[]{}|\\:";\'<>?,./';
      const policy = new Policy('SpecialPolicy', premiseWithSpecialChars, 'TestVision');
      
      expect(policy.premise).toBe(premiseWithSpecialChars);
    });

    it('should handle very long premise', () => {
      const longPremise = 'A'.repeat(600); // Over 500 character limit
      const policy = new Policy('LongPolicy', longPremise, 'TestVision');
      
      expect(policy.premise).toBe(longPremise);
      
      const validation = policy.validate();
      expect(validation.warnings.some(w => w.includes('length'))).toBe(true);
    });

    it('should handle policy evaluation with null context data', () => {
      const policy = new Policy('TestPolicy', 'Test premise', 'TestVision');
      const contextWithNullData: PolicyEvaluationContext = {
        artifactId: 'test',
        artifactType: 'PROCESS',
        data: null as any,
        actor: 'TestActor',
        timestamp: new Date()
      };

      expect(() => policy.evaluate(contextWithNullData)).not.toThrow();
    });
  });
}); 