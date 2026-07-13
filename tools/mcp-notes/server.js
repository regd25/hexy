#!/usr/bin/env node
/**
 * hexy-notes — servidor MCP mínimo de prueba (F5). Node puro, transporte stdio:
 * JSON-RPC 2.0, un mensaje por línea. Implementa el subconjunto que consume el
 * HarnessRuntime: initialize, notifications/initialized, tools/list y tools/call.
 *
 * Tres tools sobre un archivo de notas (efecto real, ligero y seguro), anotadas con la
 * semántica MCP estándar (readOnlyHint / destructiveHint / idempotentHint) para que el
 * guardrail de Authority (PEP/PDP) decida permisos:
 *   - notes_append  → escribe (ni readOnly ni destructive)
 *   - notes_read    → readOnlyHint: true
 *   - notes_clear   → destructiveHint: true
 *
 * Archivo de notas: HEXY_NOTES_FILE (default: tools/mcp-notes/data/notes.md).
 */

import { appendFileSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const NOTES_FILE =
    process.env.HEXY_NOTES_FILE ?? join(dirname(fileURLToPath(import.meta.url)), 'data', 'notes.md')

function ensureDir() {
    mkdirSync(dirname(NOTES_FILE), { recursive: true })
}

const TOOLS = [
    {
        name: 'notes_append',
        description: 'Añade una línea al archivo de notas compartido.',
        inputSchema: {
            type: 'object',
            properties: { text: { type: 'string', description: 'Texto a añadir' } },
            required: ['text'],
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    {
        name: 'notes_read',
        description: 'Lee el contenido completo del archivo de notas.',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    {
        name: 'notes_clear',
        description: 'Borra TODAS las notas (irreversible).',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
]

function callTool(name, args) {
    ensureDir()
    if (name === 'notes_append') {
        const text = String(args?.text ?? '').trim()
        if (!text) return { content: [{ type: 'text', text: 'Error: text vacío' }], isError: true }
        appendFileSync(NOTES_FILE, `- ${new Date().toISOString()} ${text}\n`, 'utf-8')
        return { content: [{ type: 'text', text: `Nota añadida a ${NOTES_FILE}: «${text}»` }], isError: false }
    }
    if (name === 'notes_read') {
        const body = existsSync(NOTES_FILE) ? readFileSync(NOTES_FILE, 'utf-8') : ''
        return { content: [{ type: 'text', text: body || '(sin notas)' }], isError: false }
    }
    if (name === 'notes_clear') {
        writeFileSync(NOTES_FILE, '', 'utf-8')
        return { content: [{ type: 'text', text: 'Notas borradas' }], isError: false }
    }
    return { content: [{ type: 'text', text: `Tool desconocida: ${name}` }], isError: true }
}

function reply(id, result) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n')
}
function replyError(id, code, message) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n')
}

const rl = createInterface({ input: process.stdin, terminal: false })
rl.on('line', (line) => {
    const raw = line.trim()
    if (!raw) return
    let msg
    try {
        msg = JSON.parse(raw)
    } catch {
        return
    }
    const { id, method, params } = msg
    try {
        if (method === 'initialize') {
            reply(id, {
                protocolVersion: params?.protocolVersion ?? '2025-03-26',
                capabilities: { tools: {} },
                serverInfo: { name: 'hexy-notes', version: '0.1.0' },
            })
        } else if (method === 'notifications/initialized') {
            /* notificación: sin respuesta */
        } else if (method === 'tools/list') {
            reply(id, { tools: TOOLS })
        } else if (method === 'tools/call') {
            reply(id, callTool(params?.name, params?.arguments ?? {}))
        } else if (id !== undefined) {
            replyError(id, -32601, `Method not found: ${method}`)
        }
    } catch (err) {
        if (id !== undefined) replyError(id, -32603, err.message)
    }
})
