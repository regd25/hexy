import { create } from 'zustand'
import { Artifact, ArtifactType, TemporalArtifact } from '../types/Artifact'

interface ArtifactStore {
    artifacts: Artifact[]
    temporalArtifacts: TemporalArtifact[]
    selectedArtifact: Artifact | null
    filteredArtifacts: Artifact[]
    searchQuery: string
    selectedType: ArtifactType | 'all'
    addArtifact: (artifact: Artifact) => void
    addTemporalArtifact: (
        artifact: Omit<
            TemporalArtifact,
            'id' | 'isTemporary' | 'createdAt' | 'status'
        >
    ) => TemporalArtifact
    updateTemporalArtifact: (
        id: string,
        updates: Partial<TemporalArtifact>
    ) => void
    commitTemporalArtifact: (id: string) => Artifact | null
    discardTemporalArtifact: (id: string) => void
    updateArtifact: (id: string, updates: Partial<Artifact>) => void
    deleteArtifact: (id: string) => void
    selectArtifact: (artifact: Artifact | null) => void
    setSearchQuery: (query: string) => void
    setSelectedType: (type: ArtifactType | 'all') => void
    filterArtifacts: (artifactsToFilter?: Artifact[]) => Artifact[]
    clearFilters: () => void
    getArtifactById: (id: string) => Artifact | undefined
    getTemporalArtifactById: (id: string) => TemporalArtifact | undefined
    getArtifactsByType: (type: ArtifactType) => Artifact[]
    getArtifactCount: () => number
    getFilteredCount: () => number
    validateArtifact: (artifact: Partial<Artifact>) => string[]
    generateUniqueId: (name: string) => string
    validateName: (name: string) => string[]
}

export const useArtifactStore = create<ArtifactStore>((set, get) => ({
    artifacts: [],
    temporalArtifacts: [],
    selectedArtifact: null,
    filteredArtifacts: [],
    searchQuery: '',
    selectedType: 'all',

    addArtifact: artifact => {
        // Validate before adding
        const validationErrors = get().validateArtifact(artifact)
        if (validationErrors.length > 0) {
            console.warn(`Validation errors for new artifact:`, validationErrors)
            return // Don't add if validation fails
        }

        set(state => {
            // Check if artifact with same ID already exists
            const existingArtifact = state.artifacts.find(
                a => a.id === artifact.id
            )
            if (existingArtifact) {
                console.warn(
                    `Artifact with ID ${artifact.id} already exists. Skipping addition.`
                )
                return state
            }

            const newArtifacts = [...state.artifacts, artifact]
            return {
                artifacts: newArtifacts,
                filteredArtifacts: get().filterArtifacts(newArtifacts),
            }
        })
    },

    addTemporalArtifact: artifactData => {
        const temporalId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        const temporalArtifact: TemporalArtifact = {
            ...artifactData,
            id: temporalId,
            isTemporary: true,
            createdAt: Date.now(),
            status: 'creating',
            validationErrors: [],
        }

        set(state => ({
            temporalArtifacts: [...state.temporalArtifacts, temporalArtifact],
        }))

        return temporalArtifact
    },

    updateTemporalArtifact: (id, updates) =>
        set(state => ({
            temporalArtifacts: state.temporalArtifacts.map(a =>
                a.id === id ? { ...a, ...updates } : a
            ),
        })),

    commitTemporalArtifact: id => {
        const state = get()
        const temporalArtifact = state.temporalArtifacts.find(a => a.id === id)

        if (!temporalArtifact) return null

        // Only validate the name for committing (not the entire artifact)
        const nameErrors = get().validateName(temporalArtifact.name)
        if (nameErrors.length > 0) {
            set(state => ({
                temporalArtifacts: state.temporalArtifacts.map(a =>
                    a.id === id
                        ? { ...a, status: 'error', validationErrors: nameErrors }
                        : a
                ),
            }))
            return null
        }

        // Convert to permanent artifact
        const {
            isTemporary,
            createdAt,
            status,
            validationErrors: _,
            ...artifactData
        } = temporalArtifact
        const permanentArtifact: Artifact = {
            ...artifactData,
            id: get().generateUniqueId(temporalArtifact.name),
        }

        // Remove from temporal and add to permanent
        set(state => ({
            temporalArtifacts: state.temporalArtifacts.filter(a => a.id !== id),
            artifacts: [...state.artifacts, permanentArtifact],
            filteredArtifacts: get().filterArtifacts([
                ...state.artifacts,
                permanentArtifact,
            ]),
        }))

        return permanentArtifact
    },

    discardTemporalArtifact: id =>
        set(state => ({
            temporalArtifacts: state.temporalArtifacts.filter(a => a.id !== id),
        })),

    validateArtifact: artifact => {
        const errors: string[] = []

        if (!artifact.name || artifact.name.trim().length === 0) {
            errors.push('El nombre del artefacto es requerido')
        }

        if (artifact.name && artifact.name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres')
        }

        if (!artifact.type) {
            errors.push('El tipo de artefacto es requerido')
        }

        return errors
    },

    validateName: (name: string) => {
        const errors: string[] = []

        if (!name || name.trim().length === 0) {
            errors.push('El nombre del artefacto es requerido')
        }

        if (name && name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres')
        }

        if (name && name.trim().length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres')
        }

        return errors
    },

    generateUniqueId: (name: string): string => {
        const baseId = name.replace(/\s+/g, '').toLowerCase()
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        return `${baseId}-${timestamp}-${random}`
    },

    updateArtifact: (id, updates) =>
        set(state => {
            const artifactToUpdate = state.artifacts.find(a => a.id === id)
            if (!artifactToUpdate) return state

            const updatedArtifact = { ...artifactToUpdate, ...updates }
            
            // Validate the updated artifact
            const validationErrors = get().validateArtifact(updatedArtifact)
            if (validationErrors.length > 0) {
                console.warn(`Validation errors for artifact ${id}:`, validationErrors)
                // Don't update if validation fails
                return state
            }

            const updatedArtifacts = state.artifacts.map(a =>
                a.id === id ? updatedArtifact : a
            )
            return {
                artifacts: updatedArtifacts,
                filteredArtifacts: get().filterArtifacts(updatedArtifacts),
                selectedArtifact:
                    state.selectedArtifact?.id === id
                        ? updatedArtifact
                        : state.selectedArtifact,
            }
        }),

    deleteArtifact: id =>
        set(state => {
            const filteredArtifacts = state.artifacts.filter(a => a.id !== id)
            return {
                artifacts: filteredArtifacts,
                filteredArtifacts: get().filterArtifacts(filteredArtifacts),
                selectedArtifact:
                    state.selectedArtifact?.id === id
                        ? null
                        : state.selectedArtifact,
            }
        }),

    selectArtifact: artifact => set({ selectedArtifact: artifact }),

    setSearchQuery: query =>
        set(state => ({
            searchQuery: query,
            filteredArtifacts: get().filterArtifacts(state.artifacts),
        })),

    setSelectedType: type =>
        set(state => ({
            selectedType: type,
            filteredArtifacts: get().filterArtifacts(state.artifacts),
        })),

    filterArtifacts: (artifactsToFilter?: Artifact[]) => {
        const state = get()
        const artifacts = artifactsToFilter || state.artifacts
        const { searchQuery, selectedType } = state

        let filtered = artifacts

        if (selectedType !== 'all') {
            filtered = filtered.filter(
                artifact => artifact.type === selectedType
            )
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                artifact =>
                    artifact.name.toLowerCase().includes(query) ||
                    artifact.description.toLowerCase().includes(query) ||
                    artifact.type.toLowerCase().includes(query)
            )
        }

        return filtered
    },

    clearFilters: () =>
        set(state => ({
            searchQuery: '',
            selectedType: 'all',
            filteredArtifacts: state.artifacts,
        })),

    getArtifactById: id => {
        return get().artifacts.find(artifact => artifact.id === id)
    },

    getTemporalArtifactById: id => {
        return get().temporalArtifacts.find(artifact => artifact.id === id)
    },

    getArtifactsByType: type => {
        return get().artifacts.filter(artifact => artifact.type === type)
    },

    getArtifactCount: () => {
        return get().artifacts.length
    },

    getFilteredCount: () => {
        return get().filteredArtifacts.length
    },
}))
