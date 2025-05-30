'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

// Artefactos de ejemplo de la comunidad
const artifacts = [
  {
    id: 'ecommerce-platform',
    name: 'E-commerce Platform',
    description: 'Sistema completo de comercio electrónico con gestión de inventario, pagos y envíos.',
    author: 'HEXI Community',
    category: 'Organization',
    tags: ['ecommerce', 'microservices', 'ddd'],
    useCases: ['ProcessOrder', 'ManageInventory', 'HandlePayment'],
    downloadCount: 1247,
    rating: 4.8,
    lastUpdated: '2024-01-15'
  },
  {
    id: 'music-collaboration',
    name: 'Music Collaboration Platform',
    description: 'Plataforma para sesiones musicales colaborativas en tiempo real con sincronización de latencia.',
    author: 'Ritmeria Team',
    category: 'Organization',
    tags: ['music', 'realtime', 'collaboration'],
    useCases: ['StartLiveJam', 'SyncAudio', 'ManageSession'],
    downloadCount: 892,
    rating: 4.6,
    lastUpdated: '2024-01-10'
  },
  {
    id: 'learning-management',
    name: 'Learning Management System',
    description: 'Sistema de gestión de aprendizaje con seguimiento de progreso y evaluaciones adaptativas.',
    author: 'EduTech Collective',
    category: 'Organization',
    tags: ['education', 'learning', 'assessment'],
    useCases: ['CreateCourse', 'TrackProgress', 'GenerateAssessment'],
    downloadCount: 2156,
    rating: 4.9,
    lastUpdated: '2024-01-20'
  },
  {
    id: 'healthcare-records',
    name: 'Healthcare Records System',
    description: 'Sistema de registros médicos con cumplimiento HIPAA y interoperabilidad HL7.',
    author: 'HealthTech Alliance',
    category: 'Organization',
    tags: ['healthcare', 'hipaa', 'hl7'],
    useCases: ['ManagePatientRecord', 'ScheduleAppointment', 'ProcessInsurance'],
    downloadCount: 743,
    rating: 4.7,
    lastUpdated: '2024-01-08'
  }
]

export default function ArtifactLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  const categories = ['all', 'Organization', 'UseCase', 'Rule', 'Agent']
  
  const filteredArtifacts = artifacts.filter(artifact => 
    selectedCategory === 'all' || artifact.category === selectedCategory
  )

  const sortedArtifacts = [...filteredArtifacts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloadCount - a.downloadCount
      case 'rating':
        return b.rating - a.rating
      case 'recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      default:
        return 0
    }
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Organization': return '🏢'
      case 'UseCase': return '⚡'
      case 'Rule': return '📋'
      case 'Agent': return '🤖'
      default: return '📦'
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background-secondary/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-text-primary mb-4"
          >
            Biblioteca de Artefactos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary max-w-3xl mx-auto"
          >
            Explora ejemplos de artefactos SCL compartidos por la comunidad. 
            Cada artefacto incluye definiciones completas y casos de uso reales.
          </motion.p>
        </div>

        {/* Filtros y ordenamiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          {/* Filtros por categoría */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-background-tertiary text-text-secondary hover:text-text-primary hover:bg-background-card'
                }`}
              >
                {getCategoryIcon(category)} {category === 'all' ? 'Todos' : category}
              </motion.button>
            ))}
          </div>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-background-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-primary-400"
          >
            <option value="popular">Más populares</option>
            <option value="rating">Mejor valorados</option>
            <option value="recent">Más recientes</option>
          </select>
        </motion.div>

        {/* Grid de artefactos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArtifacts.map((artifact, index) => (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card group cursor-pointer"
            >
              {/* Header del artefacto */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{getCategoryIcon(artifact.category)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary group-hover:text-primary-400 transition-colors">
                      {artifact.name}
                    </h3>
                    <p className="text-xs text-text-muted">por {artifact.author}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs text-primary-400">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{artifact.rating}</span>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                {artifact.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {artifact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-background-tertiary text-text-muted text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Casos de uso */}
              <div className="mb-4">
                <p className="text-xs text-text-muted mb-2">Casos de uso incluidos:</p>
                <div className="space-y-1">
                  {artifact.useCases.slice(0, 3).map((useCase) => (
                    <div key={useCase} className="flex items-center space-x-2 text-xs">
                      <span className="text-primary-400">⚡</span>
                      <span className="text-text-secondary">{useCase}</span>
                    </div>
                  ))}
                  {artifact.useCases.length > 3 && (
                    <p className="text-xs text-text-muted">
                      +{artifact.useCases.length - 3} más...
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                <div className="flex items-center space-x-4 text-xs text-text-muted">
                  <span>📥 {artifact.downloadCount.toLocaleString()}</span>
                  <span>📅 {new Date(artifact.lastUpdated).toLocaleDateString('es-ES')}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs btn-outline px-3 py-1"
                >
                  Descargar
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer de la sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              ¿Quieres contribuir?
            </h3>
            <p className="text-text-secondary mb-4">
              Comparte tus artefactos SCL con la comunidad y ayuda a otros a acelerar su desarrollo.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Subir artefacto
            </motion.button>
          </div>
        </motion.div>

        {/* Narrativa SCL */}
        <div className="mt-8 text-center text-xs text-text-muted">
          <span className="text-primary-400 font-medium">Narrativa:</span> 
          Los artefactos son el conocimiento operativo vivo del lenguaje. Compartirlos amplifica su impacto.
        </div>
      </div>
    </section>
  )
} 