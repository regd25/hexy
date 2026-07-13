/**
 * Notificaciones toast en vanilla (sin dependencias). Mantiene la misma API que la versión
 * con toastify-js: showSuccess / showError / showInfo. Contenedor fijo arriba a la derecha,
 * auto-cierre a 3.5s, botón de cierre y animación CSS (ver .toast en main.css).
 */

const DURATION_MS = 3500

let container = null

function ensureContainer() {
    if (container && document.body.contains(container)) return container
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
    return container
}

function toast(text, variant) {
    const el = document.createElement('div')
    el.className = `toast toast--${variant}`

    const label = document.createElement('span')
    label.className = 'toast__text'
    label.textContent = text

    const closeBtn = document.createElement('button')
    closeBtn.className = 'toast__close'
    closeBtn.type = 'button'
    closeBtn.setAttribute('aria-label', 'Cerrar notificación')
    closeBtn.textContent = '✕'

    el.append(label, closeBtn)
    ensureContainer().appendChild(el)

    let hideTimer = setTimeout(dismiss, DURATION_MS)

    // Pausa el auto-cierre mientras el cursor está encima (equivalente a stopOnFocus).
    el.addEventListener('mouseenter', () => clearTimeout(hideTimer))
    el.addEventListener('mouseleave', () => {
        hideTimer = setTimeout(dismiss, DURATION_MS)
    })
    closeBtn.addEventListener('click', dismiss)

    function dismiss() {
        clearTimeout(hideTimer)
        if (!el.isConnected) return
        el.classList.add('toast--leaving')
        el.addEventListener('transitionend', () => el.remove(), { once: true })
        // Fallback por si transitionend no dispara (p. ej. pestaña oculta).
        setTimeout(() => el.remove(), 400)
    }
}

export const showSuccess = (text) => toast(text, 'success')
export const showError = (text) => toast(text, 'error')
export const showInfo = (text) => toast(text, 'info')
