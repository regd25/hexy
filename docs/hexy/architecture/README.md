# Architecture

Esta sección describe la arquitectura de Hexy Framework, sus componentes principales y cómo interactúan entre sí.

## Contenido

- [Arquitectura General](./overview.md)
- [Componentes del Core](./core-components.md)
- [Sistema de Plugins](./plugin-system.md)
- [Agentes Reflexivos](./reflective-agents.md)
- [Patrones de Diseño](./design-patterns.md)
- [Modos de Operación](./operation-modes.md)

## Arquitectura General

Hexy sigue principios de arquitectura hexagonal, DDD (Domain-Driven Design), y event-driven design.

### Componentes principales

- **Core Engine**: Motor semántico y ejecución de contexto
- **Plugin System**: Adaptadores y conectores
- **Agents**: Agentes reflexivos y validadores
- **Event System**: Sistema de eventos y observaciones
- **Validation Engine**: Motor de validación contextual

### Modos de operación

1. **Modo Orquestador** – Hexy ejecuta paso a paso un proceso definido, evaluando condiciones entre nodos
2. **Modo Reactivo** – Hexy escucha eventos del sistema y valida si cada acción es coherente, permitida o necesita intervención 