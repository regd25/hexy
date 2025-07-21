# Troubleshooting

Esta guía te ayudará a resolver problemas comunes que pueden surgir al usar Hexy Framework.

## Problemas de instalación

### Error: "Module not found"

**Síntomas:**
```
Error: Cannot find module '@hexy/core'
```

**Solución:**
```bash
# Verificar que estás en el directorio correcto
pwd
ls -la

# Reinstalar dependencias
npm install

# Si persiste, limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error: "Python version incompatible"

**Síntomas:**
```
SyntaxError: invalid syntax
```

**Solución:**
```bash
# Verificar versión de Python
python --version

# Actualizar Python si es necesario
# En macOS con Homebrew:
brew install python@3.10

# En Ubuntu/Debian:
sudo apt update
sudo apt install python3.10
```

### Error: "Permission denied"

**Síntomas:**
```
EACCES: permission denied
```

**Solución:**
```bash
# Usar nvm para gestión de versiones
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# O cambiar permisos
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

## Problemas de configuración

### Error: "Configuration file not found"

**Síntomas:**
```
Error: Cannot find configuration file 'hexy.config.js'
```

**Solución:**
```bash
# Crear archivo de configuración
touch hexy.config.js

# O especificar ruta de configuración
export HEXY_CONFIG_PATH=/path/to/your/config.js
```

### Error: "Invalid configuration"

**Síntomas:**
```
Error: Invalid configuration format
```

**Solución:**
```javascript
// Verificar sintaxis del archivo de configuración
// hexy.config.js
module.exports = {
  semanticEngine: {
    mode: 'orchestrator',
    validationLevel: 'strict',
    tracing: true
  },
  plugins: {
    enabled: true,
    autoLoad: true,
    path: './plugins'
  }
};
```

## Problemas de artefactos

### Error: "Invalid SOL syntax"

**Síntomas:**
```
Error: Invalid SOL syntax at line 5
```

**Solución:**
```sol
# Verificar sintaxis SOL
# Ejemplo correcto:
@process
name: "Mi Proceso"
description: "Descripción del proceso"
version: "1.0.0"

content:
  purpose: "Propósito del proceso"
  steps:
    - step: 1
      name: "Paso 1"
      actor: "developer"
```

### Error: "Artifact validation failed"

**Síntomas:**
```
Error: Artifact validation failed
Violations: [{"rule": "required_field", "field": "name"}]
```

**Solución:**
```sol
# Asegurar que todos los campos requeridos estén presentes
@process
name: "Mi Proceso"  # Campo requerido
description: "Descripción"
version: "1.0.0"
created: "2024-01-15"
author: "Tu Nombre"
```

### Error: "Circular dependency detected"

**Síntomas:**
```
Error: Circular dependency detected in artifacts
```

**Solución:**
```sol
# Revisar relaciones entre artefactos
# Evitar referencias circulares
relations:
  - type: "implements"
    target: "process:other-process"  # Asegurar que no sea circular
```

## Problemas de ejecución

### Error: "ExecutionContext not found"

**Síntomas:**
```
Error: ExecutionContext not found
```

**Solución:**
```javascript
// Asegurar que el contexto esté correctamente definido
const { ExecutionContext } = require('@hexy/core');

const context = new ExecutionContext({
  actor: 'developer',
  purpose: 'Ejecutar proceso',
  inputs: {
    // inputs requeridos
  }
});
```

### Error: "Permission denied"

**Síntomas:**
```
Error: Permission denied for action 'create_task'
```

**Solución:**
```javascript
// Verificar permisos del actor
const hasPermission = await engine.checkPermission('developer', 'create_task');

// O configurar permisos en el artefacto
permissions:
  - "create_task"
  - "update_task"
```

### Error: "Validation violation"

**Síntomas:**
```
Error: Validation violation
Rule: task_must_have_title
```

**Solución:**
```javascript
// Verificar inputs del contexto
const context = new ExecutionContext({
  actor: 'developer',
  purpose: 'Crear tarea',
  inputs: {
    title: 'Título de la tarea',  // Campo requerido
    description: 'Descripción'
  }
});
```

## Problemas de plugins

### Error: "Plugin not found"

**Síntomas:**
```
Error: Plugin 'jira-connector' not found
```

**Solución:**
```bash
# Verificar que el plugin esté instalado
ls plugins/

# Instalar plugin si es necesario
npm install @hexy/plugin-jira

# O verificar configuración
plugins:
  enabled: true
  path: './plugins'
  enabledPlugins: ['jira-connector']
```

### Error: "Plugin initialization failed"

**Síntomas:**
```
Error: Plugin initialization failed
```

**Solución:**
```javascript
// Verificar configuración del plugin
const pluginConfig = {
  jira: {
    url: 'https://your-domain.atlassian.net',
    username: 'your-email@domain.com',
    apiToken: 'your-api-token'
  }
};
```

## Problemas de agentes

### Error: "Agent not responding"

**Síntomas:**
```
Error: Agent not responding
```

**Solución:**
```javascript
// Verificar configuración de agentes
agents: {
  reflective: {
    enabled: true,
    checkInterval: 5000
  },
  validation: {
    enabled: true,
    strictMode: true
  }
}
```

### Error: "Agent validation failed"

**Síntomas:**
```
Error: Agent validation failed
```

**Solución:**
```javascript
// Verificar que los agentes tengan permisos
const agentPermissions = await engine.getAgentPermissions('validation-agent');

// O deshabilitar temporalmente
agents: {
  validation: {
    enabled: false
  }
}
```

## Problemas de eventos

### Error: "Event system not initialized"

**Síntomas:**
```
Error: Event system not initialized
```

**Solución:**
```javascript
// Inicializar sistema de eventos
const { EventSystem } = require('@hexy/core');

const eventSystem = new EventSystem({
  enabled: true,
  persistence: true
});

await eventSystem.initialize();
```

### Error: "Event listener not found"

**Síntomas:**
```
Error: Event listener not found for 'task:created'
```

**Solución:**
```javascript
// Registrar listener de eventos
eventSystem.on('task:created', async (event) => {
  console.log('Tarea creada:', event);
});

// O verificar que el evento se emita correctamente
await eventSystem.emit('task:created', {
  actor: 'developer',
  data: { /* datos del evento */ }
});
```

## Problemas de rendimiento

### Error: "Memory limit exceeded"

**Síntomas:**
```
Error: Memory limit exceeded
```

**Solución:**
```javascript
// Configurar límites de memoria
const engine = new SemanticEngine({
  memoryLimit: '512MB',
  maxConcurrentExecutions: 10
});

// O limpiar cache periódicamente
await engine.clearCache();
```

### Error: "Execution timeout"

**Síntomas:**
```
Error: Execution timeout after 30000ms
```

**Solución:**
```javascript
// Aumentar timeout
const engine = new SemanticEngine({
  timeout: 60000, // 60 segundos
  stepTimeout: 10000 // 10 segundos por paso
});
```

## Herramientas de diagnóstico

### Comando de verificación

```bash
# Verificar instalación completa
npm run verify

# Verificar configuración
npm run verify-config

# Verificar artefactos
npm run verify-artifacts

# Verificar plugins
npm run verify-plugins
```

### Logs de depuración

```bash
# Habilitar logs detallados
export HEXY_LOG_LEVEL=debug

# O en configuración
logging: {
  level: 'debug',
  file: './logs/hexy.log'
}
```

### Comando de diagnóstico

```bash
# Generar reporte de diagnóstico
npm run diagnose

# Verificar conectividad
npm run check-connectivity

# Verificar permisos
npm run check-permissions
```

## Obtener ayuda

### Recursos de ayuda

- **Documentación**: [docs.hexy.dev](https://docs.hexy.dev)
- **GitHub Issues**: [github.com/regd25/hexy/issues](https://github.com/regd25/hexy/issues)
- **Discord**: [discord.gg/hexy](https://discord.gg/hexy)

### Información para reportes

Al reportar un problema, incluye:

1. **Versión de Hexy**: `npm list @hexy/core`
2. **Versión de Node.js**: `node --version`
3. **Sistema operativo**: `uname -a`
4. **Logs completos**: Con nivel debug habilitado
5. **Configuración**: Archivo de configuración (sin datos sensibles)
6. **Artefactos**: Archivos SOL relevantes
7. **Pasos para reproducir**: Secuencia exacta de comandos

### Comando de reporte automático

```bash
# Generar reporte automático
npm run report-issue

# Esto generará un archivo con toda la información necesaria
``` 