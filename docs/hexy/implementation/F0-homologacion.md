# F0 — Homologación tecnológica & monorepo

> Feature foundational. Sin esto, las features de producto (F1+) no tienen dónde vivir de
> forma sostenible ni el motor puede meta-construirse. Ver [roadmap](README.md).
>
> Estado: 📋 Planeado · Capa: infra · Dependencias: ninguna.

---

## 1. Objetivo

Unificar los dos repos (Hexy + SOL) y las cuatro superficies (dashboard Vite, landing
Next.js, shared, core Python) en **un monorepo homologado** con **pnpm + Turborepo**, una
**app Next.js única** y **SOL incorporado vía git subtree**. Resultado: un solo
`pnpm dev`, packages reutilizables y la base para construir features E2E.

## 2. Alcance E2E

- **Workspace:** pnpm + Turborepo.
- **Packages:** `@hexy/shared` (tipos SSOT) y `@hexy/sol` (validator/formatter/schema/parser).
- **App:** `apps/web` Next.js 14 (landing + dashboard migrado + BFF).
- **Engine:** `core/` Python tras FastAPI (fuera del grafo pnpm).
- **Docs/tooling:** docs SOL → `docs/sol/`; extensión VS Code → `tools/sol-vscode-extension/`.

## 3. Criterio de validación (desde el dashboard)

`pnpm install && pnpm dev` levanta `apps/web`; el **dashboard funciona con paridad** respecto
al actual (lista + grafo D3 + editor + validación), ahora servido por Next.js. `@hexy/sol`
es importable desde la app.

## 4. Pasos de implementación

### 4.1 Workspace
- `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - "apps/*"
    - "packages/*"
    - "tools/*"
  ```
- `turbo.json` con pipelines `build`, `dev`, `lint`, `test` (outputs `.next/**`, `dist/**`).
- Root `package.json`: `"packageManager": "pnpm@9.x"`, scripts `dev/build/test` → `turbo run`.
- Migrar el `package-lock.json` (npm) → `pnpm-lock.yaml` (`pnpm import` luego `pnpm install`).

### 4.2 Incorporar SOL (git subtree)
- `git subtree add --prefix=tools/sol-vscode-extension <sol-remote-o-path> <branch>` para
  traer el repo SOL con historia.
- Reubicar dentro del monorepo:
  - **Extraer `@hexy/sol`** (`packages/sol/src/`): mover
    `tools/sol-vscode-extension/src/validator/SemanticValidator.ts`,
    `.../formatter/SolFormatter.ts`, y convertir `.../schemas/sol-schema.json` → `schema.ts`
    (`export const SOL_SCHEMA = … as const`). Añadir `parser.ts` (`.yaml` YAML → objeto)
    usando `yaml`. `index.ts` exporta validator + formatter + schema + parser.
  - La extensión (`tools/sol-vscode-extension/`) pasa a **depender de `@hexy/sol`**
    (`"@hexy/sol": "workspace:*"`) y actualiza imports.
  - **Docs SOL → `docs/sol/`:** templates `.yaml`, `SEMANTIC_REFERENCE_RULES.md`,
    `USAGE_GUIDE.md`, examples, README (como `OVERVIEW.md`), CHANGELOG, RELEASE_STATUS (archivo).

### 4.3 `@hexy/shared`
- Mover `shared/` → `packages/shared/` con `package.json` (`name: "@hexy/shared"`,
  `exports` → `index.ts`) y `tsconfig.json`.
- Reemplazar el alias `@shared` por el package `@hexy/shared` en consumidores.

### 4.4 App Next.js `apps/web`
- Crear app Next.js 14 (App Router, TS).
- **Migrar landing** desde `landing/` (ya Next.js 14) → rutas en `apps/web/app/(marketing)`.
- **Portar dashboard** desde `dashboard/artifacts/*` → `apps/web/app/(studio)/...`:
  componentes D3/interactivos como `'use client'`; reutilizar servicios/hooks/tipos tal cual.
  El alias `@shared` pasa a `@hexy/shared`.
- BFF: route handlers / server actions en `apps/web/app/api/**` (vacío aún; se llena en F1+).

### 4.5 Engine Python
- Normalizar el layout flat `core/hexy-*.py` → paquete `core/hexy/` (`semantics/`, `context/`,
  `interfaces/`) que es lo que `pyproject.toml` ya espera (`hexy.interfaces.cli`,
  `hexy.interfaces.api`). Sin cambiar lógica.
- Confirmar que `uvicorn` levanta el FastAPI (`core/hexy-fastapi-server.py` → `hexy/interfaces/api.py`).

## 5. Archivos a crear/modificar

- **Crear:** `pnpm-workspace.yaml`, `turbo.json`, root `package.json` (scripts turbo),
  `apps/web/**`, `packages/shared/package.json`, `packages/sol/{src,package.json}`,
  `docs/sol/**`.
- **Mover (subtree/reorg):** SOL → `tools/sol-vscode-extension/` + `packages/sol/` + `docs/sol/`;
  `shared/` → `packages/shared/`; `dashboard/artifacts/*` → `apps/web/app/(studio)/*`;
  `landing/` → `apps/web/app/(marketing)/*`.
- **Actualizar:** `tsconfig` raíz (paths → packages), todos los imports `@shared`→`@hexy/shared`.

## 6. Verificación

- `pnpm install` resuelve el workspace sin errores.
- `pnpm -w build` y `pnpm -w lint` verdes; `turbo run build` cachea.
- `pnpm dev` (filtro `apps/web`) sirve landing + dashboard; paridad funcional con el Vite actual.
- `import { SemanticValidator } from '@hexy/sol'` compila en la app.
- `uvicorn` levanta el engine y `/health` responde.
- Historia de SOL presente (`git log -- tools/sol-vscode-extension/`).

## 7. Riesgos / notas

- **D3 + SSR:** los componentes de grafo deben ser `'use client'`; evitar acceso a `window`
  en server components.
- **Migración npm→pnpm:** revisar dependencias con hoisting implícito (React 19 en dashboard
  vs React 18 en landing → **homologar a una sola versión de React** en `apps/web`).
- **Engine fuera del grafo pnpm:** Turborepo puede invocarlo vía un `package.json` wrapper con
  scripts que llamen a `python`/`uvicorn`, o dejarlo con tooling propio (Makefile). Decidir en F3.
