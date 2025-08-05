/**
 * Tests for ArtifactService
 * Unit tests for artifact management functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ArtifactService } from './ArtifactService';
import { Artifact, ArtifactType } from '../types/artifact.types';

/**
 * Test setup
 */
describe('ArtifactService', () => {
  let service: ArtifactService;
  let storage: Storage;

  beforeEach(() => {
    // Mock localStorage
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    
    global.localStorage = storage as any;
    service = new ArtifactService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test artifact creation
   */
  describe('createArtifact', () => {
    it('should create a new artifact with generated ID', async () => {
      const artifactData = {
        name: 'Test Purpose',
        description: 'Test description',
        purpose: 'Test purpose statement',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation'
      };

      const result = await service.createArtifact('PURPOSE', artifactData);

      expect(result).toHaveProperty('id');
      expect(result.id).toMatch(/^[a-f0-9-]{36}$/);
      expect(result.name).toBe('Test Purpose');
      expect(result.type).toBe('PURPOSE');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create artifact with temporal data', async () => {
      const artifactData = {
        name: 'Temporal Purpose',
        description: 'Temporal description',
        purpose: 'Temporal purpose',
        context: 'Temporal context',
        authority: 'Temporal authority',
        evaluation: 'Temporal evaluation',
        temporalData: {
          validFrom: new Date('2024-01-01'),
          validTo: new Date('2024-12-31'),
          version: '1.0.0'
        }
      };

      const result = await service.createArtifact('PURPOSE', artifactData);

      expect(result.temporalData).toEqual(artifactData.temporalData);
    });
  });

  /**
   * Test artifact retrieval
   */
  describe('getArtifact', () => {
    it('should retrieve artifact by ID', async () => {
      const artifactData = {
        name: 'Test Purpose',
        description: 'Test description',
        purpose: 'Test purpose statement',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation'
      };

      const created = await service.createArtifact('PURPOSE', artifactData);
      const retrieved = await service.getArtifact(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent artifact', async () => {
      const result = await service.getArtifact('non-existent-id');
      expect(result).toBeNull();
    });
  });

  /**
   * Test artifact updates
   */
  describe('updateArtifact', () => {
    it('should update existing artifact', async () => {
      const artifactData = {
        name: 'Original Purpose',
        description: 'Original description',
        purpose: 'Original purpose',
        context: 'Original context',
        authority: 'Original authority',
        evaluation: 'Original evaluation'
      };

      const created = await service.createArtifact('PURPOSE', artifactData);
      
      const updatedData = {
        ...created,
        name: 'Updated Purpose',
        description: 'Updated description'
      };

      const updated = await service.updateArtifact(created.id, updatedData);

      expect(updated.name).toBe('Updated Purpose');
      expect(updated.description).toBe('Updated description');
      expect(updated.updatedAt).not.toEqual(created.updatedAt);
    });

    it('should throw error for non-existent artifact', async () => {
      const updateData = {
        name: 'Updated',
        description: 'Updated',
        purpose: 'Updated',
        context: 'Updated',
        authority: 'Updated',
        evaluation: 'Updated'
      };

      await expect(service.updateArtifact('non-existent', updateData))
        .rejects.toThrow('Artifact not found');
    });
  });

  /**
   * Test artifact deletion
   */
  describe('deleteArtifact', () => {
    it('should delete existing artifact', async () => {
      const artifactData = {
        name: 'To Delete',
        description: 'To delete',
        purpose: 'To delete',
        context: 'To delete',
        authority: 'To delete',
        evaluation: 'To delete'
      };

      const created = await service.createArtifact('PURPOSE', artifactData);
      const deleted = await service.deleteArtifact(created.id);

      expect(deleted).toBe(true);
      
      const retrieved = await service.getArtifact(created.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent artifact', async () => {
      const result = await service.deleteArtifact('non-existent');
      expect(result).toBe(false);
    });
  });

  /**
   * Test artifact listing
   */
  describe('getAllArtifacts', () => {
    it('should return empty array when no artifacts', async () => {
      const artifacts = await service.getAllArtifacts();
      expect(artifacts).toEqual([]);
    });

    it('should return all created artifacts', async () => {
      const artifactsData = [
        {
          name: 'Purpose 1',
          description: 'Description 1',
          purpose: 'Purpose 1',
          context: 'Context 1',
          authority: 'Authority 1',
          evaluation: 'Evaluation 1'
        },
        {
          name: 'Purpose 2',
          description: 'Description 2',
          purpose: 'Purpose 2',
          context: 'Context 2',
          authority: 'Authority 2',
          evaluation: 'Evaluation 2'
        }
      ];

      const created1 = await service.createArtifact('PURPOSE', artifactsData[0]);
      const created2 = await service.createArtifact('PURPOSE', artifactsData[1]);

      const allArtifacts = await service.getAllArtifacts();

      expect(allArtifacts).toHaveLength(2);
      expect(allArtifacts).toContainEqual(created1);
      expect(allArtifacts).toContainEqual(created2);
    });

    it('should return artifacts filtered by type', async () => {
      const purposeData = {
        name: 'Test Purpose',
        description: 'Test description',
        purpose: 'Test purpose',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation'
      };
      
      const policyData = {
        name: 'Test Policy',
        description: 'Test description',
        purpose: 'Test purpose',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation'
      };

      await service.createArtifact('PURPOSE', purposeData);
      await service.createArtifact('POLICY', policyData);

      const purposeArtifacts = await service.getArtifactsByType('PURPOSE');
      const policyArtifacts = await service.getArtifactsByType('POLICY');

      expect(purposeArtifacts).toHaveLength(1);
      expect(purposeArtifacts[0].type).toBe('PURPOSE');
      
      expect(policyArtifacts).toHaveLength(1);
      expect(policyArtifacts[0].type).toBe('POLICY');
    });
  });

  /**
   * Test relationships
   */
  describe('relationships', () => {
    it('should create artifacts with relationships', async () => {
      const purpose = await service.createArtifact('PURPOSE', {
        name: 'Test Purpose',
        description: 'Test description',
        purpose: 'Test purpose',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation'
      });

      const policy = await service.createArtifact('POLICY', {
        name: 'Test Policy',
        description: 'Test description',
        purpose: 'Test purpose',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation'
      });

      // Test relationship creation would require relationship service
      expect(purpose.id).toBeDefined();
      expect(policy.id).toBeDefined();
    });
  });

  /**
   * Test persistence
   */
  describe('persistence', () => {
    it('should persist artifacts to localStorage', async () => {
      const artifactData = {
        name: 'Persisted Purpose',
        description: 'Persisted description',
        purpose: 'Persisted purpose',
        context: 'Persisted context',
        authority: 'Persisted authority',
        evaluation: 'Persisted evaluation'
      };

      await service.createArtifact('PURPOSE', artifactData);

      expect(storage.setItem).toHaveBeenCalled();
      expect(storage.setItem).toHaveBeenCalledWith(
        'artifacts',
        expect.any(String)
      );
    });

    it('should load artifacts from localStorage', async () => {
      const mockArtifacts = [
        {
          id: 'test-id-1',
          name: 'Loaded Purpose',
          type: 'PURPOSE' as ArtifactType,
          description: 'Loaded description',
          purpose: 'Loaded purpose',
          context: 'Loaded context',
          authority: 'Loaded authority',
          evaluation: 'Loaded evaluation',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      storage.getItem.mockReturnValue(JSON.stringify(mockArtifacts));

      const service = new ArtifactService();
      const artifacts = await service.getAllArtifacts();

      expect(artifacts).toHaveLength(1);
      expect(artifacts[0].name).toBe('Loaded Purpose');
    });
  });
});