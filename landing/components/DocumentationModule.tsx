'use client'

import { motion } from 'framer-motion'

interface DocumentationModuleProps {
  activeModule: string
}

const moduleContent = {
  introduction: {
    title: 'Módulo 1: Introducción a SCL',
    content: `
## ¿Qué es SCL?

El **Semantic Context Language (SCL)** es un lenguaje de definición de contexto diseñado para modelar las interacciones, reglas, flujos y entidades que conforman un sistema vivo —ya sea una organización, un producto, una comunidad o un entorno híbrido.

A diferencia de lenguajes puramente lógicos o de programación, SCL permite representar el **significado operativo** de un sistema combinando estructura formal (reglas, agentes, KPIs) con narrativa (intención, propósito, aprendizaje).

## ¿Para qué sirve SCL?

SCL actúa como una **capa semántica intermedia** que alinea la estrategia, la operación y la automatización bajo un lenguaje común, entendible por humanos y por IA.

Con SCL es posible:
- **Modelar contextos vivos** integrando reglas, actores, flujos y métricas de forma estructurada.
- **Compartir intenciones y decisiones** con trazabilidad, facilitando la colaboración humano‑IA.
- **Hidratar modelos de IA** con contexto operativo para generar acciones, código o contenido alineado.
- **Aumentar la interoperabilidad** exportando definiciones a RDF/Turtle y JSON‑LD.
    `,
    icon: '📚'
  },
  philosophy: {
    title: 'Módulo 2: Filosofía y Principios',
    content: `
## Fundamentos y axiomas

El diseño del Semantic Context Language (SCL) se apoya en una serie de principios fundamentales:

1. **Visibilidad** – Lo que no se representa tiende a fragmentarse.
2. **Observabilidad** – Lo que no se mide, no se mejora.
3. **Intención preservada** – Cada regla crítica merece una narrativa.
4. **Lenguaje común** – No es una herramienta; es una condición estructural.
5. **Economía de la repetición** – Si algo se repite con impacto, conviene modelarlo.
6. **Evolubilidad** – Un sistema que se puede leer, se puede transformar.

## El rol de la narrativa

La narrativa en SCL no es opcional. Es el ancla semántica que permite que el sistema pueda evolucionar sin perder el sentido de lo que se modeló.
    `,
    icon: '🧠'
  },
  structure: {
    title: 'Módulo 3: Estructura del Lenguaje',
    content: `
## Artefactos semánticos

| Artefacto | Propósito |
|-----------|-----------|
| **Organization** | Define identidad, propósito, misión, visión y valores del sistema. |
| **Concept** | Representa entidades clave del dominio (objetos, ideas, procesos). |
| **UseCase** | Modela acciones o flujos que generan valor y transforman contexto. |
| **Rule** | Establece restricciones, políticas o condiciones operativas. |
| **Agent** | Describe actores humanos, automatizados o híbridos que interactúan. |
| **Path** | Traza los flujos posibles: éxito, error o alternativos. |
| **KPI** | Define métricas observables, indicadores de éxito o salud sistémica. |
| **Narrative** | Conserva la intención histórica, cultural o estratégica del artefacto. |

## Relación entre artefactos

En SCL, cada artefacto forma parte de una estructura semántica interconectada que representa la lógica del sistema.
    `,
    icon: '🏗️'
  }
}

export default function DocumentationModule({ activeModule }: DocumentationModuleProps) {
  const content = moduleContent[activeModule as keyof typeof moduleContent] || moduleContent.introduction

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" id="documentation">
      <div className="max-w-4xl mx-auto">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          {/* Header del módulo */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">{content.icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {content.title}
              </h2>
              <p className="text-text-muted text-sm mt-1">
                Documentación oficial del Semantic Context Language
              </p>
            </div>
          </div>

          {/* Contenido del módulo */}
          <div className="prose prose-invert max-w-none">
            <div className="text-text-secondary leading-relaxed space-y-6">
              {content.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('##')) {
                  return (
                    <h3 key={index} className="text-xl font-semibold text-text-primary mt-8 mb-4">
                      {paragraph.replace('## ', '')}
                    </h3>
                  )
                }
                if (paragraph.startsWith('|')) {
                  // Tabla simple
                  const rows = paragraph.split('\n').filter(row => row.trim())
                  return (
                    <div key={index} className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border-primary rounded-lg">
                        {rows.map((row, rowIndex) => {
                          const cells = row.split('|').filter(cell => cell.trim())
                          const isHeader = rowIndex === 0
                          return (
                            <tr key={rowIndex} className={isHeader ? 'bg-background-tertiary' : ''}>
                              {cells.map((cell, cellIndex) => {
                                const Tag = isHeader ? 'th' : 'td'
                                return (
                                  <Tag 
                                    key={cellIndex} 
                                    className="border border-border-primary px-4 py-2 text-left"
                                  >
                                    {cell.trim()}
                                  </Tag>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </table>
                    </div>
                  )
                }
                if (paragraph.startsWith('- ')) {
                  // Lista
                  const items = paragraph.split('\n').filter(item => item.startsWith('- '))
                  return (
                    <ul key={index} className="space-y-2 ml-4">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <span className="text-primary-400 mt-1">•</span>
                          <span>{item.replace('- ', '')}</span>
                        </li>
                      ))}
                    </ul>
                  )
                }
                if (paragraph.match(/^\d+\./)) {
                  // Lista numerada
                  const items = paragraph.split('\n').filter(item => item.match(/^\d+\./))
                  return (
                    <ol key={index} className="space-y-2 ml-4">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <span className="text-primary-400 font-medium">
                            {itemIndex + 1}.
                          </span>
                          <span>{item.replace(/^\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ol>
                  )
                }
                return (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                )
              })}
            </div>
          </div>

          {/* Footer del módulo */}
          <div className="mt-8 pt-6 border-t border-border-primary">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-muted">
                <span className="text-primary-400 font-medium">Narrativa:</span> 
                {activeModule === 'introduction' && ' Posiciona a SCL como un lenguaje intermedio entre intención humana y ejecución técnica.'}
                {activeModule === 'philosophy' && ' Define los axiomas fundacionales del lenguaje.'}
                {activeModule === 'structure' && ' Describe los artefactos de SCL y sus relaciones semánticas.'}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline text-sm px-4 py-2"
              >
                Ver código SCL
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 