import { describe, it, expect } from 'vitest'
import type { VisualArtifact, Relationship } from '../../types'
import { serializeSop, idFromName } from './serializeSop'
import { validateSop } from './validateSop'

const artifact = (over: Partial<VisualArtifact>): VisualArtifact =>
    ({
        id: over.id ?? crypto.randomUUID(),
        name: over.name ?? 'Sin Nombre',
        type: over.type ?? 'intent',
        description: over.description ?? 'Descripción suficientemente larga para el modelo.',
        version: over.version ?? '1.0.0',
        ...over,
    }) as VisualArtifact

const relation = (sourceId: string, targetId: string, type = 'depends_on'): Relationship =>
    ({ sourceId, targetId, type } as Relationship)

describe('sol serializer + validator (F1 eval gate)', () => {
    it('serializes a valid model that passes the eval gate', () => {
        const intent = artifact({ id: 'i1', name: 'Claridad Semántica', type: 'intent' })
        const process = artifact({ id: 'p1', name: 'Mi Proceso', type: 'process' })
        const rels = [relation('p1', 'i1')]

        const sop = serializeSop([intent, process], rels)
        const result = validateSop(sop)

        expect(sop).toContain('Intent:')
        expect(sop).toContain('id: ClaridadSemantica')
        expect(sop).toContain('target: Intent:ClaridadSemantica')
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('flags a dangling reference (target deleted) as CROSS_REFERENCE / notation error', () => {
        const process = artifact({ id: 'p1', name: 'Mi Proceso', type: 'process' })
        // target 'ghost' no existe entre los artefactos => referencia colgante
        const rels = [relation('p1', 'ghost')]

        const result = validateSop(serializeSop([process], rels))

        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.ruleId === 'CROSS_REFERENCE' || e.ruleId === 'REFERENCE_NOTATION')).toBe(true)
    })

    it('flags a generic placeholder in a description', () => {
        const a = artifact({ id: 'a1', name: 'Visión', type: 'vision', description: 'Lograr [OBJETIVO] pronto' })

        const result = validateSop(serializeSop([a], []))

        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.ruleId === 'PLACEHOLDER')).toBe(true)
    })

    it('derives canonical PascalCase ids, stripping accents and spaces', () => {
        expect(idFromName('Claridad Semántica')).toBe('ClaridadSemantica')
        expect(idFromName('  área de TI ')).toBe('AreaDeTI')
        expect(idFromName('')).toBe('Unnamed')
    })
})
