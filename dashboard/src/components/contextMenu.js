/** Menú contextual flotante (clic derecho sobre el canvas). */

let current = null

function close() {
    current?.remove()
    current = null
    document.removeEventListener('mousedown', onOutside, true)
}

function onOutside(e) {
    if (current && !current.contains(e.target)) close()
}

export function openContextMenu(x, y, { disabled = false, onDelete }) {
    close()
    const menu = document.createElement('div')
    menu.className = 'context-menu'
    menu.style.left = `${x}px`
    menu.style.top = `${y}px`

    const item = document.createElement('button')
    item.className = 'context-menu__item'
    item.disabled = disabled
    item.innerHTML = '<span class="danger">🗑</span><span>Eliminar seleccionados</span>'
    item.addEventListener('click', () => {
        if (disabled) return
        onDelete?.()
        close()
    })
    menu.appendChild(item)

    menu.addEventListener('contextmenu', (e) => e.preventDefault())
    document.body.appendChild(menu)
    current = menu
    setTimeout(() => document.addEventListener('mousedown', onOutside, true), 0)
}
