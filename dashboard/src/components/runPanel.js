/**
 * Panel de ejecución (F4): muestra la traza del HarnessRuntime en vivo — steps (act),
 * observations y violations con severidad. Se abre al pulsar ▶ Run sobre un Process.
 */

import { api } from '../api/client.js'
import { showError } from '../notifications.js'

let current = null

export function closeRunPanel() {
    current?.remove()
    current = null
}

const STATUS_LABEL = {
    completed: '✔ Completado',
    stoppedByViolation: '✖ Detenido por violación',
    budgetExhausted: '⏳ Presupuesto agotado',
    planFailed: '✖ Plan inválido',
    toolFailed: '✖ Fallo de tool MCP',
}

function entryLine(entry) {
    const div = document.createElement('div')
    if (entry.kind === 'event') {
        div.className = 'run-panel__line run-panel__line--event'
        if (entry.name === 'loop:start') {
            const g = entry.guardrails ?? {}
            const guard = [
                ...(g.prohibit ?? []).map((t) => `prohibit «${t}»`),
                ...(g.require ?? []).map((t) => `require «${t}»`),
            ].join(', ')
            const tools = (entry.tools ?? []).length > 0 ? ` · tools MCP: ${entry.tools.map(esc).join(', ')}` : ''
            div.innerHTML =
                `<b>▶ ${esc(entry.process)}</b> · goal: ${esc(entry.goal ?? '—')} · término: ${esc(entry.termination)}` +
                `<br/><span class="dim">steps: ${entry.steps.map(esc).join(' → ')}${tools}${guard ? ` · guardrails: ${esc(guard)}` : ''} · budget: ${entry.budget}</span>`
        } else if (entry.name === 'step:act') {
            div.innerHTML = `<b>ACT</b> step ${entry.step}: ${esc(entry.action)} <span class="dim">(${esc(entry.actor)})</span>`
        } else if (entry.name === 'tool:authorize') {
            div.className += entry.allowed ? '' : ' run-panel__line--blocked'
            div.innerHTML =
                `<b>AUTHORIZE</b> tool <b>${esc(entry.tool)}</b> <span class="lvl lvl--${esc(entry.level)}">${esc(entry.level)}</span> → ` +
                `${entry.allowed ? '<span class="ok">permitido</span>' : '<span class="bad">bloqueado</span>'} <span class="dim">${esc(entry.reason)}</span>`
        } else if (entry.name === 'tool:call') {
            const args = entry.args && Object.keys(entry.args).length > 0 ? JSON.stringify(entry.args) : ''
            div.innerHTML = `<b>ACT</b> step ${entry.step}: tool call <b>${esc(entry.tool)}</b><span class="dim">${esc(args ? ` ${args}` : '')}</span> <span class="dim">(MCP)</span>`
        } else if (entry.name === 'loop:decide') {
            div.innerHTML = `<span class="dim">DECIDE → ${esc(entry.decision)}</span>`
        } else if (entry.name === 'evaluation:satisfied') {
            div.innerHTML = `<b class="ok">EVALUATION satisfecha</b>${entry.evaluation ? `: ${esc(entry.evaluation)}` : ''} <span class="dim">${esc(entry.message ?? '')}</span>`
        } else {
            div.textContent = entry.name
        }
    } else if (entry.kind === 'context') {
        return contextLine(entry)
    } else if (entry.kind === 'observation') {
        div.className = 'run-panel__line run-panel__line--obs'
        div.innerHTML = `<b>OBSERVE</b> ${esc(entry.content)}`
    } else if (entry.kind === 'violation') {
        div.className = `run-panel__line run-panel__line--violation run-panel__line--${entry.severity}`
        div.innerHTML = `<b>VIOLATION [${esc(entry.severity)}]</b> ${esc(entry.message)}`
    } else if (entry.kind === 'done') {
        div.className = `run-panel__line run-panel__line--done run-panel__done--${entry.status}`
        const progress =
            entry.completedSteps !== undefined ? ` · ${entry.completedSteps}/${entry.totalSteps} steps` : ''
        div.innerHTML = `<b>${STATUS_LABEL[entry.status] ?? entry.status}</b>${progress}`
    }
    return div
}

/**
 * F6 — entrada `context`: el sub-grafo semántico seleccionado para el step, con las piezas
 * incluidas + por qué, la barra de presupuesto de tokens y el ratio de compresión.
 */
function contextLine(entry) {
    const div = document.createElement('div')
    div.className = 'run-panel__line run-panel__ctx'
    const pct = Math.min(100, Math.round((entry.tokensUsed / Math.max(1, entry.tokensBudget)) * 100))
    const compression = Math.round((1 - entry.compressionRatio) * 100)
    const pieces = (entry.included ?? [])
        .map(
            (p) =>
                `<li><span class="run-panel__ctx-name">${esc(p.name)}</span>` +
                `<span class="lvl lvl--${esc(p.type)}">${esc(p.type)}</span>` +
                `<span class="dim"> — ${esc(p.reason)}</span> <span class="run-panel__ctx-tok">~${p.tokens} tok</span></li>`,
        )
        .join('')
    div.innerHTML =
        `<div class="run-panel__ctx-head"><b>CONTEXT</b> step ${entry.step}: ` +
        `<b>${entry.included?.length ?? 0}</b> pieza(s) incluida(s) · ` +
        `<span class="dim">${entry.excludedCount} fuera</span> · ` +
        `<span class="run-panel__ctx-comp">−${compression}% del modelo</span></div>` +
        `<ul class="run-panel__ctx-list">${pieces}</ul>` +
        `<div class="run-panel__ctx-budget">` +
        `<div class="run-panel__ctx-bar"><span style="width:${pct}%"></span></div>` +
        `<span class="dim">token budget: ${entry.tokensUsed}/${entry.tokensBudget} (${pct}%)</span></div>`
    return div
}

function esc(s) {
    const div = document.createElement('div')
    div.textContent = String(s ?? '')
    return div.innerHTML
}

export async function openRunPanel(processArtifact) {
    closeRunPanel()
    const panel = document.createElement('aside')
    panel.className = 'run-panel slide-up'
    panel.innerHTML = `
        <div class="run-panel__header">
            <span class="run-panel__title">Run: <b></b></span>
            <button class="btn btn--ghost" data-close>✕</button>
        </div>
        <div class="run-panel__body" data-body></div>
    `
    panel.querySelector('.run-panel__title b').textContent = processArtifact.name
    panel.querySelector('[data-close]').addEventListener('click', closeRunPanel)
    document.body.appendChild(panel)
    current = panel

    const body = panel.querySelector('[data-body]')
    try {
        await api.runProcess(processArtifact.id, (entry) => {
            body.appendChild(entryLine(entry))
            body.scrollTop = body.scrollHeight
        })
    } catch (err) {
        showError(err.message)
        const line = document.createElement('div')
        line.className = 'run-panel__line run-panel__line--violation run-panel__line--error'
        line.textContent = err.message
        body.appendChild(line)
    }
}
