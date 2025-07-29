/**
 * Constantes utilizadas en toda la aplicación
 */

/**
 * Mapeo de tipos de artefactos a colores
 */
export const COLORS = {
  context: '#3949ab',
  actor: '#43a047',
  concept: '#ff7043',
  process: '#26c6da',
  reference: '#9e9e9e',
};

/**
 * Mapeo de tipos de artefactos a sus categorías en el texto
 */
export const TYPE_MAP = {
  Contextos: 'context',
  Actores: 'actor',
  Conceptos: 'concept',
  Procesos: 'process',
};

/**
 * Mapeo inverso de tipos de artefactos a sus categorías en el texto
 */
export const REVERSE_TYPE_MAP = {
  context: 'Contextos',
  actor: 'Actores',
  concept: 'Conceptos',
  process: 'Procesos',
  reference: 'Referencias',
};

/**
 * Texto por defecto para el editor
 */
export const DEFAULT_TEXT = `Contextos
  - Hexy: Hexy es un framework de contexto organizacional, ayuda a los LLMs a apegarse fuertemente a la lógica de operación del negocio de manera optimizado, escalable y ejecutable
Actores
  - Operador: Todo humano que interactúa con alguna interfaz de @Hexy, tiene un rol
  - OperadorBasico: Operador con hasta 3 meses de experiencia en Hexy
  - AgenteDeOnboarding: Agente encargado de realizar el onboarding a la ontología organizacional
Conceptos
  - Concepto: Representación semántica de una entidad dentro de la ontología
  - Proceso: Secuencia de pasos estructurados que definen actividades en la organización
  - Protocolo: Conjunto de reglas para comunicación
  - Artefacto: Objetos semánticos en la ontología
  - Propósito: Motivo u objetivo que guía un artefacto
  - Guideline: Recomendaciones para acciones específicas
  - Política: Reglas obligatorias de cumplimiento
  - ArtefactoFundacional: Contextos, Propósitos, Autoridad o Evaluación base
  - ArtefactoEstrategico: Políticas, Conceptos, Principios, Guidelines, Indicadores
  - ArtefactoOperativo: Procesos, Procedimientos, Eventos, Observaciones, Resultados
  - ArtefactoOrganizacional: Actores, Áreas
`;
