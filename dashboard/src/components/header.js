/** Cabecera del grafo: título, badge de validez (eval gate SOL), contadores, import y export. */
import { api } from '../api/client.js'
import { actions, getState } from '../state/store.js'
import { showSuccess, showError } from '../notifications.js'

export function createHeader() {
    const el = document.createElement('div')
    el.className = 'graph__header'
    el.innerHTML = `
        <div class="graph__header-top">
            <h3 class="graph__title">Grafo de Artefactos</h3>
            <div class="graph__header-actions">
                <span class="badge-validity" data-validity hidden>
                    <span class="badge-validity__dot"></span><span data-validity-text></span>
                </span>
                <button class="btn" data-import title="Importar un .yaml SOL y reconstruir el grafo">Import .yaml</button>
                <button class="btn btn--primary" data-export>Export .yaml</button>
                <input type="file" accept=".yaml,.yml,.txt" data-import-file hidden />
            </div>
        </div>
        <div class="graph__counts" data-counts></div>
    `

    const badge = el.querySelector('[data-validity]')
    const badgeText = el.querySelector('[data-validity-text]')
    const counts = el.querySelector('[data-counts]')
    const exportBtn = el.querySelector('[data-export]')
    const importBtn = el.querySelector('[data-import]')
    const importFile = el.querySelector('[data-import-file]')

    importBtn.addEventListener('click', () => importFile.click())
    importFile.addEventListener('change', async () => {
        const file = importFile.files?.[0]
        if (!file) return
        try {
            const yaml = await file.text()
            // Si ya hay modelo, preguntar si reemplazar o fusionar.
            let mode = 'merge'
            if (getState().artifacts.length > 0) {
                mode = window.confirm(
                    'Ya hay artefactos en el grafo.\n\nAceptar = reemplazar el modelo actual.\nCancelar = fusionar con lo importado.'
                )
                    ? 'replace'
                    : 'merge'
            }
            const result = await api.solImport(yaml, mode)
            await actions.loadAll()
            const extra = result.unresolved.length > 0 ? ` · ${result.unresolved.length} referencia(s) sin resolver` : ''
            showSuccess(`Importados ${result.artifacts} artefactos y ${result.relationships} relaciones${extra}`)
        } catch (err) {
            showError(`Error al importar: ${err.message}`)
        } finally {
            importFile.value = ''
        }
    })

    exportBtn.addEventListener('click', async () => {
        try {
            const result = await api.solValidate()
            if (!result.isValid) {
                const first = result.errors
                    .filter((e) => e.severity === 'error')
                    .slice(0, 3)
                    .map((e) => `L${e.line}: ${e.message}`)
                    .join(' · ')
                showError(`Export bloqueado — el modelo no pasa el eval gate: ${first}`)
                return
            }
            const yaml = await api.solYaml()
            const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'model.yaml'
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
            showSuccess('Modelo exportado a model.yaml (válido)')
        } catch (err) {
            showError(`Error al exportar: ${err.message}`)
        }
    })

    function render(state) {
        const artifactCount = state.artifacts.length
        const temporalCount = state.temporals.length
        const selectedCount = state.selectedIds.size

        exportBtn.disabled = artifactCount === 0

        if (artifactCount > 0) {
            badge.hidden = false
            badge.classList.toggle('badge-validity--ok', state.validity.isValid)
            badge.classList.toggle('badge-validity--err', !state.validity.isValid)
            badgeText.textContent = state.validity.isValid
                ? 'Modelo válido'
                : `${state.validity.errorCount} ${state.validity.errorCount === 1 ? 'error' : 'errores'}`
        } else {
            badge.hidden = true
        }

        let html = `<span><b>${artifactCount}</b></span><span>artefactos en el grafo</span>`
        if (temporalCount > 0) html += `<span class="sep">|</span><b class="c-temp">${temporalCount}</b><span>temporales</span>`
        if (selectedCount > 0) html += `<span class="sep">|</span><b class="c-sel">${selectedCount}</b><span>seleccionados</span>`
        counts.innerHTML = html
    }

    return { el, render }
}
