# F7 — Meta-construcción (dogfood)

> Estado: 📋 Planeado · Capa: TS + Python · Dependencias: [F5](F5-tools-mcp.md), [F6](F6-context-orchestration.md).
> Nivel de detalle: objetivo + alcance + validación. **Hito clave del north star.**

## 1. Objetivo
Que **Hexy se meta-construya**: modelar su propio desarrollo como artefactos SOL y usar el
dashboard + el harness como **cockpit** que rastrea (y parcialmente dirige) su build. El
framework se vuelve su primer caso de uso real.

## 2. Alcance E2E
- **Modelo del propio Hexy en SOL:** convertir este roadmap en artefactos:
  - Cada feature `F{n}` → un `Process` (con su `flow`) y un `Result` esperado.
  - Los criterios de validación → `Evaluation` (eval gate).
  - Las reglas de homologación → `Policy` (p. ej. "cómputo pesado solo en Python").
  - Áreas del repo → `Area` (bounded contexts).
- **Cockpit (dashboard):** vista que muestra el estado de cada feature-artefacto (planeado/
  en curso/validado) leyendo del repo y de los runs.
- **Dirigir, no solo describir:** un `Process` de meta-construcción puede disparar tools (F5)
  — p. ej. abrir el PR de una feature, correr el eval gate — con `Authority` de gobernanza.

## 3. Criterio de validación (desde el dashboard)
El usuario abre el cockpit y ve **el roadmap de Hexy como un grafo de artefactos vivo**: marca
una feature, corre su `Process` de validación (su `Evaluation`), y el estado se actualiza con
traza — Hexy validando a Hexy.

## 4. Verificación
- Los artefactos `.sop` del roadmap pasan el eval gate (F1).
- Un `Process` de meta-construcción corre en el harness (F4) y, si usa tools (F5), respeta
  los guardrails de `Authority`.

## 5. Dependencias
[F5](F5-tools-mcp.md) + [F6](F6-context-orchestration.md). Es el hito que prueba "meta-construir".
