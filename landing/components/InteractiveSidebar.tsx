'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { navigationAdapter } from '@/src/contexts/landing/infrastructure/adapters/NavigationAdapter'

interface InteractiveSidebarProps {
  isOpen: boolean
  activeModule: string
  onModuleChange: (module: string) => void
  onClose: () => void
}

interface NavigationItemData {
  id: string
  name: string
  url: string
  description?: string
  icon?: string
  isActive: boolean
  order: number
  isExternal: boolean
}

export default function InteractiveSidebar({ 
  isOpen, 
  activeModule, 
  onModuleChange, 
  onClose 
}: InteractiveSidebarProps) {
  const [modules, setModules] = useState<NavigationItemData[]>([])
  const [loading, setLoading] = useState(true)

  // Load navigation items from domain layer
  useEffect(() => {
    const loadNavigationItems = async () => {
      try {
        const items = await navigationAdapter.getNavigationItems()
        setModules(items)
      } catch (error) {
        console.error('Error loading navigation items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNavigationItems()
  }, [])

  // Handle module navigation using domain use case
  const handleModuleNavigation = async (moduleId: string) => {
    try {
      const result = await navigationAdapter.navigateToModule(moduleId)
      if (result.success) {
        onModuleChange(moduleId)
        onClose() // Close on mobile after selection
      } else {
        console.error('Navigation failed:', result.error)
      }
    } catch (error) {
      console.error('Error navigating to module:', error)
    }
  }
  
  // Cerrar sidebar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay para móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-background-secondary border-r border-border-primary z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header del sidebar */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  Documentación SCL
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                >
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Lista de módulos */}
              <nav className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
                  </div>
                ) : (
                  modules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.button
                        onClick={() => handleModuleNavigation(module.id)}
                        whileHover={{ x: 4 }}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                          activeModule === module.id
                            ? 'bg-background-tertiary border-l-4 border-primary-400 text-text-primary'
                            : 'hover:bg-background-tertiary text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{module.icon || '📄'}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm mb-1 truncate">
                              {module.name}
                            </h3>
                            {module.description && (
                              <p className="text-xs text-text-muted leading-relaxed">
                                {module.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </nav>

              {/* Footer del sidebar */}
              <div className="mt-8 pt-6 border-t border-border-primary">
                <div className="text-xs text-text-muted">
                  <p className="mb-2">
                    <span className="text-primary-400 font-medium">Regla:</span> AllModulesMustBeAccessible
                  </p>
                  <p className="leading-relaxed">
                    Todos los módulos del lenguaje deben estar enlazados en la navegación lateral.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
} 