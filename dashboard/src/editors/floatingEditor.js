/**
 * Editor flotante para la descripción del artefacto (segundo paso del flujo). Incluye
 * selector de tipo y autocompletado de @menciones (referencias a otros artefactos).
 * Ctrl/Cmd+Enter guarda, Esc / clic fuera cancela.
 */

import { ARTIFACT_TYPE_OPTIONS } from '../constants.js'

let active = null

export function closeFloatingEditor() {
    active?.destroy()
    active = null
}

const MENTION_RE = /@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]*)$/
const sanitize = (s) => s.replace(/\s+/g, '')

/**
 * @param {object} opts
 * @param {{x:number,y:number}} opts.position
 * @param {string} opts.title
 * @param {string} [opts.subtitle]
 * @param {string} [opts.initialText]
 * @param {string} opts.typeValue
 * @param {(type:string)=>void} opts.onTypeChange
 * @param {(text:string)=>string[]} opts.validate   devuelve errores
 * @param {(text:string)=>void} opts.onSave
 * @param {()=>void} opts.onCancel
 * @param {()=>Array} opts.getArtifacts             para el autocompletado
 * @param {(query:string)=>void} [opts.onCreateMention]  Enter sin coincidencias
 */
export function openFloatingEditor(opts) {
    closeFloatingEditor()
    const {
        position,
        title,
        subtitle = 'Elige el tipo y describe el artefacto',
        initialText = '',
        typeValue,
        onTypeChange,
        validate = () => [],
        onSave,
        onCancel,
        getArtifacts,
        onCreateMention,
    } = opts

    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    overlay.addEventListener('click', () => doCancel())

    const panel = document.createElement('div')
    panel.className = 'floating-editor slide-up'
    const left = Math.max(10, Math.min(position.x - 140, window.innerWidth - 320))
    const top = Math.max(10, Math.min(position.y, window.innerHeight - 220))
    panel.style.left = `${left}px`
    panel.style.top = `${top}px`

    panel.innerHTML = `
        ${title ? `<div class="floating-editor__title"></div>` : ''}
        <div class="floating-editor__subtitle"></div>
        <textarea placeholder="Describe este artefacto… (Ctrl+Enter para guardar)"></textarea>
        <div class="floating-editor__errors"></div>
        <div class="floating-editor__footer">
            <label class="floating-editor__type">Tipo:
                <select class="select select--sm"></select>
            </label>
            <div class="floating-editor__actions">
                <button class="btn btn--ghost" data-act="cancel">Cancelar</button>
                <button class="btn btn--primary" data-act="save">Guardar</button>
            </div>
        </div>
    `
    if (title) panel.querySelector('.floating-editor__title').textContent = title
    panel.querySelector('.floating-editor__subtitle').textContent = subtitle

    const textarea = panel.querySelector('textarea')
    textarea.value = initialText
    const errorsEl = panel.querySelector('.floating-editor__errors')
    const select = panel.querySelector('select')
    const saveBtn = panel.querySelector('[data-act="save"]')

    for (const opt of ARTIFACT_TYPE_OPTIONS) {
        const o = document.createElement('option')
        o.value = opt.value
        o.textContent = opt.label
        if (opt.value === typeValue) o.selected = true
        select.appendChild(o)
    }
    select.addEventListener('change', () => onTypeChange?.(select.value))

    // --- validación ---
    const runValidate = () => {
        const errors = validate(textarea.value)
        errorsEl.innerHTML = errors.map((e) => `<div>• ${escapeHtml(e)}</div>`).join('')
        textarea.classList.toggle('invalid', errors.length > 0)
        saveBtn.disabled = errors.length > 0
        return errors
    }

    const doSave = () => {
        if (runValidate().length > 0) return
        onSave?.(textarea.value)
    }
    const doCancel = () => onCancel?.()

    saveBtn.addEventListener('click', doSave)
    panel.querySelector('[data-act="cancel"]').addEventListener('click', doCancel)

    // --- autocompletado @menciones ---
    let dropdown = null
    let acItems = []
    let acIndex = 0
    let acQuery = ''

    function closeDropdown() {
        dropdown?.remove()
        dropdown = null
        acItems = []
        acIndex = 0
    }

    function refreshAutocomplete() {
        const value = textarea.value
        const cursor = textarea.selectionStart
        const before = value.slice(0, cursor)
        const m = before.match(MENTION_RE)
        if (!m) {
            closeDropdown()
            return
        }
        acQuery = m[1].toLowerCase()
        const all = getArtifacts?.() ?? []
        acItems = all
            .filter((a) =>
                [a.name, a.id, a.type].some((v) => v && String(v).toLowerCase().includes(acQuery))
            )
            .slice(0, 8)
        acIndex = 0
        renderDropdown()
    }

    function renderDropdown() {
        closeDropdown()
        if (acItems.length === 0) return
        dropdown = document.createElement('div')
        dropdown.className = 'autocomplete-dropdown'
        const rect = textarea.getBoundingClientRect()
        dropdown.style.left = `${rect.left}px`
        dropdown.style.top = `${rect.bottom + 4}px`
        acItems.forEach((item, i) => {
            const row = document.createElement('div')
            row.className = 'autocomplete-item' + (i === acIndex ? ' autocomplete-item--active' : '')
            row.innerHTML = `<span class="autocomplete-item__name"></span><span class="autocomplete-item__meta"></span>`
            row.querySelector('.autocomplete-item__name').textContent = item.name
            row.querySelector('.autocomplete-item__meta').textContent = `${item.type} · ${item.id.slice(0, 8)}`
            row.addEventListener('mousedown', (e) => {
                e.preventDefault()
                insertReference(item)
            })
            dropdown.appendChild(row)
        })
        document.body.appendChild(dropdown)
    }

    function insertReference(item) {
        const value = textarea.value
        const cursor = textarea.selectionStart
        const before = value.slice(0, cursor)
        const trigger = before.lastIndexOf('@')
        if (trigger === -1) return
        const display = sanitize(item.name)
        const newValue = `${value.slice(0, trigger)}@${display} ${value.slice(cursor)}`
        textarea.value = newValue
        const pos = trigger + 1 + display.length + 1
        textarea.setSelectionRange(pos, pos)
        closeDropdown()
        runValidate()
        textarea.focus()
    }

    textarea.addEventListener('input', () => {
        runValidate()
        refreshAutocomplete()
    })

    textarea.addEventListener('keydown', (e) => {
        if (dropdown && acItems.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                acIndex = (acIndex + 1) % acItems.length
                renderDropdown()
                return
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                acIndex = (acIndex - 1 + acItems.length) % acItems.length
                renderDropdown()
                return
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault()
                insertReference(acItems[acIndex])
                return
            }
            if (e.key === 'Escape') {
                e.preventDefault()
                closeDropdown()
                return
            }
        } else if (dropdown && acItems.length === 0 && e.key === 'Enter' && acQuery) {
            // @query sin coincidencias → crear nuevo artefacto enlazado
            e.preventDefault()
            closeDropdown()
            onCreateMention?.(acQuery)
            return
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            doCancel()
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            doSave()
        }
    })

    document.body.append(overlay, panel)
    runValidate()
    setTimeout(() => {
        textarea.focus()
        textarea.select()
    }, 0)

    active = {
        destroy() {
            closeDropdown()
            overlay.remove()
            panel.remove()
        },
        focus() {
            textarea.focus()
        },
    }
    return active
}

function escapeHtml(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
}
