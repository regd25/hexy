/**
 * Editor inline para el nombre del artefacto (primer paso del flujo de creación).
 * Un input flotante posicionado junto al nodo temporal; Enter guarda, Esc cancela.
 */

let active = null

export function closeInlineEditor() {
    active?.remove()
    active = null
}

/**
 * @param {object} opts
 * @param {{x:number,y:number}} opts.position  posición en coordenadas de ventana
 * @param {string} [opts.initialValue]
 * @param {(value:string)=>string[]} opts.onChange  devuelve errores a mostrar
 * @param {(value:string)=>void} opts.onSave
 * @param {()=>void} opts.onCancel
 */
export function openInlineEditor({ position, initialValue = '', placeholder = 'Nombre del artefacto…', onChange, onSave, onCancel }) {
    closeInlineEditor()
    const box = document.createElement('div')
    box.className = 'inline-editor fade-in'
    box.style.left = `${Math.max(10, position.x)}px`
    box.style.top = `${Math.max(10, position.y)}px`

    const input = document.createElement('input')
    input.className = 'input'
    input.type = 'text'
    input.placeholder = placeholder
    input.value = initialValue

    const errorsEl = document.createElement('div')
    errorsEl.className = 'inline-editor__errors'

    let currentErrors = []
    const renderErrors = () => {
        errorsEl.innerHTML = currentErrors.map((e) => `<div>• ${escapeHtml(e)}</div>`).join('')
    }

    input.addEventListener('input', () => {
        currentErrors = onChange?.(input.value) ?? []
        renderErrors()
    })
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (currentErrors.length > 0 || !input.value.trim()) return
            onSave?.(input.value.trim())
        } else if (e.key === 'Escape') {
            e.preventDefault()
            onCancel?.()
        }
    })

    box.append(input, errorsEl)
    document.body.appendChild(box)
    active = box
    setTimeout(() => input.focus(), 0)
}

function escapeHtml(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
}
