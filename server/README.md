# hexy-server

Backend de Hexy en **Node.js puro** (`node:http`, sin framework). Asume la persistencia y la
lógica de negocio que antes corrían en el navegador (localStorage) del dashboard.

## Arquitectura

- **YAML en disco = fuente de verdad** (`data/artifacts/*.yaml`, `data/relationships/*.yaml`,
  `data/temporal/*.yaml`). Lossless, versionable en git, editable por el usuario.
- **SQLite = índice derivado** (`data/hexy.db`, vía `node:sqlite`). Sirve todas las lecturas y
  consultas. **Nunca es autoritativo**: al arrancar se reconstruye desde los YAML, y si se
  borra/corrompe se regenera con `rebuildFromYaml()`.
- **Write-through**: las mutaciones escriben primero el YAML y luego espejan en SQLite.

```
src/
├── index.js              # arranque http.Server + wiring
├── router.js             # router mínimo (method + :param)
├── http.js               # parseo de body, JSON/CORS, errores
├── api/routes.js         # endpoints REST
├── domain/
│   ├── ArtifactService.js    # orquestación (CRUD, relaciones, temporales, stats)
│   ├── ValidationService.js  # validación semántica Hexy
│   ├── EventBus.js           # bus en memoria (futuro SSE)
│   ├── constants.js          # tipos, colores, defaults (SSOT del modelo)
│   └── sol/                  # serializeYaml (SOL canónico) + validateYaml (eval gate)
└── repository/
    ├── YamlStore.js          # fuente de verdad en disco
    ├── SqliteIndex.js        # índice derivado
    └── ArtifactRepository.js # write-through
```

## Requisitos

- **Node ≥ 22** (necesario para `node:sqlite`).

## Uso

```bash
pnpm --filter hexy-server dev     # node --watch, puerto 4000
pnpm --filter hexy-server start   # producción
pnpm --filter hexy-server test    # node --test
```

Variables de entorno: `PORT` (4000), `HEXY_DATA_DIR` (`./data`), `HEXY_DB_PATH` (`./data/hexy.db`).

## API

`GET /api/health` · `GET|POST /api/artifacts` · `GET|PATCH|DELETE /api/artifacts/:id` ·
`GET /api/artifacts/:id/relationships` · `POST /api/artifacts/:id/validate` ·
`POST /api/relationships` · `DELETE /api/relationships/:id` ·
`POST /api/temporal` · `GET|PATCH|DELETE /api/temporal/:id` · `POST /api/temporal/:id/promote` ·
`GET /api/statistics` · `GET /api/export` · `POST /api/import` ·
`GET /api/sol/yaml` · `POST /api/sol/validate` · `POST /api/sol/import`

`POST /api/sol/import` cierra el round-trip (F2): recibe `{ yaml, mode }` (`mode`:
`merge` | `replace`), parsea el `.yaml` SOL, reconstruye el grafo (layout en círculo) y
devuelve `{ artifacts, relationships, unresolved }`.
