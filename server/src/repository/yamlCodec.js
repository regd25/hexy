/**
 * Codec YAML mínimo y sin dependencias para la persistencia de entidades (YamlStore).
 * Cubre exactamente el subconjunto que producen/consumen nuestros .yaml: maps anidados por
 * indentación (2 espacios), listas con `- `, `{}`/`[]` inline para vacíos y escalares
 * (string/number/boolean/null). Sin anchors, tags, multiline ni comentarios de fin de línea.
 * YAML 1.2 en lo que importa: los timestamps ISO se conservan como strings.
 */

const INDENT = '  '

// ---------------------------------------------------------------------------
// stringify
// ---------------------------------------------------------------------------

const NUMBER_RE = /^-?(\d+)(\.\d+)?([eE][+-]?\d+)?$/

/** ¿El string necesita comillas para no cambiar de tipo/romper la sintaxis al re-parsear? */
function needsQuotes(s) {
    if (s.length === 0) return true
    if (/^[\s]|[\s]$/.test(s)) return true // espacios en los bordes
    if (/^["'#&*!|>%@`{}[\]-]/.test(s)) return true // arranques con significado en YAML
    if (s.includes(': ') || s.endsWith(':')) return true
    if (s.includes(' #')) return true // comentario de fin de línea
    if (/[\n\t]/.test(s)) return true
    if (NUMBER_RE.test(s)) return true // parsearía como número
    if (['true', 'false', 'null', '~', 'yes', 'no', 'on', 'off'].includes(s.toLowerCase())) return true
    return false
}

function scalarToYaml(value) {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'boolean' || typeof value === 'number') return String(value)
    if (value instanceof Date) return value.toISOString()
    const s = String(value)
    return needsQuotes(s) ? JSON.stringify(s) : s
}

function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)
}

/** Serializa un valor como bloque; devuelve líneas ya indentadas. */
function blockLines(value, depth) {
    const pad = INDENT.repeat(depth)
    const lines = []
    if (Array.isArray(value)) {
        for (const item of value) {
            if (isPlainObject(item) && Object.keys(item).length > 0) {
                const inner = blockLines(item, depth + 1)
                // Primera clave del map en la línea del guion; el resto alineado debajo.
                lines.push(`${pad}- ${inner[0].slice(INDENT.length * (depth + 1))}`)
                lines.push(...inner.slice(1))
            } else if (Array.isArray(item) && item.length > 0) {
                lines.push(`${pad}-`)
                lines.push(...blockLines(item, depth + 1))
            } else {
                lines.push(`${pad}- ${inlineValue(item)}`)
            }
        }
        return lines
    }
    for (const [key, v] of Object.entries(value)) {
        if (v === undefined) continue
        const k = needsQuotes(key) ? JSON.stringify(key) : key
        if (isPlainObject(v) && Object.keys(v).length > 0) {
            lines.push(`${pad}${k}:`)
            lines.push(...blockLines(v, depth + 1))
        } else if (Array.isArray(v) && v.length > 0) {
            lines.push(`${pad}${k}:`)
            lines.push(...blockLines(v, depth + 1))
        } else {
            lines.push(`${pad}${k}: ${inlineValue(v)}`)
        }
    }
    return lines
}

function inlineValue(v) {
    if (Array.isArray(v)) return '[]'
    if (isPlainObject(v)) return '{}'
    return scalarToYaml(v)
}

/** Objeto → YAML (el top-level debe ser un map, como en YamlStore). */
export function stringify(value) {
    if (!isPlainObject(value)) throw new TypeError('yamlCodec.stringify: se esperaba un objeto')
    return blockLines(value, 0).join('\n') + '\n'
}

// ---------------------------------------------------------------------------
// parse
// ---------------------------------------------------------------------------

function parseScalar(raw) {
    const s = raw.trim()
    if (s === '' || s === 'null' || s === '~') return null
    if (s === 'true') return true
    if (s === 'false') return false
    if (s === '[]') return []
    if (s === '{}') return {}
    if (s.startsWith('"')) return JSON.parse(s) // las dobles comillas de nuestro subset ≡ JSON
    if (s.startsWith("'") && s.endsWith("'") && s.length >= 2) {
        return s.slice(1, -1).replace(/''/g, "'")
    }
    if (NUMBER_RE.test(s)) return Number(s)
    return s
}

/** Divide `key: resto` en la primera `:` seguida de espacio o fin de línea. */
function splitKey(line) {
    // Clave con comillas: "a: b": valor
    if (line.startsWith('"')) {
        const end = line.indexOf('":')
        if (end !== -1) return [JSON.parse(line.slice(0, end + 1)), line.slice(end + 2).trim()]
    }
    const m = line.match(/^([^:]+):(?:\s+(.*))?$/)
    if (!m) return null
    return [m[1].trim(), (m[2] ?? '').trim()]
}

/**
 * Parser recursivo por indentación. `lines` ya viene filtrado (sin blancos/comentarios)
 * como `{ indent, text }`; `pos` es un cursor mutable `{ i }`.
 */
function parseBlock(lines, pos, indent) {
    const isList = lines[pos.i].text.startsWith('- ') || lines[pos.i].text === '-'
    return isList ? parseList(lines, pos, indent) : parseMap(lines, pos, indent)
}

function parseMap(lines, pos, indent) {
    const out = {}
    while (pos.i < lines.length && lines[pos.i].indent === indent) {
        const { text } = lines[pos.i]
        const kv = splitKey(text)
        if (!kv) throw new SyntaxError(`yamlCodec.parse: línea inválida: "${text}"`)
        const [key, rest] = kv
        pos.i++
        if (rest !== '') {
            out[key] = parseScalar(rest)
        } else if (pos.i < lines.length && lines[pos.i].indent > indent) {
            out[key] = parseBlock(lines, pos, lines[pos.i].indent)
        } else {
            out[key] = null
        }
    }
    return out
}

function parseList(lines, pos, indent) {
    const out = []
    while (pos.i < lines.length && lines[pos.i].indent === indent && lines[pos.i].text.startsWith('-')) {
        const rest = lines[pos.i].text.slice(1).trim()
        if (rest === '') {
            pos.i++
            out.push(pos.i < lines.length && lines[pos.i].indent > indent ? parseBlock(lines, pos, lines[pos.i].indent) : null)
            continue
        }
        const kv = splitKey(rest)
        if (kv && kv[1] !== '' ? true : kv && rest.endsWith(':')) {
            // `- key: valor` → map inline: la primera clave vive en la línea del guion.
            // Se re-inyecta como línea virtual con la indentación de las claves siguientes.
            const itemIndent = indent + 2
            lines.splice(pos.i, 1, { indent: itemIndent, text: rest })
            out.push(parseMap(lines, pos, itemIndent))
        } else {
            out.push(parseScalar(rest))
            pos.i++
        }
    }
    return out
}

/** YAML → objeto (o null para documentos vacíos), para el subset descrito arriba. */
export function parse(text) {
    if (typeof text !== 'string') return null
    const lines = []
    for (const rawLine of text.split(/\r?\n/)) {
        if (rawLine.trim() === '' || rawLine.trim().startsWith('#')) continue
        const indent = rawLine.length - rawLine.trimStart().length
        lines.push({ indent, text: rawLine.trim() })
    }
    if (lines.length === 0) return null
    const pos = { i: 0 }
    const result = parseBlock(lines, pos, lines[0].indent)
    if (pos.i < lines.length) {
        throw new SyntaxError(`yamlCodec.parse: contenido inesperado en "${lines[pos.i].text}"`)
    }
    return result
}
