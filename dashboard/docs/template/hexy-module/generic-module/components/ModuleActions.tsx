import React from 'react'
import { useModuleContext } from '../contexts/ModuleContext'
import { useModule } from '../hooks/useModule'

export interface ModuleActionsProps {
    customActions?: React.ReactNode
}

export const ModuleActions: React.FC<ModuleActionsProps> = ({
    customActions,
}) => {
    const { moduleState } = useModuleContext()
    const { save, refresh, reset, export: exportData } = useModule()

    const handleSave = async () => {
        try {
            await save()
        } catch (error) {
            console.error('Failed to save:', error)
        }
    }

    const handleRefresh = async () => {
        try {
            await refresh()
        } catch (error) {
            console.error('Failed to refresh:', error)
        }
    }

    const handleReset = async () => {
        if (
            window.confirm(
                'Are you sure you want to reset? All unsaved changes will be lost.'
            )
        ) {
            try {
                await reset()
            } catch (error) {
                console.error('Failed to reset:', error)
            }
        }
    }

    const handleExport = async () => {
        try {
            await exportData()
        } catch (error) {
            console.error('Failed to export:', error)
        }
    }

    return (
        <div className="module-actions flex items-center space-x-2">
            {customActions}

            <button
                onClick={handleRefresh}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                disabled={moduleState.isLoading}
            >
                Refresh
            </button>

            {moduleState.isDirty && (
                <button
                    onClick={handleSave}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                    disabled={moduleState.isLoading}
                >
                    Save
                </button>
            )}

            <button
                onClick={handleExport}
                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                disabled={moduleState.isLoading}
            >
                Export
            </button>

            <button
                onClick={handleReset}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                disabled={moduleState.isLoading}
            >
                Reset
            </button>
        </div>
    )
}
