# Continuous Growth & Validation (CGV)

---

## 1. Vision

Establecer un **bucle continuo de aprendizaje** que valide iterativamente:

1. El **problema** (dolor de documentación / ejecución de procesos).
2. La claridad y adopción del **lenguaje SOL**.
3. La **viabilidad técnica y de negocio** del framework **Hexy** como herramienta para documentar, orquestar y validar procesos (integraciones con Jira, n8n, etc.).
   El objetivo es que cada release aporte valor medible y que las hipótesis de producto se ajusten semanalmente.

---

## 2. Herramientas a usar

* **LinkedIn Polls + Buffer** – difusión y programación de encuestas.
* **Google Sheets / Airtable** – captura de respuestas y métricas.
* **Slack `#validation-alerts`** – notificaciones automáticas vía n8n.
* **Jira (Validation Backlog)** – gestión de experimentos (*issue‑type: Experiment*).
* **n8n** – orquestación de flujos y webhooks.
* **Hexy Framework** – documentación viviente y ejecución de procesos.
* **Lenguaje SOL** – modelado semántico de artefactos y decisiones.
* **Mixpanel & Grafana** – panel de métricas y funnels.
* **GitHub Actions** – validación automática de políticas SOL.
* **Calendly** – agendar entrevistas cualitativas.

---

## 3. Actores involucrados y ciclo de vida

* **Product Owner** – define hipótesis, prioriza backlog de validación.
* **Validation Lead (Jason)** – orquesta experimentos, reporta métricas.
* **Equipo Dev** – implementa prototipos, integra métricas.
* **Equipo Piloto** – usa Hexy y provee feedback operativo.
* **Participantes externos** – responden encuestas y entrevistas.
* **Agentes automatizados** (Hexy DocAgent, n8n bots) – recolectan y notifican datos.

**Ciclo de vida de una hipótesis:** Ideación → Priorización → Diseño de experimento → Ejecución → Recolección de datos → Análisis → Decisión (*pivot / persevere*) → Documentación en SOL → Nueva iteración.

---

## 4. Definición del proceso de operación

### 4.1 Procedimiento del **Bucle de Validación** (semanal)

1. **Lunes – Plan** : seleccionar 1‑2 hipótesis y definir métrica de éxito.
2. **Mar‑Mié – Build** : construir prototipo (encuesta, snippet SOL, integración Hexy).
3. **Mié‑Jue – Measure** : ejecutar experimento, recolectar métricas en Sheets / Mixpanel.
4. **Viernes – Learn** : retro de 30 min, registrar decisión en artefactos SOL (*Result + Observation*).

### 4.2 Procedimiento de **Validación de hipótesis** (calendario de referencia)

* **Semana 1** – Problema (encuestas LinkedIn).
* **Semana 2** – Entrevistas follow‑up (5‑8 usuarios clave).
* **Semana 3** – Test de comprensión SOL.
* **Semana 4** – PoC Hexy + Jira + n8n.

### 4.3 Procedimiento de **Validación de lenguaje SOL**

1. Enviar guía SOL (2 páginas) a 15 testers (10 devs, 5 PMs).
2. Desafío de 30 min: describir un proceso real en SOL.
3. Rúbrica de evaluación (claridad, ambigüedad, esfuerzo).
4. Registrar feedback como **Observation** y ajustar políticas.

### 4.4 Procedimiento de **Validación de Hexy Framework**

* Instalación limpia en equipo piloto (objetivo ≤ 1 h).
* Importar artefacto SOL → documentación viviente.
* **Integración Jira** : crear issue “Process\:XYZ” automáticamente.
* **Integración n8n** : convertir `Process.steps` → workflow funcional.
* Ejecutar política `ValidacionMinimaProceso` en CI (GitHub Actions).
* Medir fricción (bugs, bloqueos) y lead‑time antes/después.

### 4.5 Procedimiento de **Análisis semanal de resultados**

1. Revisar panel Grafana “Hexy Validation”.
2. Comparar contra criterios de éxito definidos el lunes.
3. Decidir → pivot / persevere / kill.
4. Actualizar backlog en Jira y **Decision Log** en SOL.

---

## 5. Indicadores de efectividad por validación

* **Problema** : ≥ 70 % encuestados reconoce dolor.
* **Lenguaje SOL** : comprensión ≥ 4/5 · tiempo ≤ 30 min.
* **Hexy Setup** : instalación ≤ 1 h · 0 bloqueos críticos.
* **Orquestación n8n/Jira** : flujo end‑to‑end ≤ 2 h.
* **Valor recurrente** : reducción lead‑time ≥ 20 % · NPS ≥ 80 %.
