'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Datos de búsqueda basados en los conceptos y artefactos SCL
const searchData = [
  {
    id: 'scl-intro',
    title: 'Semantic Context Language (SCL)',
    description: 'Lenguaje semántico de definición contextual interoperable entre humanos y agentes artificiales.',
    category: 'Concepto',
    module: 'Introducción',
    keywords: ['lenguaje', 'semántico', 'contexto', 'IA', 'humanos']
  },
  {
    id: 'organization',
    title: 'Artefacto Organization',
    description: 'Define identidad, propósito, misión, visión y valores del sistema.',
    category: 'Artefacto',
    module: 'Estructura',
    keywords: ['organización', 'misión', 'visión', 'valores', 'identidad']
  },
  {
    id: 'usecase',
    title: 'Artefacto UseCase',
    description: 'Modela acciones o flujos que generan valor y transforman contexto.',
    category: 'Artefacto',
    module: 'Estructura',
    keywords: ['caso de uso', 'acción', 'flujo', 'valor', 'transformación']
  },
  {
    id: 'rule',
    title: 'Artefacto Rule',
    description: 'Establece restricciones, políticas o condiciones operativas.',
    category: 'Artefacto',
    module: 'Estructura',
    keywords: ['regla', 'restricción', 'política', 'condición', 'operativa']
  },
  {
    id: 'agent',
    title: 'Artefacto Agent',
    description: 'Describe actores humanos, automatizados o híbridos que interactúan.',
    category: 'Artefacto',
    module: 'Estructura',
    keywords: ['agente', 'actor', 'humano', 'automatizado', 'híbrido']
  },
  {
    id: 'narrative',
    title: 'Artefacto Narrative',
    description: 'Conserva la intención histórica, cultural o estratégica del artefacto.',
    category: 'Artefacto',
    module: 'Estructura',
    keywords: ['narrativa', 'intención', 'histórica', 'cultural', 'estratégica']
  },
  {
    id: 'kpi',
    title: 'Artefacto KPI',
    description: 'Define métricas observables, indicadores de éxito o salud sistémica.',
    category: 'Artefacto',
    module: 'Estructura',
    keywords: ['kpi', 'métrica', 'indicador', 'éxito', 'salud', 'observabilidad']
  },
  {
    id: 'hexy-organization',
    title: 'HexyOrganization',
    description: 'Agente que interactúa en lenguaje natural para crear definiciones SCL.',
    category: 'Agente',
    module: 'Agentes',
    keywords: ['agente', 'organización', 'lenguaje natural', 'definiciones', 'SCL']
  },
  {
    id: 'hexy-aid',
    title: 'HexyAid',
    description: 'Agente que guía el desarrollo con código reutilizable alineado con SCL.',
    category: 'Agente',
    module: 'Agentes',
    keywords: ['agente', 'desarrollo', 'código', 'reutilizable', 'alineado']
  }
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(searchData)

  // Configuración de Fuse.js para búsqueda semántica
  const fuse = useMemo(() => new Fuse(searchData, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'keywords', weight: 0.2 },
      { name: 'category', weight: 0.1 }
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true
  }), [])

  // Búsqueda en tiempo real
  useEffect(() => {
    if (query.trim() === '') {
      setResults(searchData)
    } else {
      const searchResults = fuse.search(query)
      setResults(searchResults.map(result => result.item))
    }
  }, [query, fuse])

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults(searchData)
    }
  }, [isOpen])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Concepto': return '💡'
      case 'Artefacto': return '🧩'
      case 'Agente': return '🤖'
      default: return '📄'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Concepto': return 'text-primary-400 bg-primary-400/10'
      case 'Artefacto': return 'text-secondary-400 bg-secondary-400/10'
      case 'Agente': return 'text-primary-500 bg-primary-500/10'
      default: return 'text-text-muted bg-background-tertiary'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl mx-4 bg-background-secondary border border-border-primary rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header del modal */}
            <div className="p-6 border-b border-border-primary">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-text-primary">
                  Búsqueda Semántica SCL
                </h2>
                <div className="flex-1"></div>
                <kbd className="px-2 py-1 text-xs bg-background-tertiary border border-border-primary rounded">
                  ESC
                </kbd>
              </div>
              
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conceptos, artefactos, agentes..."
                className="w-full px-4 py-3 bg-background-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-400 transition-colors"
                autoFocus
              />
            </div>

            {/* Resultados */}
            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <div className="p-2">
                  {results.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-text-primary group-hover:text-primary-400 transition-colors">
                              {item.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary mb-2 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-text-muted">
                            <span>📍 {item.module}</span>
                            <span>•</span>
                            <span>{item.keywords.slice(0, 3).join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-text-muted">
                    No se encontraron resultados para "{query}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border-primary bg-background-tertiary/50">
              <div className="text-xs text-text-muted">
                <span className="text-primary-400 font-medium">Regla:</span> SearchMustBeHotkeyAccessible
                <span className="mx-2">•</span>
                Búsqueda activable con Cmd/Ctrl+K
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 