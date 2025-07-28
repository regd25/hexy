# Execution Context

Esta sección cubre el contexto de ejecución de Hexy Framework, el contrato semántico vivo que transporta toda la información necesaria para la ejecución.

## Contenido

- [Concepto de Contexto](./context-concept.md)
- [Estructura del Contexto](./context-structure.md)
- [Actor y Propósito](./actor-purpose.md)
- [Inputs y Outputs](./inputs-outputs.md)
- [Eventos y Observaciones](./events-observations.md)
- [Violaciones y Errores](./violations-errors.md)
- [Trazabilidad](./tracing.md)

## Características del contexto de ejecución

### Información transportada

- **Actor**: Quién está ejecutando la acción
- **Propósito**: Por qué se está ejecutando
- **Inputs**: Datos de entrada necesarios
- **Eventos**: Cambios y notificaciones durante la ejecución
- **Resultados**: Outputs y estados finales
- **Observaciones**: Métricas y datos de monitoreo
- **Violaciones**: Incumplimientos de reglas o restricciones

### Propiedades del contexto

- **Inmutable**: Una vez creado, no puede ser modificado
- **Trazable**: Mantiene historial completo de cambios
- **Semántico**: Contiene significado y propósito
- **Validable**: Puede ser validado contra reglas organizacionales 