import { Artifact, ArtifactType } from '../../../shared/types/Artifact'

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
    private static readonly ARTIFACT_TYPES: { value: ArtifactType; label: string }[] = [
        { value: 'purpose', label: 'Propósito' },
        { value: 'vision', label: 'Visión' },
        { value: 'policy', label: 'Política' },
        { value: 'principle', label: 'Principio' },
        { value: 'guideline', label: 'Guía' },
        { value: 'context', label: 'Contexto' },
        { value: 'actor', label: 'Actor' },
        { value: 'concept', label: 'Concepto' },
        { value: 'process', label: 'Proceso' },
        { value: 'procedure', label: 'Procedimiento' },
        { value: 'event', label: 'Evento' },
        { value: 'result', label: 'Resultado' },
        { value: 'observation', label: 'Observación' },
        { value: 'evaluation', label: 'Evaluación' },
        { value: 'indicator', label: 'Indicador' },
        { value: 'area', label: 'Área' },
        { value: 'authority', label: 'Autoridad' },
        { value: 'reference', label: 'Referencia' },
    ]

    static getArtifactTypes(): { value: ArtifactType; label: string }[] {
        return this.ARTIFACT_TYPES
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

    static createArtifactFromFormData(formData: ArtifactFormData, existingArtifact?: Artifact): Artifact {
        return {
            id: existingArtifact?.id || this.generateId(),
            name: formData.name.trim(),
            type: formData.type,
            description: formData.description.trim(),
            info: formData.description.trim(),
            x: existingArtifact?.x || 100,
            y: existingArtifact?.y || 100,
            vx: 0,
            vy: 0,
            fx: null,
            fy: null,
        }
    }

    static hasUnsavedChanges(formData: ArtifactFormData, originalArtifact?: Artifact): boolean {
        if (!originalArtifact) {
            return formData.name.trim() !== '' || formData.description.trim() !== ''
        }

        return (
            formData.name.trim() !== originalArtifact.name ||
            formData.type !== originalArtifact.type ||
            formData.description.trim() !== originalArtifact.description
        )
    }

    static shouldShowCancelConfirmation(formData: ArtifactFormData, originalArtifact?: Artifact): boolean {
        return this.hasUnsavedChanges(formData, originalArtifact)
    }
}
