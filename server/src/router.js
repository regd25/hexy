/**
 * Router mínimo para node:http: registra (method, pattern) → handler.
 * Los patrones usan segmentos `:param` (p.ej. `/api/artifacts/:id`). Sin dependencias.
 */

import { HttpError, readJsonBody, sendJson, sendPreflight } from './http.js'

/** Compila un patrón tipo `/api/artifacts/:id` a un matcher de pathname. */
function compile(pattern) {
    const segments = pattern.split('/').filter(Boolean)
    return (pathname) => {
        const parts = pathname.split('/').filter(Boolean)
        if (parts.length !== segments.length) return null
        const params = {}
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i]
            if (seg.startsWith(':')) {
                params[seg.slice(1)] = decodeURIComponent(parts[i])
            } else if (seg !== parts[i]) {
                return null
            }
        }
        return params
    }
}

export class Router {
    constructor() {
        this.routes = []
    }

    /** Registra una ruta. handler(ctx) recibe { req, res, params, query, body }. */
    add(method, pattern, handler) {
        this.routes.push({ method, match: compile(pattern), handler, pattern })
        return this
    }

    get(p, h) {
        return this.add('GET', p, h)
    }
    post(p, h) {
        return this.add('POST', p, h)
    }
    patch(p, h) {
        return this.add('PATCH', p, h)
    }
    delete(p, h) {
        return this.add('DELETE', p, h)
    }

    /** Devuelve el handler node:http que resuelve cada request. */
    handler() {
        return async (req, res) => {
            try {
                if (req.method === 'OPTIONS') return sendPreflight(res)

                const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
                const query = Object.fromEntries(url.searchParams)

                for (const route of this.routes) {
                    if (route.method !== req.method) continue
                    const params = route.match(url.pathname)
                    if (!params) continue

                    const body =
                        req.method === 'POST' || req.method === 'PATCH' ? await readJsonBody(req) : undefined

                    return await route.handler({ req, res, params, query, body })
                }

                sendJson(res, 404, { error: `No route for ${req.method} ${url.pathname}` })
            } catch (err) {
                const status = err instanceof HttpError ? err.status : 500
                if (status >= 500) console.error('[server] error:', err)
                sendJson(res, status, { error: err.message ?? 'Internal error' })
            }
        }
    }
}
