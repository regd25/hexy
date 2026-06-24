/**
 * Canvas del grafo (vanilla). Renderiza nodos + aristas y maneja todas las interacciones
 * portadas de useGraphInteractions: drag de nodos, selección rubber-band, doble-click para
 * crear relación, context menu y borrado por teclado.
 */

import { getState, actions } from '../state/store.js'
import { showSuccess, showError } from '../notifications.js'
import { NODE_SIZE } from '../constants.js'
import { createArtifactNode, createTemporalNode, drawEdges, nodeCenter } from './nodes.js'
import { openContextMenu } from '../components/contextMenu.js'

const DRAG_DELAY_MS = 120
const SELECTION_THRESHOLD = 6
const SVG_NS = 'http://www.w3.org/2000/svg'

export function createCanvas({ onCreateAt, onOpenEditor, getActiveArtifactId }) {
    const el = document.createElement('div')
    el.className = 'canvas'

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('class', 'canvas__edges')
    el.appendChild(svg)

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

    const rectOf = () => el.getBoundingClientRect()
    const toLocal = (e) => {
        const r = rectOf()
        return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    // --- render ---
    function render() {
        const state = getState()
        // Quita nodos previos (conserva svg + selection rect).
        el.querySelectorAll('.node').forEach((n) => n.remove())

        redrawEdges()

        const activeId = getActiveArtifactId?.()
        for (const a of state.artifacts) {
            const node = createArtifactNode(a, {
                selected: state.selectedIds.has(a.id),
                active: activeId === a.id,
            })
            wireNode(node, a)
            el.appendChild(node)
        }
        for (const t of state.temporals) {
            el.appendChild(createTemporalNode(t, { current: true }))
        }
    }

    function redrawEdges() {
        const state = getState()
        const override = isDragging && draggingId && liveDragCenter ? { id: draggingId, center: liveDragCenter } : null
        drawEdges(svg, state.artifacts, state.relationships, override)

        // Overlay de relaciones inferidas por el motor (F3): ámbar punteado.
        if (state.inferred.length > 0) {
            const byId = new Map(state.artifacts.map((a) => [a.id, a]))
            for (const r of state.inferred) {
                const s = byId.get(r.sourceId)
                const t = byId.get(r.targetId)
                if (!s || !t) continue
                const sc = nodeCenter(s)
                const tc = nodeCenter(t)
                const line = document.createElementNS(SVG_NS, 'line')
                line.setAttribute('x1', sc.x)
                line.setAttribute('y1', sc.y)
                line.setAttribute('x2', tc.x)
                line.setAttribute('y2', tc.y)
                line.setAttribute('stroke', '#f59e0b')
                line.setAttribute('stroke-width', '2')
                line.setAttribute('stroke-dasharray', '2,4')
                line.setAttribute('opacity', '0.85')
                svg.appendChild(line)
            }
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
            const { x, y } = toLocal(e)
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
            const { x, y } = toLocal(e)
            relationLine = { x1: c.x, y1: c.y, x2: x, y2: y }
            redrawEdges()
        })
    }

    // --- canvas ---
    el.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return
        e.preventDefault()
        const { x, y } = toLocal(e)
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
        const { x, y } = toLocal(e)
        onCreateAt?.(x, y)
    })

    // mousemove/up a nivel documento → el drag/selección continúan fuera del canvas.
    function onDocMouseMove(e) {
        const { x, y } = toLocal(e)

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
            draggingEl = el.querySelector(`.node[data-id="${draggingId}"]`)
            draggingEl?.classList.add('node--dragging')
        }

        // Drag en vivo (mueve el DOM directo, sin pasar por el store)
        if (isDragging && draggingEl) {
            const nx = x - dragOffset.x
            const ny = y - dragOffset.y
            draggingEl.style.left = `${nx}px`
            draggingEl.style.top = `${ny}px`
            liveDragCenter = { x: nx + NODE_SIZE / 2, y: ny + NODE_SIZE / 2 }
            redrawEdges()
            return
        }

        // Línea de relación en curso
        if (relationSourceId && relationLine) {
            relationLine = { ...relationLine, x2: x, y2: y }
            redrawEdges()
        }
    }

    async function onDocMouseUp(e) {
        if (isSelecting) {
            isSelecting = false
            selectionStart = null
            removeSelectionRect()
            suppressClickUntil = Date.now() + 600
            return
        }
        if (selectionStart) {
            const { x, y } = toLocal(e)
            if (Math.abs(x - selectionStart.x) > 2 || Math.abs(y - selectionStart.y) > 2) {
                suppressClickUntil = Date.now() + 600
            }
            selectionStart = null
            removeSelectionRect()
        }

        if (isDragging && draggingId) {
            const { x, y } = toLocal(e)
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
            const { x, y } = toLocal(e)
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

    // Borrado por teclado
    function onKeyDown(e) {
        const selected = getState().selectedIds
        if (selected.size === 0) return
        const isDelete = e.key === 'Delete' || e.key === 'Del'
        const isCmdBackspace = (e.metaKey || e.ctrlKey) && e.key === 'Backspace'
        if (isDelete || isCmdBackspace) {
            e.preventDefault()
            deleteSelected()
        }
    }
    window.addEventListener('keydown', onKeyDown)

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
            el.appendChild(selectionEl)
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

    function destroy() {
        document.removeEventListener('mousemove', onDocMouseMove)
        document.removeEventListener('mouseup', onDocMouseUp)
        window.removeEventListener('keydown', onKeyDown)
    }

    return { el, render, destroy }
}
