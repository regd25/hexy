# HexyEngine - Arquitectura Inicial Aprobada

## Vision Ejecutada
Permitir que artefactos semánticos definidos en SOL (Vision, Policy, Process, Actor, Result) sean interpretados, evaluados y ejecutados por un motor central.

## Patrón Arquitectónico
**Hexagonal Architecture + Event-Driven**

## Stack Tecnológico
- **Runtime**: Node.js + TypeScript
- **APIs**: Híbrido GraphQL (consultas) + REST (operaciones)
- **Persistencia**: PostgreSQL + Redis
- **Validación**: JSON Schema + Custom SOL validators

## Estructura Conceptual

### Core Domain (Núcleo Semántico)
```
domain/
├── entities/
│   ├── SOLArtifact.ts       # Base para todos los artefactos
│   ├── Vision.ts            # Entidad Vision
│   ├── Policy.ts            # Entidad Policy  
│   ├── Process.ts           # Entidad Process
│   ├── Actor.ts             # Entidad Actor
│   └── Result.ts            # Entidad Result
├── services/
│   ├── SemanticInterpreter.ts    # Motor interpretación SOL
│   ├── ExecutionEngine.ts        # Motor ejecución procesos
│   └── CoherenceValidator.ts     # Validador coherencia narrativa
└── repositories/
    └── SOLArtifactRepository.ts  # Abstracción persistencia
```

### Application Layer
```
application/
├── use-cases/
│   ├── ExecuteProcess.ts         # UC: Ejecutar proceso semántico
│   ├── ValidateArtifact.ts       # UC: Validar artefacto SOL
│   └── InterpretVision.ts        # UC: Interpretar visión
└── event-handlers/
    ├── ProcessExecutedHandler.ts # Handler eventos ejecución
    └── ResultEmittedHandler.ts   # Handler resultados emitidos
```

### Infrastructure Layer
```
infrastructure/
├── adapters/
│   ├── graphql/
│   │   ├── resolvers/           # Resolvers GraphQL
│   │   └── schema.ts           # Schema SOL
│   ├── rest/
│   │   └── controllers/        # Controllers REST
│   └── persistence/
│       ├── PostgresRepository.ts
│       └── RedisCache.ts
└── events/
    └── EventBus.ts             # Bus eventos interno
```

### Ports (Interfaces)
```
ports/
├── primary/                    # Driving ports
│   ├── SemanticInterpreterPort.ts
│   └── ExecutionEnginePort.ts
└── secondary/                  # Driven ports  
    ├── PersistencePort.ts
    └── NotificationPort.ts
```

## APIs Definidas

### GraphQL Schema (Consultas semánticas)
```graphql
type Process {
  id: ID!
  actors: [Actor!]!
  steps: [ProcessStep!]!
  vision: Vision
  results: [Result!]!
}

type Query {
  process(id: ID!): Process
  executeProcess(id: ID!): ExecutionResult
}
```

### REST Endpoints (Operaciones)
```
POST /api/processes/{id}/execute
GET  /api/actors/{id}/processes  
PUT  /api/artifacts/{id}
POST /api/artifacts/validate
```

## Event-Driven Integration
- **Process Executed Event**: Notifica finalización de proceso
- **Result Emitted Event**: Notifica emisión de resultado
- **Policy Violated Event**: Notifica violación de política

## Principios Aplicados
✅ **Modularidad**: Separación clara de responsabilidades  
✅ **Extensibilidad**: Nuevos artefactos SOL sin modificar núcleo  
✅ **Bajo acoplamiento**: Dominio SOL independiente de infraestructura  

---
*Arquitectura aprobada por UsuarioAdministrador - Proceso: DefinirArquitecturaInicial* 