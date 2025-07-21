# Plugins

Esta sección cubre el sistema de plugins de Hexy Framework, que permite extender la funcionalidad del core con conectores externos.

## Contenido

- [Sistema de Plugins](./plugin-system.md)
- [Creando Plugins](./creating-plugins.md)
- [Plugin API](./plugin-api.md)
- [Plugins Disponibles](./available-plugins.md)
- [Integración con Servicios Externos](./external-services.md)
- [Testing de Plugins](./testing-plugins.md)

## Características del sistema de plugins

### Tipos de plugins

- **Executors**: Ejecutan acciones específicas
- **Validators**: Validan condiciones y reglas
- **Connectors**: Conectan con servicios externos
- **Observers**: Monitorean eventos y cambios

### Integración extensible

Hexy es compatible con:
- Jira, n8n, AWS Step Functions
- GraphQL, REST APIs
- Modelos generativos
- Protocolos como MCP (Model Context Protocol)

### Desarrollo de plugins

Los plugins siguen un contrato semántico específico y pueden ser desarrollados en TypeScript o Python. 