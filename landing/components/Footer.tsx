'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Información del proyecto */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-3 mb-4"
            >
              {/* Logo */}
              <div className="relative">
                <div className="w-8 h-8 border-2 border-primary-400 transform rotate-45 rounded-sm"></div>
                <div className="absolute inset-0 w-8 h-8 border-2 border-primary-400 transform -rotate-45 rounded-sm"></div>
              </div>
              <span className="text-xl font-bold text-gradient-teal">
                Hexy Framework
              </span>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-text-secondary mb-6 leading-relaxed max-w-md"
            >
              Un lenguaje operativo que conecte humanos, máquinas e inteligencia artificial 
              desde el contexto. SCL es el puente semántico entre intención y ejecución.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex space-x-4"
            >
              <motion.a
                href="https://github.com/regd25/hexy"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-background-tertiary border border-border-primary rounded-lg flex items-center justify-center hover:border-primary-400 transition-colors"
              >
                <svg className="w-5 h-5 text-text-secondary hover:text-primary-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </motion.a>
              
              <motion.a
                href="https://twitter.com/hexyframework"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-background-tertiary border border-border-primary rounded-lg flex items-center justify-center hover:border-primary-400 transition-colors"
              >
                <svg className="w-5 h-5 text-text-secondary hover:text-primary-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </motion.a>
            </motion.div>
          </div>

          {/* Enlaces de documentación */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-text-primary font-semibold mb-4"
            >
              Documentación
            </motion.h3>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              {[
                'Introducción a SCL',
                'Filosofía y Principios',
                'Estructura del Lenguaje',
                'Proceso de Definición',
                'Sintaxis y Exportación',
                'Interpretación',
                'Integraciones',
                'Contribución'
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={`#module-${index + 1}`}
                    className="text-text-secondary hover:text-primary-400 transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Enlaces de comunidad */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-text-primary font-semibold mb-4"
            >
              Comunidad
            </motion.h3>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              {[
                'Biblioteca de Artefactos',
                'Ejemplos de Uso',
                'Contribuir al Proyecto',
                'Reportar Issues',
                'Discusiones',
                'Blog y Actualizaciones'
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-text-secondary hover:text-primary-400 transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-border-primary my-8"></div>

        {/* Footer bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <div className="text-text-muted text-sm">
            © 2025 Hexy. Built with SCL.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-text-secondary hover:text-primary-400 transition-colors">
              Términos de Uso
            </a>
            <a href="#" className="text-text-secondary hover:text-primary-400 transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="text-text-secondary hover:text-primary-400 transition-colors">
              Licencia MIT
            </a>
          </div>
        </motion.div>

        {/* Narrativa SCL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-xs text-text-muted"
        >
          <span className="text-primary-400 font-medium">Narrativa:</span> 
          Un sistema que se puede leer, se puede evolucionar. SCL preserva la intención para facilitar la transformación.
        </motion.div>
      </div>
    </footer>
  )
} 