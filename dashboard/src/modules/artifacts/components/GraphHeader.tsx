import React from 'react'

interface GraphHeaderProps {
    artifactCount: number
    temporalArtifactCount: number
    selectedCount?: number
}

export const GraphHeader: React.FC<GraphHeaderProps> = ({
    artifactCount,
    temporalArtifactCount,
    selectedCount = 0,
}) => {
    return (
        <div className="p-4 border-b border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-2">
                Grafo de Artefactos
            </h3>
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg text-sm w-fit">
                <span className="font-semibold text-blue-400">
                    {artifactCount}
                </span>
                <span className="text-slate-300">artefactos en el grafo</span>
                {temporalArtifactCount > 0 && (
                    <>
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-yellow-400">
                            {temporalArtifactCount}
                        </span>
                        <span className="text-slate-300">temporales</span>
                    </>
                )}
                {selectedCount > 0 && (
                    <>
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-green-400">
                            {selectedCount}
                        </span>
                        <span className="text-slate-300">seleccionados</span>
                    </>
                )}
            </div>
        </div>
    )
}
