# Tu Primer Artefacto

Esta guía te ayudará a crear tu primer artefacto SOL (Semantic Organizational Language) en Hexy Framework.

## ¿Qué es un artefacto SOL?

Un artefacto SOL es una unidad semántica que representa intenciones, condiciones, actores o flujos de trabajo de forma estructurada y auditable. Es la base fundamental de Hexy.

## Tipos de artefactos

### Strategic Artifacts
- **Vision**: Visión organizacional
- **Mission**: Misión y propósito
- **Objective**: Objetivos estratégicos

### Organizational Artifacts
- **Actor**: Personas o sistemas que ejecutan acciones
- **Area**: Áreas de responsabilidad
- **Authority**: Autoridades y permisos

### Operational Artifacts
- **Process**: Procesos de negocio
- **Procedure**: Procedimientos específicos
- **Workflow**: Flujos de trabajo

### Foundational Artifacts
- **Principle**: Principios organizacionales
- **Policy**: Políticas y reglas
- **Guideline**: Guías y mejores prácticas

## Crear tu primer artefacto

### 1. Estructura básica de un artefacto

Crea un archivo `my-first-artifact.sol`:

```sol
# Strategic Artifact: Vision
@vision
name: "Mi Primera Visión"
description: "Esta es mi primera visión organizacional creada con Hexy"
version: "1.0.0"
created: "2024-01-15"
author: "Tu Nombre"

# Contexto organizacional
context:
  organization: "Mi Empresa"
  domain: "Desarrollo de Software"
  scope: "Sistema de gestión de tareas"

# Contenido semántico
content:
  vision: "Ser líderes en innovación tecnológica"
  purpose: "Transformar la manera en que las organizaciones gestionan sus procesos"
  values:
    - "Innovación continua"
    - "Calidad excepcional"
    - "Colaboración efectiva"

# Métricas de éxito
metrics:
  - name: "Satisfacción del cliente"
    target: "95%"
    period: "trimestral"
  - name: "Tiempo de entrega"
    target: "< 2 semanas"
    period: "mensual"

# Relaciones con otros artefactos
relations:
  - type: "implements"
    target: "process:task-management"
  - type: "supports"
    target: "objective:digital-transformation"
```

### 2. Artefacto de proceso

Crea un archivo `task-management-process.sol`:

```sol
# Operational Artifact: Process
@process
name: "Gestión de Tareas"
description: "Proceso para gestionar tareas del proyecto"
version: "1.0.0"
created: "2024-01-15"
author: "Tu Nombre"

# Contexto
context:
  organization: "Mi Empresa"
  domain: "Gestión de Proyectos"
  scope: "Desarrollo de Software"

# Definición del proceso
content:
  purpose: "Gestionar tareas de desarrollo de manera eficiente"
  steps:
    - step: 1
      name: "Crear tarea"
      actor: "developer"
      action: "create_task"
      inputs:
        - "title"
        - "description"
        - "priority"
      outputs:
        - "task_id"
        - "status"
    
    - step: 2
      name: "Asignar tarea"
      actor: "team_lead"
      action: "assign_task"
      inputs:
        - "task_id"
        - "assignee"
      outputs:
        - "assignment_date"
        - "estimated_time"
    
    - step: 3
      name: "Desarrollar"
      actor: "developer"
      action: "develop_task"
      inputs:
        - "task_id"
        - "requirements"
      outputs:
        - "completion_status"
        - "code_changes"
    
    - step: 4
      name: "Revisar"
      actor: "reviewer"
      action: "review_task"
      inputs:
        - "task_id"
        - "code_changes"
      outputs:
        - "review_status"
        - "feedback"
    
    - step: 5
      name: "Cerrar tarea"
      actor: "team_lead"
      action: "close_task"
      inputs:
        - "task_id"
        - "review_status"
      outputs:
        - "completion_date"
        - "final_status"

# Condiciones y validaciones
conditions:
  - name: "task_must_have_title"
    rule: "title.length > 0"
    message: "La tarea debe tener un título"
  
  - name: "assignee_must_exist"
    rule: "assignee in team_members"
    message: "El asignado debe ser miembro del equipo"

# Métricas del proceso
metrics:
  - name: "Tiempo promedio de completado"
    target: "< 3 días"
    measurement: "average_completion_time"
  
  - name: "Tasa de aprobación en primera revisión"
    target: "> 80%"
    measurement: "first_review_approval_rate"
```

### 3. Artefacto de actor

Crea un archivo `developer-actor.sol`:

```sol
# Organizational Artifact: Actor
@actor
name: "Developer"
description: "Desarrollador de software"
version: "1.0.0"
created: "2024-01-15"
author: "Tu Nombre"

# Contexto
context:
  organization: "Mi Empresa"
  domain: "Desarrollo de Software"
  scope: "Equipo de Desarrollo"

# Definición del actor
content:
  role: "Desarrollador de Software"
  responsibilities:
    - "Desarrollar funcionalidades según especificaciones"
    - "Escribir código limpio y mantenible"
    - "Realizar pruebas unitarias"
    - "Participar en revisiones de código"
    - "Documentar cambios realizados"
  
  skills:
    - "Programación en lenguajes requeridos"
    - "Control de versiones (Git)"
    - "Testing y debugging"
    - "Comunicación efectiva"
  
  permissions:
    - "create_task"
    - "update_task_status"
    - "submit_code_review"
    - "access_development_environment"

# Relaciones
relations:
  - type: "reports_to"
    target: "actor:team_lead"
  - type: "collaborates_with"
    target: "actor:reviewer"
  - type: "executes"
    target: "process:task-management"

# Métricas de rendimiento
metrics:
  - name: "Velocidad de desarrollo"
    target: "> 5 story points/sprint"
    measurement: "story_points_completed"
  
  - name: "Calidad del código"
    target: "< 5% defect rate"
    measurement: "defect_rate"
```

## Validar tu artefacto

### Comando de validación

```bash
# Node.js
npm run validate-artifact my-first-artifact.sol

# Python
python -m hexy.validate my-first-artifact.sol
```

### Verificar sintaxis

```bash
# Verificar sintaxis SOL
npm run lint-artifact my-first-artifact.sol

# Verificar semántica
npm run check-semantics my-first-artifact.sol
```

## Ejecutar tu artefacto

### Crear contexto de ejecución

```javascript
// execution-context.js
const { ExecutionContext } = require('@hexy/core');

const context = new ExecutionContext({
  actor: 'developer',
  purpose: 'Crear primera tarea del proyecto',
  inputs: {
    title: 'Implementar autenticación',
    description: 'Sistema de login con JWT',
    priority: 'high'
  }
});
```

### Ejecutar artefacto

```javascript
// execute-artifact.js
const { SemanticEngine } = require('@hexy/core');

const engine = new SemanticEngine();
const result = await engine.execute('task-management-process.sol', context);

console.log('Resultado:', result);
```

## Próximos pasos

Una vez creado tu primer artefacto, continúa con:
- [Ejecución básica](./basic-execution.md)
- [Conceptos avanzados](../core-concepts/README.md)
- [Creación de plugins](../plugins/README.md) 