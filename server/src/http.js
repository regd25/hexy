/**
 * Helpers HTTP sobre node:http puro: parseo de body JSON, respuestas JSON, CORS y errores.
 */

/** Error de dominio con status HTTP asociado (lo traduce el router a la respuesta). */
export class HttpError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
        this.name = 'HttpError'
    }
}

export const notFound = (msg = 'Not found') => new HttpError(404, msg)
export const badRequest = (msg = 'Bad request') => new HttpError(400, msg)

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

/** Escribe una respuesta JSON con CORS. */
export function sendJson(res, status, payload) {
    const body = payload === undefined ? '' : JSON.stringify(payload)
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        ...CORS_HEADERS,
    })
    res.end(body)
}

/** Escribe una respuesta de texto plano con CORS (p.ej. el YAML SOL). */
export function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
    const body = text ?? ''
    res.writeHead(status, {
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(body),
        ...CORS_HEADERS,
    })
    res.end(body)
}

/** Responde un preflight CORS. */
export function sendPreflight(res) {
    res.writeHead(204, CORS_HEADERS)
    res.end()
}

/** Lee y parsea el body JSON de una request. Lanza HttpError(400) si el JSON es inválido. */
export function readJsonBody(req, limitBytes = 5 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
        const chunks = []
        let size = 0
        req.on('data', (chunk) => {
            size += chunk.length
            if (size > limitBytes) {
                reject(new HttpError(413, 'Payload too large'))
                req.destroy()
                return
            }
            chunks.push(chunk)
        })
        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf-8').trim()
            if (!raw) return resolve({})
            try {
                resolve(JSON.parse(raw))
            } catch {
                reject(new HttpError(400, 'Invalid JSON body'))
            }
        })
        req.on('error', reject)
    })
}
