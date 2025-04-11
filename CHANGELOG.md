# CHANGELOG

## v0.1.0 (Fecha actual)

### Añadido
- Nuevo módulo: TaskModule con estructura hexagonal
- Implementación del controlador TaskController
- Servicio de aplicación TaskApplicationService
- Servicio de dominio TaskDomainService
- Repositorio de tareas con implementación en memoria (InMemoryTaskRepository)

### Modificado
- Integración del sistema de inyección de dependencias
- Actualización de la estructura de carpetas siguiendo convenciones kebab-case

### Corregido
- Problema de resolución de dependencias en el contenedor DI
- Referencias incorrectas a Object() nativo

### Técnico
- Refactorización siguiendo principios SOLID
- Implementación de patrón repositorio
- Mejora en la gestión de dependencias mediante el patrón de inyección
- Arquitectura hexagonal aplicada al módulo de tareas 