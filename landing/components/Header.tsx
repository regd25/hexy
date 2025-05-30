'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
  onSearchClick: () => void
}

export default function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  const [activeNav, setActiveNav] = useState('home')

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-background-primary/95 backdrop-blur-sm border-b border-border-primary"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y marca */}
          <div className="flex items-center space-x-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              {/* Icono hexagonal con efecto glow */}
              <div className="relative">
                <div className="w-8 h-8 border-2 border-primary-400 transform rotate-45 rounded-sm glow-teal"></div>
                <div className="absolute inset-0 w-8 h-8 border-2 border-primary-400 transform -rotate-45 rounded-sm"></div>
              </div>
              <span className="text-xl font-bold text-gradient-teal">
                Hexy Framework
              </span>
            </motion.div>
          </div>

          {/* Navegación principal */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { id: 'home', label: '¿Qué es SCL?', href: '#' },
              { id: 'docs', label: 'Documentación', href: '#documentation' },
              { id: 'agents', label: 'Agentes', href: '#agents' },
            ].map((item) => (
              <motion.a
                key={item.id}
                href={item.href}
                className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* Acciones del header */}
          <div className="flex items-center space-x-4">
            {/* Botón de búsqueda */}
            <motion.button
              onClick={onSearchClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-background-tertiary border border-border-primary rounded-lg text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">Buscar...</span>
              <kbd className="px-2 py-1 text-xs bg-background-secondary border border-border-primary rounded">
                ⌘K
              </kbd>
            </motion.button>

            {/* Botón CTA principal */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Comenzar
            </motion.button>

            {/* Botón de menú móvil */}
            <motion.button
              onClick={onMenuClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 rounded-lg bg-background-tertiary border border-border-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  )
} 