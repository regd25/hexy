/** Ensamblado de la app vanilla: navbar + sidebar + grafo (header + canvas). */
import { subscribe, getState, actions } from './state/store.js'
import { showError } from './notifications.js'
import { createNavbar } from './components/navbar.js'
import { createList } from './components/list.js'
import { createHeader } from './components/header.js'
import { createCanvas } from './graph/canvas.js'
import { createAuthoringFlow } from './editors/flow.js'
import { importFromLocalStorage } from './migrate.js'

export function mountApp(root) {
    root.innerHTML = ''
    const app = document.createElement('div')
    app.className = 'app'

    const navbar = createNavbar({ onImport: importFromLocalStorage })
    const dashboard = document.createElement('div')
    dashboard.className = 'dashboard'

    const list = createList()

    const graphPanel = document.createElement('div')
    graphPanel.className = 'panel graph'
    const header = createHeader()
    const canvasWrap = document.createElement('div')
    canvasWrap.className = 'canvas-wrap'

    // El canvas y el flujo de autoría se referencian mutuamente; se enlazan tras crearse.
    let flow
    const canvas = createCanvas({
        onCreateAt: (x, y) => flow.startCreate(x, y),
        onOpenEditor: (artifact) => flow.openEditor(artifact),
        getActiveArtifactId: () => flow?.activeArtifactId() ?? null,
    })
    flow = createAuthoringFlow({ canvasEl: canvas.el, requestCanvasRender: () => canvas.render() })

    canvasWrap.appendChild(canvas.el)
    graphPanel.append(header.el, canvasWrap)
    dashboard.append(list.el, graphPanel)
    app.append(navbar.el, dashboard)
    root.appendChild(app)

    // Re-render reactivo en cada cambio del store.
    subscribe((state) => {
        header.render(state)
        list.render(state)
        canvas.render()
    })

    // Carga inicial.
    actions.loadAll().catch((err) => showError(`Error al cargar artefactos: ${err.message}`))

    // Primer pintado con estado vacío.
    const s = getState()
    header.render(s)
    list.render(s)
    canvas.render()
}
