# Semantic Operations Language (SOL)

![SOL Banner](https://img.shields.io/badge/SOL-Semantic%20Operations%20Language-blue)
![Version](https://img.shields.io/badge/version-0.0.3--dev-red)
![License](https://img.shields.io/badge/license-MIT-orange)

## 🎯 Introducción

**Semantic Operations Language (SOL)** es un lenguaje semántico de propósito organizacional diseñado para modelar de manera explícita la intención, las condiciones de operación y los mecanismos de evaluación de sistemas vivos —ya sean humanos, automatizados o híbridos.

A diferencia de lenguajes formales orientados exclusivamente a la ejecución, SOL prioriza la representación del significado operativo y contextual de un sistema, actuando como una capa intermedia entre la estrategia organizacional y la automatización técnica.

### ⚠️ Estado del Proyecto - Development Build

Esta versión **0.0.3-dev** es una **BUILD DE DESARROLLO** e incluye:

**✅ Implementado (Core Infrastructure):**
- ✅ **20 Artefactos SOL** definidos conceptualmente con templates completos
- ✅ **VS Code Extension** estructura base implementada
- ✅ **Semantic Validator** (~600 líneas de código funcional)
- ✅ **Document Formatter** implementación completa
- ✅ **Language Server Protocol** configuración básica
- ✅ **Documentación** extensa de arquitectura y conceptos

**❌ NO Implementado/Validado:**
- ❌ **Testing Infrastructure** (tests fallan, requieren configuración)
- ❌ **End-to-end Functionality** (no probado como extensión real)
- ❌ **Language Server Features** (implementación parcial)
- ❌ **Production Stability** (no optimizado para uso real)

**🎯 Siguiente Milestone (v0.1.0-alpha):**
- ✅ Testing infrastructure funcional
- ✅ Extension instalable y activable
- ✅ Funcionalidades básicas end-to-end validadas
- ✅ Performance básico aceptable

## 🧩 Arquitectura Semántica SOL

SOL se basa en **bloques semánticos composables** y **artefactos especializados** organizados en tres categorías:

### 🧠 Bloques Fundacionales

| Bloque       | Propósito                                    | Template                                |
| ------------ | -------------------------------------------- | ----------------------------------------- |
| **Intent**   | Voluntad o propósito declarado               | [📄 intent-template.sop](docs/templates/intent-template.sop) |
| **Context**  | Ámbito, condiciones o grupo de aplicación   | [📄 context-template.sop](docs/templates/context-template.sop) |
| **Evaluation** | Cómo se mide o valida el cumplimiento     | [📄 evaluation-template.sop](docs/templates/evaluation-template.sop) |
| **Authority** | Fuente, actor o norma que respalda         | [📄 authority-template.sop](docs/templates/authority-template.sop) |

### 🏗️ Artefactos Estratégicos y Narrativos

**Describen significado, gobernanza o condiciones. Son estructurales y no ejecutables.**

| Artefacto     | Propósito                                   | Template                           |
| ------------- | ------------------------------------------- | ---------------------------------- |
| **Vision**    | Declaración estratégica de largo plazo      | [📄 vision-template.sop](docs/templates/vision-template.sop) |
| **Policy**    | Condición obligatoria o prohibitiva         | [📄 policy-template.sop](docs/templates/policy-template.sop) |
| **Concept**   | Define nociones semánticas centrales        | [📄 concept-template.sop](docs/templates/concept-template.sop) |
| **Principle** | Norma guía fundamental                       | [📄 principle-template.sop](docs/templates/principle-template.sop) |
| **Guideline** | Recomendación flexible                       | [📄 guideline-template.sop](docs/templates/guideline-template.sop) |
| **Indicator** | Métrica formalizada de desempeño            | [📄 indicator-template.sop](docs/templates/indicator-template.sop) |

### ⚡ Artefactos Operativos y de Flujo

**Tienen flujo, activación, ejecución o resultado. Incluyen secciones `flow`, `lifecycle` y `events`.**

| Artefacto     | Propósito                                   | Template                           |
| ------------- | ------------------------------------------- | ---------------------------------- |
| **Process**   | Secuencia operacional estructurada          | [📄 process-template.sop](docs/templates/process-template.sop) |
| **Procedure** | Coreografía detallada de actividades        | [📄 procedure-template.sop](docs/templates/procedure-template.sop) |
| **Event**     | Suceso observable que inicia acciones       | [📄 event-template.sop](docs/templates/event-template.sop) |
| **Result**    | Estado final o decisión emergente           | [📄 result-template.sop](docs/templates/result-template.sop) |
| **Observation** | Captura de eventos perceptuales (híbrido) | [📄 observation-template.sop](docs/templates/observation-template.sop) |

### 🏢 Artefactos Organizacionales

**Definen estructura, roles y dominios organizacionales.**

| Artefacto     | Propósito                                   | Template                           |
| ------------- | ------------------------------------------- | ---------------------------------- |
| **Actor**     | Sujetos que ejecutan acciones               | [📄 actor-template.sop](docs/templates/actor-template.sop) |
| **Area**      | Dominios organizacionales y agrupaciones    | [📄 area-template.sop](docs/templates/area-template.sop) |

## 🚀 Características Principales

- **Composición Semántica**: Todos los artefactos se construyen con bloques fundamentales reutilizables
- **Principio DRY**: Eliminación de duplicación mediante composición explícita
- **Flexibilidad de Formato**: Expresable en YAML, texto plano, JSON-LD, RDF/Turtle
- **Referencias Semánticas**: `Actor:Name` en lugar de strings genéricos
- **Integridad Estructural**: Mantiene coherencia semántica independiente del formato
- **Trazabilidad Estratégica**: Vincula cada artefacto a una visión organizacional
- **Análisis Reflexivo**: Permite evaluación continua del sistema
- **Activación Computacional**: Facilita la automatización de procesos complejos

## 📋 Templates SOL Implementados (20 Artefactos)

### 🧠 Fundacionales (4)
- **[Intent](docs/templates/intent-template.sop)** - Propósito y motivación reutilizable
- **[Context](docs/templates/context-template.sop)** - Contexto operacional reutilizable  
- **[Authority](docs/templates/authority-template.sop)** - Autoridad y legitimidad reutilizable
- **[Evaluation](docs/templates/evaluation-template.sop)** - Criterios de éxito reutilizables

### 🏗️ Estratégicos (6)
- **[Vision](docs/templates/vision-template.sop)** - Delimita el propósito último de un dominio
- **[Policy](docs/templates/policy-template.sop)** - Condiciones estructuradas de comportamiento
- **[Concept](docs/templates/concept-template.sop)** - Define nociones semánticas centrales
- **[Principle](docs/templates/principle-template.sop)** - Normas guía fundamentales
- **[Guideline](docs/templates/guideline-template.sop)** - Recomendaciones flexibles
- **[Indicator](docs/templates/indicator-template.sop)** - Métrica formalizada de desempeño

### ⚡ Operativos (5)
- **[Process](docs/templates/process-template.sop)** - Secuencia operacional estructurada
- **[Procedure](docs/templates/procedure-template.sop)** - Coreografía detallada de actividades
- **[Event](docs/templates/event-template.sop)** - Transmisión de información entre actores
- **[Observation](docs/templates/observation-template.sop)** - Captura de eventos perceptuales
- **[Result](docs/templates/result-template.sop)** - Estado final o decisión emergente

### 🏢 Organizacionales (2)
- **[Actor](docs/templates/actor-template.sop)** - Sujetos que ejecutan acciones
- **[Area](docs/templates/area-template.sop)** - Dominios organizacionales y agrupaciones

### 📚 Documentación y Guías (3)
- **[SEMANTIC_REFERENCE_RULES.md](docs/templates/SEMANTIC_REFERENCE_RULES.md)** - Reglas semánticas anti-alucinación
- **[USAGE_GUIDE.md](docs/templates/USAGE_GUIDE.md)** - Guía de uso de templates
- **[README.md](docs/templates/README.md)** - Documentación completa de templates

## 🏢 Ejemplos de Implementación

### Contextos Empresariales

SOL ha sido probado en diferentes contextos organizacionales:

#### 🏠 [Empresa Tradicional - Servicio de Limpieza](docs/examples/traditional-business/)
- Gestión de rutas de servicio
- Control de calidad
- Asignación de personal

#### 💻 [Empresa Tech - Plataforma E-Learning](docs/examples/tech-business/)
- Marketplace de cursos
- Sistema de recomendaciones
- Gestión de usuarios y contenido

#### 🏪 [Empresa Mediana - Sector Abarrotes](docs/examples/medium-business/)
- Gestión de clientes y rutas de reparto
- Control de inventario
- Administración de cobranza

## 🚀 Inicio Rápido

### 1. Crear Bloques Fundacionales Primero

```yaml
# Paso 1: Intent reutilizable
Intent:
  id: TransformacionDigital
  statement: Fomentar una cultura de transparencia radical
  mode: declare
  priority: high

# Paso 2: Context reutilizable  
Context:
  id: OrganizacionCompleta
  scope: Toda la organización
  conditions:
    - comunicación abierta habilitada
    - canales de feedback activos

# Paso 3: Authority reutilizable
Authority:
  id: ConsejoDirectivoAuthority
  actor: Actor:ConsejoDirectivo
  basedOn: Manifiesto Ético 2025
  level: strategic
```

### 2. Crear Artefacto Principal con Composición

```yaml
# Paso 4: Vision usando composición (NO duplicación)
Vision:
  id: CulturaTransparencia
  uses:                                     # Composición explícita
    intent: Intent:TransformacionDigital
    context: Context:OrganizacionCompleta
    authority: Authority:ConsejoDirectivoAuthority
  
  aspirationalStatement: >                  # Solo contenido específico de Vision
    "Ser reconocidos como la organización más transparente 
    y éticamente sólida del sector"
```

### 3. Crear Proceso Operativo con Referencias Semánticas

```yaml
Process:
  id: RegistroUsuarioExterno
  uses:
    intent: Intent:AccesoSeguroIntent
    context: Context:UsuariosExternos
    authority: Authority:TecnologiaAuthority
  
  flow:
    steps:
      - step: 1
        actor: Actor:GerenteRRHH → "Enviar invitación"        # Semántica Actor → acción
        inputs: [Actor:Solicitante → "Datos contacto"]
        outputs: [Actor:UsuarioExterno ← "Invitación válida"]
      
      - step: 2
        actor: Actor:SistemaAutenticacion → "Validar identidad"
        dependsOn: [1]
        inputs: [Actor:UsuarioExterno → "Enlace único"]
        outputs: [Actor:AdministradorSistemas ← "Identidad verificada"]
```

## 📚 Documentación Completa

- **[Templates SOL](docs/templates/)**: 20 artefactos con composición semántica
- **[Reglas Semánticas](docs/templates/SEMANTIC_REFERENCE_RULES.md)**: Anti-alucinación para AI/LLM
- **[Guía de Uso](docs/templates/USAGE_GUIDE.md)**: Cómo usar templates correctamente
- **[Ejemplos Prácticos](docs/examples/)**: Implementaciones en contextos reales

## ⚠️ Development Build - Solo para Desarrolladores

### 🚨 IMPORTANTE: Esta es una Development Build

**NO instalar para uso productivo.** Esta versión es solo para:
- Desarrolladores que quieren contribuir al proyecto
- Testing de conceptos y arquitectura SOL
- Validación de funcionalidades en desarrollo

### Instalación para Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/regd25/sol.git
cd sol

# Instalar dependencias
cd extension
npm install
npm run compile

# Abrir en VS Code para desarrollo
code .
# Presionar F5 para lanzar Extension Development Host
```

### ⚠️ Limitaciones Conocidas (v0.0.3-dev)

- **Tests fallan**: TypeScript + Jest configuration issues
- **Language Server**: Implementación parcial, puede no responder
- **Performance**: No optimizado, puede ser lento
- **Stability**: Crashes esperados durante desarrollo
- **Features**: Muchas funcionalidades aún en desarrollo

### Crear tu Primer Archivo SOL

```sol
# SOL - Semantic Operations Language
# Version: v2025.07

Vision:
  - id: MiPrimeraVision
    content: "Transformar mi organización con claridad semántica"
    description: "Vision estratégica inicial"

Actor:
  - id: ResponsableProceso
    type: "Humano"
    capabilities: ["Gestión de Procesos"]

Process:
  - id: MiPrimerProceso
    vision: Vision:MiPrimeraVision
    description: "Proceso de ejemplo"
    steps:
      - Actor:ResponsableProceso → "Analizar situación actual"
      - Actor:ResponsableProceso → "Implementar mejoras"
    endCondition: "Proceso optimizado y documentado"
```

## 🤝 Contribución

SOL es un proyecto en constante evolución. Las contribuciones son bienvenidas siguiendo estos principios:

1. **Coherencia Semántica**: Mantener la integridad narrativa
2. **Trazabilidad**: Vincular artefactos a su visión estratégica
3. **Simplicidad**: Empezar simple y refactorizar cuando sea necesario
4. **Documentación**: Todo cambio debe incluir ejemplos claros

### Roadmap Development → Alpha → Beta

**v0.1.0-alpha (Próximo milestone):**
- [ ] **Fix Testing Infrastructure**: Tests deben pasar completamente
- [ ] **End-to-end Validation**: Extension debe instalar y activar
- [ ] **Basic Language Server**: Funcionalidades core trabajando
- [ ] **Performance Básico**: Tiempos de respuesta aceptables
- [ ] **Stability**: Sin crashes en uso básico

**v0.2.0-alpha (Funcionalidad):**
- [ ] **Advanced Validation**: Validación semántica profunda
- [ ] **Complete Language Server**: Todas las características LSP
- [ ] **User Experience**: Interface pulida y mensajes claros

**v1.0.0-beta (Producción):**
- [ ] **Export Formats**: JSON-LD, RDF/Turtle support
- [ ] **Integration APIs**: Conectores empresariales
- [ ] **Performance Optimization**: Escalabilidad para documentos grandes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---