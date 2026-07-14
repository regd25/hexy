/** Cabecera del grafo: título, badge de validez (eval gate SOL), contadores, import y export. */
import { api } from '../api/client.js'
import { actions, getState } from '../state/store.js'
import { showSuccess, showError, showInfo } from '../notifications.js'

export function createHeader({ onAutoLayout, onExtracted } = {}) {
    const el = document.createElement('div')
    el.className = 'graph__header'
    el.innerHTML = `
        <div class="graph__header-top">
            <h3 class="graph__title">Grafo de Artefactos</h3>
            <div class="graph__header-actions">
                <span class="badge-validity" data-validity hidden>
                    <span class="badge-validity__dot"></span><span data-validity-text></span>
                </span>
                <input class="input input--path" data-extract-path type="text" value="../gatonica"
                    title="Ruta a un repo (relativa al proyecto o absoluta) para extraer su grafo estructural" placeholder="ruta al repo…" />
                <select class="input input--depth" data-extract-depth
                    title="Profundidad del análisis: carpetas más profundas se agregan a su área (vista ejecutiva vs detalle)">
                    <option value="2" selected>áreas (2)</option>
                    <option value="3">medio (3)</option>
                    <option value="">todo</option>
                </select>
                <button class="btn" data-extract title="Extraer el grafo estructural de código de un repo real (cualquier proyecto JS/TS o Python)">Extraer repo</button>
                <button class="btn" data-enrich title="Fase C: Gemini etiqueta el grafo con nombres de negocio, descripciones ancladas al código, tipos ontológicos y relaciones semánticas">IA: enriquecer</button>
                <button class="btn" data-autolayout title="Reorganizar el grafo con un layout de fuerzas">Auto-organizar</button>
                <button class="btn" data-analyze title="Proyectar a RDF y inferir relaciones con el motor (Python)">Analizar con el motor</button>
                <button class="btn" data-import title="Importar un .yaml SOL y reconstruir el grafo">Import .yaml</button>
                <button class="btn btn--primary" data-export>Export .yaml</button>
                <input type="file" accept=".yaml,.yml,.txt" data-import-file hidden />
            </div>
        </div>
        <div class="graph__counts" data-counts></div>
    `

    const badge = el.querySelector('[data-validity]')
    const badgeText = el.querySelector('[data-validity-text]')
    const counts = el.querySelector('[data-counts]')
    const exportBtn = el.querySelector('[data-export]')
    const importBtn = el.querySelector('[data-import]')
    const importFile = el.querySelector('[data-import-file]')
    const analyzeBtn = el.querySelector('[data-analyze]')
    const autoLayoutBtn = el.querySelector('[data-autolayout]')
    const extractBtn = el.querySelector('[data-extract]')
    const extractPath = el.querySelector('[data-extract-path]')
    const extractDepth = el.querySelector('[data-extract-depth]')

    extractBtn.addEventListener('click', async () => {
        const path = extractPath.value.trim()
        if (!path) return showError('Escribe una ruta al repo a extraer')
        extractBtn.disabled = true
        extractBtn.textContent = 'Extrayendo…'
        try {
            const maxDepth = extractDepth.value ? Number(extractDepth.value) : undefined
            const result = await api.extractRepo(path, { maxDepth })
            await actions.loadAll() // recarga el grafo persistido
            onExtracted?.()
            const s = result.stats ?? {}
            const langs = (s.languages ?? []).join('+')
            const adapters = s.adapters?.length ? ` · adaptadores: ${s.adapters.join(', ')}` : ''
            showSuccess(`Extraído «${path}»: ${result.artifacts} artefactos, ${result.relationships} relaciones (${s.filesScanned ?? 0} archivos, ${langs})${adapters}`)
        } catch (err) {
            showError(`Extracción falló: ${err.message}`)
        } finally {
            extractBtn.disabled = false
            extractBtn.textContent = 'Extraer repo'
        }
    })

    const enrichBtn = el.querySelector('[data-enrich]')
    enrichBtn.addEventListener('click', async () => {
        if (getState().artifacts.length === 0) return showError('Extrae o modela un grafo antes de enriquecerlo')
        enrichBtn.disabled = true
        enrichBtn.textContent = 'IA pensando…'
        try {
            // La misma ruta del input ancla la evidencia (extractos de código) del LLM.
            const result = await api.enrichModel(extractPath.value.trim() || undefined)
            await actions.loadAll()
            const skipped = result.skipped?.length ? ` · ${result.skipped.length} propuesta(s) descartadas por el clamp` : ''
            showSuccess(`IA (${result.stats?.model ?? 'gemini'}): ${result.updated} artefactos enriquecidos, ${result.relationsCreated} relación(es) semántica(s) nueva(s)${skipped}`)
        } catch (err) {
            showError(`Enriquecimiento falló: ${err.message}`)
        } finally {
            enrichBtn.disabled = false
            enrichBtn.textContent = 'IA: enriquecer'
        }
    })

    autoLayoutBtn.addEventListener('click', async () => {
        if (getState().artifacts.length < 2) return
        autoLayoutBtn.disabled = true
        autoLayoutBtn.textContent = 'Organizando…'
        try {
            await onAutoLayout?.()
        } finally {
            autoLayoutBtn.disabled = false
            autoLayoutBtn.textContent = 'Auto-organizar'
        }
    })

    analyzeBtn.addEventListener('click', async () => {
        if (getState().artifacts.length === 0) return
        analyzeBtn.disabled = true
        analyzeBtn.textContent = 'Analizando…'
        try {
            const result = await api.engineProject()
            actions.setInferred(result.inferred ?? [])
            const diagnostics = result.diagnostics ?? []
            actions.setDiagnostics(diagnostics)

            const cyc = result.stats?.cycleCount ?? 0
            const cycMsg = cyc > 0 ? ` · ${cyc} ciclo(s) detectado(s)` : ''
            showSuccess(
                `Motor: ${result.stats.nodes} entidades, ${result.rdf.triples} triples RDF, ${result.stats.inferredCount} relación(es) inferida(s)${cycMsg}`
            )

            // Fase A: los diagnósticos del motor ya no se tragan — se muestran, el más grave primero.
            const errors = diagnostics.filter((d) => d.severity === 'error')
            const warnings = diagnostics.filter((d) => d.severity === 'warning')
            if (errors.length > 0) {
                showError(`${errors.length} error(es) de modelo — ${errors[0].message}`)
            } else if (warnings.length > 0) {
                showInfo(`${warnings.length} advertencia(s) — ${warnings[0].message}`)
            }
        } catch (err) {
            showError(err.message)
        } finally {
            analyzeBtn.disabled = false
            analyzeBtn.textContent = 'Analizar con el motor'
        }
    })

    importBtn.addEventListener('click', () => importFile.click())
    importFile.addEventListener('change', async () => {
        const file = importFile.files?.[0]
        if (!file) return
        try {
            const yaml = await file.text()
            // Si ya hay modelo, preguntar si reemplazar o fusionar.
            let mode = 'merge'
            if (getState().artifacts.length > 0) {
                mode = window.confirm(
                    'Ya hay artefactos en el grafo.\n\nAceptar = reemplazar el modelo actual.\nCancelar = fusionar con lo importado.'
                )
                    ? 'replace'
                    : 'merge'
            }
            const result = await api.solImport(yaml, mode)
            await actions.loadAll()
            const extra = result.unresolved.length > 0 ? ` · ${result.unresolved.length} referencia(s) sin resolver` : ''
            showSuccess(`Importados ${result.artifacts} artefactos y ${result.relationships} relaciones${extra}`)
        } catch (err) {
            showError(`Error al importar: ${err.message}`)
        } finally {
            importFile.value = ''
        }
    })

    exportBtn.addEventListener('click', async () => {
        try {
            const result = await api.solValidate()
            if (!result.isValid) {
                const first = result.errors
                    .filter((e) => e.severity === 'error')
                    .slice(0, 3)
                    .map((e) => `L${e.line}: ${e.message}`)
                    .join(' · ')
                showError(`Export bloqueado — el modelo no pasa el eval gate: ${first}`)
                return
            }
            const yaml = await api.solYaml()
            const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'model.yaml'
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
            showSuccess('Modelo exportado a model.yaml (válido)')
        } catch (err) {
            showError(`Error al exportar: ${err.message}`)
        }
    })

    function render(state) {
        const artifactCount = state.artifacts.length
        const temporalCount = state.temporals.length
        const selectedCount = state.selectedIds.size

        exportBtn.disabled = artifactCount === 0
        analyzeBtn.disabled = artifactCount === 0
        autoLayoutBtn.disabled = artifactCount < 2

        if (artifactCount > 0) {
            badge.hidden = false
            badge.classList.toggle('badge-validity--ok', state.validity.isValid)
            badge.classList.toggle('badge-validity--err', !state.validity.isValid)
            badgeText.textContent = state.validity.isValid
                ? 'Modelo válido'
                : `${state.validity.errorCount} ${state.validity.errorCount === 1 ? 'error' : 'errores'}`
        } else {
            badge.hidden = true
        }

        let html = `<span><b>${artifactCount}</b></span><span>artefactos en el grafo</span>`
        if (temporalCount > 0) html += `<span class="sep">|</span><b class="c-temp">${temporalCount}</b><span>temporales</span>`
        if (selectedCount > 0) html += `<span class="sep">|</span><b class="c-sel">${selectedCount}</b><span>seleccionados</span>`
        if (state.inferred.length > 0)
            html += `<span class="sep">|</span><b class="c-inferred">${state.inferred.length}</b><span>inferidas</span>`
        counts.innerHTML = html
    }

    return { el, render }
}
