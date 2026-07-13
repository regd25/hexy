/**
 * Utilidades de @menciones (referencias a otros artefactos), compartidas entre el editor
 * flotante (autocompletado), el flujo de autoría (mención → relación) y el grafo (nodos
 * fantasma para referencias sin resolver).
 */

/** Caracteres válidos dentro de una @mención. */
const MENTION_CHARS = 'A-Za-zÁÉÍÓÚÑáéíóú0-9-'

/** Coincide una @mención EN CURSO al final del texto (para el autocompletado). */
export const MENTION_RE = new RegExp(`@([${MENTION_CHARS}]*)$`)

/** Coincide todas las @menciones COMPLETAS de un texto. */
export const MENTION_GLOBAL_RE = new RegExp(`@([${MENTION_CHARS}]+)`, 'g')

/** Normaliza un nombre/mención para comparación: sin espacios, en minúsculas. */
export const sanitize = (s) => String(s ?? '').replace(/\s+/g, '').toLowerCase()

/** Quita solo los espacios (conserva mayúsculas) — para el texto insertado. */
export const stripSpaces = (s) => String(s ?? '').replace(/\s+/g, '')

/** Extrae los nombres de todas las @menciones completas de un texto. */
export function parseMentions(text) {
    const matches = String(text ?? '').match(MENTION_GLOBAL_RE) || []
    return matches.map((m) => m.slice(1))
}
