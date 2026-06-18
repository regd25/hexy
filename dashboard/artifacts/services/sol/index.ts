/**
 * F1 — SOL authoring (TS-only): serializador `.sop` + validador semántico (eval gate).
 * Se reemplaza por el package `@hexy/sol` en F0 (homologación/monorepo).
 */
export { serializeSop, idFromName, solKeyword } from './serializeSop'
export { validateSop } from './validateSop'
export type { SolValidationError, SolValidationResult, SolSeverity } from './validateSop'
