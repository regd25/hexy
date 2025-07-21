# Configuración Inicial

Esta guía te ayudará a configurar Hexy Framework para tu primer uso.

## Configuración básica

### 1. Crear archivo de configuración

Crea un archivo `hexy.config.js` en la raíz de tu proyecto:

```javascript
module.exports = {
  // Configuración del motor semántico
  semanticEngine: {
    mode: 'orchestrator', // 'orchestrator' | 'reactive'
    validationLevel: 'strict', // 'strict' | 'warn' | 'none'
    tracing: true
  },

  // Configuración de plugins
  plugins: {
    enabled: true,
    autoLoad: true,
    path: './plugins'
  },

  // Configuración de agentes
  agents: {
    reflective: true,
    validation: true,
    improvement: true
  },

  // Configuración de eventos
  events: {
    enabled: true,
    persistence: true,
    maxHistory: 1000
  },

  // Configuración de artefactos
  artifacts: {
    repository: './artifacts',
    validation: true,
    versioning: true
  }
};
```

### 2. Configuración con Python

Crea un archivo `hexy.config.py`:

```python
config = {
    'semantic_engine': {
        'mode': 'orchestrator',
        'validation_level': 'strict',
        'tracing': True
    },
    'plugins': {
        'enabled': True,
        'auto_load': True,
        'path': './plugins'
    },
    'agents': {
        'reflective': True,
        'validation': True,
        'improvement': True
    },
    'events': {
        'enabled': True,
        'persistence': True,
        'max_history': 1000
    },
    'artifacts': {
        'repository': './artifacts',
        'validation': True,
        'versioning': True
    }
}
```

## Estructura de directorios

### Crear estructura básica

```bash
mkdir -p artifacts plugins logs config
```

### Estructura recomendada

```
tu-proyecto/
├── hexy.config.js
├── artifacts/
│   ├── strategic/
│   ├── organizational/
│   ├── operational/
│   └── foundational/
├── plugins/
│   ├── executors/
│   ├── validators/
│   └── connectors/
├── logs/
│   ├── events/
│   ├── violations/
│   └── traces/
└── config/
    ├── environments/
    └── templates/
```

## Configuración de entorno

### Variables de entorno

Crea un archivo `.env`:

```bash
# Configuración del motor
HEXY_MODE=orchestrator
HEXY_VALIDATION_LEVEL=strict
HEXY_TRACING=true

# Configuración de plugins
HEXY_PLUGINS_ENABLED=true
HEXY_PLUGINS_PATH=./plugins

# Configuración de agentes
HEXY_AGENTS_REFLECTIVE=true
HEXY_AGENTS_VALIDATION=true

# Configuración de eventos
HEXY_EVENTS_ENABLED=true
HEXY_EVENTS_PERSISTENCE=true

# Configuración de artefactos
HEXY_ARTIFACTS_REPOSITORY=./artifacts
HEXY_ARTIFACTS_VALIDATION=true
```

## Configuración de desarrollo

### TypeScript (Node.js)

```typescript
import { HexyConfig } from '@hexy/core';

const config: HexyConfig = {
  semanticEngine: {
    mode: 'orchestrator',
    validationLevel: 'strict',
    tracing: true
  },
  // ... resto de configuración
};

export default config;
```

### Python con tipos

```python
from typing import Dict, Any
from hexy.config import HexyConfig

config: HexyConfig = {
    'semantic_engine': {
        'mode': 'orchestrator',
        'validation_level': 'strict',
        'tracing': True
    },
    # ... resto de configuración
}
```

## Configuración de plugins

### Habilitar plugins específicos

```javascript
// hexy.config.js
module.exports = {
  plugins: {
    enabled: true,
    autoLoad: true,
    path: './plugins',
    enabledPlugins: [
      'jira-connector',
      'n8n-workflow',
      'aws-step-functions'
    ]
  }
};
```

## Configuración de agentes

### Configurar agentes reflexivos

```javascript
// hexy.config.js
module.exports = {
  agents: {
    reflective: {
      enabled: true,
      checkInterval: 5000, // ms
      maxSuggestions: 10
    },
    validation: {
      enabled: true,
      strictMode: true
    },
    improvement: {
      enabled: true,
      learningEnabled: true
    }
  }
};
```

## Verificación de configuración

### Comando de verificación

```bash
# Node.js
npm run verify-config

# Python
python -m hexy.verify_config
```

### Verificar componentes

- ✅ Configuración del motor semántico
- ✅ Sistema de plugins
- ✅ Agentes reflexivos
- ✅ Sistema de eventos
- ✅ Repositorio de artefactos

## Próximos pasos

Una vez completada la configuración, continúa con:
- [Tu primer artefacto](./first-artifact.md)
- [Ejecución básica](./basic-execution.md) 