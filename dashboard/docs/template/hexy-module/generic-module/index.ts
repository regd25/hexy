// Main exports for the generic module template
export { default as ModulePage } from './pages/index'

// Components
export { ModuleContainer, ModuleHeader, ModuleContent, ModuleFooter, ModuleActions } from './components'

// Hooks
export { useModule, useModuleValidation } from './hooks'

// Context
export { ModuleProvider, useModuleContext } from './contexts/ModuleContext'

// Services
export { ModuleService } from './services'

// Types
export type {
    ModuleData,
    ModuleState,
    ModuleConfig,
    ModuleStats,
    ValidationRule,
    ValidationResult,
    ModuleContextValue,
    ModuleEvent,
    ModulePlugin,
} from './types'
