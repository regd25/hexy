/**
 * SOL serializer + validator (eval gate). Portado de
 * dashboard/artifacts/services/sol/sol.test.ts a node:test.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { serializeYaml, idFromName } from '../src/domain/sol/serializeYaml.js'
import { validateYaml } from '../src/domain/sol/validateYaml.js'

const artifact = (over) => ({
    id: over.id ?? randomUUID(),
    name: over.name ?? 'Sin Nombre',
    type: over.type ?? 'intent',
    description: over.description ?? 'Descripción suficientemente larga para el modelo.',
    version: over.version ?? '1.0.0',
    ...over,
})

const relation = (sourceId, targetId, type = 'depends_on') => ({ sourceId, targetId, type })

test('serializes a valid model that passes the eval gate', () => {
    const intent = artifact({ id: 'i1', name: 'Claridad Semántica', type: 'intent' })
    const process = artifact({ id: 'p1', name: 'Mi Proceso', type: 'process' })
    const yaml = serializeYaml([intent, process], [relation('p1', 'i1')])
    const result = validateYaml(yaml)

    assert.ok(yaml.includes('Intent:'))
    assert.ok(yaml.includes('id: ClaridadSemantica'))
    assert.ok(yaml.includes('target: Intent:ClaridadSemantica'))
    assert.equal(result.isValid, true)
    assert.equal(result.errors.length, 0)
})

test('flags a dangling reference (target deleted)', () => {
    const process = artifact({ id: 'p1', name: 'Mi Proceso', type: 'process' })
    const result = validateYaml(serializeYaml([process], [relation('p1', 'ghost')]))

    assert.equal(result.isValid, false)
    assert.ok(result.errors.some((e) => e.ruleId === 'CROSS_REFERENCE' || e.ruleId === 'REFERENCE_NOTATION'))
})

test('flags a generic placeholder in a description', () => {
    const a = artifact({ id: 'a1', name: 'Visión', type: 'vision', description: 'Lograr [OBJETIVO] pronto' })
    const result = validateYaml(serializeYaml([a], []))

    assert.equal(result.isValid, false)
    assert.ok(result.errors.some((e) => e.ruleId === 'PLACEHOLDER'))
})

test('derives canonical PascalCase ids, stripping accents and spaces', () => {
    assert.equal(idFromName('Claridad Semántica'), 'ClaridadSemantica')
    assert.equal(idFromName('  área de TI '), 'AreaDeTI')
    assert.equal(idFromName(''), 'Unnamed')
})
