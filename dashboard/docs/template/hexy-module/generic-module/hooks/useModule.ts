import { useCallback, useEffect, useMemo, useState } from 'react'
import { ModuleData } from '../types/Module'
import { useModuleContext } from '../contexts/ModuleContext'
import { ModuleService } from '../services/ModuleService'
import { useEventBus } from '@/shared'

export interface UseModuleReturn {
    data: ModuleData | null
    isLoading: boolean
    error: Error | null
    save: () => Promise<void>
    refresh: () => Promise<void>
    reset: () => Promise<void>
    export: () => Promise<void>
    updateData: (updates: Partial<ModuleData>) => void
}

export const useModule = (): UseModuleReturn => {
    const { setModuleState, moduleConfig } = useModuleContext()
    const [data, setData] = useState<ModuleData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const eventBus = useEventBus()

    const moduleService = useMemo(
        () => new ModuleService(moduleConfig, eventBus),
        [moduleConfig, eventBus]
    )

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const moduleData = await moduleService.load()
            setData(moduleData)
            setModuleState(prev => ({
                ...prev,
                isEmpty: !moduleData || Object.keys(moduleData).length === 0,
                status: 'active',
                lastAction: 'loaded',
            }))
        } catch (err) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to load module data')
            setError(error)
            setModuleState(prev => ({
                ...prev,
                status: 'error',
                lastAction: 'load_failed',
            }))
        } finally {
            setIsLoading(false)
        }
    }, [moduleService, setModuleState])

    const save = useCallback(async () => {
        if (!data) return

        setIsLoading(true)
        setError(null)

        try {
            await moduleService.save(data)
            setModuleState(prev => ({
                ...prev,
                isDirty: false,
                lastAction: 'saved',
            }))
        } catch (err) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to save module data')
            setError(error)
            setModuleState(prev => ({
                ...prev,
                status: 'error',
                lastAction: 'save_failed',
            }))
        } finally {
            setIsLoading(false)
        }
    }, [data, moduleService, setModuleState])

    const refresh = useCallback(async () => {
        await loadData()
    }, [loadData])

    const reset = useCallback(async () => {
        setData(null)
        setError(null)
        setModuleState(prev => ({
            ...prev,
            isDirty: false,
            isEmpty: true,
            status: 'inactive',
            lastAction: 'reset',
        }))
        await loadData()
    }, [loadData, setModuleState])

    const exportData = useCallback(async () => {
        if (!data) return

        try {
            await moduleService.export(data)
            setModuleState(prev => ({
                ...prev,
                lastAction: 'exported',
            }))
        } catch (err) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to export module data')
            setError(error)
        }
    }, [data, moduleService, setModuleState])

    const updateData = useCallback(
        (updates: Partial<ModuleData>) => {
            setData(prev =>
                prev ? { ...prev, ...updates } : (updates as ModuleData)
            )
            setModuleState(prev => ({
                ...prev,
                isDirty: true,
                lastAction: 'updated',
            }))
        },
        [setModuleState]
    )

    useEffect(() => {
        loadData()
    }, [loadData])

    return {
        data,
        isLoading,
        error,
        save,
        refresh,
        reset,
        export: exportData,
        updateData,
    }
}
