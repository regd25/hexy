/**
 * Artifact Editor Component
 * Main component for creating and editing Hexy artifacts
 * Provides comprehensive editing interface with real-time validation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Artifact, ArtifactType, ARTIFACT_TYPES } from '../types/artifact.types';
import { useArtifacts } from '../hooks/useArtifacts';
import { ValidationService } from '../services/ValidationService';
import { ArtifactService } from '../services/ArtifactService';

/**
 * Props for ArtifactEditor component
 */
export interface ArtifactEditorProps {
  artifactId?: string;
  onSave?: (artifact: Artifact) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
  className?: string;
}

/**
 * Form field component
 */
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, error, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

/**
 * Artifact Editor component
 */
export const ArtifactEditor: React.FC<ArtifactEditorProps> = ({
  artifactId,
  onSave,
  onCancel,
  mode = 'create',
  className = ''
}) => {
  // Services
  const artifactService = useMemo(() => new ArtifactService(), []);
  const validationService = useMemo(() => new ValidationService(), []);
  const artifactsHook = useArtifacts(artifactService, validationService);

  // State
  const [formData, setFormData] = useState<Partial<Artifact>>({
    name: '',
    type: 'purpose' as ArtifactType,
    description: '',
    purpose: '',
    context: '',
    authority: '',
    evaluation: '',
    tags: [],
    relationships: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing artifact for edit mode
  useEffect(() => {
    if (artifactId && mode !== 'create') {
      const artifact = artifactsHook.artifacts.find(a => a.id === artifactId);
      if (artifact) {
        setFormData({
          ...artifact,
          tags: artifact.tags || [],
          relationships: artifact.relationships || []
        });
      }
    }
  }, [artifactId, mode, artifactsHook.artifacts]);

  // Real-time validation
  useEffect(() => {
    if (formData.name || formData.description || formData.purpose) {
      validateForm();
    }
  }, [formData]);

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field: keyof Artifact, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle tags input
   */
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    handleFieldChange('tags', tags);
  };

  /**
   * Validate form data
   */
  const validateForm = async () => {
    if (!formData.name || !formData.type) {
      const newErrors: Record<string, string> = {};
      
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.type) newErrors.type = 'Type is required';
      
      setErrors(newErrors);
      return false;
    }

    setIsValidating(true);
    
    try {
      // Create temporary artifact for validation
      const tempArtifact: Artifact = {
        id: artifactId || 'temp',
        name: formData.name || '',
        type: formData.type as ArtifactType,
        description: formData.description || '',
        purpose: formData.purpose || '',
        context: formData.context || '',
        authority: formData.authority || '',
        evaluation: formData.evaluation || '',
        tags: formData.tags || [],
        relationships: formData.relationships || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const validation = await validationService.validateArtifact(tempArtifact);
      
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        if (error.includes('name')) newErrors.name = error;
        else if (error.includes('description')) newErrors.description = error;
        else if (error.includes('purpose')) newErrors.purpose = error;
        else if (error.includes('type')) newErrors.type = error;
      });

      setErrors(newErrors);
      return validation.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSaving(true);
    
    try {
      let savedArtifact: Artifact;
      
      if (mode === 'create') {
        savedArtifact = await artifactsHook.createArtifact(
          formData.type as ArtifactType,
          formData
        );
      } else if (artifactId) {
        savedArtifact = await artifactsHook.updateArtifact(artifactId, formData);
      } else {
        throw new Error('Artifact ID is required for edit mode');
      }

      onSave?.(savedArtifact);
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save artifact');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    onCancel?.();
  };

  /**
   * Get artifact type configuration
   */
  const getTypeConfig = (type: ArtifactType) => {
    const configs = {
      purpose: {
        label: 'Purpose',
        description: 'The fundamental intention or reason behind an effort',
        placeholder: 'Describe the core purpose...',
        color: 'bg-blue-100 text-blue-800'
      },
      vision: {
        label: 'Vision',
        description: 'A shared, desired future state',
        placeholder: 'Envision the future state...',
        color: 'bg-purple-100 text-purple-800'
      },
      policy: {
        label: 'Policy',
        description: 'Collective commitments that govern behavior',
        placeholder: 'Define the governing policy...',
        color: 'bg-green-100 text-green-800'
      },
      principle: {
        label: 'Principle',
        description: 'Fundamental truth for decision-making',
        placeholder: 'State the guiding principle...',
        color: 'bg-yellow-100 text-yellow-800'
      },
      guideline: {
        label: 'Guideline',
        description: 'Recommendations based on experience',
        placeholder: 'Provide the guideline...',
        color: 'bg-orange-100 text-orange-800'
      },
      context: {
        label: 'Context',
        description: 'Where, when, and for whom it applies',
        placeholder: 'Define the context...',
        color: 'bg-gray-100 text-gray-800'
      },
      actor: {
        label: 'Actor',
        description: 'Entity capable of meaningful action',
        placeholder: 'Describe the actor...',
        color: 'bg-indigo-100 text-indigo-800'
      },
      concept: {
        label: 'Concept',
        description: 'Shared meaning of key terms',
        placeholder: 'Define the concept...',
        color: 'bg-pink-100 text-pink-800'
      },
      process: {
        label: 'Process',
        description: 'Living sequence of transformations',
        placeholder: 'Describe the process...',
        color: 'bg-teal-100 text-teal-800'
      },
      procedure: {
        label: 'Procedure',
        description: 'Detailed choreography of specific actions',
        placeholder: 'Outline the procedure...',
        color: 'bg-cyan-100 text-cyan-800'
      },
      event: {
        label: 'Event',
        description: 'Relevant state change',
        placeholder: 'Describe the event...',
        color: 'bg-red-100 text-red-800'
      },
      result: {
        label: 'Result',
        description: 'Desired effect of a flow or process',
        placeholder: 'Define the expected result...',
        color: 'bg-emerald-100 text-emerald-800'
      },
      observation: {
        label: 'Observation',
        description: 'Record of perceptual fact or narrative',
        placeholder: 'Record the observation...',
        color: 'bg-slate-100 text-slate-800'
      },
      evaluation: {
        label: 'Evaluation',
        description: 'How fulfillment is recognized',
        placeholder: 'Define evaluation criteria...',
        color: 'bg-violet-100 text-violet-800'
      },
      indicator: {
        label: 'Indicator',
        description: 'Data story for inferring progress',
        placeholder: 'Define the indicator...',
        color: 'bg-rose-100 text-rose-800'
      },
      area: {
        label: 'Area',
        description: 'Operational domain with its own identity',
        placeholder: 'Describe the area...',
        color: 'bg-amber-100 text-amber-800'
      },
      authority: {
        label: 'Authority',
        description: 'Source of legitimacy',
        placeholder: 'Define the authority...',
        color: 'bg-lime-100 text-lime-800'
      },
      reference: {
        label: 'Reference',
        description: 'External reference or source',
        placeholder: 'Provide the reference...',
        color: 'bg-fuchsia-100 text-fuchsia-800'
      }
    };
    
    return configs[type] || configs.purpose;
  };

  const typeConfig = getTypeConfig(formData.type as ArtifactType);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New Artifact' : 'Edit Artifact'}
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeConfig.color}`}>
          {typeConfig.label}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Artifact Type" required error={errors.type}>
          <select
            value={formData.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            disabled={mode === 'edit'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {ARTIFACT_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Name" required error={errors.name}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Enter artifact name..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </FormField>

        <FormField label="Description" error={errors.description}>
          <textarea
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder={typeConfig.description}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </FormField>

        <FormField label="Purpose" required error={errors.purpose}>
          <textarea
            value={formData.purpose}
            onChange={(e) => handleFieldChange('purpose', e.target.value)}
            placeholder={typeConfig.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Context">
            <textarea
              value={formData.context}
              onChange={(e) => handleFieldChange('context', e.target.value)}
              placeholder="Where, when, and for whom this applies..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </FormField>

          <FormField label="Authority">
            <input
              type="text"
              value={formData.authority}
              onChange={(e) => handleFieldChange('authority', e.target.value)}
              placeholder="Source of legitimacy..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </FormField>
        </div>

        <FormField label="Evaluation">
          <textarea
            value={formData.evaluation}
            onChange={(e) => handleFieldChange('evaluation', e.target.value)}
            placeholder="How fulfillment is recognized..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </FormField>

        <FormField label="Tags">
          <input
            type="text"
            value={formData.tags?.join(', ') || ''}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Enter tags separated by commas..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </FormField>

        {isValidating && (
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Validating...
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || Object.keys(errors).length > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : mode === 'create' ? 'Create Artifact' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtifactEditor;