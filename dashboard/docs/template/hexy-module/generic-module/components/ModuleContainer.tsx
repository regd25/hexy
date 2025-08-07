import React from 'react'
import { ModuleHeader } from './ModuleHeader'
import { ModuleContent } from './ModuleContent'
import { ModuleFooter } from './ModuleFooter'
import { useModule } from '../hooks/useModule'
import { ModuleProvider } from '../contexts/ModuleContext'

export interface ModuleContainerProps {
  className?: string
  children?: React.ReactNode
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ 
  className = '',
  children 
}) => {
  const { isLoading, error } = useModule()

  if (error) {
    return (
      <div className={`module-container error ${className}`}>
        <div className="text-red-500 p-4">
          Error: {error.message}
        </div>
      </div>
    )
  }

  return (
    <ModuleProvider>
      <div className={`module-container ${className}`}>
        <div className="flex flex-col h-full">
          <ModuleHeader />
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ModuleContent>
                {children}
              </ModuleContent>
            )}
          </div>
          <ModuleFooter />
        </div>
      </div>
    </ModuleProvider>
  )
}