/**
 * Parser SOL `.yaml` → modelo (inverso de serializeYaml). Cierra el round-trip de F2:
 * toma el texto canónico que produce el export (un bloque `Type:` por artefacto con
 * `meta.id`, `description` y `relationships` con referencias `Type:Id`) y reconstruye
 * artefactos + relaciones.
 *
 * Parser a medida (line-based) en vez de una dependencia YAML: el formato canónico repite
 * claves top-level (`Intent:` varias veces), que un parser de YAML colapsaría en un mapa.
 * Sin dependencias, coherente con el backend node puro.
 */

import { solKeyword } from './serializeYaml.js'

/** Referencia SOL canónica de un artefacto parseado: `Type:Id`. */
export function solRefFor(artifact) {
    return `${solKeyword(artifact.type)}:${artifact.solId}`
}

const stripQuotes = (s) => s.replace(/^["']|["']$/g, '')

/**
 * @param {string} text  documento `.yaml` SOL
 * @returns {{ artifacts: Array<{solId:string,type:string,name:string,description:string,version:string,relationships:Array<{type:string,targetRef:string}>}> }}
 */
export function parseYaml(text) {
    const lines = String(text ?? '').split('\n')
    const artifacts = []
    let current = null
    let mode = null // 'description' | 'relationships' | 'meta'
    let descLines = null
    let currentRel = null

    const flushDesc = () => {
        if (current && descLines) {
            current.description = descLines.join('\n').trim()
            descLines = null
        }
    }
    const flushRel = () => {
        if (current && currentRel && currentRel.type && currentRel.targetRef) {
            current.relationships.push(currentRel)
        }
        currentRel = null
    }

    for (const raw of lines) {
        const line = raw.replace(/\s+$/, '')

        if (line.trim() === '') {
            flushDesc()
            flushRel()
            mode = null
            continue
        }
        if (line.trimStart().startsWith('#')) continue

        const indent = line.length - line.trimStart().length

        // Captura de descripción (bloque `>` indentado a 4 espacios).
        if (mode === 'description') {
            if (indent >= 4) {
                descLines.push(line.slice(4))
                continue
            }
            flushDesc()
            mode = null
        }

        // Nuevo artefacto: clave top-level en columna 0.
        const top = indent === 0 ? line.match(/^([A-Za-z][A-Za-z0-9]*):\s*$/) : null
        if (top) {
            flushDesc()
            flushRel()
            current = {
                solId: null,
                type: top[1].toLowerCase(),
                name: null,
                description: '',
                version: '1.0.0',
                relationships: [],
            }
            artifacts.push(current)
            mode = null
            continue
        }
        if (!current) continue

        const trimmed = line.trim()

        if (indent === 2 && trimmed === 'meta:') {
            mode = 'meta'
            continue
        }
        if (indent === 4 && trimmed.startsWith('id:')) {
            current.solId = trimmed.slice(3).trim()
            current.name = current.solId
            continue
        }
        if (indent === 4 && trimmed.startsWith('version:')) {
            current.version = stripQuotes(trimmed.slice(8).trim())
            continue
        }
        if (indent === 2 && trimmed === 'description: >') {
            mode = 'description'
            descLines = []
            continue
        }
        if (indent === 2 && trimmed.startsWith('description:')) {
            current.description = trimmed.slice('description:'.length).trim().replace(/^>\s*/, '')
            continue
        }
        if (indent === 2 && trimmed === 'relationships:') {
            mode = 'relationships'
            continue
        }
        if (mode === 'relationships') {
            const t = trimmed.match(/^-\s*type:\s*(.+)$/)
            if (t) {
                flushRel()
                currentRel = { type: t[1].trim(), targetRef: null }
                continue
            }
            const tg = trimmed.match(/^target:\s*(.+)$/)
            if (tg && currentRel) {
                currentRel.targetRef = tg[1].trim()
                continue
            }
        }
    }
    flushDesc()
    flushRel()

    return { artifacts }
}
