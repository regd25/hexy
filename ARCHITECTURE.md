# Arquitectura de Hexy

## Visión General

Hexy es un framework para el desarrollo de aplicaciones basado en arquitectura hexagonal (o ports and adapters) y Domain-Driven Design (DDD). Está diseñado para facilitar la creación de sistemas empresariales complejos con un dominio de negocio bien definido.

## Principios Arquitectónicos

### 1. Arquitectura Hexagonal

La arquitectura hexagonal (también conocida como Ports and Adapters) separa el núcleo de la aplicación de los servicios externos mediante puertos e interfaces. En Hexy, esto se implementa con:

- **Dominio**: El núcleo de la aplicación que contiene la lógica de negocio.
- **Aplicación**: Casos de uso que orquestan el flujo de la lógica de negocio.
- **Infraestructura**: Implementaciones técnicas de las interfaces definidas en el dominio.

### 2. Domain-Driven Design (DDD)

Hexy implementa los siguientes conceptos de DDD:

- **Entidades**: Objetos con identidad única a lo largo del tiempo.
- **Value Objects**: Objetos inmutables definidos por sus atributos.
- **Agregados**: Clusters de entidades y value objects tratados como una unidad.
- **Repositorios**: Abstracción para el acceso a datos.
- **Servicios de Dominio**: Operaciones que no pertenecen naturalmente a entidades o value objects.
- **Bounded Contexts**: Limites explícitos que definen donde se aplican ciertos modelos.

### 3. Command Query Responsibility Segregation (CQRS)

Hexy separa las operaciones de lectura y escritura:

- **Commands**: Representan intenciones de cambiar el estado del sistema.
- **Queries**: Solicitudes para recuperar datos sin cambios de estado.
- **CommandBus**: Orquesta la ejecución de comandos a sus manejadores.
- **QueryBus**: Orquesta la ejecución de consultas a sus manejadores.

## Estructura de Directorios

```
src/
├── domain/             # Capa de dominio
│   ├── aggregate/      # Entidades, value objects y agregados
│   ├── criteria/       # Criterios para consultas y filtrado
│   ├── dependency-injection/ # Sistema de inyección de dependencias
│   ├── error/          # Errores específicos del dominio
│   ├── event-bus/      # Infraestructura para eventos de dominio
│   ├── persistence/    # Interfaces de repositorios
│   ├── use-case/       # Casos de uso abstractos
│   └── types/          # Tipos comunes
├── application/        # Capa de aplicación
│   └── ...             # Implementación de casos de uso específicos
├── infrastructure/     # Capa de infraestructura
│   ├── persistence/    # Implementaciones de repositorios
│   ├── http/           # Interfaces HTTP
│   └── ...             # Otras implementaciones técnicas
├── contexts/           # Bounded contexts de la aplicación
│   └── [nombre-contexto]/ # Un contexto específico
│       ├── domain/     # Modelo de dominio específico del contexto
│       ├── application/ # Casos de uso del contexto
│       └── infrastructure/ # Infraestructura del contexto
└── cli/                # Interfaz de línea de comandos
```

## Flujo de Control

1. **Entrada**: Las solicitudes llegan a través de adaptadores (HTTP, CLI, etc.)
2. **Aplicación**: Los adaptadores convierten las solicitudes en comandos/consultas
3. **Ejecución**: Los buses envían comandos/consultas a sus manejadores
4. **Dominio**: Los manejadores interactúan con el modelo de dominio
5. **Persistencia**: Los cambios se almacenan a través de repositorios
6. **Eventos**: Se emiten eventos de dominio para efectos secundarios

## Guías de Implementación

### Inyección de Dependencias

Hexy utiliza un sistema de inyección de dependencias propio, siguiendo los principios de inversión de dependencias (DIP) de SOLID:

```typescript
@Injectable()
class MyService {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private repository: IRepository
  ) {}
}
```

### CQRS

Para implementar operaciones, sigue el patrón:

1. Define un comando o consulta
2. Crea un manejador para procesarlo
3. Usa el bus apropiado para ejecutarlo

```typescript
// 1. Define el comando
interface CreateUserCommand extends Command {
  commandType: 'CreateUser';
  username: string;
  email: string;
}

// 2. Crea el manejador
@Injectable()
class CreateUserCommandHandler extends CommandHandler<CreateUserCommand, User> {
  // Implementa el manejador
}

// 3. Ejecuta vía CommandBus
const result = await commandBus.dispatch(createUserCommand);
```

## Evolución y Extensibilidad

Hexy está diseñado para ser extensible. Nuevas capacidades pueden añadirse:

1. Como nuevos bounded contexts
2. Como módulos que extienden la funcionalidad actual
3. Como adaptadores para servicios externos 