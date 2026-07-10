/** Construcción de nodos (artefactos y temporales) como elementos DOM. */
import { COLORS, NODE_SIZE } from '../constants.js'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Posición top-left del nodo. */
function nodePos(a) {
    return {
        x: a.visualProperties?.x ?? a.coordinates?.x ?? 0,
        y: a.visualProperties?.y ?? a.coordinates?.y ?? 0,
    }
}

/** Centroide del nodo (para anclar aristas). */
export function nodeCenter(a) {
    const p = nodePos(a)
    return { x: p.x + NODE_SIZE / 2, y: p.y + NODE_SIZE / 2 }
}

/** Crea el elemento DOM de un artefacto permanente. */
export function createArtifactNode(artifact, { selected, active } = {}) {
    const el = document.createElement('div')
    el.className = 'node'
    el.dataset.id = artifact.id
    const { x, y } = nodePos(artifact)
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.style.backgroundColor = COLORS[artifact.type] ?? '#3b82f6'

    const errors = artifact.validationErrors ?? []
    if (errors.length > 0) el.classList.add('node--error')
    if (selected) el.classList.add('node--selected')
    if (active) {
        el.classList.add('node--active')
        el.style.cursor = 'default'
    }

    const label = document.createElement('span')
    label.className = 'node__label'
    label.textContent = artifact.name || '?'
    el.appendChild(label)

    if (errors.length > 0) {
        const badge = document.createElement('div')
        badge.className = 'node__badge'
        badge.textContent = `${errors.length} error(es)`
        el.appendChild(badge)

        el.addEventListener('mouseenter', () => showTooltip(el, errors))
        el.addEventListener('mouseleave', () => hideTooltip(el))
    }

    el.title = artifact.name ?? ''
    return el
}

/** Crea el elemento DOM de un artefacto temporal (borrador). */
export function createTemporalNode(temporal, { current } = {}) {
    const el = document.createElement('div')
    el.className = 'node node--temporal pulse'
    el.dataset.temporaryId = temporal.temporaryId
    const x = temporal.visualProperties?.x ?? temporal.coordinates?.x ?? 0
    const y = temporal.visualProperties?.y ?? temporal.coordinates?.y ?? 0
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.style.backgroundColor = temporal.visualState?.color ?? '#94A3B8'
    el.style.opacity = String(temporal.visualState?.opacity ?? 0.7)
    if (current) el.style.borderColor = '#60a5fa'

    const label = document.createElement('span')
    label.className = 'node__label'
    label.textContent = temporal.name || '?'
    el.appendChild(label)

    const badge = document.createElement('div')
    badge.className = 'node__badge node__badge--temp'
    badge.textContent = 'temp'
    el.appendChild(badge)

    return el
}

/**
 * Crea el elemento DOM de un nodo "referencia" fantasma: una @mención escrita en alguna
 * descripción que aún no corresponde a ningún artefacto. No está persistido; es solo feedback
 * visual (más pequeño, punteado). Click → promoverlo a artefacto real.
 */
export function createReferenceNode(name, { x, y }, onClick) {
    const el = document.createElement('div')
    el.className = 'node node--reference'
    el.dataset.reference = name
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.style.backgroundColor = COLORS.reference

    const label = document.createElement('span')
    label.className = 'node__label'
    label.textContent = name
    el.appendChild(label)

    el.title = `Referencia sin resolver: @${name} (clic para crearla)`
    el.addEventListener('click', (e) => {
        e.stopPropagation()
        onClick?.(name)
    })
    return el
}

function showTooltip(nodeEl, messages) {
    hideTooltip(nodeEl)
    const tip = document.createElement('div')
    tip.className = 'node__tooltip'
    const top = parseFloat(nodeEl.style.top) || 0
    if (top > 100) tip.style.bottom = `${NODE_SIZE + 8}px`
    else tip.style.top = `${NODE_SIZE + 8}px`
    tip.innerHTML = messages.map((m) => `<div>• ${escapeHtml(m)}</div>`).join('')
    nodeEl.appendChild(tip)
}

function hideTooltip(nodeEl) {
    nodeEl.querySelector('.node__tooltip')?.remove()
}

function escapeHtml(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
}

/** Dibuja todas las aristas (relaciones) dentro del SVG dado. */
export function drawEdges(svg, artifacts, relationships, overridePos) {
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const defs = document.createElementNS(SVG_NS, 'defs')
    defs.innerHTML =
        '<marker id="hexy-edge-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b" /></marker>'
    svg.appendChild(defs)

    const centerById = new Map(
        artifacts.map((a) => [a.id, overridePos?.id === a.id ? overridePos.center : nodeCenter(a)])
    )

    for (const r of relationships) {
        const s = centerById.get(r.sourceId)
        const t = centerById.get(r.targetId)
        if (!s || !t) continue
        const line = document.createElementNS(SVG_NS, 'line')
        line.setAttribute('x1', s.x)
        line.setAttribute('y1', s.y)
        line.setAttribute('x2', t.x)
        line.setAttribute('y2', t.y)
        line.setAttribute('stroke', '#64748b')
        line.setAttribute('stroke-width', '2')
        line.setAttribute('opacity', '0.8')
        line.setAttribute('marker-end', 'url(#hexy-edge-arrow)')
        svg.appendChild(line)
    }
}
