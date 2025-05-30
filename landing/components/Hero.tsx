'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Título principal con gradiente teal */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8"
        >
          <span className="text-gradient-teal">
            Semantic Context Language (SCL)
          </span>
        </motion.h1>

        {/* Descripción principal */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl sm:text-2xl text-text-secondary mb-12 leading-relaxed max-w-3xl mx-auto"
        >
          SCL es un lenguaje vivo que evoluciona con tu organización. Define conceptos, 
          procesos y reglas en un formato que tanto humanos como IA pueden entender y 
          transformar en sistemas ejecutables.
        </motion.p>

        {/* Botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Manifiesto oficial</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>API & DSL</span>
          </motion.button>
        </motion.div>

        {/* Cards de agentes */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          id="agents"
        >
          {/* HexyOrganization Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="card-glow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary">HexyOrganization</h3>
            </div>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Interactúa en lenguaje natural para crear definiciones SCL y guiar 
              decisiones organizacionales basadas en KPIs y OKRs.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary"
            >
              Usar agente
            </motion.button>
          </motion.div>

          {/* HexyAid Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="card-glow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary">HexyAid</h3>
            </div>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Guía el proceso de desarrollo proporcionando código reutilizable 
              alineado con las reglas de consistencia definidas en SCL.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary"
            >
              Usar agente
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
} 