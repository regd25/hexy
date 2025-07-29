/**
 * Constantes utilizadas en toda la aplicación
 */

/**
 * Mapeo de tipos de artefactos a colores
 */
export const COLORS = {
  purpose: '#8b5cf6',
  context: '#3b82f6',
  authority: '#10b981',
  evaluation: '#f59e0b',
  vision: '#6366f1',
  policy: '#ef4444',
  principle: '#ec4899',
  guideline: '#f97316',
  concept: '#06b6d4',
  indicator: '#0891b2',
  process: '#059669',
  procedure: '#84cc16',
  event: '#d97706',
  result: '#dc2626',
  observation: '#0ea5e9',
  actor: '#8b5cf6',
  area: '#a855f7',
  reference: '#6b7280',
};

/**
 * Mapeo de tipos de artefactos a sus categorías en el texto
 */
export const TYPE_MAP = {
  Purpose: 'purpose',
  Context: 'context',
  Authority: 'authority',
  Evaluation: 'evaluation',
  Vision: 'vision',
  Policy: 'policy',
  Principle: 'principle',
  Guideline: 'guideline',
  Concept: 'concept',
  Indicator: 'indicator',
  Process: 'process',
  Procedure: 'procedure',
  Event: 'event',
  Result: 'result',
  Observation: 'observation',
  Actor: 'actor',
  Area: 'area',
  Contextos: 'context',
  Actores: 'actor',
  Conceptos: 'concept',
  Procesos: 'process',
};

/**
 * Mapeo inverso de tipos de artefactos a sus categorías en el texto
 */
export const REVERSE_TYPE_MAP = {
  purpose: 'Purpose',
  context: 'Context',
  authority: 'Authority',
  evaluation: 'Evaluation',
  vision: 'Vision',
  policy: 'Policy',
  principle: 'Principle',
  guideline: 'Guideline',
  concept: 'Concept',
  indicator: 'Indicator',
  process: 'Process',
  procedure: 'Procedure',
  event: 'Event',
  result: 'Result',
  observation: 'Observation',
  actor: 'Actor',
  area: 'Area',
  reference: 'Reference',
};

/**
 * Texto por defecto para el editor
 */
export const DEFAULT_TEXT = `Purpose
  - Hexy Framework: Hexy es un framework de contexto organizacional, ayuda a los LLMs a apegarse fuertemente a la lógica de operación del negocio de manera optimizado, escalable y ejecutable

Context
  - Development Environment: Entorno de desarrollo para crear y gestionar artefactos semánticos
  - Organizational Context: Contexto organizacional donde se aplican los artefactos

Actor
  - Developer: Desarrollador que utiliza el framework Hexy
  - Operator: Operador que interactúa con las interfaces de Hexy
  - Agent: Agente de onboarding encargado de realizar el onboarding a la ontología organizacional

Concept
  - Artifact: Objetos semánticos en la ontología organizacional
  - Semantic Model: Modelo semántico que representa la lógica de negocio
  - Organizational Logic: Lógica operativa del negocio

Process
  - Artifact Creation: Proceso de creación de nuevos artefactos
  - Artifact Management: Proceso de gestión y mantenimiento de artefactos
  - Validation Process: Proceso de validación de artefactos

Policy
  - Naming Convention: Convención de nombres para artefactos
  - Quality Standards: Estándares de calidad para artefactos

Principle
  - Semantic Clarity: Claridad semántica en la definición de artefactos
  - Organizational Alignment: Alineación con la lógica organizacional

Guideline
  - Artifact Documentation: Guías para documentar artefactos
  - Best Practices: Mejores prácticas para el uso del framework
`;
