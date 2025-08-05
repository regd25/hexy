/**
 * Custom hook for managing artifacts with React and Zustand
 * Provides reactive state management for artifact operations
 */

import { useState, useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { 
  Artifact, 
  Relationship, 
  ArtifactType,
  ArtifactFilter,
  ArtifactSortOption 
} from '../types/artifact.types';
import { ArtifactService } from '../services/ArtifactService';
import { ValidationService } from '../services/ValidationService';
import { ValidationResult } from '../services/ValidationService';

/**
 * Hook configuration options
 */
export interface UseArtifactsOptions {
  autoValidate?: boolean;
  autoSave?: boolean;
  enableHistory?: boolean;
  maxHistorySize?: number;
}

/**
 * Hook return type
 */
export interface UseArtifactsReturn {
  // State
  artifacts: Artifact[];
  selectedArtifact: Artifact | null;
  isLoading: boolean;
  error: string | null;
  validationResults: Record<string, ValidationResult>;
  
  // Actions
  createArtifact: (type: ArtifactType, data: Partial<Artifact>) => Promise<Artifact>;
  updateArtifact: (id: string, updates: Partial<Artifact>) => Promise<Artifact>;
  deleteArtifact: (id: string) => Promise<void>;
  selectArtifact: (id: string | null) => void;
  
  // Relationships
  addRelationship: (sourceId: string, targetId: string, type: string) => Promise<void>;
  removeRelationship: (sourceId: string, targetId: string) => Promise<void>;
  
  // Validation
  validateArtifact: (id: string) => Promise<ValidationResult>;
  validateAll: () => Promise<Record<string, ValidationResult>>;
  
  // Filtering and sorting
  filteredArtifacts: Artifact[];
  setFilter: (filter: ArtifactFilter) => void;
  setSort: (sort: ArtifactSortOption) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Graph operations
  getConnectedArtifacts: (id: string, depth?: number) => Artifact[];
  findPath: (fromId: string, toId: string) => Artifact[];
  
  // Search
  searchArtifacts: (query: string) => Artifact[];
}

/**
 * Custom hook for artifact management
 */
export function useArtifacts(
  service: ArtifactService,
  validationService: ValidationService,
  options: UseArtifactsOptions = {}
): UseArtifactsReturn {
  const {
    autoValidate = true,
    autoSave = true,
    enableHistory = true,
    maxHistorySize = 50
  } = options;

  // State management
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  
  // Filtering and sorting
  const [filter, setFilter] = useState<ArtifactFilter>({});
  const [sort, setSort] = useState<ArtifactSortOption>({ field: 'name', direction: 'asc' });
  
  // History management
  const [history, setHistory] = useState<Artifact[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load artifacts on mount
  useState(() => {
    loadArtifacts();
  });

  /**
   * Load all artifacts from service
   */
  const loadArtifacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedArtifacts = await service.getAllArtifacts();
      setArtifacts(loadedArtifacts);
      
      if (autoValidate) {
        await validateAll();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artifacts');
    } finally {
      setIsLoading(false);
    }
  }, [service, autoValidate]);

  /**
   * Save artifacts to service
   */
  const saveArtifacts = useCallback(async (newArtifacts: Artifact[]) => {
    if (!autoSave) return;
    
    try {
      await service.saveArtifacts(newArtifacts);
      
      if (enableHistory) {
        addToHistory(newArtifacts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save artifacts');
    }
  }, [service, autoSave, enableHistory]);

  /**
   * Add state to history
   */
  const addToHistory = useCallback((newArtifacts: Artifact[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newArtifacts);
      
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [historyIndex, maxHistorySize]);

  /**
   * Create new artifact
   */
  const createArtifact = useCallback(async (
    type: ArtifactType, 
    data: Partial<Artifact>
  ): Promise<Artifact> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newArtifact = await service.createArtifact(type, data);
      const updatedArtifacts = [...artifacts, newArtifact];
      
      setArtifacts(updatedArtifacts);
      await saveArtifacts(updatedArtifacts);
      
      if (autoValidate) {
        const validation = await validationService.validateArtifact(newArtifact);
        setValidationResults(prev => ({ ...prev, [newArtifact.id]: validation }));
      }
      
      return newArtifact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create artifact');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, artifacts, autoValidate, saveArtifacts]);

  /**
   * Update existing artifact
   */
  const updateArtifact = useCallback(async (
    id: string, 
    updates: Partial<Artifact>
  ): Promise<Artifact> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedArtifact = await service.updateArtifact(id, updates);
      const updatedArtifacts = artifacts.map(a => 
        a.id === id ? updatedArtifact : a
      );
      
      setArtifacts(updatedArtifacts);
      await saveArtifacts(updatedArtifacts);
      
      if (selectedArtifact?.id === id) {
        setSelectedArtifact(updatedArtifact);
      }
      
      if (autoValidate) {
        const validation = await validationService.validateArtifact(updatedArtifact);
        setValidationResults(prev => ({ ...prev, [id]: validation }));
      }
      
      return updatedArtifact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update artifact');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, artifacts, selectedArtifact, autoValidate, saveArtifacts]);

  /**
   * Delete artifact
   */
  const deleteArtifact = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await service.deleteArtifact(id);
      const updatedArtifacts = artifacts.filter(a => a.id !== id);
      
      setArtifacts(updatedArtifacts);
      await saveArtifacts(updatedArtifacts);
      
      if (selectedArtifact?.id === id) {
        setSelectedArtifact(null);
      }
      
      // Remove validation results
      setValidationResults(prev => {
        const newResults = { ...prev };
        delete newResults[id];
        return newResults;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete artifact');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, artifacts, selectedArtifact, saveArtifacts]);

  /**
   * Select artifact
   */
  const selectArtifact = useCallback((id: string | null): void => {
    if (id === null) {
      setSelectedArtifact(null);
      return;
    }
    
    const artifact = artifacts.find(a => a.id === id);
    setSelectedArtifact(artifact || null);
  }, [artifacts]);

  /**
   * Add relationship
   */
  const addRelationship = useCallback(async (
    sourceId: string, 
    targetId: string, 
    type: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await service.addRelationship(sourceId, targetId, type);
      const updatedArtifacts = await service.getAllArtifacts();
      
      setArtifacts(updatedArtifacts);
      await saveArtifacts(updatedArtifacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add relationship');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, saveArtifacts]);

  /**
   * Remove relationship
   */
  const removeRelationship = useCallback(async (
    sourceId: string, 
    targetId: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await service.removeRelationship(sourceId, targetId);
      const updatedArtifacts = await service.getAllArtifacts();
      
      setArtifacts(updatedArtifacts);
      await saveArtifacts(updatedArtifacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove relationship');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, saveArtifacts]);

  /**
   * Validate single artifact
   */
  const validateArtifact = useCallback(async (id: string): Promise<ValidationResult> => {
    const artifact = artifacts.find(a => a.id === id);
    if (!artifact) {
      return {
        isValid: false,
        errors: ['Artifact not found'],
        warnings: [],
        suggestions: []
      };
    }
    
    const validation = await validationService.validateArtifact(artifact);
    setValidationResults(prev => ({ ...prev, [id]: validation }));
    return validation;
  }, [artifacts, validationService]);

  /**
   * Validate all artifacts
   */
  const validateAll = useCallback(async (): Promise<Record<string, ValidationResult>> => {
    const results: Record<string, ValidationResult> = {};
    
    for (const artifact of artifacts) {
      const validation = await validationService.validateArtifact(artifact);
      results[artifact.id] = validation;
    }
    
    setValidationResults(results);
    return results;
  }, [artifacts, validationService]);

  /**
   * Get connected artifacts
   */
  const getConnectedArtifacts = useCallback((id: string, depth = 1): Artifact[] => {
    const visited = new Set<string>();
    const result: Artifact[] = [];
    
    const traverse = (currentId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(currentId)) {
        return;
      }
      
      visited.add(currentId);
      const artifact = artifacts.find(a => a.id === currentId);
      
      if (artifact && currentId !== id) {
        result.push(artifact);
      }
      
      const relatedArtifacts = artifacts.filter(a => 
        a.relationships.some(r => 
          r.sourceId === currentId || r.targetId === currentId
        )
      );
      
      relatedArtifacts.forEach(a => traverse(a.id, currentDepth + 1));
    };
    
    traverse(id, 0);
    return result;
  }, [artifacts]);

  /**
   * Find path between artifacts
   */
  const findPath = useCallback((fromId: string, toId: string): Artifact[] => {
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [{ id: fromId, path: [fromId] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (id === toId) {
        return path.map(id => artifacts.find(a => a.id === id)).filter(Boolean) as Artifact[];
      }
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      const artifact = artifacts.find(a => a.id === id);
      if (!artifact) continue;
      
      const neighbors = artifacts.filter(a => 
        a.relationships.some(r => 
          (r.sourceId === id && r.targetId !== id) || 
          (r.targetId === id && r.sourceId !== id)
        )
      );
      
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor.id)) {
          queue.push({ id: neighbor.id, path: [...path, neighbor.id] });
        }
      });
    }
    
    return [];
  }, [artifacts]);

  /**
   * Search artifacts
   */
  const searchArtifacts = useCallback((query: string): Artifact[] => {
    if (!query.trim()) return artifacts;
    
    const lowercaseQuery = query.toLowerCase();
    
    return artifacts.filter(artifact =>
      artifact.name.toLowerCase().includes(lowercaseQuery) ||
      artifact.description.toLowerCase().includes(lowercaseQuery) ||
      artifact.purpose.toLowerCase().includes(lowercaseQuery) ||
      artifact.type.toLowerCase().includes(lowercaseQuery)
    );
  }, [artifacts]);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setArtifacts(history[newIndex]);
    }
  }, [history, historyIndex]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setArtifacts(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Memoized filtered and sorted artifacts
  const filteredArtifacts = useMemo(() => {
    let result = artifacts;
    
    // Apply filter
    if (filter.type) {
      result = result.filter(a => a.type === filter.type);
    }
    
    if (filter.search) {
      result = searchArtifacts(filter.search);
    }
    
    // Apply sort
    result.sort((a, b) => {
      const fieldA = a[sort.field];
      const fieldB = b[sort.field];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sort.direction === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sort.direction === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }
      
      return 0;
    });
    
    return result;
  }, [artifacts, filter, sort, searchArtifacts]);

  return {
    artifacts,
    selectedArtifact,
    isLoading,
    error,
    validationResults,
    
    createArtifact,
    updateArtifact,
    deleteArtifact,
    selectArtifact,
    
    addRelationship,
    removeRelationship,
    
    validateArtifact,
    validateAll,
    
    filteredArtifacts,
    setFilter,
    setSort,
    
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    
    getConnectedArtifacts,
    findPath,
    
    searchArtifacts
  };
}