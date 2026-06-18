import { ARTIFACT_TYPES_LABELS, ArtifactType, ArtifactMetadata } from '@shared'
import { createDefaultVisualizationProperties, VisualArtifact } from '../types/VisualArtifact'
import { ArtifactAdapter } from '@shared'

export interface ArtifactFormData {
    name: string
    type: ArtifactType
    description: string
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

export class ArtifactEditorService {

    static getArtifactTypes(): { value: ArtifactType; label: string }[] {
        return Object.entries(ARTIFACT_TYPES_LABELS).map((entry) => ({
            value: entry[0] as ArtifactType,
            label: entry[1],
        }))
    }

    static generateId(): string {
        return `artifact-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }

    static validateFormData(data: ArtifactFormData): ValidationResult {
        const errors: string[] = []

        if (!data.name.trim()) {
            errors.push('El nombre del artefacto es requerido')
        } else if (data.name.trim().length < 3) {
            errors.push('El nombre del artefacto debe tener al menos 3 caracteres')
        }

        if (!data.type) {
            errors.push('El tipo de artefacto es requerido')
        }

        if (data.description.trim().length > 1000) {
            errors.push('La descripción no puede exceder 1000 caracteres')
        }

        return {
            isValid: errors.length === 0,
            errors,
        }
    }

    static createArtifactFromFormData(formData: ArtifactFormData, existingArtifact?: VisualArtifact): VisualArtifact {
        return {
            id: existingArtifact?.id || this.generateId(),
            name: formData.name.trim(),
            type: formData.type,
            description: formData.description.trim(),
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: ArtifactAdapter.createDefaultArtifactMetadata() as ArtifactMetadata,
            visualProperties: createDefaultVisualizationProperties(formData.type, 100, 100),
            coordinates: { x: 100, y: 100 },
            relationships: [],
        }
    }

    static hasUnsavedChanges(formData: ArtifactFormData, originalArtifact?: VisualArtifact): boolean {
        if (!originalArtifact) {
            return formData.name.trim() !== '' || formData.description.trim() !== ''
        }

        return (
            formData.name.trim() !== originalArtifact.name ||
            formData.type !== originalArtifact.type ||
            formData.description.trim() !== originalArtifact.description
        )
    }

    static shouldShowCancelConfirmation(formData: ArtifactFormData, originalArtifact?: VisualArtifact): boolean {
        return this.hasUnsavedChanges(formData, originalArtifact)
    }
}
