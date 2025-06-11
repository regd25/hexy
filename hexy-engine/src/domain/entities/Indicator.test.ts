import { Indicator } from './Indicator';
import { SOLArtifactType } from './SOLArtifact';

describe('Indicator', () => {
  describe('constructor', () => {
    it('should create an indicator with all properties', () => {
      const indicator = new Indicator(
        'RotacionInventario',
        'Porcentaje de productos vendidos antes de requerir reabastecimiento',
        '(productosVendidos / productosTotales) * 100',
        '%',
        85,
        'GestionInventario'
      );

      expect(indicator.id).toBe('RotacionInventario');
      expect(indicator.description).toBe('Porcentaje de productos vendidos antes de requerir reabastecimiento');
      expect(indicator.measurement).toBe('(productosVendidos / productosTotales) * 100');
      expect(indicator.unit).toBe('%');
      expect(indicator.goal).toBe(85);
      expect(indicator.domain).toBe('GestionInventario');
      expect(indicator.getType()).toBe(SOLArtifactType.INDICATOR);
    });

    it('should throw error for empty id', () => {
      expect(() => new Indicator('', 'desc', 'measure', 'unit', 10, 'domain')).toThrow('Indicator ID cannot be empty');
    });

    it('should throw error for empty description', () => {
      expect(() => new Indicator('id', '', 'measure', 'unit', 10, 'domain')).toThrow('Indicator description cannot be empty');
    });

    it('should throw error for empty measurement', () => {
      expect(() => new Indicator('id', 'desc', '', 'unit', 10, 'domain')).toThrow('Indicator measurement cannot be empty');
    });

    it('should throw error for empty domain', () => {
      expect(() => new Indicator('id', 'desc', 'measure', 'unit', 10, '')).toThrow('Indicator domain cannot be empty');
    });
  });

  describe('thresholds', () => {
    let indicator: Indicator;

    beforeEach(() => {
      indicator = new Indicator(
        'TestIndicator',
        'Test description',
        'testMeasurement',
        'units',
        100,
        'TestDomain'
      );
    });

    it('should set warning threshold', () => {
      indicator.setWarningThreshold(80);
      expect(indicator.warningThreshold).toBe(80);
    });

    it('should set critical threshold', () => {
      indicator.setCriticalThreshold(50);
      expect(indicator.criticalThreshold).toBe(50);
    });

    it('should evaluate status based on thresholds', () => {
      indicator.setWarningThreshold(80);
      indicator.setCriticalThreshold(50);

      expect(indicator.evaluateStatus(90)).toBe('healthy');
      expect(indicator.evaluateStatus(70)).toBe('warning');
      expect(indicator.evaluateStatus(40)).toBe('critical');
    });

    it('should handle status evaluation without thresholds', () => {
      expect(indicator.evaluateStatus(90)).toBe('unknown');
    });
  });

  describe('validation', () => {
    it('should validate indicator with all required properties', () => {
      const indicator = new Indicator(
        'ValidIndicator',
        'Valid description',
        'validMeasurement',
        'units',
        100,
        'ValidDomain'
      );

      const validation = indicator.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should warn about missing thresholds', () => {
      const indicator = new Indicator(
        'IndicatorNoThresholds',
        'Valid description',
        'validMeasurement',
        'units',
        100,
        'ValidDomain'
      );

      const validation = indicator.validate();

      expect(validation.warnings).toContain('Indicator has no warning or critical thresholds defined');
    });

    it('should validate negative goal', () => {
      const indicator = new Indicator(
        'NegativeGoal',
        'Valid description',
        'validMeasurement',
        'units',
        -10,
        'ValidDomain'
      );

      const validation = indicator.validate();

      expect(validation.warnings).toContain('Negative goal value may be intentional, please verify');
    });
  });

  describe('serialization', () => {
    it('should serialize to correct format', () => {
      const indicator = new Indicator(
        'TestIndicator',
        'Test description',
        'testMeasurement',
        'units',
        100,
        'TestDomain'
      );
      indicator.setWarningThreshold(80);
      indicator.setCriticalThreshold(50);

      const serialized = indicator.toPlainObject();

      expect(serialized).toEqual({
        id: 'TestIndicator',
        description: 'Test description',
        measurement: 'testMeasurement',
        unit: 'units',
        goal: 100,
        domain: 'TestDomain',
        warningThreshold: 80,
        criticalThreshold: 50,
        type: 'indicator'
      });
    });
  });
}); 