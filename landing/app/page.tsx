'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import InteractiveSidebar from '@/components/InteractiveSidebar'
import SearchModal from '@/components/SearchModal'
import DocumentationModule from '@/components/DocumentationModule'
import ArtifactLibrary from '@/components/ArtifactLibrary'
import Footer from '@/components/Footer'

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeModule, setActiveModule] = useState('introduction')

  // UseCase: SearchWithinDocs - Búsqueda con hotkey Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header con navegación principal */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* Layout principal */}
      <div className="flex">
        {/* UseCase: NavigateModules - Sidebar interactivo */}
        <InteractiveSidebar 
          isOpen={isSidebarOpen}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Contenido principal */}
        <main className="flex-1 transition-all duration-300">
          {/* Hero Section */}
          <Hero />

          {/* UseCase: NavigateModules - Módulos de documentación */}
          <DocumentationModule activeModule={activeModule} />

          {/* UseCase: BrowseArtifactLibrary - Biblioteca de artefactos */}
          <ArtifactLibrary />
        </main>
      </div>

      {/* UseCase: SearchWithinDocs - Modal de búsqueda */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  )
} 