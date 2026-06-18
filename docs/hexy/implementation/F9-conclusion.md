# F9 — Conclusión / empaquetado

> Estado: 📋 Planeado · Capa: infra · Dependencias: todas (F0–F8).
> Nivel de detalle: objetivo + alcance + validación.

## 1. Objetivo
Dejar el framework **instalable, desplegable y documentado** — el punto en que SOL+Hexy es un
producto que un tercero puede adoptar, y la extensión VS Code consume el mismo `@hexy/sol` que
el dashboard (lenguaje y harness homologados de punta a punta).

## 2. Alcance E2E
- **Extensión VS Code** (`tools/sol-vscode-extension/`) publicada, dependiendo de `@hexy/sol`
  (mismo validator que el dashboard → cero divergencia lenguaje↔harness).
- **Deploy:** `apps/web` (Vercel/Node) + `core/` engine (contenedor) con su compose/manifests;
  variables de entorno y secrets documentados.
- **Docs de adopción:** getting-started real (instalar, modelar, validar, correr un loop),
  reemplazando los enlaces muertos del `docs/hexy/README.md` actual.
- **Release:** versionado del monorepo, CHANGELOG unificado, RELEASE notes.

## 3. Criterio de validación (desde el dashboard)
Un usuario nuevo sigue el getting-started: **instala limpio, levanta la app, modela y valida un
artefacto, corre un loop**, y la **extensión VS Code** valida un `.sop` con las mismas reglas
que el dashboard.

## 4. Verificación
- Instalación limpia (`pnpm install && pnpm build`) en un entorno fresco, verde.
- Deploy reproducible (web + engine) con health checks.
- La extensión usa `@hexy/sol`; un `.sop` válido en el dashboard lo es también en VS Code.

## 5. Dependencias
F0–F8. Cierra la definición de **"concluido"** del [roadmap](README.md).
