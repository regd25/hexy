import React from 'react'

export interface ModuleData {
    id?: string
    name: string
    description?: string
    type: string
    metadata?: Record<string, any>
    createdAt?: Date
    updatedAt?: Date
    version?: string
}

export interface ModuleState {
    isLoading: boolean
    isDirty: boolean
    isEmpty: boolean
    status: 'active' | 'inactive' | 'error' | 'loading'
    lastAction?: string
    hasFooterContent?: boolean
}

export interface ModuleConfig {
    name: string
    title: string
    subtitle?: string
    version: string
    author: string
    description: string
    features?: string[]
    settings: {
        autoSave: boolean
        validateOnChange: boolean
        showFooter: boolean
        showActions: boolean
    }
}

export interface ModuleStats {
    totalItems: number
    lastUpdated: Date
    version: string
}

export interface ValidationRule {
    field: string
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    message?: string
    custom?: (value: unknown) => string | null
}

export interface ValidationResult {
    isValid: boolean
    errors: Record<string, string[]>
    warnings: Record<string, string[]>
}

export interface ModuleContextValue {
    moduleState: ModuleState
    setModuleState: React.Dispatch<React.SetStateAction<ModuleState>>
    moduleConfig: ModuleConfig
    moduleStats?: ModuleStats
}

export interface ModuleEvent {
    type: string
    payload: any
    timestamp: Date
    source: string
}

export interface ModulePlugin {
    name: string
    version: string
    initialize: (config: ModuleConfig) => void
    destroy: () => void
    onEvent?: (event: ModuleEvent) => void
}
