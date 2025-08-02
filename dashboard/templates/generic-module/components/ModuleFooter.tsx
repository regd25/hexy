import React from 'react'
import { useModuleContext } from '../contexts/ModuleContext'

export interface ModuleFooterProps {
  showStats?: boolean
  className?: string
}

export const ModuleFooter: React.FC<ModuleFooterProps> = ({
  showStats = true,
  className = ''
}) => {
  const { moduleState, moduleStats } = useModuleContext()

  if (!showStats && !moduleState.hasFooterContent) {
    return null
  }

  return (
    <footer className={`module-footer bg-gray-800 border-t border-gray-700 px-6 py-3 ${className}`}>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          {showStats && moduleStats && (
            <>
              <span>Items: {moduleStats.totalItems}</span>
              <span>•</span>
              <span>Updated: {new Date(moduleStats.lastUpdated).toLocaleTimeString()}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {moduleState.isDirty && (
            <span className="text-yellow-400">Unsaved changes</span>
          )}
          {moduleState.lastAction && (
            <span className="text-gray-500">
              Last: {moduleState.lastAction}
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}