# F2 — Round-trip import

> Estado: ✅ Implementado · Capa: backend Node.js + dashboard vanilla · Dependencias: [F1](F1-authoring-loop.md).
>
> **Implementación:** parser SOL inverso `parseYaml` (`server/src/domain/sol/parseYaml.js`) +
> `importGraph` (`server/src/domain/sol/importGraph.js`), expuestos en `POST /api/sol/import`
> (`mode: merge | replace`). UI: botón **Import .yaml** en el header del dashboard
> (`dashboard/src/components/header.js`) con file picker y confirmación reemplazar/fusionar.
> Verificado con test de round-trip (`server/test/sol.test.js`) + smoke E2E export→import.

## 1. Objetivo
Cerrar el round-trip: **importar un `.yaml`** (el que F1 exportó, o un template de
`docs/sol/templates/`) → parsear → reconstruir el grafo de artefactos → renderizar y validar
al cargar. Demuestra que `.yaml` es un formato de intercambio real, no solo de salida.

## 2. Alcance E2E
- **Parser (`@hexy/sol`):** `parse(yaml: string)` → objeto SOL (YAML) → `VisualArtifact[]` +
  `Relationship[]` (resolver `uses:` y referencias `Type:Id` a aristas del grafo).
- **UI:** acción **Import `.yaml`** (file picker / drag-drop) que carga el grafo en el canvas.
- **Validación al cargar:** correr el eval gate (F1) sobre lo importado; marcar referencias
  no resueltas.

## 3. Criterio de validación (desde el dashboard)
El usuario importa el `.yaml` exportado en F1 (o `intent-template.yaml`) y **ve el mismo grafo**
con artefactos, relaciones y estado de validación; las referencias resuelven a nodos reales.

## 4. Verificación
- Round-trip: `parse(serialize(g))` ≈ `g` (igualdad estructural de artefactos y relaciones).
- Importar un template de `docs/sol/templates/` produce un grafo válido.

## 5. Dependencias
[F1](F1-authoring-loop.md) (serializador + validador). Habilita [F3](F3-engine-bridge.md).
