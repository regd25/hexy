import { useContext } from 'react'
import { EventBusContext } from './EventBusContext'
import { EventBus } from './EventBus'

export const useEventBus = (): EventBus => {
    const context = useContext(EventBusContext)
    if (!context) {
        throw new Error('useEventBus must be used within EventBusProvider')
    }
    return context
}
