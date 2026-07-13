# F8 — Persistencia, auth ligera & observabilidad

> Estado: 📋 Planeado · Capa: TS + Python · Dependencias: [F4](F4-harness-loop.md), [F7](F7-meta-construccion.md).
> Nivel de detalle: objetivo + alcance + validación.

## 1. Objetivo
Hacer el sistema **duradero y auditable**: persistir modelos y runs, añadir auth/multi-tenant
ligero (en Next.js, no-core) e instrumentar observabilidad sobre el loop.

## 2. Alcance E2E
- **Persistencia:** Postgres para artefactos/relaciones/runs (sustituye el JSON/in-memory de
  F1); Redis para cache del orchestrator. Migrar `InMemoryArtifactRepository` → repo Postgres
  detrás de la misma interfaz de `@hexy/shared`.
- **Auth ligera (Next.js):** sesión + workspaces/tenants; autorización de UI/BFF. El cómputo
  pesado sigue en Python; la auth vive en la capa ligera.
- **Observabilidad:** persistir `ExecutionContext` de cada run; métricas del orchestrator
  (cache hit rate, compression events) expuestas; historial navegable.

## 3. Criterio de validación (desde el dashboard)
El usuario cierra y reabre: **sus modelos siguen ahí**. Entra al **historial de runs** y
revisa una corrida pasada con su traza completa (events/observations/violations).

## 4. Verificación
- El repo Postgres pasa los tests de la interfaz `ArtifactRepository`.
- Un run queda persistido y es reproducible/consultable desde la UI.
- Auth: un tenant no ve los modelos de otro.

## 5. Dependencias
[F4](F4-harness-loop.md) (hay runs que persistir), [F7](F7-meta-construccion.md). Habilita [F9](F9-conclusion.md).
