# Hexy Core Framework

Core semántico del framework Hexy para modelar y ejecutar operaciones organizacionales complejas.

## 🏗️ Arquitectura

```
hexy-core/
├── src/
│   ├── artifacts/          # Artefactos semánticos
│   │   ├── base.py         # Clase base para artefactos
│   │   ├── foundational.py # Purpose, Context, Authority, Evaluation
│   │   ├── strategic.py    # Vision, Policy, Principle, Guideline, Concept, Indicator
│   │   ├── operational.py  # Process, Procedure, Event, Result, Observation
│   │   └── organizational.py # Actor, Area
│   ├── engine/             # Motores de procesamiento
│   │   ├── semantic_engine.py    # Motor semántico principal
│   │   ├── validation_engine.py  # Validación de coherencia
│   │   └── execution_engine.py   # Ejecución de procesos
│   ├── context/            # Contextos de ejecución
│   │   └── execution_context.py  # Contexto de ejecución
│   ├── events/             # Sistema de eventos
│   │   ├── event_bus.py    # Event Bus
│   │   └── event_types.py  # Tipos de eventos
│   ├── plugins/            # Sistema de plugins
│   │   ├── plugin_manager.py     # Gestión de plugins
│   │   └── base_plugin.py        # Clase base para plugins
│   ├── api/                # APIs
│   │   ├── graphql/        # GraphQL API
│   │   │   ├── schema.py   # Schema GraphQL
│   │   │   └── resolvers.py # Resolvers
│   │   └── rest/           # REST API
│   │       ├── routes.py   # Endpoints REST
│   │       └── middleware.py # Middleware
│   ├── services/           # Servicios externos
│   │   ├── opensearch_service.py # Búsqueda semántica
│   │   ├── embedding_service.py  # Generación de embeddings
│   │   └── graphql_service.py    # Cliente GraphQL
│   ├── utils/              # Utilidades
│   │   ├── semantic_utils.py     # Utilidades semánticas
│   │   └── validation_utils.py   # Utilidades de validación
│   └── handlers/           # Handlers para Serverless
│       ├── artifacts.py    # CRUD de artefactos
│       ├── search.py       # Búsqueda semántica
│       └── validation.py   # Validación de coherencia
├── tests/                  # Tests
│   ├── unit/               # Tests unitarios
│   └── integration/        # Tests de integración
├── docs/                   # Documentación
├── examples/               # Ejemplos de uso
└── serverless.yml          # Configuración Serverless
```

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd hexy-core

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar tests
pytest

# Desplegar (requiere AWS CLI configurado)
serverless deploy
```

## 🎯 Uso Básico

```python
from src.engine.semantic_engine import SemanticEngine
from src.artifacts.foundational import Purpose, Context

# Inicializar el motor semántico
engine = SemanticEngine()

# Crear artefactos
purpose = Purpose("transparency", "Transparencia Radical", "Transformar la cultura organizacional")
context = Context("latam", "Latinoamérica 2024-2028", "Operaciones en Latinoamérica")

# Registrar artefactos
engine.register_artifact(purpose)
engine.register_artifact(context)

# Validar coherencia
coherence_report = engine.validate_coherence()
print(coherence_report)
```

## 🔌 Plugins

Los plugins permiten extender la funcionalidad del core:

```python
from src.plugins.base_plugin import BasePlugin

class CustomPlugin(BasePlugin):
    def get_capabilities(self):
        return ["custom_action"]
    
    def execute(self, action, data):
        if action == "custom_action":
            return self.process_custom_action(data)
    
    def process_custom_action(self, data):
        # Implementar lógica personalizada
        return {"result": "success"}
```

## 📚 Documentación

- [Arquitectura](./docs/architecture.md)
- [API Reference](./docs/api_reference.md)
- [Guía de Plugins](./docs/plugins_guide.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.
