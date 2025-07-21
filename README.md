# 🧠 Hexy Framework

**Hexy** es un framework de contexto organizacional, diseñado para alinear el proposito, reglas y procesos de negocio con su ejecución técnica. Permite construir sistemas AI-first, modulares, escalables, con trazabilidad total y validación contextual.

---

## 🎯 Propósito

Hexy transforma la manera en que las organizaciones definen y ejecutan sus operaciones. Lo hace mediante una capa de validacion y orquestacion semántica basada su filosofia de diseño organizacional basada en "artefactos", que permite describir intenciones, condiciones, actores y flujos de trabajo de forma estructurada y auditable.

---

## 🚀 Características principales

- ⚙️ **Motor semántico**
  Interpreta artefactos y decide qué debe ejecutarse, validarse o rechazarse con base en reglas organizacionales.

- 📦 **Execution Context**
  Contrato semántico vivo que transporta actor, propósito, inputs, eventos, resultados, observaciones y violaciones.

- 🧠 **Agentes reflexivos**
  Detectan incoherencias, sugieren mejoras y versionan artefactos semánticos.

- 🧩 **Sistema de plugins**
  Ejecutores o validadores semánticos que se conectan a servicios externos, LLMs, APIs u otros protocolos.

- 📚 **Documentación viva**
  Generada automáticamente a partir de la ejecución y definición de artefactos SOL.

- 🌐 **Integración extensible**
  Compatible con Jira, n8n, AWS Step Functions, GraphQL, REST APIs, modelos generativos y protocolos como MCP.

---

## 🧬 Arquitectura

Hexy sigue principios de arquitectura hexagonal, DDD (Domain-Driven Design), y event-driven design. Funciona en dos modos operativos:

1. **Modo Orquestador** – Hexy ejecuta paso a paso un proceso definido, evaluando condiciones entre nodos.
2. **Modo Reactivo** – Hexy escucha eventos del sistema y valida si cada acción es coherente, permitida o necesita intervención.

---

## 📁 Estructura del repositorio

```

hexy-framework/
├── core/ # Motor semántico y ejecución de contexto
├── plugins/ # Adaptadores y conectores
├── agents/ # Agentes reflexivos y validadores
├── docs/ # Documentación, filosofia, y guias
├── examples/ # Casos de uso y aplicaciones demo
├── lib/ # Herramientas auxiliares (deploy, testing, CLI, etc.)
└── README.md # Este archivo

```

## 🤖 Requisitos

- Node.js >= 18.x o Python >= 3.10
- AWS SDK (opcional para integración serverless)
- Docker (para pruebas locales de infraestructura)

---


## 📡 Contribuciones

Este proyecto se encuentra en etapa activa de desarrollo. Las contribuciones están abiertas bajo un esquema semántico: cada PR deberá incluir un archivo `.md` que describa el artefacto o ajuste propuesto.

Consulta la [guía de contribución](docs/CONTRIBUTING.md) para más detalles.

---

## 🧭 Visión a futuro

- Interfaz visual para visualizacion edición y despliegue de artefactos
- Soporte completo para Semantic Feedback Loops ("Flywheel Semántico")
- Conexión nativa con marketplaces de modelos (via MCPs)

---

## 🧠 ¿Quién está detrás?

Hexy Framework es desarrollado por [Rednell Labs](https://github.com/regd25), como parte de su iniciativa de evolución organizacional AI-first.

---

## 📄 Licencia

MIT License. Ver [LICENSE](./LICENSE) para más información.
