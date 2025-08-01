import { useCallback, useMemo } from 'react'
import { EventBus, useEventBus } from '../contexts/EventBusContext'
import Toastify from 'toastify-js'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

class NotificationManager {
    private eventBus: EventBus
    constructor(eventBus: EventBus) {
        this.eventBus = eventBus
        this.eventBus.subscribe('notification', data => {
            this.show(data.data.message, data.data.type, data.data.duration)
        })
    }

    show(message: string, type: NotificationType = 'info', duration = 3000) {
        return Toastify({
            text: message,
            duration: duration,
            gravity: 'top',
            position: 'right',
            stopOnFocus: true,
            close: true,
            offset: {
                x: 20,
                y: 20,
            },
            style: {
                background: this.getColor(type),
                color: 'white',
                fontWeight: '500',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                fontSize: '14px',
                padding: '12px 20px',
                maxWidth: '400px',
                wordWrap: 'break-word',
            },
        }).showToast()
    }

    private getColor(type: NotificationType): string {
        const colors = {
            success: 'linear-gradient(to right, #059669, #10b981)',
            error: 'linear-gradient(to right, #dc2626, #ef4444)',
            warning: 'linear-gradient(to right, #d97706, #f59e0b)',
            info: 'linear-gradient(to right, #3b82f6, #60a5fa)',
        }
        return colors[type] || colors.info
    }

    showSuccess(message: string, duration = 3000) {
        return this.show(message, 'success', duration)
    }

    showError(message: string, duration = 5000) {
        return this.show(message, 'error', duration)
    }

    showWarning(message: string, duration = 4000) {
        return this.show(message, 'warning', duration)
    }

    showInfo(message: string, duration = 3000) {
        return this.show(message, 'info', duration)
    }

    custom(
        message: string,
        customStyle: Record<string, string> = {},
        duration = 3000
    ) {
        return Toastify({
            text: message,
            duration: duration,
            gravity: 'top',
            position: 'right',
            stopOnFocus: true,
            close: true,
            offset: {
                x: 20,
                y: 20,
            },
            style: {
                background: 'linear-gradient(to right, #6b7280, #9ca3af)',
                color: 'white',
                fontWeight: '500',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                fontSize: '14px',
                padding: '12px 20px',
                ...customStyle,
            },
            className: 'notification-custom',
        }).showToast()
    }

    persistent(message: string, type: NotificationType = 'info') {
        return this.show(message, type, 0)
    }

    clearAll() {
        const notifications = document.querySelectorAll('.toastify')
        notifications.forEach(notification => {
            const closeButton = notification.querySelector('.toast-close')
            if (closeButton) {
                closeButton.dispatchEvent(new Event('click'))
            }
        })
    }
}

export const useNotifications = () => {
    const eventBus = useEventBus()

    const notificationManager = useMemo(() => {
        return new NotificationManager(eventBus)
    }, [eventBus])

    const showNotification = useCallback(
        (message: string, type: NotificationType = 'info', duration = 3000) => {
            return notificationManager.show(message, type, duration)
        },
        [notificationManager]
    )

    const showSuccess = useCallback(
        (message: string, duration = 3000) => {
            return notificationManager.showSuccess(message, duration)
        },
        [notificationManager]
    )

    const showError = useCallback(
        (message: string, duration = 5000) => {
            return notificationManager.showError(message, duration)
        },
        [notificationManager]
    )

    const showWarning = useCallback(
        (message: string, duration = 4000) => {
            return notificationManager.showWarning(message, duration)
        },
        [notificationManager]
    )

    const showInfo = useCallback(
        (message: string, duration = 3000) => {
            return notificationManager.showInfo(message, duration)
        },
        [notificationManager]
    )

    const showCustom = useCallback(
        (
            message: string,
            customStyle: Record<string, string> = {},
            duration = 3000
        ) => {
            return notificationManager.custom(message, customStyle, duration)
        },
        [notificationManager]
    )

    const showPersistent = useCallback(
        (message: string, type: NotificationType = 'info') => {
            return notificationManager.persistent(message, type)
        },
        [notificationManager]
    )

    const clearAll = useCallback(() => {
        notificationManager.clearAll()
    }, [notificationManager])

    return {
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showCustom,
        showPersistent,
        clearAll,
    }
}
