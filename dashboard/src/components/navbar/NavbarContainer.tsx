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
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>Hexy Dashboard</h1>
            </div>
            <div className="navbar-actions">
                <button onClick={handleNewArtifact} className="btn btn-primary">
                    Nuevo Artefacto
                </button>
                <button onClick={handleExport} className="btn btn-secondary">
                    Exportar
                </button>
                <button onClick={handleImport} className="btn btn-secondary">
                    Importar
                </button>
            </div>
        </nav>
    )
}
