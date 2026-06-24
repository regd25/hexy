/** Barra superior con marca y acción de importar datos de localStorage al backend. */
export function createNavbar({ onImport }) {
    const el = document.createElement('nav')
    el.className = 'navbar'
    el.innerHTML = `
        <div class="navbar__brand">HEXY<span>·</span>dashboard</div>
        <div class="navbar__actions">
            <button class="btn btn--ghost" data-import title="Migrar artefactos guardados en este navegador (localStorage) al backend">
                Importar de localStorage
            </button>
        </div>
    `
    el.querySelector('[data-import]').addEventListener('click', () => onImport?.())
    return { el }
}
