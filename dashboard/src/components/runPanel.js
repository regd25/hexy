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
            div.innerHTML =
                `<b>▶ ${esc(entry.process)}</b> · goal: ${esc(entry.goal ?? '—')} · término: ${esc(entry.termination)}` +
                `<br/><span class="dim">steps: ${entry.steps.map(esc).join(' → ')}${guard ? ` · guardrails: ${esc(guard)}` : ''} · budget: ${entry.budget}</span>`
        } else if (entry.name === 'step:act') {
            div.innerHTML = `<b>ACT</b> step ${entry.step}: ${esc(entry.action)} <span class="dim">(${esc(entry.actor)})</span>`
        } else if (entry.name === 'loop:decide') {
            div.innerHTML = `<span class="dim">DECIDE → ${esc(entry.decision)}</span>`
        } else if (entry.name === 'evaluation:satisfied') {
            div.innerHTML = `<b class="ok">EVALUATION satisfecha</b>${entry.evaluation ? `: ${esc(entry.evaluation)}` : ''} <span class="dim">${esc(entry.message ?? '')}</span>`
        } else {
            div.textContent = entry.name
        }
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
