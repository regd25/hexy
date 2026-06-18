/**
 * F1 — Validador semántico SOL (eval gate, TS-only)
 * Validación anti-alucinación sobre texto `.sop`, dependency-free. Reglas portadas (enfoque)
 * desde el SemanticValidator de SOL; en F0 se reemplaza por `@hexy/sol`.
 *
 * Reglas implementadas:
 *  - PLACEHOLDER:           prohíbe strings genéricos `[Algo]` (no verificables por un agente).
 *  - REFERENCE_NOTATION:    toda referencia `Type:Id` debe usar Id `^[A-Z][a-zA-Z0-9]*$`
 *                           (se admite jerarquía de Area con puntos: `Area:Tec.Dev`).
 *  - CROSS_REFERENCE:       toda referencia debe resolver a un artefacto definido (existencia).
 */

export type SolSeverity = 'error' | 'warning'

export interface SolValidationError {
    line: number
    message: string
    severity: SolSeverity
    ruleId: 'PLACEHOLDER' | 'REFERENCE_NOTATION' | 'CROSS_REFERENCE'
}

export interface SolValidationResult {
    isValid: boolean
    errors: SolValidationError[]
    definedIds: string[]
}

// Referencia semántica `Type:Id` (Type en PascalCase). El Id se captura de forma laxa para
// poder validar su notación después.
const REFERENCE_RE = /\b([A-Z][a-zA-Z]+):([A-Za-z0-9_.[\]-]+)/g
const ID_NOTATION_RE = /^[A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*$/
const PLACEHOLDER_RE = /\[[A-Za-z][^\]\n]*\]/
const DEFINED_ID_RE = /^\s*id:\s*([A-Za-z0-9_]+)\s*$/

/** Valida un documento `.sop` y devuelve errores con número de línea. */
export function validateSop(text: string): SolValidationResult {
    const lines = text.split('\n')
    const errors: SolValidationError[] = []

    // 1) Recolectar ids definidos (líneas `id: Foo` dentro de `meta`).
    const definedIds = new Set<string>()
    for (const line of lines) {
        const m = DEFINED_ID_RE.exec(line)
        if (m) definedIds.add(m[1])
    }

    // 2) Recorrer líneas: placeholders + referencias.
    lines.forEach((line, idx) => {
        const lineNo = idx + 1

        if (PLACEHOLDER_RE.test(line)) {
            errors.push({
                line: lineNo,
                message: `Placeholder genérico no permitido: usa una referencia o valor concreto (regla anti-alucinación)`,
                severity: 'error',
                ruleId: 'PLACEHOLDER',
            })
        }

        REFERENCE_RE.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = REFERENCE_RE.exec(line)) !== null) {
            const [, type, rawId] = match
            const ref = `${type}:${rawId}`

            if (!ID_NOTATION_RE.test(rawId)) {
                errors.push({
                    line: lineNo,
                    message: `Referencia con notación inválida: ${ref} (esperado Type:Id en PascalCase)`,
                    severity: 'error',
                    ruleId: 'REFERENCE_NOTATION',
                })
                continue
            }

            const baseId = rawId.split('.')[0]
            if (!definedIds.has(baseId)) {
                errors.push({
                    line: lineNo,
                    message: `Referencia a artefacto inexistente: ${ref} (no hay un artefacto con id "${baseId}")`,
                    severity: 'error',
                    ruleId: 'CROSS_REFERENCE',
                })
            }
        }
    })

    return {
        isValid: errors.filter(e => e.severity === 'error').length === 0,
        errors,
        definedIds: [...definedIds],
    }
}
