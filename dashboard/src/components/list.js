/** Barra lateral: lista de artefactos con búsqueda por texto y filtro por tipo. */
import { ARTIFACT_FILTER_OPTIONS } from '../constants.js'
import { openRunPanel } from './runPanel.js'

export function createList() {
    const el = document.createElement('div')
    el.className = 'panel sidebar'
    el.innerHTML = `
        <div class="sidebar__filters">
            <input class="input" type="text" placeholder="Buscar por nombre, descripción o tags" data-search />
            <select class="select select--sm" data-type></select>
        </div>
        <div class="list" data-list></div>
    `

    const search = el.querySelector('[data-search]')
    const typeSel = el.querySelector('[data-type]')
    const listEl = el.querySelector('[data-list]')

    for (const opt of ARTIFACT_FILTER_OPTIONS) {
        const o = document.createElement('option')
        o.value = opt.value
        o.textContent = opt.label
        typeSel.appendChild(o)
    }

    let query = ''
    let type = 'all'
    let lastState = { artifacts: [] }

    search.addEventListener('input', () => {
        query = search.value
        render(lastState)
    })
    typeSel.addEventListener('change', () => {
        type = typeSel.value
        render(lastState)
    })

    function render(state) {
        lastState = state
        const byType = type === 'all' ? state.artifacts : state.artifacts.filter((a) => a.type === type)
        const q = query.trim().toLowerCase()
        const filtered = !q
            ? byType
            : byType.filter(
                  (a) =>
                      a.name.toLowerCase().includes(q) ||
                      (a.description ?? '').toLowerCase().includes(q) ||
                      (a.semanticMetadata?.semanticTags ?? []).some((t) => t.toLowerCase().includes(q))
              )

        if (filtered.length === 0) {
            listEl.innerHTML = `<div class="list__empty">Sin resultados</div>`
            return
        }

        listEl.innerHTML = ''
        for (const a of filtered) {
            const item = document.createElement('div')
            item.className = 'list__item'
            const tags = (a.semanticMetadata?.semanticTags ?? []).slice(0, 4)
            item.innerHTML = `
                <div>
                    <div class="list__name"></div>
                    <div class="list__desc"></div>
                    <div class="list__tags"></div>
                </div>
                <div class="list__side">
                    <span class="tag" data-type></span>
                </div>
            `
            item.querySelector('.list__name').textContent = a.name
            item.querySelector('.list__desc').textContent = a.description ?? ''
            item.querySelector('[data-type]').textContent = a.type

            // F4: los Process son ejecutables — botón ▶ Run que abre el panel de traza.
            if (a.type === 'process') {
                const runBtn = document.createElement('button')
                runBtn.className = 'btn btn--run'
                runBtn.textContent = '▶ Run'
                runBtn.title = 'Correr este proceso con el HarnessRuntime'
                runBtn.addEventListener('click', () => openRunPanel(a))
                item.querySelector('.list__side').appendChild(runBtn)
            }
            const tagsEl = item.querySelector('.list__tags')
            for (const t of tags) {
                const span = document.createElement('span')
                span.className = 'tag'
                span.textContent = `#${t}`
                tagsEl.appendChild(span)
            }
            listEl.appendChild(item)
        }
    }

    return { el, render }
}
