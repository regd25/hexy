import { Domain } from './Domain';
import { SOLArtifactType } from './SOLArtifact';

describe('Domain', () => {
  describe('constructor', () => {
    it('should create a domain with basic properties', () => {
      const domain = new Domain(
        'IngresoApoyoEmocional',
        'Evaluación automatizada del estado emocional de usuarios nuevos para determinar rutas de atención.',
        'DetectarRiesgoEmocional'
      );

      expect(domain.id).toBe('IngresoApoyoEmocional');
      expect(domain.description).toBe(
        'Evaluación automatizada del estado emocional de usuarios nuevos para determinar rutas de atención.'
      );
      expect(domain.vision).toBe('DetectarRiesgoEmocional');
      expect(domain.getType()).toBe(SOLArtifactType.DOMAIN);
    });

    it('should throw error for empty id', () => {
      expect(() => new Domain('', 'description', 'vision')).toThrow('Domain ID cannot be empty');
    });

    it('should throw error for empty description', () => {
      expect(() => new Domain('DomainId', '', 'vision')).toThrow(
        'Domain description cannot be empty'
      );
    });

    it('should throw error for empty vision', () => {
      expect(() => new Domain('DomainId', 'description', '')).toThrow(
        'Domain vision cannot be empty'
      );
    });
  });

  describe('artifact management', () => {
    let domain: Domain;

    beforeEach(() => {
      domain = new Domain('TestDomain', 'Test description', 'TestVision');
    });

    it('should add policies to domain', () => {
      domain.addPolicy('StockBajo');
      domain.addPolicy('ValidacionMinima');

      expect(domain.policies).toContain('StockBajo');
      expect(domain.policies).toContain('ValidacionMinima');
      expect(domain.policies).toHaveLength(2);
    });

    it('should add processes to domain', () => {
      domain.addProcess('IngresoDeMercancia');
      domain.addProcess('ValidacionCalidad');

      expect(domain.processes).toContain('IngresoDeMercancia');
      expect(domain.processes).toContain('ValidacionCalidad');
      expect(domain.processes).toHaveLength(2);
    });

    it('should add indicators to domain', () => {
      domain.addIndicator('RotacionInventario');
      domain.addIndicator('TiempoRespuesta');

      expect(domain.indicators).toContain('RotacionInventario');
      expect(domain.indicators).toContain('TiempoRespuesta');
      expect(domain.indicators).toHaveLength(2);
    });

    it('should not duplicate artifact references', () => {
      domain.addPolicy('StockBajo');
      domain.addPolicy('StockBajo');

      expect(domain.policies).toHaveLength(1);
    });

    it('should remove artifacts from domain', () => {
      domain.addPolicy('PolicyToRemove');
      domain.removePolicy('PolicyToRemove');

      expect(domain.policies).not.toContain('PolicyToRemove');
    });
  });

  describe('validation', () => {
    it('should validate domain with all required properties', () => {
      const domain = new Domain('ValidDomain', 'Valid description', 'ValidVision');
      const validation = domain.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should warn about empty domain', () => {
      const domain = new Domain('EmptyDomain', 'Valid description', 'ValidVision');
      const validation = domain.validate();

      expect(validation.warnings).toContain(
        'Domain has no policies, processes, or indicators defined'
      );
    });

    it('should validate domain with artifacts', () => {
      const domain = new Domain('ActiveDomain', 'Valid description', 'ValidVision');
      domain.addPolicy('TestPolicy');
      domain.addProcess('TestProcess');

      const validation = domain.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.warnings).not.toContain(
        'Domain has no policies, processes, or indicators defined'
      );
    });
  });

  describe('serialization', () => {
    it('should serialize to correct format', () => {
      const domain = new Domain('TestDomain', 'Test description', 'TestVision');
      domain.addPolicy('Policy1');
      domain.addProcess('Process1');
      domain.addIndicator('Indicator1');

      const serialized = domain.toPlainObject();

      expect(serialized).toEqual({
        id: 'TestDomain',
        description: 'Test description',
        vision: 'TestVision',
        policies: ['Policy1'],
        processes: ['Process1'],
        indicators: ['Indicator1'],
        type: 'domain',
      });
    });
  });
});
