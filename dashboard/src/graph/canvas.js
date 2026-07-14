/**
 * Canvas del grafo (vanilla). Renderiza nodos + aristas y maneja todas las interacciones
 * portadas de useGraphInteractions: drag de nodos, selección rubber-band, doble-click para
 * crear relación, context menu y borrado por teclado.
 */

import { getState, getPhantoms, actions } from '../state/store.js'
import { showSuccess, showError } from '../notifications.js'
import { NODE_SIZE } from '../constants.js'
import { createArtifactNode, createTemporalNode, createReferenceNode, drawEdges, syncDeclaredEdges, centersOf, nodeCenter } from './nodes.js'
import { openContextMenu } from '../components/contextMenu.js'
import { createForceLayout } from './forceLayout.js'

const DRAG_DELAY_MS = 120
const SELECTION_THRESHOLD = 6
const SVG_NS = 'http://www.w3.org/2000/svg'

const ZOOM_MIN = 0.2
const ZOOM_MAX = 5

export function createCanvas({ onCreateAt, onOpenEditor, getActiveArtifactId, onCreateFromMention }) {
    const el = document.createElement('div')
    el.className = 'canvas'

    // Capa "mundo": contiene aristas + nodos y recibe el transform de zoom/paneo. Los nodos
    // se posicionan en coordenadas de mundo (su x,y guardada); el transform hace el resto.
    const world = document.createElement('div')
    world.className = 'canvas__world'
    el.appendChild(world)

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('class', 'canvas__edges')
    world.appendChild(svg)

    const PHANTOM_SIZE = 40 // ver .node--reference en el CSS

    // Viewport de zoom/paneo. scale=1, sin desplazamiento por defecto.
    const viewport = { scale: 1, tx: 0, ty: 0 }
    function applyTransform() {
        world.style.transform = `translate(${viewport.tx}px, ${viewport.ty}px) scale(${viewport.scale})`
    }

    let selectionEl = null

    // --- estado de interacción ---
    let pendingDrag = null // { id, offsetX, offsetY, startX, startY }
    let mouseDownAt = 0
    let isDragging = false
    let draggingId = null
    let dragOffset = { x: 0, y: 0 }
    let draggingEl = null
    let liveDragCenter = null

    let relationSourceId = null
    let relationLine = null

    let selectionStart = null
    let isSelecting = false
    let suppressClickUntil = 0
    let justDragged = false

    // Paneo: arrastre con botón central o con Espacio + botón izquierdo.
    let panning = null // { startX, startY, tx0, ty0 }
    let spaceDown = false

    const rectOf = () => el.getBoundingClientRect()
    // Pantalla → mundo (deshace el transform del viewport).
    const toWorld = (e) => {
        const r = rectOf()
        return {
            x: (e.clientX - r.left - viewport.tx) / viewport.scale,
            y: (e.clientY - r.top - viewport.ty) / viewport.scale,
        }
    }
    // Mundo → pantalla (para posicionar los editores flotantes sobre un nodo).
    function worldToScreen(x, y) {
        const r = rectOf()
        return { x: r.left + viewport.tx + x * viewport.scale, y: r.top + viewport.ty + y * viewport.scale }
    }

    // --- render ---
    let nodeEls = new Map() // id → elemento .node (para el fast-path de posiciones)
    let lastStructure = null // referencias de la última estructura renderizada (diff barato)

    function render() {
        const state = getState()

        // Fast-path: si solo cambió la selección/activo (el store reemplaza los arrays en cada
        // cambio estructural, así que comparar referencias basta), actualiza clases y sal.
        // Crítico: la selección rubber-band emite por mousemove — reconstruir cientos de nodos
        // por evento congela el canvas.
        const structural =
            !lastStructure ||
            lastStructure.artifacts !== state.artifacts ||
            lastStructure.relationships !== state.relationships ||
            lastStructure.temporals !== state.temporals ||
            lastStructure.inferred !== state.inferred
        if (!structural) {
            const activeId = getActiveArtifactId?.()
            for (const [id, elNode] of nodeEls) {
                elNode.classList.toggle('node--selected', state.selectedIds.has(id))
                elNode.classList.toggle('node--active', activeId === id)
            }
            return
        }
        lastStructure = {
            artifacts: state.artifacts,
            relationships: state.relationships,
            temporals: state.temporals,
            inferred: state.inferred,
        }

        // Quita nodos previos (conserva svg + selection rect).
        world.querySelectorAll('.node').forEach((n) => n.remove())
        nodeEls = new Map()

        const phantoms = computePhantoms(state)
        redrawEdges(phantoms)

        const activeId = getActiveArtifactId?.()
        // Los nodos se insertan en un fragment: una sola inserción al DOM (importante con cientos).
        const frag = document.createDocumentFragment()
        for (const a of state.artifacts) {
            const node = createArtifactNode(a, {
                selected: state.selectedIds.has(a.id),
                active: activeId === a.id,
            })
            wireNode(node, a)
            frag.appendChild(node)
            nodeEls.set(a.id, node)
        }
        for (const t of state.temporals) {
            frag.appendChild(createTemporalNode(t, { current: true }))
        }
        for (const p of phantoms) {
            frag.appendChild(
                createReferenceNode(p.name, { x: p.x, y: p.y }, (name) =>
                    onCreateFromMention?.(name, p.sources, { x: p.x, y: p.y })
                )
            )
        }
        world.appendChild(frag)
    }

    /**
     * Fast-path de posiciones: mueve nodos y aristas EXISTENTES actualizando solo atributos,
     * sin destruir/recrear DOM. Es lo que hace fluido el layout animado y el drag con
     * cientos de nodos (el render() completo queda para cambios estructurales).
     */
    function syncPositions(override) {
        const state = getState()
        for (const a of state.artifacts) {
            if (override?.id === a.id) continue // el nodo en drag ya lo mueve el handler
            const elNode = nodeEls.get(a.id)
            if (!elNode) continue
            elNode.style.left = `${a.visualProperties?.x ?? 0}px`
            elNode.style.top = `${a.visualProperties?.y ?? 0}px`
        }
        syncEdges(override)
    }

    /** Re-posiciona aristas declaradas + overlay inferido in place. */
    function syncEdges(override) {
        const state = getState()
        const centerById = centersOf(state.artifacts, override)
        syncDeclaredEdges(svg, centerById)
        if (inferredPath && inferredPairs.length > 0) {
            inferredPath.setAttribute('d', inferredD(centerById))
        }
    }

    /**
     * Calcula la posición de los nodos fantasma: junto al primer artefacto que los menciona,
     * con un desplazamiento que reduce solapes cuando un mismo artefacto tiene varias.
     */
    function computePhantoms(state) {
        const byId = new Map(state.artifacts.map((a) => [a.id, a]))
        const perSource = new Map() // sourceId → cuántas fantasmas lleva colocadas
        return getPhantoms().map((p) => {
            const source = byId.get(p.sources[0])
            const c = source ? nodeCenter(source) : { x: 200, y: 200 }
            const n = perSource.get(p.sources[0]) ?? 0
            perSource.set(p.sources[0], n + 1)
            const angle = -Math.PI / 4 + n * (Math.PI / 6)
            const dist = 120
            return {
                ...p,
                x: c.x + Math.cos(angle) * dist - PHANTOM_SIZE / 2,
                y: c.y + Math.sin(angle) * dist - PHANTOM_SIZE / 2,
            }
        })
    }

    // Overlay inferido (F3): con cientos de relaciones inferidas, un <line> por arista mata el
    // rendimiento. Se dibujan TODAS en un único <path> (un solo elemento DOM).
    let inferredPath = null
    let inferredPairs = [] // [{sourceId, targetId}] del último redraw

    function inferredD(centerById) {
        let d = ''
        for (const p of inferredPairs) {
            const s = centerById.get(p.sourceId)
            const t = centerById.get(p.targetId)
            if (!s || !t) continue
            d += `M${s.x},${s.y}L${t.x},${t.y}`
        }
        return d
    }

    function redrawEdges(phantoms) {
        const state = getState()
        const override = isDragging && draggingId && liveDragCenter ? { id: draggingId, center: liveDragCenter } : null
        drawEdges(svg, state.artifacts, state.relationships, override)
        inferredPath = null

        // Aristas punteadas hacia los nodos fantasma (referencias sin resolver).
        const list = phantoms ?? computePhantoms(state)
        if (list.length > 0) {
            const byId = new Map(state.artifacts.map((a) => [a.id, a]))
            for (const p of list) {
                const pc = { x: p.x + PHANTOM_SIZE / 2, y: p.y + PHANTOM_SIZE / 2 }
                for (const sourceId of p.sources) {
                    const s = byId.get(sourceId)
                    if (!s) continue
                    const sc = override?.id === sourceId ? override.center : nodeCenter(s)
                    const line = document.createElementNS(SVG_NS, 'line')
                    line.setAttribute('x1', sc.x)
                    line.setAttribute('y1', sc.y)
                    line.setAttribute('x2', pc.x)
                    line.setAttribute('y2', pc.y)
                    line.setAttribute('stroke', '#64748b')
                    line.setAttribute('stroke-width', '1.5')
                    line.setAttribute('stroke-dasharray', '3,3')
                    line.setAttribute('opacity', '0.6')
                    svg.appendChild(line)
                }
            }
        }

        // Overlay de relaciones inferidas por el motor (F3): ámbar punteado, todo en UN path.
        inferredPairs = state.inferred.map((r) => ({ sourceId: r.sourceId, targetId: r.targetId }))
        if (inferredPairs.length > 0) {
            const centerById = centersOf(state.artifacts, override)
            inferredPath = document.createElementNS(SVG_NS, 'path')
            inferredPath.setAttribute('d', inferredD(centerById))
            inferredPath.setAttribute('fill', 'none')
            inferredPath.setAttribute('stroke', '#f59e0b')
            inferredPath.setAttribute('stroke-width', '2')
            inferredPath.setAttribute('stroke-dasharray', '2,4')
            inferredPath.setAttribute('opacity', '0.85')
            svg.appendChild(inferredPath)
        }

        if (relationLine) {
            const line = document.createElementNS(SVG_NS, 'line')
            line.setAttribute('x1', relationLine.x1)
            line.setAttribute('y1', relationLine.y1)
            line.setAttribute('x2', relationLine.x2)
            line.setAttribute('y2', relationLine.y2)
            line.setAttribute('stroke', '#60a5fa')
            line.setAttribute('stroke-width', '2')
            line.setAttribute('stroke-dasharray', '5,5')
            svg.appendChild(line)
        }
    }

    // --- nodos ---
    function wireNode(node, artifact) {
        node.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return
            if (getActiveArtifactId?.() === artifact.id) return
            e.stopPropagation()
            const { x, y } = toWorld(e)
            pendingDrag = {
                id: artifact.id,
                offsetX: x - (artifact.visualProperties?.x ?? 0),
                offsetY: y - (artifact.visualProperties?.y ?? 0),
                startX: x,
                startY: y,
            }
            mouseDownAt = Date.now()
        })

        node.addEventListener('click', (e) => {
            if (justDragged) {
                justDragged = false
                return
            }
            e.stopPropagation()
            pendingDrag = null
            isDragging = false
            draggingId = null
            onOpenEditor?.(artifact)
        })

        node.addEventListener('dblclick', (e) => {
            e.preventDefault()
            e.stopPropagation()
            const c = nodeCenter(artifact)
            relationSourceId = artifact.id
            const { x, y } = toWorld(e)
            relationLine = { x1: c.x, y1: c.y, x2: x, y2: y }
            redrawEdges()
        })
    }

    // --- zoom (rueda, hacia el cursor) ---
    el.addEventListener(
        'wheel',
        (e) => {
            e.preventDefault()
            const r = rectOf()
            const mx = e.clientX - r.left
            const my = e.clientY - r.top
            const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
            const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, viewport.scale * factor))
            const k = newScale / viewport.scale
            // Mantén fijo el punto bajo el cursor: tx' = mx - (mx - tx) * k
            viewport.tx = mx - (mx - viewport.tx) * k
            viewport.ty = my - (my - viewport.ty) * k
            viewport.scale = newScale
            applyTransform()
        },
        { passive: false }
    )

    // --- canvas ---
    el.addEventListener('mousedown', (e) => {
        // Paneo: botón central, o Espacio + botón izquierdo.
        if (e.button === 1 || (e.button === 0 && spaceDown)) {
            e.preventDefault()
            panning = { startX: e.clientX, startY: e.clientY, tx0: viewport.tx, ty0: viewport.ty }
            el.classList.add('canvas--panning')
            return
        }
        if (e.button !== 0) return
        e.preventDefault()
        const { x, y } = toWorld(e)
        selectionStart = { x, y }
        removeSelectionRect()
        if (!e.shiftKey) actions.clearSelection()
    })

    el.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        openContextMenu(e.clientX, e.clientY, {
            disabled: getState().selectedIds.size === 0,
            onDelete: deleteSelected,
        })
    })

    el.addEventListener('click', async (e) => {
        if (Date.now() < suppressClickUntil) return
        if (e.target.closest('.node')) return
        if (getActiveArtifactId?.()) return
        const { x, y } = toWorld(e)
        onCreateAt?.(x, y)
    })

    // Throttle a un frame para el re-posicionado de aristas durante el drag.
    let edgeSyncRaf = null
    function scheduleEdgeSync() {
        if (edgeSyncRaf) return
        edgeSyncRaf = requestAnimationFrame(() => {
            edgeSyncRaf = null
            const override = isDragging && draggingId && liveDragCenter ? { id: draggingId, center: liveDragCenter } : null
            syncEdges(override)
        })
    }

    // mousemove/up a nivel documento → el drag/selección continúan fuera del canvas.
    function onDocMouseMove(e) {
        // Paneo en curso: desplaza el viewport y sale.
        if (panning) {
            viewport.tx = panning.tx0 + (e.clientX - panning.startX)
            viewport.ty = panning.ty0 + (e.clientY - panning.startY)
            applyTransform()
            return
        }

        const { x, y } = toWorld(e)

        // Selección rubber-band
        if (selectionStart) {
            const dx = x - selectionStart.x
            const dy = y - selectionStart.y
            if (!isSelecting && (Math.abs(dx) > SELECTION_THRESHOLD || Math.abs(dy) > SELECTION_THRESHOLD)) {
                isSelecting = true
            }
            if (isSelecting) {
                updateSelectionRect(selectionStart.x, selectionStart.y, dx, dy)
                actions.setSelection(computeSelection(selectionStart.x, selectionStart.y, dx, dy))
                return
            }
        }

        // Arranque de drag tras el delay
        if (!isDragging && pendingDrag && Date.now() - mouseDownAt >= DRAG_DELAY_MS) {
            isDragging = true
            draggingId = pendingDrag.id
            dragOffset = { x: pendingDrag.offsetX, y: pendingDrag.offsetY }
            draggingEl = world.querySelector(`.node[data-id="${draggingId}"]`)
            draggingEl?.classList.add('node--dragging')
        }

        // Drag en vivo (mueve el DOM directo, sin pasar por el store). Las aristas se
        // re-posicionan in place y con throttle a un frame (rAF) — nunca se recrean.
        if (isDragging && draggingEl) {
            const nx = x - dragOffset.x
            const ny = y - dragOffset.y
            draggingEl.style.left = `${nx}px`
            draggingEl.style.top = `${ny}px`
            liveDragCenter = { x: nx + NODE_SIZE / 2, y: ny + NODE_SIZE / 2 }
            scheduleEdgeSync()
            return
        }

        // Línea de relación en curso
        if (relationSourceId && relationLine) {
            relationLine = { ...relationLine, x2: x, y2: y }
            redrawEdges()
        }
    }

    async function onDocMouseUp(e) {
        if (panning) {
            panning = null
            el.classList.remove('canvas--panning')
            suppressClickUntil = Date.now() + 250
            return
        }
        if (isSelecting) {
            isSelecting = false
            selectionStart = null
            removeSelectionRect()
            suppressClickUntil = Date.now() + 600
            return
        }
        if (selectionStart) {
            const { x, y } = toWorld(e)
            if (Math.abs(x - selectionStart.x) > 2 || Math.abs(y - selectionStart.y) > 2) {
                suppressClickUntil = Date.now() + 600
            }
            selectionStart = null
            removeSelectionRect()
        }

        if (isDragging && draggingId) {
            const { x, y } = toWorld(e)
            const nx = x - dragOffset.x
            const ny = y - dragOffset.y
            const id = draggingId
            isDragging = false
            draggingId = null
            draggingEl?.classList.remove('node--dragging')
            draggingEl = null
            liveDragCenter = null
            pendingDrag = null
            justDragged = true
            suppressClickUntil = Date.now() + 250
            try {
                await actions.persistPosition(id, nx, ny)
            } catch (err) {
                showError(`Error al mover: ${err.message}`)
            }
            return
        }

        // Soltar una relación sobre un nodo objetivo
        if (relationSourceId && relationLine) {
            const { x, y } = toWorld(e)
            const target = getState().artifacts.find((a) => {
                if (a.id === relationSourceId) return false
                const c = nodeCenter(a)
                return Math.hypot(x - c.x, y - c.y) < 36
            })
            const sourceId = relationSourceId
            relationSourceId = null
            relationLine = null
            redrawEdges()
            if (target) {
                try {
                    await actions.createRelationship({ sourceId, targetId: target.id, type: 'references' })
                    showSuccess(`Relación creada con ${target.name}`)
                } catch (err) {
                    showError(`Error al crear relación: ${err.message}`)
                }
            }
            pendingDrag = null
        }
    }

    document.addEventListener('mousemove', onDocMouseMove)
    document.addEventListener('mouseup', onDocMouseUp)

    const isTextTarget = (t) =>
        t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)

    // Borrado por teclado + activación del modo paneo con Espacio.
    function onKeyDown(e) {
        if (e.code === 'Space' && !isTextTarget(e.target)) {
            spaceDown = true
            el.classList.add('canvas--pannable')
            e.preventDefault() // evita el scroll de la página
            return
        }
        const selected = getState().selectedIds
        if (selected.size === 0) return
        const isDelete = e.key === 'Delete' || e.key === 'Del'
        const isCmdBackspace = (e.metaKey || e.ctrlKey) && e.key === 'Backspace'
        if (isDelete || isCmdBackspace) {
            e.preventDefault()
            deleteSelected()
        }
    }
    function onKeyUp(e) {
        if (e.code === 'Space') {
            spaceDown = false
            el.classList.remove('canvas--pannable')
        }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    async function deleteSelected() {
        const ids = [...getState().selectedIds]
        if (ids.length === 0) return
        try {
            await actions.deleteArtifacts(ids)
            showSuccess(`Eliminados ${ids.length} artefacto(s)`)
        } catch {
            showError('Error al eliminar artefactos seleccionados')
        }
    }

    // --- selección rect helpers ---
    function updateSelectionRect(sx, sy, dw, dh) {
        if (!selectionEl) {
            selectionEl = document.createElement('div')
            selectionEl.className = 'selection-rect'
            world.appendChild(selectionEl)
        }
        selectionEl.style.left = `${Math.min(sx, sx + dw)}px`
        selectionEl.style.top = `${Math.min(sy, sy + dh)}px`
        selectionEl.style.width = `${Math.abs(dw)}px`
        selectionEl.style.height = `${Math.abs(dh)}px`
    }
    function removeSelectionRect() {
        selectionEl?.remove()
        selectionEl = null
    }
    function computeSelection(sx, sy, dw, dh) {
        const nx = Math.min(sx, sx + dw)
        const ny = Math.min(sy, sy + dh)
        const nw = Math.abs(dw)
        const nh = Math.abs(dh)
        const ids = []
        for (const a of getState().artifacts) {
            const ax = a.visualProperties?.x ?? 0
            const ay = a.visualProperties?.y ?? 0
            if (nx < ax + NODE_SIZE && nx + nw > ax && ny < ay + NODE_SIZE && ny + nh > ay) ids.push(a.id)
        }
        return ids
    }

    // --- encuadre: ajusta zoom/paneo para que el grafo completo quepa en el viewport ---
    function fitToView(padding = 60) {
        const state = getState()
        if (state.artifacts.length === 0) return
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const a of state.artifacts) {
            const x = a.visualProperties?.x ?? 0
            const y = a.visualProperties?.y ?? 0
            if (x < minX) minX = x
            if (y < minY) minY = y
            if (x + NODE_SIZE > maxX) maxX = x + NODE_SIZE
            if (y + NODE_SIZE > maxY) maxY = y + NODE_SIZE
        }
        const r = rectOf()
        const w = Math.max(maxX - minX, 1)
        const h = Math.max(maxY - minY, 1)
        const scale = Math.max(
            ZOOM_MIN,
            Math.min((r.width - 2 * padding) / w, (r.height - 2 * padding) / h, 1.25)
        )
        viewport.scale = scale
        viewport.tx = (r.width - w * scale) / 2 - minX * scale
        viewport.ty = (r.height - h * scale) / 2 - minY * scale
        applyTransform()
    }

    // --- auto-layout (fuerzas, sin D3) ---
    let layoutRunning = false

    async function autoLayout() {
        if (layoutRunning) return // ya hay uno en curso
        const state = getState()
        if (state.artifacts.length < 2) return

        const r = rectOf()
        const width = r.width || 800
        const height = r.height || 600

        const nodes = state.artifacts.map((a) => ({
            id: a.id,
            x: a.visualProperties?.x ?? a.coordinates?.x ?? width / 2,
            y: a.visualProperties?.y ?? a.coordinates?.y ?? height / 2,
        }))
        const links = state.relationships.map((rel) => ({ sourceId: rel.sourceId, targetId: rel.targetId }))

        const sim = createForceLayout({ nodes, links, width, height })

        // Aplica posiciones mutando visualProperties en sitio (sin emit) y usa el fast-path:
        // mover nodos/aristas existentes actualizando atributos. Reconstruir el DOM entero
        // por frame (render()) se traba con cientos de nodos.
        const apply = (positions) => {
            const posById = new Map(positions.map((p) => [p.id, p]))
            for (const a of state.artifacts) {
                const p = posById.get(a.id)
                if (!p) continue
                a.visualProperties = { ...(a.visualProperties ?? {}), x: p.x, y: p.y }
            }
            syncPositions()
        }

        const persist = async (final) => {
            try {
                await actions.persistPositions(final)
                showSuccess('Grafo reorganizado')
            } catch (err) {
                showError(`Error al guardar posiciones: ${err.message}`)
            }
        }

        // Layout SIEMPRE estático: se calcula de golpe y se pinta el resultado final + encuadre.
        // La animación por frame ralentizaba con grafos grandes y no aporta al análisis.
        layoutRunning = true
        try {
            const final = sim.runStatic()
            apply(final)
            fitToView()
            await persist(final)
        } finally {
            layoutRunning = false
        }
    }

    function destroy() {
        if (edgeSyncRaf) cancelAnimationFrame(edgeSyncRaf)
        edgeSyncRaf = null
        document.removeEventListener('mousemove', onDocMouseMove)
        document.removeEventListener('mouseup', onDocMouseUp)
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
    }

    applyTransform()

    return { el, render, destroy, autoLayout, fitToView, worldToScreen }
}
