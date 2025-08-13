import React from 'react'
import { useModuleContext } from '../contexts/ModuleContext'
import { ModuleActions } from './ModuleActions'

export interface ModuleHeaderProps {
    title?: string
    subtitle?: string
    showActions?: boolean
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({ title, subtitle, showActions = true }) => {
    const { moduleState, moduleConfig } = useModuleContext()

    const displayTitle = title || moduleConfig.title || 'Module'
    const displaySubtitle = subtitle || moduleConfig.subtitle

    return (
        <header className="module-header bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold text-white">{displayTitle}</h1>
                    {displaySubtitle && <p className="text-sm text-gray-400 mt-1">{displaySubtitle}</p>}
                </div>

                <div className="flex items-center space-x-4">
                    {moduleState.status && (
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                moduleState.status === 'active'
                                    ? 'bg-green-900 text-green-300'
                                    : moduleState.status === 'error'
                                      ? 'bg-red-900 text-red-300'
                                      : 'bg-yellow-900 text-yellow-300'
                            }`}
                        >
                            {moduleState.status}
                        </div>
                    )}

                    {showActions && <ModuleActions />}
                </div>
            </div>
        </header>
    )
}
