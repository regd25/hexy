import React from 'react'
import { useArtifactStore } from '../../stores/artifactStore'
import { useNotifications } from '../../hooks/useNotifications'
import { ArtifactType } from '../../types/Artifact'

export const NavigatorContainer: React.FC = () => {
    const {
        searchQuery,
        setSearchQuery,
        selectedType,
        setSelectedType,
        getArtifactCount,
        getFilteredCount,
    } = useArtifactStore()

    const { showInfo } = useNotifications()

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value as ArtifactType)
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedType('all')
        showInfo('Filtros limpiados')
    }

    return (
        <div className="navigator">
            <div className="navigator-header">
                <h3>Navegador</h3>
                <div className="artifact-count">
                    {getFilteredCount()} / {getArtifactCount()} artefactos
                </div>
            </div>

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Buscar artefactos..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            <div className="filter-section">
                <select
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="type-filter"
                >
                    <option value="all">Todos los tipos</option>
                    <option value="purpose">Propósito</option>
                    <option value="vision">Visión</option>
                    <option value="policy">Política</option>
                    <option value="principle">Principio</option>
                    <option value="guideline">Guía</option>
                    <option value="context">Contexto</option>
                    <option value="actor">Actor</option>
                    <option value="concept">Concepto</option>
                    <option value="process">Proceso</option>
                    <option value="procedure">Procedimiento</option>
                    <option value="event">Evento</option>
                    <option value="result">Resultado</option>
                    <option value="observation">Observación</option>
                    <option value="evaluation">Evaluación</option>
                    <option value="indicator">Indicador</option>
                    <option value="area">Área</option>
                    <option value="authority">Autoridad</option>
                    <option value="reference">Referencia</option>
                </select>

                <button onClick={handleClearFilters} className="btn btn-clear">
                    Limpiar
                </button>
            </div>

            <div className="artifact-list">
                <p className="placeholder-text">
                    Lista de artefactos - En desarrollo
                </p>
            </div>
        </div>
    )
}
