import { create } from 'zustand'
import { Artifact, ArtifactType } from '../types/Artifact'

interface ArtifactStore {
    artifacts: Artifact[]
    selectedArtifact: Artifact | null
    filteredArtifacts: Artifact[]
    searchQuery: string
    selectedType: ArtifactType | 'all'
    addArtifact: (artifact: Artifact) => void
    updateArtifact: (id: string, updates: Partial<Artifact>) => void
    deleteArtifact: (id: string) => void
    selectArtifact: (artifact: Artifact | null) => void
    setSearchQuery: (query: string) => void
    setSelectedType: (type: ArtifactType | 'all') => void
    filterArtifacts: (artifactsToFilter?: Artifact[]) => Artifact[]
    clearFilters: () => void
    getArtifactById: (id: string) => Artifact | undefined
    getArtifactsByType: (type: ArtifactType) => Artifact[]
    getArtifactCount: () => number
    getFilteredCount: () => number
}

export const useArtifactStore = create<ArtifactStore>((set, get) => ({
    artifacts: [],
    selectedArtifact: null,
    filteredArtifacts: [],
    searchQuery: '',
    selectedType: 'all',

    addArtifact: artifact =>
        set(state => {
            // Check if artifact with same ID already exists
            const existingArtifact = state.artifacts.find(a => a.id === artifact.id)
            if (existingArtifact) {
                console.warn(`Artifact with ID ${artifact.id} already exists. Skipping addition.`)
                return state
            }
            
            const newArtifacts = [...state.artifacts, artifact]
            return {
                artifacts: newArtifacts,
                filteredArtifacts: get().filterArtifacts(newArtifacts),
            }
        }),

    updateArtifact: (id, updates) =>
        set(state => {
            const updatedArtifacts = state.artifacts.map(a =>
                a.id === id ? { ...a, ...updates } : a
            )
            return {
                artifacts: updatedArtifacts,
                filteredArtifacts: get().filterArtifacts(updatedArtifacts),
                selectedArtifact:
                    state.selectedArtifact?.id === id
                        ? { ...state.selectedArtifact, ...updates }
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
