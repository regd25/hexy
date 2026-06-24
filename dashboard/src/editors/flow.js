/**
 * Flujo de autoría: orquesta el editor de nombre (inline) y el de descripción (flotante)
 * con el store. Encapsula la lógica que vivía en GraphContainer: validación, promoción del
 * artefacto temporal, creación de relaciones por @menciones y el "crear desde mención".
 */

import { actions, getState } from '../state/store.js'
import { showSuccess, showError } from '../notifications.js'
import { openInlineEditor, closeInlineEditor } from './inlineEditor.js'
import { openFloatingEditor, closeFloatingEditor } from './floatingEditor.js'

const sanitize = (s) => s.replace(/\s+/g, '').toLowerCase()

function validateName(name, artifacts) {
    const errors = []
    const v = name.trim()
    if (!v) errors.push('El nombre del artefacto es requerido')
    else if (v.length < 2) errors.push('El nombre debe tener al menos 2 caracteres')
    else if (v.length > 100) errors.push('El nombre no puede exceder 100 caracteres')
    if (artifacts.some((a) => a.name.toLowerCase() === v.toLowerCase())) {
        errors.push('Ya existe un artefacto con este nombre')
    }
    return errors
}

function validateDescription(description) {
    const errors = []
    const v = (description ?? '').trim()
    if (!v) errors.push('La descripción del artefacto es requerida')
    else if (v.length < 10) errors.push('La descripción debe tener al menos 10 caracteres')
    else if (v.length > 1000) errors.push('La descripción no puede exceder 1000 caracteres')
    return errors
}

function parseMentions(text) {
    const matches = text.match(/@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g) || []
    return matches.map((m) => m.slice(1))
}

export function createAuthoringFlow({ canvasEl, requestCanvasRender }) {
    let currentTemporalId = null
    let editingArtifact = null
    let editingType = 'intent'
    let pendingRelationFromId = null
    let currentName = ''

    const rect = () => canvasEl.getBoundingClientRect()

    function reset() {
        currentTemporalId = null
        editingArtifact = null
        currentName = ''
        closeInlineEditor()
        closeFloatingEditor()
        requestCanvasRender?.()
    }

    async function createRelationsFromMentions(sourceId, text) {
        const mentions = parseMentions(text)
        if (mentions.length === 0) return
        const artifacts = getState().artifacts
        for (const m of mentions) {
            const target = artifacts.find((a) => sanitize(a.name) === sanitize(m))
            if (!target || target.id === sourceId) continue
            try {
                await actions.createRelationship({ sourceId, targetId: target.id, type: 'references' })
            } catch (err) {
                console.error('Error creando relación desde mención:', err)
            }
        }
    }

    function openDescriptionEditor({ x, y }) {
        const r = rect()
        openFloatingEditor({
            position: { x: r.left + x, y: r.top + y + 80 },
            title: editingArtifact
                ? `Editando: ${editingArtifact.name}`
                : `Nuevo artefacto: ${currentName}`,
            initialText: editingArtifact?.description ?? '',
            typeValue: editingType,
            getArtifacts: () => getState().artifacts,
            onTypeChange: async (type) => {
                editingType = type
                try {
                    if (currentTemporalId) await actions.updateTemporal(currentTemporalId, { type })
                    else if (editingArtifact) {
                        editingArtifact = await actions.updateArtifact(editingArtifact.id, { type })
                    }
                } catch (err) {
                    console.error('Error updating type:', err)
                }
            },
            validate: validateDescription,
            onSave: (description) => saveDescription(description),
            onCancel: () => {
                if (currentTemporalId) actions.cancelTemporal(currentTemporalId).catch(() => {})
                reset()
            },
            onCreateMention: (query) => createFromMention(query),
        })
        requestCanvasRender?.()
    }

    async function saveDescription(description) {
        if (validateDescription(description).length > 0) return

        if (currentTemporalId) {
            try {
                await actions.updateTemporal(currentTemporalId, { description, type: editingType })
                const newArtifact = await actions.promoteTemporal(currentTemporalId)
                const tempId = currentTemporalId
                currentTemporalId = null
                closeFloatingEditor()
                showSuccess(`Artefacto "${newArtifact.name}" creado`)

                if (pendingRelationFromId) {
                    try {
                        await actions.createRelationship({
                            sourceId: pendingRelationFromId,
                            targetId: newArtifact.id,
                            type: 'references',
                        })
                    } catch (err) {
                        console.error('Error en relación pendiente:', err)
                    }
                    pendingRelationFromId = null
                }
                await createRelationsFromMentions(newArtifact.id, description)
                void tempId
                reset()
            } catch (err) {
                showError(`Error al crear artefacto: ${err.message}`)
            }
            return
        }

        if (editingArtifact) {
            try {
                await actions.updateArtifact(editingArtifact.id, { description })
                showSuccess(`Artefacto "${editingArtifact.name}" actualizado`)
                await createRelationsFromMentions(editingArtifact.id, description)
            } catch (err) {
                showError(`Error al actualizar artefacto: ${err.message}`)
            }
        }
        reset()
    }

    async function createFromMention(query) {
        // @query sin coincidencias dentro del editor de descripción → crea un artefacto
        // nuevo enlazado al que se está editando.
        const base = editingArtifact?.visualProperties ?? { x: 200, y: 200 }
        const x = base.x + 120
        const y = base.y + 20
        const sourceId = editingArtifact?.id ?? null
        closeFloatingEditor()
        try {
            const temporal = await actions.createTemporal(x, y)
            currentTemporalId = temporal.temporaryId
            currentName = query
            pendingRelationFromId = sourceId
            editingArtifact = null
            await actions.updateTemporal(temporal.temporaryId, { name: query, status: 'editing' })
            showNameEditor({ x, y, initialValue: query })
        } catch {
            showError('Error al crear artefacto desde mención')
        }
    }

    function showNameEditor({ x, y, initialValue = '' }) {
        const r = rect()
        currentName = initialValue
        openInlineEditor({
            position: { x: r.left + x, y: r.top + y + 80 },
            initialValue,
            onChange: (name) => {
                currentName = name
                if (currentTemporalId) actions.updateTemporal(currentTemporalId, { name }).catch(() => {})
                return validateName(name, getState().artifacts)
            },
            onSave: (name) => {
                currentName = name
                closeInlineEditor()
                const temp = getState().temporals.find((t) => t.temporaryId === currentTemporalId)
                editingType = temp?.type ?? 'intent'
                editingArtifact = null
                openDescriptionEditor({ x: temp?.visualProperties?.x ?? x, y: temp?.visualProperties?.y ?? y })
            },
            onCancel: () => {
                if (currentTemporalId) actions.cancelTemporal(currentTemporalId).catch(() => {})
                reset()
            },
        })
    }

    return {
        /** Clic en zona vacía del canvas (coords locales del canvas). */
        async startCreate(x, y) {
            try {
                const temporal = await actions.createTemporal(x, y)
                currentTemporalId = temporal.temporaryId
                editingArtifact = null
                showNameEditor({ x, y })
            } catch {
                showError('Error al crear artefacto temporal')
            }
        },
        /** Clic en un nodo existente → editar su descripción. */
        openEditor(artifact) {
            editingArtifact = artifact
            editingType = artifact.type
            currentTemporalId = null
            openDescriptionEditor({ x: artifact.visualProperties?.x ?? 0, y: artifact.visualProperties?.y ?? 0 })
        },
        /** Id del artefacto en edición (el canvas bloquea su interacción). */
        activeArtifactId() {
            return editingArtifact?.id ?? null
        },
    }
}
