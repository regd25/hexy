/**
 * Tests for useArtifacts hook
 * Unit tests for artifact state management
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useArtifacts } from './useArtifacts';
import { ArtifactService } from '../services/ArtifactService';
import { ValidationService } from '../services/ValidationService';
import { Artifact, ArtifactType } from '../types/artifact.types';

/**
 * Test setup
 */
describe('useArtifacts', () => {
  let artifactService: ArtifactService;
  let validationService: ValidationService;

  beforeEach(() => {
    artifactService = new ArtifactService();
    validationService = new ValidationService();
    
    // Mock service methods
    vi.spyOn(artifactService, 'createArtifact').mockResolvedValue({
      id: 'test-id',
      name: 'Test Purpose',
      type: 'PURPOSE' as ArtifactType,
      description: 'Test description',
      purpose: 'Test purpose',
      context: 'Test context',
      authority: 'Test authority',
      evaluation: 'Test evaluation',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    });

    vi.spyOn(artifactService, 'getAllArtifacts').mockResolvedValue([]);
    vi.spyOn(artifactService, 'updateArtifact').mockResolvedValue({
      id: 'test-id',
      name: 'Updated Purpose',
      type: 'PURPOSE' as ArtifactType,
      description: 'Updated description',
      purpose: 'Updated purpose',
      context: 'Updated context',
      authority: 'Updated authority',
      evaluation: 'Updated evaluation',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02')
    });

    vi.spyOn(artifactService, 'deleteArtifact').mockResolvedValue(true);
    vi.spyOn(artifactService, 'getArtifact').mockResolvedValue(null);

    // Mock validation service
    vi.spyOn(validationService, 'validateArtifact').mockResolvedValue({
      isValid: true,
      errors: [],
      warnings: []
    });
  });

  /**
   * Test initial state
   */
  describe('initial state', () => {
    it('should initialize with empty artifacts array', () => {
      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      expect(result.current.artifacts).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedArtifact).toBeNull();
    });
  });

  /**
   * Test artifact creation
   */
  describe('createArtifact', () => {
    it('should create new artifact', async () => {
      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      const artifactData = {
        name: 'Test Purpose',
        description: 'Test description',
        purpose: 'Test purpose',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation'
      };

      await act(async () => {
        await result.current.createArtifact('PURPOSE', artifactData);
      });

      expect(artifactService.createArtifact).toHaveBeenCalledWith('PURPOSE', artifactData);
      expect(result.current.artifacts).toHaveLength(1);
      expect(result.current.artifacts[0].name).toBe('Test Purpose');
    });

    it('should handle creation errors', async () => {
      vi.spyOn(artifactService, 'createArtifact').mockRejectedValue(new Error('Creation failed'));
      
      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.createArtifact('PURPOSE', {
          name: 'Test',
          description: 'Test',
          purpose: 'Test',
          context: 'Test',
          authority: 'Test',
          evaluation: 'Test'
        });
      });

      expect(result.current.error).toBe('Creation failed');
    });
  });

  /**
   * Test artifact updates
   */
  describe('updateArtifact', () => {
    it('should update existing artifact', async () => {
      const existingArtifact: Artifact = {
        id: 'test-id',
        name: 'Original Purpose',
        type: 'PURPOSE' as ArtifactType,
        description: 'Original description',
        purpose: 'Original purpose',
        context: 'Original context',
        authority: 'Original authority',
        evaluation: 'Original evaluation',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      vi.spyOn(artifactService, 'getAllArtifacts').mockResolvedValue([existingArtifact]);

      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.loadArtifacts();
      });

      const updatedData = {
        ...existingArtifact,
        name: 'Updated Purpose',
        description: 'Updated description'
      };

      await act(async () => {
        await result.current.updateArtifact('test-id', updatedData);
      });

      expect(artifactService.updateArtifact).toHaveBeenCalledWith('test-id', updatedData);
      expect(result.current.artifacts[0].name).toBe('Updated Purpose');
    });
  });

  /**
   * Test artifact deletion
   */
  describe('deleteArtifact', () => {
    it('should delete artifact', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        name: 'To Delete',
        type: 'PURPOSE' as ArtifactType,
        description: 'To delete',
        purpose: 'To delete',
        context: 'To delete',
        authority: 'To delete',
        evaluation: 'To delete',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      vi.spyOn(artifactService, 'getAllArtifacts').mockResolvedValue([artifact]);

      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.loadArtifacts();
      });

      await act(async () => {
        await result.current.deleteArtifact('test-id');
      });

      expect(artifactService.deleteArtifact).toHaveBeenCalledWith('test-id');
      expect(result.current.artifacts).toHaveLength(0);
    });
  });

  /**
   * Test artifact selection
   */
  describe('selectArtifact', () => {
    it('should select artifact by ID', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        name: 'Test Purpose',
        type: 'PURPOSE' as ArtifactType,
        description: 'Test description',
        purpose: 'Test purpose',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      vi.spyOn(artifactService, 'getArtifact').mockResolvedValue(artifact);

      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.selectArtifact('test-id');
      });

      expect(result.current.selectedArtifact).toEqual(artifact);
    });
  });

  /**
   * Test filtering
   */
  describe('filterArtifacts', () => {
    it('should filter artifacts by type', async () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          name: 'Purpose 1',
          type: 'PURPOSE' as ArtifactType,
          description: 'Test',
          purpose: 'Test',
          context: 'Test',
          authority: 'Test',
          evaluation: 'Test',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          name: 'Policy 1',
          type: 'POLICY' as ArtifactType,
          description: 'Test',
          purpose: 'Test',
          context: 'Test',
          authority: 'Test',
          evaluation: 'Test',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      vi.spyOn(artifactService, 'getAllArtifacts').mockResolvedValue(artifacts);

      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.loadArtifacts();
      });

      act(() => {
        result.current.setFilter({ type: 'PURPOSE' });
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
      expect(result.current.filteredArtifacts[0].type).toBe('PURPOSE');
    });

    it('should filter artifacts by search term', async () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          name: 'Test Purpose',
          type: 'PURPOSE' as ArtifactType,
          description: 'This is a test',
          purpose: 'Test purpose',
          context: 'Test context',
          authority: 'Test authority',
          evaluation: 'Test evaluation',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          name: 'Other Purpose',
          type: 'PURPOSE' as ArtifactType,
          description: 'This is different',
          purpose: 'Other purpose',
          context: 'Other context',
          authority: 'Other authority',
          evaluation: 'Other evaluation',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      vi.spyOn(artifactService, 'getAllArtifacts').mockResolvedValue(artifacts);

      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.loadArtifacts();
      });

      act(() => {
        result.current.setSearchTerm('test');
      });

      expect(result.current.filteredArtifacts).toHaveLength(1);
      expect(result.current.filteredArtifacts[0].name).toBe('Test Purpose');
    });
  });

  /**
   * Test sorting
   */
  describe('sortArtifacts', () => {
    it('should sort artifacts by name', async () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          name: 'Zebra Purpose',
          type: 'PURPOSE' as ArtifactType,
          description: 'Test',
          purpose: 'Test',
          context: 'Test',
          authority: 'Test',
          evaluation: 'Test',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          name: 'Apple Purpose',
          type: 'PURPOSE' as ArtifactType,
          description: 'Test',
          purpose: 'Test',
          context: 'Test',
          authority: 'Test',
          evaluation: 'Test',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      vi.spyOn(artifactService, 'getAllArtifacts').mockResolvedValue(artifacts);

      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.loadArtifacts();
      });

      act(() => {
        result.current.setSortBy('name');
        result.current.setSortOrder('asc');
      });

      expect(result.current.sortedArtifacts[0].name).toBe('Apple Purpose');
      expect(result.current.sortedArtifacts[1].name).toBe('Zebra Purpose');
    });
  });

  /**
   * Test validation
   */
  describe('validation', () => {
    it('should validate single artifact', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        name: 'Test Purpose',
        type: 'PURPOSE' as ArtifactType,
        description: 'Test description',
        purpose: 'Test purpose',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.validateArtifact(artifact);
      });

      expect(validationService.validateArtifact).toHaveBeenCalledWith(artifact);
      expect(result.current.validationResults['test-id']).toEqual({
        isValid: true,
        errors: [],
        warnings: []
      });
    });

    it('should validate all artifacts', async () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          name: 'Test Purpose 1',
          type: 'PURPOSE' as ArtifactType,
          description: 'Test description',
          purpose: 'Test purpose',
          context: 'Test context',
          authority: 'Test authority',
          evaluation: 'Test evaluation',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          name: 'Test Purpose 2',
          type: 'PURPOSE' as ArtifactType,
          description: 'Test description',
          purpose: 'Test purpose',
          context: 'Test context',
          authority: 'Test authority',
          evaluation: 'Test evaluation',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      vi.spyOn(artifactService, 'getAllArtifacts').mockResolvedValue(artifacts);

      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      await act(async () => {
        await result.current.loadArtifacts();
      });

      await act(async () => {
        await result.current.validateAll();
      });

      expect(validationService.validateArtifact).toHaveBeenCalledTimes(2);
      expect(Object.keys(result.current.validationResults)).toHaveLength(2);
    });
  });

  /**
   * Test history management
   */
  describe('history', () => {
    it('should track history for undo/redo', async () => {
      const { result } = renderHook(() => useArtifacts(artifactService, validationService));
      
      const artifactData = {
        name: 'Test Purpose',
        description: 'Test description',
        purpose: 'Test purpose',
        context: 'Test context',
        authority: 'Test authority',
        evaluation: 'Test evaluation'
      };

      await act(async () => {
        await result.current.createArtifact('PURPOSE', artifactData);
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(true);
    });
  });
});