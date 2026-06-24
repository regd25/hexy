# F1 — Authoring loop (TS-only) ⭐ primera feature validable

> El primer slice E2E que el usuario valida desde el dashboard. Todo en TS/Next.js, **sin el
> motor Python**: prueba el Ubiquitous Language y el eval gate. Ver [roadmap](README.md).
>
> Estado: 🔨 En curso (vía rápida sobre el dashboard Vite, sin esperar F0) · Capa: TS ·
> Dependencias: [F0](F0-homologacion.md) (se difiere; ver nota de implementación).
>
> **Implementación vía rápida (entregada):** validador + serializador en
> `dashboard/artifacts/services/sol/` (con tests `sol.test.ts`), eval gate en vivo y botón
> **Export .yaml** en `GraphHeader`/`GraphContainer`. Se migrará a `@hexy/sol` en F0.

---

## 1. Objetivo

Cerrar el ciclo de autoría de un artefacto de dominio: **crear/editar → validar en vivo →
persistir → exportar a `.yaml`** válido. Es la prueba mínima de que el dashboard sirve como
*systems modeling tool* y de que el vocabulario (referencias `Type:Id`, composición `uses:`)
funciona punta a punta.

## 2. Alcance E2E

- **UI (`apps/web`):** vista de edición de artefacto en el studio.
- **Validación combinada:** Zod (`ValidationService` actual) **+** `@hexy/sol`
  `SemanticValidator` (referencias, DRY, jerarquía) como **eval gate** en vivo.
- **Persistencia ligera (BFF):** guardar el modelo (archivo JSON / in-memory primero).
- **Export `.yaml`:** serializar el grafo a YAML `.yaml` canónico.

> Sin Python, sin ejecución de loop, sin MCP. Solo autoría + validación + export.

## 3. Criterio de validación (desde el dashboard)

El usuario:
1. Crea un artefacto `Intent` y un `Process` que lo referencia (`uses: { intent: Intent:X }`).
2. Ve **validación en vivo**: si pone un string genérico o referencia inexistente, aparece
   el error del eval gate; al corregir, pasa a verde.
3. Pulsa **Export** → descarga un `.yaml` que **pasa `SemanticValidator.validateDocument()`
   sin errores** y valida contra `sol-schema.json`.

## 4. Pasos de implementación

### 4.1 Integrar el validador de SOL como eval gate
- En `useArtifactValidation` (dashboard), además del `ValidationService` Zod, llamar a
  `@hexy/sol` `SemanticValidator.validateDocument(serializeToSop(artifact))`.
- Fusionar resultados en el `ValidationResult` existente (errors/warnings/suggestions);
  mapear `ruleId` de SOL (`ACTOR_REFERENCE_NOTATION`, `DRY_FOUNDATIONAL_BLOCKS`,
  `CROSS_REFERENCE_VALIDATION`) a los campos de UI ya soportados.
- Mostrar inline en `SemanticArtifactEditor` (ya tiene estado de validación por campo).

### 4.2 Serializador `.yaml` (TS)
- Nuevo módulo `apps/web/lib/sop/serialize.ts`: `VisualArtifact`/grafo → objeto SOL →
  YAML (`yaml.stringify`). Respetar la **gramática canónica**: `meta`, `uses:` (composición,
  no duplicación), referencias `Type:Id`, flujo `Actor:Rol → "acción"` para `Process`.
- Round-trip mínimo: lo serializado debe re-parsear con el `parser` de `@hexy/sol` (preparado
  para F2).

### 4.3 Persistencia ligera (BFF)
- Route handler `apps/web/app/api/artifacts/route.ts` (POST/GET) que persiste el modelo.
- Reutilizar `InMemoryArtifactRepository` de `@hexy/shared`; backend de archivo JSON para que
  sobreviva al reload (Postgres llega en F8).

### 4.4 UI de export
- Botón **Export `.yaml`** en el editor/lista que llama al serializador y descarga el archivo;
  feedback con `useNotifications`.

## 5. Archivos a crear/modificar

- **Crear:** `apps/web/lib/sop/serialize.ts`, `apps/web/app/api/artifacts/route.ts`.
- **Reutilizar/extender:** `useArtifactValidation.ts`, `ValidationService.ts`,
  `SemanticArtifactEditor.tsx`, `VisualArtifact.ts`, `@hexy/shared`
  `InMemoryArtifactRepository`, `@hexy/sol` `SemanticValidator`.

## 6. Verificación

- **Unit:** test del serializador → `serialize(artifact)` produce YAML que
  `SemanticValidator.validateDocument()` marca `isValid: true`; y que valida contra
  `SOL_SCHEMA`.
- **Unit:** referencia inexistente → el eval gate combinado devuelve error
  `CROSS_REFERENCE_VALIDATION`.
- **E2E manual (criterio §3):** autoría → validación en vivo → export `.yaml` válido.
- `pnpm -w test` verde.

## 7. Dependencias

- [F0](F0-homologacion.md): `apps/web`, `@hexy/sol`, `@hexy/shared` disponibles.
- Habilita [F2](F2-round-trip-import.md) (importar lo exportado).
