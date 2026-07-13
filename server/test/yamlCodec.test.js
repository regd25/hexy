/** Tests del codec YAML propio (subset de persistencia de entidades). */
import test from 'node:test'
import assert from 'node:assert/strict'

import { parse, stringify } from '../src/repository/yamlCodec.js'

test('round-trip de una entidad artifact realista', () => {
    const artifact = {
        id: '4b170a37-4a7a-4eef-a98f-9f91c1994276',
        name: 'Onboarding',
        type: 'process',
        description: 'Proceso de alta de usuarios.',
        purpose: '',
        context: {},
        authority: '',
        evaluationCriteria: [],
        semanticMetadata: {
            semanticTags: [],
            businessValue: 5,
            stakeholders: [],
            semanticWeight: 0.5,
        },
        visualProperties: {
            x: 459.42648244822965,
            y: 257.1815421484807,
            scale: 1,
            color: '#F97316',
            strokeColor: '#374151',
        },
        version: '1.0.16',
        createdAt: '2026-07-02T17:49:17.196Z',
        relationships: [],
        isValid: true,
        validationErrors: [],
    }
    assert.deepEqual(parse(stringify(artifact)), artifact)
})

test('los tipos ambiguos sobreviven: strings numéricas, hex-color, ISO, vacíos', () => {
    const rt = (v) => parse(stringify(v))
    assert.deepEqual(rt({ v: '1.0.16' }), { v: '1.0.16' }) // string, no número
    assert.deepEqual(rt({ v: 1.5 }), { v: 1.5 }) // número, no string
    assert.deepEqual(rt({ v: '#abc' }), { v: '#abc' }) // requiere comillas
    assert.deepEqual(rt({ v: '2026-07-02T17:49:17.196Z' }), { v: '2026-07-02T17:49:17.196Z' })
    assert.deepEqual(rt({ v: '' }), { v: '' })
    assert.deepEqual(rt({ v: null }), { v: null })
    assert.deepEqual(rt({ v: false }), { v: false })
    assert.deepEqual(rt({ v: 'true' }), { v: 'true' }) // string, no boolean
    assert.deepEqual(rt({ v: {} }), { v: {} })
    assert.deepEqual(rt({ v: [] }), { v: [] })
})

test('listas no vacías: escalares y maps (con anidamiento)', () => {
    const value = {
        tags: ['a', 'b c', '#hash', '1.0'],
        errors: [
            { line: 3, message: 'algo: raro' },
            { line: 7, message: 'otro', nested: { deep: true } },
        ],
    }
    assert.deepEqual(parse(stringify(value)), value)
})

test('parse tolera blancos y comentarios de línea completa', () => {
    const doc = ['# comentario', 'id: x', '', 'meta:', '  # otro comentario', '  k: 1', ''].join('\n')
    assert.deepEqual(parse(doc), { id: 'x', meta: { k: 1 } })
})

test('parse devuelve null para documentos vacíos', () => {
    assert.equal(parse(''), null)
    assert.equal(parse('\n# solo comentario\n'), null)
})

test('strings con caracteres especiales se escapan y recuperan', () => {
    const value = { v: 'línea con "comillas" y : dos puntos', u: 'ends with :' }
    assert.deepEqual(parse(stringify(value)), value)
})
