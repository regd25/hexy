import React from 'react'
import { useModuleContext } from '../contexts/ModuleContext'

export interface ModuleContentProps {
    children?: React.ReactNode
    className?: string
}

export const ModuleContent: React.FC<ModuleContentProps> = ({ children, className = '' }) => {
    const { moduleState } = useModuleContext()

    return (
        <main className={`module-content flex-1 overflow-auto p-6 ${className}`}>
            <div className="max-w-full h-full">
                {moduleState.isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-lg font-medium mb-2">No content available</h3>
                        <p className="text-sm text-center max-w-md">
                            This module doesn&apos;t have any content yet. Start by adding some data or configuring the
                            module.
                        </p>
                    </div>
                ) : (
                    children
                )}
            </div>
        </main>
    )
}
