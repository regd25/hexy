# Ejecución Básica

Esta guía te mostrará cómo ejecutar artefactos SOL en Hexy Framework y entender los modos de operación.

## Modos de ejecución

Hexy Framework opera en dos modos principales:

### 1. Modo Orquestador

El modo orquestador ejecuta procesos paso a paso, evaluando condiciones entre nodos.

### 2. Modo Reactivo

El modo reactivo escucha eventos del sistema y valida si cada acción es coherente, permitida o necesita intervención.

## Configurar modo de ejecución

### En configuración

```javascript
// hexy.config.js
module.exports = {
  semanticEngine: {
    mode: 'orchestrator', // o 'reactive'
    validationLevel: 'strict',
    tracing: true
  }
};
```

### En código

```javascript
const { SemanticEngine } = require('@hexy/core');

// Modo orquestador
const orchestratorEngine = new SemanticEngine({
  mode: 'orchestrator'
});

// Modo reactivo
const reactiveEngine = new SemanticEngine({
  mode: 'reactive'
});
```

## Ejecutar artefacto en modo orquestador

### 1. Crear contexto de ejecución

```javascript
const { ExecutionContext } = require('@hexy/core');

const context = new ExecutionContext({
  actor: 'developer',
  purpose: 'Ejecutar proceso de gestión de tareas',
  inputs: {
    title: 'Implementar autenticación JWT',
    description: 'Sistema de login seguro',
    priority: 'high',
    assignee: 'john.doe'
  },
  metadata: {
    project: 'auth-system',
    sprint: 'Sprint 1',
    deadline: '2024-02-01'
  }
});
```

### 2. Ejecutar proceso completo

```javascript
const { SemanticEngine } = require('@hexy/core');

const engine = new SemanticEngine({
  mode: 'orchestrator',
  validationLevel: 'strict'
});

try {
  const result = await engine.execute('task-management-process.sol', context);
  
  console.log('Ejecución completada:', result);
  console.log('Estado final:', result.status);
  console.log('Outputs:', result.outputs);
  console.log('Eventos generados:', result.events);
  
} catch (error) {
  console.error('Error en ejecución:', error);
  console.log('Violaciones:', error.violations);
}
```

### 3. Ejecutar paso específico

```javascript
const result = await engine.executeStep('task-management-process.sol', 'create_task', context);

console.log('Paso ejecutado:', result.step);
console.log('Outputs del paso:', result.outputs);
```

## Ejecutar en modo reactivo

### 1. Configurar listeners de eventos

```javascript
const { EventSystem } = require('@hexy/core');

const eventSystem = new EventSystem();

// Escuchar eventos de tareas
eventSystem.on('task:created', async (event) => {
  console.log('Nueva tarea creada:', event.data);
  
  // Validar coherencia
  const isValid = await engine.validateEvent('task-management-process.sol', event);
  
  if (!isValid) {
    console.log('Violación detectada:', isValid.violations);
  }
});

eventSystem.on('task:assigned', async (event) => {
  console.log('Tarea asignada:', event.data);
  
  // Verificar permisos
  const hasPermission = await engine.checkPermission(event.actor, 'assign_task');
  
  if (!hasPermission) {
    console.log('Permiso denegado para asignar tarea');
  }
});
```

### 2. Emitir eventos

```javascript
// Emitir evento de creación de tarea
await eventSystem.emit('task:created', {
  actor: 'developer',
  data: {
    taskId: 'TASK-001',
    title: 'Implementar autenticación',
    description: 'Sistema de login con JWT',
    priority: 'high'
  },
  timestamp: new Date(),
  context: context
});
```

## Monitorear ejecución

### 1. Habilitar tracing

```javascript
const engine = new SemanticEngine({
  mode: 'orchestrator',
  tracing: true,
  traceLevel: 'detailed' // 'basic' | 'detailed' | 'full'
});
```

### 2. Obtener trazas de ejecución

```javascript
const result = await engine.execute('task-management-process.sol', context);

console.log('Trazas de ejecución:');
result.traces.forEach(trace => {
  console.log(`- ${trace.timestamp}: ${trace.step} - ${trace.status}`);
  console.log(`  Inputs: ${JSON.stringify(trace.inputs)}`);
  console.log(`  Outputs: ${JSON.stringify(trace.outputs)}`);
});
```

### 3. Monitorear métricas

```javascript
const metrics = await engine.getMetrics('task-management-process.sol');

console.log('Métricas del proceso:');
console.log(`- Tiempo promedio: ${metrics.averageExecutionTime}ms`);
console.log(`- Tasa de éxito: ${metrics.successRate}%`);
console.log(`- Violaciones: ${metrics.violations.length}`);
```

## Manejar errores y violaciones

### 1. Capturar violaciones

```javascript
try {
  const result = await engine.execute('task-management-process.sol', context);
} catch (error) {
  if (error.type === 'VALIDATION_VIOLATION') {
    console.log('Violaciones de validación:');
    error.violations.forEach(violation => {
      console.log(`- ${violation.rule}: ${violation.message}`);
    });
  }
  
  if (error.type === 'PERMISSION_DENIED') {
    console.log('Permiso denegado:', error.message);
  }
}
```

### 2. Configurar manejo de errores

```javascript
const engine = new SemanticEngine({
  mode: 'orchestrator',
  errorHandling: {
    onViolation: 'stop', // 'stop' | 'warn' | 'continue'
    onPermissionDenied: 'stop',
    onValidationError: 'warn'
  }
});
```

## Ejemplos de ejecución

### Ejemplo 1: Proceso simple

```javascript
// Ejecutar proceso de creación de tarea
const context = new ExecutionContext({
  actor: 'developer',
  purpose: 'Crear tarea de desarrollo',
  inputs: {
    title: 'Fix bug in login',
    description: 'User cannot login with valid credentials',
    priority: 'medium'
  }
});

const result = await engine.execute('create-task-process.sol', context);
console.log('Tarea creada:', result.outputs.taskId);
```

### Ejemplo 2: Proceso con validaciones

```javascript
// Ejecutar proceso con validaciones estrictas
const engine = new SemanticEngine({
  mode: 'orchestrator',
  validationLevel: 'strict'
});

const context = new ExecutionContext({
  actor: 'team_lead',
  purpose: 'Asignar tarea crítica',
  inputs: {
    taskId: 'TASK-001',
    assignee: 'senior_developer',
    priority: 'critical'
  }
});

const result = await engine.execute('assign-task-process.sol', context);
```

### Ejemplo 3: Modo reactivo con validaciones

```javascript
// Configurar modo reactivo
const reactiveEngine = new SemanticEngine({
  mode: 'reactive',
  validationLevel: 'strict'
});

// Escuchar eventos y validar
eventSystem.on('task:updated', async (event) => {
  const validation = await reactiveEngine.validateEvent('task-management-process.sol', event);
  
  if (!validation.isValid) {
    console.log('Cambio de tarea viola reglas:', validation.violations);
  }
});
```

## Próximos pasos

Una vez familiarizado con la ejecución básica, continúa con:
- [Conceptos avanzados](../core-concepts/README.md)
- [Creación de plugins](../plugins/README.md)
- [Agentes reflexivos](../agents/README.md) 