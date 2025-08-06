import React from 'react'
import { useArtifactStore } from '../../../stores/artifactStore'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { ArtifactType } from '../../../shared/types/Artifact'

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
        <div className="w-80 bg-slate-800 border-r border-slate-600 flex flex-col">
            <div className="p-4 border-b border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-2">Navegador</h3>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg text-sm">
                    <span className="font-semibold text-blue-400">{getFilteredCount()}</span> 
                    <span className="text-slate-300">/ {getArtifactCount()} artefactos</span>
                </div>
            </div>

            <div className="p-4">
                <input
                    type="text"
                    placeholder="Buscar artefactos..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="px-4 pb-4 flex gap-2">
                <select
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

                <button 
                    onClick={handleClearFilters} 
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                >
                    Limpiar
                </button>
            </div>

            <div className="flex-1 p-4">
                <p className="text-slate-400 text-center">
                    Lista de artefactos - En desarrollo
                </p>
            </div>
        </div>
    )
}
