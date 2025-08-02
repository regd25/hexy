import React from 'react'
import { Artifact } from '../../types/Artifact'

interface AutocompleteDropdownProps {
    query: string
    artifacts: Artifact[]
    onSelect: (artifact: Artifact) => void
    position: { x: number; y: number }
    visible: boolean
}

export const AutocompleteDropdown: React.FC<AutocompleteDropdownProps> = ({
    query,
    artifacts,
    onSelect,
    position,
    visible,
}) => {
    if (!visible || artifacts.length === 0) return null

    const filteredArtifacts = artifacts
        .filter(
            artifact =>
                artifact.name.toLowerCase().includes(query.toLowerCase()) ||
                artifact.id.toLowerCase().includes(query.toLowerCase()) ||
                artifact.type.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)

    if (filteredArtifacts.length === 0) {
        return (
            <div
                className="autocomplete-dropdown no-results"
                style={{
                    left: position.x,
                    top: position.y,
                    display: visible ? 'block' : 'none',
                }}
            >
                <div className="autocomplete-item disabled">
                    <span>No se encontraron artefactos</span>
                </div>
            </div>
        )
    }

    return (
        <div
            className="autocomplete-dropdown"
            style={{
                left: position.x,
                top: position.y,
                display: visible ? 'block' : 'none',
            }}
        >
            {filteredArtifacts.map(artifactItem => (
                <div
                    key={artifactItem.id}
                    className="autocomplete-item"
                    onClick={() => onSelect(artifactItem)}
                >
                    <div className="autocomplete-item-content">
                        <span className="artifact-name">{artifactItem.name}</span>
                        <span className="artifact-type">{artifactItem.type}</span>
                    </div>
                    <div className="autocomplete-item-preview">
                        {artifactItem.description.length > 50
                            ? `${artifactItem.description.substring(0, 50)}...`
                            : artifactItem.description}
                    </div>
                </div>
            ))}
        </div>
    )
}
