import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ModuleState, ModuleConfig, ModuleContextValue, ModuleStats } from '../types/Module'

const ModuleContext = createContext<ModuleContextValue | undefined>(undefined)

export const useModuleContext = (): ModuleContextValue => {
  const context = useContext(ModuleContext)
  if (!context) {
    throw new Error('useModuleContext must be used within a ModuleProvider')
  }
  return context
}

interface ModuleProviderProps {
  children: ReactNode
  config: ModuleConfig
  initialState?: Partial<ModuleState>
}

const defaultModuleState: ModuleState = {
  isLoading: false,
  isDirty: false,
  isEmpty: true,
  status: 'inactive',
  hasFooterContent: true
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({
  children,
  config,
  initialState = {}
}) => {
  const [moduleState, setModuleState] = useState<ModuleState>({
    ...defaultModuleState,
    ...initialState
  })

  const [moduleStats] = useState<ModuleStats>({
    totalItems: 0,
    lastUpdated: new Date(),
    version: config.version
  })

  const contextValue: ModuleContextValue = {
    moduleState,
    setModuleState,
    moduleConfig: config,
    moduleStats
  }

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  )
}