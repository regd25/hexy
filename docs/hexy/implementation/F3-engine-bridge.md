# F3 — Engine bridge (light ↔ heavy)

> Estado: 📋 Planeado · Capa: TS + Python · Dependencias: [F2](F2-round-trip-import.md).
> Nivel de detalle: objetivo + alcance + validación (se profundiza al llegar).

## 1. Objetivo
Conectar la capa ligera (Next.js BFF) con el **motor pesado** (Python/FastAPI): enviar un
`.sop`, que el motor lo **proyecte a RDF/OWL**, razone, y devuelva **entidades, inferencias y
sub-grafo** que el lado TS no puede calcular. Primer cruce real de la frontera de cómputo.

## 2. Alcance E2E
- **Engine (`core/`):** endpoint FastAPI `POST /model/project` que recibe `.sop`/JSON, usa
  `hexy-rdf-processor.py` + `hexy-ontology-manager.py` para proyectar a RDF, razonar
  (HermiT/Pellet) y devolver entidades + relaciones inferidas + estadísticas del grafo.
- **BFF (`apps/web`):** route handler `app/api/engine/project` que hace de proxy al motor
  (HTTP), con timeout/retry; sin meter cómputo pesado en Next.js.
- **UI:** overlay en el grafo que muestra relaciones **inferidas** (distinguibles de las
  declaradas) y entidades extraídas.

## 3. Criterio de validación (desde el dashboard)
El usuario carga un modelo y pulsa **"Analizar con el motor"**: aparecen relaciones/inferencias
nuevas (p. ej. transitividad de `DEPENDS_ON`, o entidades derivadas) que no estaban en el
grafo autorado — evidencia de que el motor razona.

## 4. Verificación
- `pytest` del endpoint `/model/project` con un `.sop` fixture → entidades/inferencias esperadas.
- El BFF responde y la UI pinta las inferencias; el motor corre como proceso/servicio aparte.

## 5. Dependencias
[F2](F2-round-trip-import.md). Define cómo Turborepo/infra invoca el engine (ver F0 §7).
Habilita [F4](F4-harness-loop.md).
