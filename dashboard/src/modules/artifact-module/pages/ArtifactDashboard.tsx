/**
 * Artifact Dashboard Page
 * Main page component that integrates all artifact module components
 * Provides comprehensive artifact management interface
 */

import React, { useState, useCallback } from 'react';
import { Artifact } from '../types/artifact.types';
import { ArtifactService } from '../services/ArtifactService';
import { ValidationService } from '../services/ValidationService';
import { useArtifacts } from '../hooks/useArtifacts';
import { ArtifactEditor } from '../components/ArtifactEditor';
import { ArtifactGraph } from '../components/ArtifactGraph';
import { ArtifactList } from '../components/ArtifactList';

/**
 * Dashboard layout configuration
 */
interface DashboardLayout {
  showGraph: boolean;
  showList: boolean;
  showEditor: boolean;
  splitMode: 'horizontal' | 'vertical';
}

/**
 * Artifact Dashboard page component
 */
export const ArtifactDashboard: React.FC = () => {
  // Services
  const artifactService = new ArtifactService();
  const validationService = new ValidationService();
  const artifactsHook = useArtifacts(artifactService, validationService);

  // State
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [layout, setLayout] = useState<DashboardLayout>({
    showGraph: true,
    showList: true,
    showEditor: false,
    splitMode: 'horizontal'
  });

  /**
   * Handle artifact selection
   */
  const handleArtifactSelect = useCallback((artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setEditingArtifact(null);
  }, []);

  /**
   * Handle artifact edit
   */
  const handleArtifactEdit = useCallback((artifact: Artifact) => {
    setEditingArtifact(artifact);
    setSelectedArtifact(null);
  }, []);

  /**
   * Handle artifact creation
   */
  const handleArtifactCreate = useCallback(() => {
    setEditingArtifact({} as Artifact);
    setSelectedArtifact(null);
  }, []);

  /**
   * Handle artifact save
   */
  const handleArtifactSave = useCallback(async (artifact: Artifact) => {
    try {
      if (editingArtifact) {
        await artifactsHook.updateArtifact(artifact.id, artifact);
      } else {
        await artifactsHook.createArtifact(artifact.type, artifact);
      }
      setEditingArtifact(null);
      setSelectedArtifact(artifact);
    } catch (error) {
      console.error('Failed to save artifact:', error);
    }
  }, [editingArtifact, artifactsHook]);

  /**
   * Handle artifact delete
   */
  const handleArtifactDelete = useCallback(async (artifact: Artifact) => {
    if (window.confirm(`Are you sure you want to delete "${artifact.name}"?`)) {
      try {
        await artifactsHook.deleteArtifact(artifact.id);
        if (selectedArtifact?.id === artifact.id) {
          setSelectedArtifact(null);
        }
        if (editingArtifact?.id === artifact.id) {
          setEditingArtifact(null);
        }
      } catch (error) {
        console.error('Failed to delete artifact:', error);
      }
    }
  }, [selectedArtifact, editingArtifact, artifactsHook]);

  /**
   * Handle artifact cancel
   */
  const handleArtifactCancel = useCallback(() => {
    setEditingArtifact(null);
  }, []);

  /**
   * Toggle layout
   */
  const toggleLayout = useCallback((key: keyof DashboardLayout) => {
    setLayout(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /**
   * Change split mode
   */
  const changeSplitMode = useCallback((mode: 'horizontal' | 'vertical') => {
    setLayout(prev => ({ ...prev, splitMode: mode }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Artifact Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage and visualize your Hexy artifacts
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {artifactsHook.artifacts.length}
                </span>
                <button
                  onClick={handleArtifactCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Create Artifact
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Layout:
              </span>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.showGraph}
                  onChange={() => toggleLayout('showGraph')}
                  className="rounded"
                />
                <span className="text-sm">Graph</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.showList}
                  onChange={() => toggleLayout('showList')}
                  className="rounded"
                />
                <span className="text-sm">List</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.showEditor}
                  onChange={() => toggleLayout('showEditor')}
                  className="rounded"
                />
                <span className="text-sm">Editor</span>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Split:</span>
              <button
                onClick={() => changeSplitMode('horizontal')}
                className={`px-2 py-1 text-xs rounded ${
                  layout.splitMode === 'horizontal'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Horizontal
              </button>
              <button
                onClick={() => changeSplitMode('vertical')}
                className={`px-2 py-1 text-xs rounded ${
                  layout.splitMode === 'vertical'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Vertical
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`
          ${layout.splitMode === 'horizontal' ? 'grid grid-cols-1 lg:grid-cols-2' : 'flex flex-col'}
          gap-6
        `}>
          {/* Graph Section */}
          {layout.showGraph && (
            <div className={`
              ${layout.splitMode === 'horizontal' ? 'lg:col-span-1' : 'h-96'}
              bg-white dark:bg-gray-800 rounded-lg shadow p-4
            `}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Artifact Network
              </h2>
              <div className="h-96">
                <ArtifactGraph
                  artifacts={artifactsHook.artifacts}
                  selectedId={selectedArtifact?.id}
                  onNodeClick={handleArtifactSelect}
                  onNodeHover={(artifact) => {
                    // Handle hover if needed
                  }}
                />
              </div>
            </div>
          )}

          {/* List Section */}
          {layout.showList && (
            <div className={`
              ${layout.splitMode === 'horizontal' ? 'lg:col-span-1' : ''}
              bg-white dark:bg-gray-800 rounded-lg shadow p-4
            `}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Artifact List
              </h2>
              <ArtifactList
                artifacts={artifactsHook.artifacts}
                selectedId={selectedArtifact?.id}
                onArtifactSelect={handleArtifactSelect}
                onArtifactEdit={handleArtifactEdit}
                onArtifactDelete={handleArtifactDelete}
              />
            </div>
          )}
        </div>

        {/* Editor Section */}
        {layout.showEditor && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingArtifact ? 'Edit Artifact' : selectedArtifact ? 'Artifact Details' : 'Create Artifact'}
            </h2>
            
            {editingArtifact ? (
              <ArtifactEditor
                artifactId={editingArtifact.id}
                mode={editingArtifact.id ? 'edit' : 'create'}
                onSave={handleArtifactSave}
                onCancel={handleArtifactCancel}
              />
            ) : selectedArtifact ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Name</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedArtifact.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Type</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedArtifact.type}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedArtifact.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Purpose</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedArtifact.purpose}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Context</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedArtifact.context}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Authority</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedArtifact.authority}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Evaluation</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedArtifact.evaluation}</p>
                </div>
                
                {selectedArtifact.tags && selectedArtifact.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtifact.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleArtifactEdit(selectedArtifact)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArtifactDelete(selectedArtifact)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Select an artifact to view details or create a new one.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {artifactsHook.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading artifacts...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {artifactsHook.error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <span>Error: {artifactsHook.error}</span>
            <button
              onClick={() => artifactsHook.validateAll()}
              className="text-white underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtifactDashboard;