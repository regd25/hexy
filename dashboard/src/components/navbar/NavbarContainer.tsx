import { useNotifications } from '../../hooks/useNotifications'

export const NavbarContainer: React.FC = () => {
    const { showSuccess } = useNotifications()

    const handleNewArtifact = () => {
        showSuccess('Función de nuevo artefacto - En desarrollo')
    }

    const handleExport = () => {
        showSuccess('Función de exportación - En desarrollo')
    }

    const handleImport = () => {
        showSuccess('Función de importación - En desarrollo')
    }

    return (
        <header className="bg-slate-800 border-b border-slate-600 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-blue-400">Hexy Dashboard</h1>
                    <span className="text-slate-400 font-medium">Framework Semántico</span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleNewArtifact} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Nuevo Artefacto
                    </button>
                    <button 
                        onClick={handleExport} 
                        className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Exportar
                    </button>
                    <button 
                        onClick={handleImport} 
                        className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Importar
                    </button>
                </div>
            </div>
        </header>
    )
}
