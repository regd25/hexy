/**
 * Simulación de fuerzas mínima (sin D3). Reemplaza d3.forceSimulation del dashboard antiguo:
 * repulsión entre nodos (charge), resortes en aristas (link) y centrado. Pensada para grafos
 * pequeños — la repulsión es O(n²), lo cual es suficiente para el tamaño de estos modelos.
 *
 * Uso:
 *   const sim = createForceLayout({ nodes, links, width, height })
 *   sim.animate(positions => …, finalPositions => …)  // animado (rAF)
 *   sim.runStatic(300)                                  // N ticks sin render → sim.positions()
 */

const DEFAULTS = {
    linkDistance: 120, // distancia objetivo de las aristas
    linkStrength: 0.08, // rigidez del resorte
    charge: 4000, // fuerza de repulsión (∝ 1/dist²)
    centerStrength: 0.02, // atracción hacia el centro
    damping: 0.85, // fricción (0..1); menor = se frena antes
    alpha: 1, // "temperatura" inicial
    alphaDecay: 0.02, // decaimiento por tick
    alphaMin: 0.02, // umbral para detener la animación
    maxTicks: 600, // tope duro de ticks en runStatic
}

export function createForceLayout({ nodes, links, width, height, options = {} }) {
    const opts = { ...DEFAULTS, ...options }
    const cx = width / 2
    const cy = height / 2

    // Copia mutable con velocidad. Conserva las posiciones iniciales.
    const sim = nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, vx: 0, vy: 0 }))
    const byId = new Map(sim.map((n) => [n.id, n]))
    const pinned = new Set()

    let alpha = opts.alpha

    function tick() {
        // Repulsión (charge): cada par se repele ∝ 1/dist².
        for (let i = 0; i < sim.length; i++) {
            const a = sim[i]
            for (let j = i + 1; j < sim.length; j++) {
                const b = sim[j]
                let dx = a.x - b.x
                let dy = a.y - b.y
                let d2 = dx * dx + dy * dy
                if (d2 === 0) {
                    // Desempata nodos superpuestos con un jitter determinista-ish.
                    dx = (Math.random() - 0.5) * 0.01
                    dy = (Math.random() - 0.5) * 0.01
                    d2 = dx * dx + dy * dy
                }
                const dist = Math.sqrt(d2)
                const force = (opts.charge / d2) * alpha
                const fx = (dx / dist) * force
                const fy = (dy / dist) * force
                a.vx += fx
                a.vy += fy
                b.vx -= fx
                b.vy -= fy
            }
        }

        // Resorte (link): atrae los pares enlazados hacia linkDistance.
        for (const l of links) {
            const s = byId.get(l.sourceId)
            const t = byId.get(l.targetId)
            if (!s || !t) continue
            const dx = t.x - s.x
            const dy = t.y - s.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
            const diff = (dist - opts.linkDistance) / dist
            const force = diff * opts.linkStrength * alpha
            const fx = dx * force
            const fy = dy * force
            s.vx += fx
            s.vy += fy
            t.vx -= fx
            t.vy -= fy
        }

        // Centrado: empuje suave hacia el centro del canvas.
        for (const n of sim) {
            n.vx += (cx - n.x) * opts.centerStrength * alpha
            n.vy += (cy - n.y) * opts.centerStrength * alpha
        }

        // Integración + fricción. Los nodos fijados (pinned) no se mueven.
        for (const n of sim) {
            if (pinned.has(n.id)) {
                n.vx = 0
                n.vy = 0
                continue
            }
            n.vx *= opts.damping
            n.vy *= opts.damping
            n.x += n.vx
            n.y += n.vy
        }

        alpha = Math.max(0, alpha - opts.alphaDecay)
    }

    function positions() {
        return sim.map((n) => ({ id: n.id, x: n.x, y: n.y }))
    }

    return {
        /** Fija/actualiza la posición de un nodo (equivalente a fx/fy de D3). */
        pin(id, x, y) {
            const n = byId.get(id)
            if (!n) return
            if (x !== undefined) n.x = x
            if (y !== undefined) n.y = y
            pinned.add(id)
        },
        unpin(id) {
            pinned.delete(id)
        },
        /** Corre N ticks sin animar (posicionamiento inicial). Devuelve las posiciones. */
        runStatic(iterations = 300) {
            const n = Math.min(iterations, opts.maxTicks)
            for (let i = 0; i < n; i++) tick()
            return positions()
        },
        /**
         * Anima con requestAnimationFrame hasta estabilizar (alpha < alphaMin).
         * onTick(positions) por frame; onEnd(finalPositions) al terminar.
         * Devuelve una función para cancelar.
         */
        animate(onTick, onEnd) {
            let raf = null
            let stopped = false
            const step = () => {
                if (stopped) return
                tick()
                onTick?.(positions())
                if (alpha <= opts.alphaMin) {
                    onEnd?.(positions())
                    return
                }
                raf = requestAnimationFrame(step)
            }
            raf = requestAnimationFrame(step)
            return () => {
                stopped = true
                if (raf) cancelAnimationFrame(raf)
            }
        },
        positions,
    }
}
