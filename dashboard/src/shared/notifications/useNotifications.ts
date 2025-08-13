import { useCallback, useMemo } from 'react'
import { useEventBus } from '../event-bus'
import { NotificationManager, NotificationType } from './NotificationManager'

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
        (message: string, customStyle: Record<string, string> = {}, duration = 3000) => {
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
