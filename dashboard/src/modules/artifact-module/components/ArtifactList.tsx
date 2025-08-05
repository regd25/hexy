/**
 * Artifact List Component
 * Comprehensive list view with filtering, search, and management capabilities
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Artifact, ArtifactType, ARTIFACT_TYPES } from '../types/artifact.types';
import { useArtifacts } from '../hooks/useArtifacts';
import { ArtifactService } from '../services/ArtifactService';
import { ValidationService } from '../services/ValidationService';

/**
 * Props for ArtifactList component
 */
export interface ArtifactListProps {
  onArtifactSelect?: (artifact: Artifact) => void;
  onArtifactEdit?: (artifact: Artifact) => void;
  onArtifactDelete?: (artifact: Artifact) => void;
  selectedId?: string;
  className?: string;
}

/**
 * Sort configuration
 */
interface SortConfig {
  field: keyof Artifact;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
interface FilterConfig {
  type?: ArtifactType;
  search?: string;
  tags?: string[];
  hasErrors?: boolean;
}

/**
 * View modes
 */
type ViewMode = 'grid' | 'list' | 'compact';

/**
 * Artifact List component
 */
export const ArtifactList: React.FC<ArtifactListProps> = ({
  onArtifactSelect,
  onArtifactEdit,
  onArtifactDelete,
  selectedId,
  className = ''
}) => {
  // Services
  const artifactService = useMemo(() => new ArtifactService(), []);
  const validationService = useMemo(() => new ValidationService(), []);
  const artifactsHook = useArtifacts(artifactService, validationService);

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    field: 'updatedAt', 
    direction: 'desc' 
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    artifactsHook.artifacts.forEach(artifact => {
      artifact.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [artifactsHook.artifacts]);

  // Filter and sort artifacts
  const filteredArtifacts = useMemo(() => {
    let filtered = [...artifactsHook.artifacts];

    // Apply type filter
    if (filterConfig.type) {
      filtered = filtered.filter(a => a.type === filterConfig.type);
    }

    // Apply search filter
    if (filterConfig.search) {
      const searchLower = filterConfig.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.purpose.toLowerCase().includes(searchLower)
      );
    }

    // Apply tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(a =>
        selectedTags.every(tag => a.tags?.includes(tag))
      );
    }

    // Apply error filter
    if (filterConfig.hasErrors) {
      filtered = filtered.filter(a => {
        const validation = artifactsHook.validationResults[a.id];
        return validation && !validation.isValid;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    return filtered;
  }, [artifactsHook.artifacts, filterConfig, sortConfig, selectedTags, artifactsHook.validationResults]);

  /**
   * Handle sort change
   */
  const handleSort = (field: keyof Artifact) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key: keyof FilterConfig, value: any) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Handle tag toggle
   */
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilterConfig({});
    setSelectedTags([]);
  };

  /**
   * Get validation status for artifact
   */
  const getValidationStatus = (artifact: Artifact) => {
    const validation = artifactsHook.validationResults[artifact.id];
    if (!validation) return null;

    return {
      hasErrors: validation.errors.length > 0,
      hasWarnings: validation.warnings.length > 0,
      isValid: validation.isValid
    };
  };

  /**
   * Get color for artifact type
   */
  const getTypeColor = (type: ArtifactType) => {
    const colors: Record<ArtifactType, string> = {
      purpose: 'bg-blue-100 text-blue-800',
      vision: 'bg-purple-100 text-purple-800',
      policy: 'bg-green-100 text-green-800',
      principle: 'bg-yellow-100 text-yellow-800',
      guideline: 'bg-orange-100 text-orange-800',
      context: 'bg-gray-100 text-gray-800',
      actor: 'bg-indigo-100 text-indigo-800',
      concept: 'bg-pink-100 text-pink-800',
      process: 'bg-teal-100 text-teal-800',
      procedure: 'bg-cyan-100 text-cyan-800',
      event: 'bg-red-100 text-red-800',
      result: 'bg-emerald-100 text-emerald-800',
      observation: 'bg-slate-100 text-slate-800',
      evaluation: 'bg-violet-100 text-violet-800',
      indicator: 'bg-rose-100 text-rose-800',
      area: 'bg-amber-100 text-amber-800',
      authority: 'bg-lime-100 text-lime-800',
      reference: 'bg-fuchsia-100 text-fuchsia-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Format date
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  /**
   * Render grid view
   */
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredArtifacts.map(artifact => {
        const validation = getValidationStatus(artifact);
        
        return (
          <div
            key={artifact.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedId === artifact.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onArtifactSelect?.(artifact)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(artifact.type)}`}>
                {artifact.type}
              </span>
              {validation && (
                <div className="flex space-x-1">
                  {validation.hasErrors && (
                    <span className="text-red-500" title="Has errors">⚠️</span>
                  )}
                  {validation.hasWarnings && (
                    <span className="text-yellow-500" title="Has warnings">⚠️</span>
                  )}
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-lg mb-2 dark:text-white">{artifact.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {artifact.description || artifact.purpose}
            </p>
            
            {artifact.tags && artifact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {artifact.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {artifact.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                    +{artifact.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{formatDate(artifact.updatedAt)}</span>
              <span>{artifact.relationships?.length || 0} connections</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  /**
   * Render list view
   */
  const renderListView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => handleSort('name')}
            >
              Name {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => handleSort('type')}
            >
              Type {sortConfig.field === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Description
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => handleSort('updatedAt')}
            >
              Updated {sortConfig.field === 'updatedAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredArtifacts.map(artifact => {
            const validation = getValidationStatus(artifact);
            
            return (
              <tr
                key={artifact.id}
                className={`${selectedId === artifact.id ? 'bg-blue-50 dark:bg-blue-900' : ''} hover:bg-gray-50 dark:hover:bg-gray-700`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {artifact.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(artifact.type)}`}>
                    {artifact.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div className="max-w-xs truncate">
                    {artifact.description || artifact.purpose}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(artifact.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onArtifactSelect?.(artifact)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onArtifactEdit?.(artifact)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onArtifactDelete?.(artifact)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  /**
   * Render compact view
   */
  const renderCompactView = () => (
    <div className="space-y-2">
      {filteredArtifacts.map(artifact => {
        const validation = getValidationStatus(artifact);
        
        return (
          <div
            key={artifact.id}
            className={`bg-white dark:bg-gray-800 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              selectedId === artifact.id ? 'ring-1 ring-blue-500' : ''
            }`}
            onClick={() => onArtifactSelect?.(artifact)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(artifact.type)}`}>
                  {artifact.type}
                </span>
                <span className="font-medium text-sm dark:text-white">{artifact.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {validation && (
                  <div className="flex space-x-1">
                    {validation.hasErrors && (
                      <span className="text-red-500" title="Has errors">⚠️</span>
                    )}
                    {validation.hasWarnings && (
                      <span className="text-yellow-500" title="Has warnings">⚠️</span>
                    )}
                  </div>
                )}
                <span className="text-xs text-gray-500">{formatDate(artifact.updatedAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold dark:text-white">
              Artifacts ({filteredArtifacts.length})
            </h2>
            
            {/* View mode toggle */}
            <div className="flex space-x-1">
              {(['grid', 'list', 'compact'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search artifacts..."
              value={filterConfig.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Filters
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={filterConfig.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Types</option>
                  {ARTIFACT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Tags filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 rounded text-xs ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Validation Status
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterConfig.hasErrors || false}
                    onChange={(e) => handleFilterChange('hasErrors', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Show only with errors</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {filteredArtifacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No artifacts found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}
            {viewMode === 'compact' && renderCompactView()}
          </>
        )}
      </div>
    </div>
  );
};

export default ArtifactList;