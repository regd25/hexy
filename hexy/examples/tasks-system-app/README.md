# Aplicación de Ejemplo con Arquitectura Hexagonal

Este ejemplo muestra una implementación completa de una aplicación simple de gestión de tareas (Task Management) siguiendo los principios de:

- Arquitectura Hexagonal (Puertos y Adaptadores)
- Domain-Driven Design (DDD)
- Principios SOLID
- Clean Architecture

## Estructura del Proyecto

El proyecto está organizado en capas claras siguiendo la arquitectura hexagonal:

```
hexagonal-example/
│
├── domain/                     # Capa de dominio (centro de la aplicación)
│   └── task/
│       ├── task.ts             # Entidad y Value Objects
│       ├── task-repository.ts  # Interfaz de repositorio (puerto)
│       ├── task-domain-service.ts  # Servicio de dominio
│       └── task-domain.module.ts   # Módulo de dominio
│
├── application/                # Capa de aplicación (casos de uso)
│   └── task/
│       ├── create-task.use-case.ts     # Caso de uso para crear tareas
│       ├── list-tasks.use-case.ts      # Caso de uso para listar tareas
│       ├── complete-task.use-case.ts   # Caso de uso para completar tareas
│       └── task-application.module.ts  # Módulo de aplicación
│
├── infrastructure/             # Capa de infraestructura (adaptadores)
│   └── task/
│       ├── in-memory-task-repository.ts  # Implementación del repositorio
│       └── task-infrastructure.module.ts # Módulo de infraestructura
│
├── app.module.ts               # Módulo principal de la aplicación
└── main.ts                     # Punto de entrada
```

## Principios de Arquitectura Aplicados

### Arquitectura Hexagonal

La arquitectura hexagonal separa claramente:

1. **Dominio**: El núcleo de negocio, independiente de frameworks y detalles técnicos
2. **Aplicación**: Orquesta el flujo de datos usando los casos de uso
3. **Infraestructura**: Implementa los detalles técnicos como persistencia

### Flujo de Dependencias

El flujo de dependencias siempre apunta hacia el centro:

```
Infraestructura → Aplicación → Dominio
```

Esto se logra mediante:

- Interfaces en el dominio (puertos) implementadas en la infraestructura (adaptadores)
- Inyección de dependencias para proporcionar implementaciones concretas

## Características Implementadas

- **Value Objects** inmutables (`TaskId`, `TaskTitle`, `TaskDescription`)
- **Entidades** con identidad y comportamiento (`Task`)
- **Servicios de Dominio** para lógica de negocio que no pertenece a entidades
- **Repositorios** como interfaces en el dominio e implementaciones en infraestructura
- **Casos de Uso** en la capa de aplicación
- **Módulos** específicos para cada capa
- **Sistema de Inyección de Dependencias** con decoradores específicos para cada capa

## Cómo Ejecutar

Para ejecutar este ejemplo:

```bash
# Instalar dependencias (asegúrate de tener uuid instalado)
npm install uuid

# Ejecutar la aplicación
ts-node examples/hexagonal-example/main.ts
```

## Extensiones Posibles

Este ejemplo puede extenderse con:

1. Implementación de repositorios persistentes (MongoDB, SQL, etc.)
2. UI para interactuar con la aplicación (web, CLI, API REST)
3. Más validaciones y reglas de negocio
4. Eventos de dominio y manejadores
5. Tests unitarios e integración para cada capa 