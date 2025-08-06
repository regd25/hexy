/**
 * Artifact Store - Zustand store for artifact state management
 * Restored original functionality that worked
 */

import { create } from 'zustand'
import { Artifact, ArtifactType } from '../shared/types/Artifact'

interface ArtifactStore {
    // State
    artifacts: Artifact[]
    selectedArtifact: Artifact | null
    searchQuery: string
    selectedType: ArtifactType | 'all'
    isLoading: boolean

    // Actions
    setArtifacts: (artifacts: Artifact[]) => void
    addArtifact: (artifact: Artifact) => void
    updateArtifact: (id: string, updates: Partial<Artifact>) => void
    deleteArtifact: (id: string) => void
    selectArtifact: (artifact: Artifact | null) => void
    setSearchQuery: (query: string) => void
    setSelectedType: (type: ArtifactType | 'all') => void
    setLoading: (loading: boolean) => void

    // Computed values
    getFilteredArtifacts: () => Artifact[]
    getArtifactCount: () => number
    getFilteredCount: () => number
    
    // Validation (simplified)
    validateArtifact: (artifact: Partial<Artifact>) => string[]
}

export const useArtifactStore = create<ArtifactStore>((set, get) => ({
    // Initial state
    artifacts: [],
    selectedArtifact: null,
    searchQuery: '',
    selectedType: 'all',
    isLoading: false,

    // Actions
    setArtifacts: (artifacts) => set({ artifacts }),
    
    addArtifact: (artifact) => set((state) => ({
        artifacts: [...state.artifacts, artifact]
    })),
    
    updateArtifact: (id, updates) => set((state) => ({
        artifacts: state.artifacts.map(artifact =>
            artifact.id === id ? { ...artifact, ...updates } : artifact
        )
    })),
    
    deleteArtifact: (id) => set((state) => ({
        artifacts: state.artifacts.filter(artifact => artifact.id !== id),
        selectedArtifact: state.selectedArtifact?.id === id ? null : state.selectedArtifact
    })),
    
    selectArtifact: (artifact) => set({ selectedArtifact: artifact }),
    
    setSearchQuery: (query) => set({ searchQuery: query }),
    
    setSelectedType: (type) => set({ selectedType: type }),
    
    setLoading: (loading) => set({ isLoading: loading }),

    // Computed values
    getFilteredArtifacts: () => {
        const { artifacts, searchQuery, selectedType } = get()
        
        return artifacts.filter(artifact => {
            const matchesSearch = !searchQuery || 
                artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                artifact.description.toLowerCase().includes(searchQuery.toLowerCase())
            
            const matchesType = selectedType === 'all' || artifact.type === selectedType
            
            return matchesSearch && matchesType
        })
    },
    
    getArtifactCount: () => get().artifacts.length,
    
    getFilteredCount: () => get().getFilteredArtifacts().length,

    // Simple validation
    validateArtifact: (artifact) => {
        const errors: string[] = []
        
        if (!artifact.name || artifact.name.trim().length === 0) {
            errors.push('El nombre es requerido')
        }
        
        if (!artifact.type) {
            errors.push('El tipo es requerido')
        }
        
        if (!artifact.description || artifact.description.trim().length < 10) {
            errors.push('La descripción debe tener al menos 10 caracteres')
        }
        
        return errors
    }
}))