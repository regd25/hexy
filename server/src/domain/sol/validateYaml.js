/**
 * Validador semántico SOL (eval gate, anti-alucinación) sobre texto `.yaml`.
 * Portado de dashboard/artifacts/services/sol/validateYaml.ts (lógica pura, dependency-free).
 *
 * Reglas:
 *  - PLACEHOLDER:        prohíbe strings genéricos `[Algo]` (no verificables por un agente).
 *  - REFERENCE_NOTATION: toda referencia `Type:Id` debe usar Id `^[A-Z][a-zA-Z0-9]*$`
 *                        (se admite jerarquía de Area con puntos: `Area:Tec.Dev`).
 *  - CROSS_REFERENCE:    toda referencia debe resolver a un artefacto definido (existencia).
 */

const REFERENCE_RE = /\b([A-Z][a-zA-Z]+):([A-Za-z0-9_.[\]-]+)/g
const ID_NOTATION_RE = /^[A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*$/
const PLACEHOLDER_RE = /\[[A-Za-z][^\]\n]*\]/
const DEFINED_ID_RE = /^\s*id:\s*([A-Za-z0-9_]+)\s*$/

/** Valida un documento `.yaml` SOL y devuelve errores con número de línea. */
export function validateYaml(text) {
    const lines = text.split('\n')
    const errors = []

    // 1) Recolectar ids definidos (líneas `id: Foo` dentro de `meta`).
    const definedIds = new Set()
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
        let match
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
        isValid: errors.filter((e) => e.severity === 'error').length === 0,
        errors,
        definedIds: [...definedIds],
    }
}
