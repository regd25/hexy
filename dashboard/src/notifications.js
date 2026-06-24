/** Notificaciones toast (toastify-js). Sustituye useNotifications del dashboard React. */
import Toastify from 'toastify-js'

function toast(text, background) {
    Toastify({
        text,
        duration: 3500,
        close: true,
        gravity: 'top',
        position: 'right',
        stopOnFocus: true,
        style: { background },
    }).showToast()
}

export const showSuccess = (text) => toast(text, 'linear-gradient(135deg, #16a34a, #22c55e)')
export const showError = (text) => toast(text, 'linear-gradient(135deg, #dc2626, #ef4444)')
export const showInfo = (text) => toast(text, 'linear-gradient(135deg, #2563eb, #3b82f6)')
