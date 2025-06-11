import { Concept } from './Concept';
import { SOLArtifactType } from './SOLArtifact';

describe('Concept', () => {
  describe('constructor', () => {
    it('should create a concept with basic properties', () => {
      const concept = new Concept(
        'Producto',
        'Entidad comercializable con atributos como nombre, categoría, inventario y precio unitario.'
      );

      expect(concept.id).toBe('Producto');
      expect(concept.description).toBe('Entidad comercializable con atributos como nombre, categoría, inventario y precio unitario.');
      expect(concept.getType()).toBe(SOLArtifactType.CONCEPT);
    });

    it('should create a concept with vision reference', () => {
      const concept = new Concept(
        'Usuario',
        'Persona que interactúa con el sistema',
        'GestionUsuarios'
      );

      expect(concept.vision).toBe('GestionUsuarios');
    });

    it('should throw error for empty id', () => {
      expect(() => new Concept('', 'description')).toThrow('Concept ID cannot be empty');
    });

    it('should throw error for empty description', () => {
      expect(() => new Concept('ConceptId', '')).toThrow('Concept description cannot be empty');
    });
  });

  describe('usedIn tracking', () => {
    it('should track where concept is used', () => {
      const concept = new Concept('Producto', 'Test description');
      
      concept.addUsage('Process:GestionInventario');
      concept.addUsage('Policy:StockBajo');
      
      expect(concept.usedIn).toContain('Process:GestionInventario');
      expect(concept.usedIn).toContain('Policy:StockBajo');
      expect(concept.usedIn).toHaveLength(2);
    });

    it('should not duplicate usage entries', () => {
      const concept = new Concept('Producto', 'Test description');
      
      concept.addUsage('Process:GestionInventario');
      concept.addUsage('Process:GestionInventario');
      
      expect(concept.usedIn).toHaveLength(1);
    });
  });

  describe('validation', () => {
    it('should validate concept with all required properties', () => {
      const concept = new Concept('Producto', 'Valid description');
      const validation = concept.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should identify validation errors', () => {
      const concept = new Concept('ValidId', 'Valid description');
      // Simulate invalid state
      (concept as any)._id = '';
      
      const validation = concept.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('serialization', () => {
    it('should serialize to correct format', () => {
      const concept = new Concept(
        'Producto',
        'Entidad comercializable',
        'GestionInventario'
      );
      concept.addUsage('Process:Compras');
      
      const serialized = concept.toPlainObject();
      
      expect(serialized).toEqual({
        id: 'Producto',
        description: 'Entidad comercializable',
        vision: 'GestionInventario',
        usedIn: ['Process:Compras'],
        type: 'concept'
      });
    });
  });
}); 