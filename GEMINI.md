# 📐 Guía de estilo, convenciones y reglas del proyecto Hexy Framework

Esta guía establece las normas para mantener la coherencia semántica, técnica y organizativa del proyecto Hexy Framework y el lenguaje SOL (Semantic Operations Language).

---

## 🧠 Convenciones semánticas (SOL)

### Nombres de artefactos SOL
- **Artefactos principales**: `Vision`, `Policy`, `Process`, `Actor`, `Result`, `Signal`, `Observation`, `Indicator`, `Authority`, `Protocol`, `Context`, `Intent`.
- **Artefactos deprecados**: `Domain` (reemplazado por `Context`), `Concept` (integrado en `Context`).
- Los nombres deben usar **identificadores específicos en inglés, formato camelCase**.
  - ✅ `DetectarRiesgoEmocional`, `GestionarEnviosExpress`, `ValidarArtefactoSOL`
  - ❌ `envio`, `proceso1`, `vision_default`

### Formato YAML
- Todos los archivos `.sop` deben estar estructurados como YAML legible por humanos.
- Usar siempre indentación de 2 espacios.
- La estructura raíz usa nombres de artefactos en plural: `Policies:`, `Actors:`, `Processes:`, etc.

### Referencias internas
- Todas las referencias entre artefactos deben usar la notación `TipoArtefacto:id`.
  - ✅ `Policy:ValidacionMinimaProceso`, `Actor:HexyEngine`, `Vision:DesarrolloProcesosOrganizacionalesConHexy`
  - ❌ referencias por `name:` únicamente
- Las referencias cruzadas deben mantenerse **consistentes** y documentadas en el mismo archivo si el contexto lo permite.

### Estructura de artefactos v2025.07
- **Vision**: Requiere `id`, `content`. Opcionalmente `author`, `date`
- **Policy**: Requiere `id`, `premise`. Opcionalmente `vision`, `version`, `governance`
- **Process**: Requiere `id`, `steps`, `actors`. Opcionalmente `vision`, `errorPaths`
- **Actor**: Requiere `id`, `type`. Opcionalmente `capabilities`, `context`
- **Result**: Requiere `id`, `outcome`, `issuedBy`, `reason`, `timestamp`
- **Signal**: Requiere `id`, `sentBy`, `sentTo`, `basedOn`, `channel`, `type`, `timestamp`
- **Observation**: Requiere `id`, `observedBy`, `value`, `timestamp`, `context`
- **Indicator**: Requiere `id`, `description`, `measurement`. Opcionalmente `unit`, `goal`
- **Authority**: Requiere `id`, `role`, `approves`, `scope`
- **Protocol**: Requiere `id`, `description`, `steps`. Opcionalmente `actors`, `vision`
- **Context**: Requiere `id`, `description`, `vision`. Opcionalmente `policies`, `processes`
- **Intent**: Requiere `id`, `purpose`, `context`. Opcionalmente `constraints`, `success_criteria`

### Migración a v2025.07
- **Artefactos fundacionales**: `Intent`, `Context`, `Authority` ahora son independientes
- **Composición**: Usar bloques `uses:` para evitar duplicación
- **Referencias semánticas**: Notación `Actor:Id` es obligatoria
- **Validación semántica**: Reglas de coherencia implementadas en herramientas

---

## 💻 Convenciones de desarrollo

### Estructura del proyecto

```
hexy-framework/
├── core/              # Motor semántico (interpreta SOL)
├── agents/            # Agentes reflexivos y validadores semánticos
├── plugins/           # Adaptadores externos, Copilot, etc.
├── sol/               # Artefactos SOL de ejemplo y test
├── examples/          # Casos de uso (por contexto)
├── docs/              # Documentación viva generada desde SOL
├── scripts/           # CLI, utilidades
└── README.md
```

### Estilo de código
- JavaScript/TypeScript: usar `prettier` y `eslint` (config compartida).
- Python: usar `black`, `isort` y `mypy` para chequeo de tipos.
- Convención de archivos en `kebab-case` para JS/TS.
- Evitar prefijo `I` para interfaces. Ej: `Repository` en lugar de `IRepository`.

### Documentación automática
- La documentación generada se almacenará en `docs/` y en `hexy.index.json` con los campos:
  - `updatedAt`
  - `source`

---

## 📦 Plugins y extensiones

### Estructura mínima de un plugin:
```
plugins/plugin-name/
├── README.md
├── package.json / pyproject.toml
├── src/
└── prompts/
```

### Naming
- Todos los plugins deben llamarse con prefijo `hexy-` si son oficiales.
  - Ej: `hexy-vscode-autodoc`, `hexy-aws-stepfunctions-adapter`

---

## 📄 Reglas para Pull Requests (PR)

### Formato de contribución semántica
Cada PR debe incluir:
- Un archivo `.sop` con la descripción del cambio (artefacto, propósito, justificación).
- Cambio de código/documentación correspondiente.
- Actualización de `hexy.index.json` si aplica.

### Revisión
- Los PR son revisados por al menos 1 humano + 1 agente reflexivo (simulado o real).
- El bot o agente debe validar:
  - Consistencia entre artefactos.
  - Coherencia semántica con el dominio.
  - Referencias no rotas.

---

## 🧪 Testing semántico

- El motor Hexy debe ejecutar tests de validación por cada `Process` definido.
- Se evalúan:
  - Flujo correcto (todos los pasos conectados)
  - Validación de políticas activadas
  - Resultados esperados definidos y alcanzables

---

## 🧭 Principios del framework

1. **Semántica antes que sintaxis.**
2. **Ejecución basada en intención.**
3. **Agentes autónomos supervisan la integridad.**
4. **Toda lógica de negocio debe estar trazada a una visión.**
5. **El sistema debe poder explicarse a sí mismo.**

---

Para dudas o propuestas de ajuste, abrir un PR sobre este documento o escribir a `@regd25`.
