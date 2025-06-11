import { Vision } from './Vision';
import { SOLArtifactType } from './SOLArtifact';

describe('Vision', () => {
  describe('constructor', () => {
    it('should create a vision with all properties', () => {
      const vision = new Vision(
        'DetectarRiesgoEmocional',
        'Detectar a tiempo a los usuarios en situación de crisis para activar intervención humana especializada.',
        'EquipoClinico'
      );

      expect(vision.id).toBe('DetectarRiesgoEmocional');
      expect(vision.content).toBe(
        'Detectar a tiempo a los usuarios en situación de crisis para activar intervención humana especializada.'
      );
      expect(vision.author).toBe('EquipoClinico');
      expect(vision.getType()).toBe(SOLArtifactType.VISION);
    });

    it('should create a vision with optional domain', () => {
      const vision = new Vision('TestVision', 'Test content', 'TestAuthor', 'TestDomain');

      expect(vision.domain).toBe('TestDomain');
    });

    it('should throw error for empty id', () => {
      expect(() => new Vision('', 'content', 'author')).toThrow('Vision ID cannot be empty');
    });

    it('should throw error for empty content', () => {
      expect(() => new Vision('id', '', 'author')).toThrow('Vision content cannot be empty');
    });

    it('should throw error for empty author', () => {
      expect(() => new Vision('id', 'content', '')).toThrow('Vision author cannot be empty');
    });
  });

  describe('validation', () => {
    it('should validate vision with all required properties', () => {
      const vision = new Vision(
        'ValidVision',
        'This is a comprehensive vision statement that provides clear strategic direction for the organization',
        'ValidAuthor'
      );

      const validation = vision.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should warn about short content', () => {
      const vision = new Vision('ShortVision', 'Short', 'Author');

      const validation = vision.validate();

      expect(validation.warnings).toContain(
        'Vision content should be more comprehensive (at least 50 characters)'
      );
    });

    it('should warn about missing domain', () => {
      const vision = new Vision(
        'NoDomainVision',
        'This is a vision without a domain specified which may make it harder to contextualize',
        'Author'
      );

      const validation = vision.validate();

      expect(validation.warnings).toContain(
        'Vision should specify a domain for better contextualization'
      );
    });
  });

  describe('serialization', () => {
    it('should serialize to correct format', () => {
      const vision = new Vision(
        'TestVision',
        'Test content for serialization',
        'TestAuthor',
        'TestDomain'
      );

      const serialized = vision.toPlainObject();

      expect(serialized).toEqual({
        id: 'TestVision',
        content: 'Test content for serialization',
        author: 'TestAuthor',
        domain: 'TestDomain',
        type: 'vision',
      });
    });

    it('should serialize without domain', () => {
      const vision = new Vision('TestVision', 'Test content', 'TestAuthor');

      const serialized = vision.toPlainObject();

      expect(serialized.domain).toBeUndefined();
    });
  });

  describe('fromPlainObject', () => {
    it('should create vision from plain object', () => {
      const obj = {
        id: 'TestVision',
        content: 'Test content',
        author: 'TestAuthor',
        domain: 'TestDomain',
      };

      const vision = Vision.fromPlainObject(obj);

      expect(vision.id).toBe('TestVision');
      expect(vision.content).toBe('Test content');
      expect(vision.author).toBe('TestAuthor');
      expect(vision.domain).toBe('TestDomain');
    });
  });
});
