import React from 'react'

export interface ModelValidity {
    isValid: boolean
    errorCount: number
}

interface GraphHeaderProps {
    artifactCount: number
    temporalArtifactCount: number
    selectedCount?: number
    validity?: ModelValidity
    onExport?: () => void
}

export const GraphHeader: React.FC<GraphHeaderProps> = ({
    artifactCount,
    temporalArtifactCount,
    selectedCount = 0,
    validity,
    onExport,
}) => {
    return (
        <div className="p-4 border-b border-slate-600">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Grafo de Artefactos</h3>
                <div className="flex items-center gap-2">
                    {validity && artifactCount > 0 && (
                        <span
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                                validity.isValid
                                    ? 'bg-green-500/15 text-green-400'
                                    : 'bg-red-500/15 text-red-400'
                            }`}
                            title="Validación semántica SOL (eval gate) en vivo"
                        >
                            <span className={`w-2 h-2 rounded-full ${validity.isValid ? 'bg-green-400' : 'bg-red-400'}`} />
                            {validity.isValid
                                ? 'Modelo válido'
                                : `${validity.errorCount} ${validity.errorCount === 1 ? 'error' : 'errores'}`}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onExport}
                        disabled={!onExport || artifactCount === 0}
                        className="px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Exportar el modelo a un archivo .sop (validado)"
                    >
                        Export .sop
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg text-sm w-fit">
                <span className="font-semibold text-blue-400">{artifactCount}</span>
                <span className="text-slate-300">artefactos en el grafo</span>
                {temporalArtifactCount > 0 && (
                    <>
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-yellow-400">{temporalArtifactCount}</span>
                        <span className="text-slate-300">temporales</span>
                    </>
                )}
                {selectedCount > 0 && (
                    <>
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-green-400">{selectedCount}</span>
                        <span className="text-slate-300">seleccionados</span>
                    </>
                )}
            </div>
        </div>
    )
}
