# 📋 Artefactos SOL - Definiciones Completas v0.0.3-dev

Esta documentación contiene las **definiciones completas de los 20 artefactos SOL** implementados en la carpeta `/docs/templates/`.

## 🧠 Arquitectura Semántica SOL

SOL está organizado en **bloques fundacionales reutilizables** y **artefactos especializados** que implementan el principio DRY (Don't Repeat Yourself) mediante composición explícita.

### 🧱 Bloques Fundacionales (4 Templates)

Estos son los bloques semánticos reutilizables que eliminan duplicación:

#### **Intent** - Propósito y Motivación
- **Template:** [📄 intent-template.sop](../templates/intent-template.sop)
- **Propósito:** Define el propósito específico y la motivación detrás de cualquier artefacto organizacional
- **Características:**
  - Declaración clara e intención medible
  - Modos: `declare`, `require`, `propose`, `prohibit`
  - Criterios de éxito y resultados esperados
  - Contexto organizacional y nivel de prioridad
- **Campos Clave:**
  - `statement`: Declaración clara de la intención
  - `mode`: Modo de operación del intent
  - `priority`: Nivel de importancia empresarial
  - `measurability`: Criterios de éxito y métricas
- **Reutilizado Por:** Vision, Policy, Process, Principle, Guideline, Concept
- **Ejemplo:** `Intent:TransformacionDigitalIntent`

#### **Context** - Contexto Operacional
- **Template:** [📄 context-template.sop](../templates/context-template.sop)
- **Propósito:** Define el contexto operacional donde se aplica un artefacto, incluyendo límites, stakeholders y condiciones
- **Características:**
  - Definición clara de alcance y límites
  - Identificación de stakeholders primarios y secundarios
  - Condiciones ambientales y restricciones
  - Factores temporales y geográficos
- **Campos Clave:**
  - `scope`: Definición de límites y alcance
  - `timeframe`: Marco temporal de relevancia
  - `stakeholders`: Partes interesadas involucradas
  - `conditions`: Prerequisites, assumptions y constraints
- **Reutilizado Por:** Vision, Policy, Process, Procedure, Area
- **Ejemplo:** `Context:MercadoLatamContext`

#### **Authority** - Autoridad y Legitimidad
- **Template:** [📄 authority-template.sop](../templates/authority-template.sop)
- **Propósito:** Define quién tiene autoridad sobre decisiones específicas y bajo qué marco legal o organizacional
- **Características:**
  - Niveles: `strategic`, `tactical`, `operational`
  - Marco de legitimidad y base legal
  - Límites de decisión y delegación
  - Estructura de rendición de cuentas
- **Campos Clave:**
  - `actor`: Quién tiene la autoridad
  - `scope`: Qué decisiones cubre esta autoridad
  - `legitimacy`: Base legal o organizacional
  - `decisionBoundaries`: Límites de autoridad para toma de decisiones
- **Reutilizado Por:** Vision, Policy, Process, Actor, Area
- **Ejemplo:** `Authority:ConsejoDirectivoAuthority`

#### **Evaluation** - Criterios de Éxito
- **Template:** [📄 evaluation-template.sop](../templates/evaluation-template.sop)
- **Propósito:** Define cómo se evalúa el éxito y el cumplimiento de objetivos con criterios específicos y medibles
- **Características:**
  - Criterios cuantitativos y cualitativos
  - Umbrales de rendimiento (excellent, good, acceptable, poor)
  - Proceso de evaluación estructurado
  - Mejora continua basada en resultados
- **Campos Clave:**
  - `expected`: Resultado esperado o estado final
  - `method`: Método de evaluación
  - `criteria`: Criterios específicos con métricas
  - `thresholds`: Niveles de rendimiento definidos
- **Reutilizado Por:** Vision, Policy, Indicator, Process, Actor
- **Ejemplo:** `Evaluation:IndicadoresEstrategicosEvaluation`

---

### 🏗️ Artefactos Estratégicos y Normativos (6 Templates)

**Definen significado, gobernanza y condiciones estructurales.**

#### **Vision** - Declaraciones Estratégicas
- **Template:** [📄 vision-template.sop](../templates/vision-template.sop)
- **Composición:** Intent + Context + Authority + Evaluation
- **Propósito:** Define declaraciones aspiracionales de largo plazo que guían la dirección estratégica organizacional
- **Características:**
  - Declaración aspiracional inspiradora
  - Pilares estratégicos que apoyan la visión
  - Impacto empresarial medible
  - Alineación con objetivos organizacionales
- **Campos Específicos:**
  - `aspirationalStatement`: Declaración inspiradora de la visión
  - `businessImpact`: Impactos estratégicos esperados
  - `strategicPillars`: Pilares clave que soportan la visión
  - `stakeholderValue`: Valor creado para cada stakeholder
- **Ejemplo:** `Vision:LiderazgoTecnologicoVision`

#### **Policy** - Reglas Obligatorias
- **Template:** [📄 policy-template.sop](../templates/policy-template.sop)
- **Composición:** Intent + Context + Authority + Evaluation
- **Propósito:** Define reglas obligatorias, prohibiciones y requisitos de cumplimiento organizacional
- **Características:**
  - Modos: `require` (obligatorio) o `prohibit` (prohibido)
  - Reglas específicas con rationale
  - Monitoreo y reporte de cumplimiento
  - Proceso de excepciones estructurado
- **Campos Específicos:**
  - `rules`: Reglas específicas (mandatory, prohibited, conditional)
  - `compliance`: Requisitos de cumplimiento y monitoreo
  - Criterios de evaluación de cumplimiento
- **Ejemplo:** `Policy:SeguridadDatosPolicy`

#### **Concept** - Definiciones Organizacionales
- **Template:** [📄 concept-template.sop](../templates/concept-template.sop)
- **Composición:** Intent + Context + Authority
- **Propósito:** Define conceptos empresariales fundamentales con significado claro y no ambiguo
- **Características:**
  - Definiciones claras y precisas
  - Atributos core y opcionales
  - Clasificaciones y tipos
  - Relaciones con otros conceptos de negocio
- **Campos Específicos:**
  - `definition`: Definición principal clara y precisa
  - `attributes`: Propiedades esenciales y opcionales
  - `types`: Subtipos y clasificaciones
  - `businessRelationships`: Relaciones con otros conceptos
- **Ejemplo:** `Concept:Cliente`, `Concept:Proyecto`

#### **Principle** - Normas Guía
- **Template:** [📄 principle-template.sop](../templates/principle-template.sop)
- **Composición:** Intent + Authority
- **Propósito:** Define principios fundamentales que guían decisiones y comportamientos organizacionales
- **Características:**
  - Normas guía sin evaluación cuantitativa
  - Aplicabilidad amplia organizacional
  - Casos de uso y excepciones
  - Impacto en decisiones estratégicas
- **Campos Específicos:**
  - Principios fundamentales de comportamiento
  - Casos de aplicación y excepciones
  - Impacto en decisiones organizacionales
- **Ejemplo:** `Principle:TransparenciaOrganizacional`

#### **Guideline** - Recomendaciones Flexibles
- **Template:** [📄 guideline-template.sop](../templates/guideline-template.sop)
- **Composición:** Intent + Authority
- **Propósito:** Proporciona recomendaciones y mejores prácticas flexibles para situaciones específicas
- **Características:**
  - Recomendaciones no obligatorias
  - Mejores prácticas documentadas
  - Flexibilidad en implementación
  - Casos de uso específicos
- **Campos Específicos:**
  - Recomendaciones y mejores prácticas
  - Casos de aplicación y contextos
  - Flexibilidad en implementación
- **Ejemplo:** `Guideline:DesarrolloSoftwareGuideline`

#### **Indicator** - Métricas y KPIs
- **Template:** [📄 indicator-template.sop](../templates/indicator-template.sop)
- **Composición:** Intent + Context + Authority + Evaluation
- **Propósito:** Define métricas específicas para medir el desempeño y progreso organizacional
- **Características:**
  - Definición precisa de cálculo
  - Fuentes de datos y calidad requerida
  - Umbrales y targets específicos
  - Reportes y alertas automatizadas
- **Campos Específicos:**
  - `measurement`: Definición y fórmula de cálculo
  - `targets`: Valores objetivo y umbrales de rendimiento
  - `dataSource`: Fuentes de datos y requisitos de calidad
  - `reporting`: Dashboards, alertas y reportes
- **Ejemplo:** `Indicator:ParticipacionMercadoLatam`

---

### ⚡ Artefactos Operativos (5 Templates)

**Incluyen flujo, activación, ejecución y manejo de eventos.**

#### **Process** - Secuencias Operacionales
- **Template:** [📄 process-template.sop](../templates/process-template.sop)
- **Composición:** Intent + Context + Authority + Flow Semántico
- **Propósito:** Define secuencias operacionales estructuradas con flujos Actor → acción
- **Características:**
  - Flujo semántico con notación `Actor → acción`
  - Participantes claramente definidos
  - Inputs/outputs entre actores
  - Gestión de excepciones y escalación
- **Campos Específicos:**
  - `actors`: Participantes primarios, de apoyo y externos
  - `flow`: Pasos secuenciales con semántica Actor → acción
  - `governance`: Propietario del proceso y ciclo de revisión
  - `qualityControls`: Medidas de control de calidad
- **Ejemplo:** `Process:OnboardingEmpleadosProcess`

#### **Procedure** - Coreografía Detallada
- **Template:** [📄 procedure-template.sop](../templates/procedure-template.sop)
- **Composición:** Intent + Context + Authority + Pasos Detallados
- **Propósito:** Define coreografía detallada paso a paso para actividades específicas
- **Características:**
  - Instrucciones paso a paso muy detalladas
  - Roles y responsabilidades específicas
  - Recursos y herramientas requeridas
  - Controles de calidad y cumplimiento
- **Campos Específicos:**
  - `steps`: Pasos detallados de preparación, ejecución y finalización
  - `roles`: Responsabilidades específicas por actor
  - `resources`: Sistemas, herramientas y documentación necesaria
  - `exceptions`: Manejo de excepciones y escalación
- **Ejemplo:** `Procedure:RecuperacionContraseñaProcedure`

#### **Event** - Sucesos Observables
- **Template:** [📄 event-template.sop](../templates/event-template.sop)
- **Composición:** Intent + Context + Authority + Triggers + Subscribers
- **Propósito:** Define sucesos observables que pueden iniciar acciones o procesos en la organización
- **Características:**
  - Triggers que activan el evento
  - Subscribers que responden al evento
  - Datos transportados con el evento
  - Comunicación cross-área estructurada
- **Campos Específicos:**
  - Definición del evento y condiciones de activación
  - Publishers y subscribers del evento
  - Estructura de datos del evento
  - Patrones de comunicación cross-área
- **Ejemplo:** `Event:SolicitudSoporteTecnico`

#### **Observation** - Captura de Eventos Perceptuales
- **Template:** [📄 observation-template.sop](../templates/observation-template.sop)
- **Composición:** Intent + Context + Authority + Events + Data Capture
- **Propósito:** Define puntos de observación para capturar eventos y datos del comportamiento organizacional
- **Características:**
  - Captura de eventos perceptuales
  - Puntos de observación estratégicos
  - Análisis de patrones y tendencias
  - Inputs para toma de decisiones
- **Campos Específicos:**
  - Puntos de observación y métricas capturadas
  - Eventos observados y patrones detectados
  - Análisis y insights generados
- **Ejemplo:** `Observation:ComportamientoClienteObservation`

#### **Result** - Estados Finales y Decisiones
- **Template:** [📄 result-template.sop](../templates/result-template.sop)
- **Composición:** Intent + Context + Authority + Lifecycle + Outcomes
- **Propósito:** Define estados finales, productos o decisiones que emergen de procesos organizacionales
- **Características:**
  - Lifecycle claro del resultado
  - Outcomes específicos y medibles
  - Criterios de aceptación
  - Trazabilidad hacia procesos origen
- **Campos Específicos:**
  - Definición del resultado y outcomes esperados
  - Lifecycle y estados de maduración
  - Criterios de aceptación y validación
  - Relación con procesos generadores
- **Ejemplo:** `Result:EmpleadoActivoSistemaResult`

---

### 🏢 Artefactos Organizacionales (2 Templates)

**Definen estructura, roles y dominios organizacionales.**

#### **Actor** - Sujetos que Ejecutan Acciones
- **Template:** [📄 actor-template.sop](../templates/actor-template.sop)
- **Composición:** Intent + Context + Authority + Responsibilities + Capabilities
- **Propósito:** Define roles, responsabilidades y capacidades de individuos, grupos o sistemas que ejecutan acciones
- **Características:**
  - Tipos: `internal`, `external`, `system`
  - Categorías: `individual`, `group`, `organization`, `system`
  - Responsabilidades primarias y secundarias
  - Capacidades requeridas y preferidas
- **Campos Específicos:**
  - `definition`: Definición del actor y su contexto
  - `responsibilities`: Responsabilidades primarias y secundarias
  - `capabilities`: Capacidades requeridas, preferidas y en desarrollo
  - `interactions`: Interacciones internas, externas y cross-área
  - `decisionAuthority`: Autoridad de decisión y aprobación
- **Ejemplo:** `Actor:GerenteRRHH`, `Actor:SoftwareArchitect`

#### **Area** - Dominios Organizacionales
- **Template:** [📄 area-template.sop](../templates/area-template.sop)
- **Composición:** Intent + Context + Authority + Hierarchy + Cross-area Communications
- **Propósito:** Define dominios organizacionales, estructura jerárquica y comunicaciones entre áreas
- **Características:**
  - Estructura de liderazgo y equipos
  - Responsabilidades core, estratégicas y operativas
  - Capacidades técnicas y empresariales
  - Comunicación cross-área vía eventos
- **Campos Específicos:**
  - `structure`: Liderazgo, equipos y estructura de reporte
  - `responsibilities`: Responsabilidades core, estratégicas y operativas
  - `capabilities`: Capacidades técnicas y empresariales
  - `interactions`: Interacciones internas y externas
  - `communication`: Eventos cross-área entrantes y salientes
- **Ejemplo:** `Area:Tecnologia`, `Area:RecursosHumanos`

---

### 📚 Documentación y Guías (3 Archivos)

| Documento | Propósito | Contenido |
|-----------|-----------|-----------|
| [📄 SEMANTIC_REFERENCE_RULES.md](../templates/SEMANTIC_REFERENCE_RULES.md) | Reglas anti-alucinación para AI/LLM | Notación correcta, composición vs duplicación |
| [📄 USAGE_GUIDE.md](../templates/USAGE_GUIDE.md) | Guía de uso de templates | Cómo usar templates, mejores prácticas |
| [📄 README.md](../templates/README.md) | Documentación completa | Overview arquitectura y templates v0.0.3-dev |

---

## 🚀 Principios de Arquitectura v0.0.3-dev

### 1. **Composición Explícita (No Duplicación)**
```yaml
# ✅ CORRECTO - Composición v0.0.3-dev
Vision:
  uses:                                    # Reutiliza artefactos independientes
    intent: Intent:TransformacionDigital
    context: Context:MercadoLatam
    authority: Authority:ConsejoDirectivo
  
  aspirationalStatement: >                 # Solo contenido específico de Vision
    "Ser el catalizador principal..."

# ❌ INCORRECTO - Duplicación versiones anteriores
Vision:
  intent:                                  # Duplicado en 18+ artefactos
    statement: "..."
    mode: declare
  context:                                 # Duplicado en 18+ artefactos  
    scope: "..."
```

### 2. **Referencias Semánticas (No Strings Genéricos)**
```yaml
# ✅ CORRECTO - Referencias semánticas
actor: Actor:ConsejoDirectivo
area: Area:Tecnologia.Desarrollo  
measuredBy: Indicator:ParticipacionMercado

# ❌ INCORRECTO - Strings genéricos
actor: "[ResponsibleActorId]"
area: "[OrganizationalArea]"
```

### 3. **Flujos Semánticos Actor → Acción**
```yaml
# ✅ CORRECTO - Semántica Actor → Acción
flow:
  steps:
    - step: 1
      actor: Actor:GerenteRRHH → "Crear expediente digital"
      inputs: [Actor:RecrutadorSenior → "Datos verificados"]
      outputs: [Actor:AdministradorSistemas ← "Expediente creado"]

# ❌ INCORRECTO - Sin semántica
steps:
  - step: 1
    description: "Crear expediente"         # No indica quién
    owner: "[ActorId]"                      # String genérico
```

### 4. **Jerarquía Organizacional Respetada**
```yaml
# ✅ Comunicación permitida
Process.Desarrollo.CodeReview → Actor:TechLead         # Mismo contexto
Process.Desarrollo.Arquitectura → Vision.Liderazgo     # Contexto superior
Event.SolicitudSoporte ← Area.Ventas                   # Cross-área VÍA Events

# ❌ Comunicación prohibida
Process.Desarrollo.Deploy → Process.Ventas.FollowUp    # Cross-área directa
Vision.Corporativa → Process.Desarrollo.UnitTests      # Referencias descendentes
```

---

## 📊 Estado de Implementación

### ✅ Templates Completamente Implementados (20)

| Categoría | Cantidad | Templates |
|-----------|----------|-----------|
| 🧠 **Fundacionales** | 4 | Intent, Context, Authority, Evaluation |
| 🏗️ **Estratégicos** | 6 | Vision, Policy, Concept, Principle, Guideline, Indicator |
| ⚡ **Operativos** | 5 | Process, Procedure, Event, Observation, Result |
| 🏢 **Organizacionales** | 2 | Actor, Area |
| 📚 **Documentación** | 3 | Reglas semánticas, Guía de uso, README |

### 🔄 Características v0.0.3-dev Implementadas

- ✅ **Composición explícita** (elimina duplicación DRY)
- ✅ **Artefactos fundacionales independientes** 
- ✅ **Referencias semánticas** (`Actor:Name`, no strings)
- ✅ **Reglas anti-alucinación** para AI/LLM
- ✅ **Jerarquía organizacional** clara
- ✅ **Flujos semánticos** `Actor → acción`
- ✅ **Validación automática** de estructura

---

## 🚀 Cómo Usar los Templates

### 1. **Crear Artefactos Fundacionales Primero**
```bash
# Orden obligatorio - crear fundacionales primero
1. Intent:MiPropositoEstrategico
2. Context:MiContextoOperacional  
3. Authority:MiAutoridadRelevante
4. Evaluation:MiCriteriosExito
```

### 2. **Crear Artefacto Principal con Composición**
```yaml
Vision:MiVisionEstrategica:
  uses:                                    # Composición explícita
    intent: Intent:MiPropositoEstrategico    # Debe existir
    context: Context:MiContextoOperacional   # Debe existir
    authority: Authority:MiAutoridadRelevante # Debe existir
    evaluation: Evaluation:MiCriteriosExito  # Debe existir
```

### 3. **Validar Referencias Semánticas**
```bash
# Verificar que todas las referencias existen
✅ Actor:ConsejoDirectivo        # Debe existir como artefacto
✅ Area:Tecnologia.Desarrollo    # Jerarquía debe ser válida
✅ Process:Onboarding.Setup      # Referencia debe ser exacta
```

---

## ✅ Checklist de Validación

### **Antes de Crear Cualquier Artefacto:**
- [ ] **Artefactos fundacionales existen** (Intent, Context, Authority, Evaluation)
- [ ] **Referencias usan notación correcta** (`Actor:Name`, no strings)
- [ ] **Jerarquía organizacional respetada** (no cross-área directas)
- [ ] **Principio DRY cumplido** (sin duplicar bloques fundacionales)
- [ ] **Flujos usan semántica** (`Actor → acción`)

### **Validaciones Automáticas Disponibles:**
```bash
# Estas validaciones están implementadas en la extensión VSCode
sol validate --semantic-references    # Referencias existen
sol validate --dry-compliance        # Sin duplicación  
sol validate --hierarchy-rules       # Jerarquía respetada
sol validate --flow-semantics       # Flujos semánticos
```

---

## 🔗 Referencias Útiles

- **[Templates SOL v0.0.3-dev](../templates/)**: Directorio completo de templates
- **[VS Code Extension](../../extension/)**: Herramientas de validación y formato
- **[Ejemplos Prácticos](../examples/)**: Implementaciones en contextos reales
- **[Schema JSON](../../extension/schemas/sol-schema.json)**: Validación estructural

---

**Versión Template:** v2025.07  
**Build del Proyecto:** v0.0.3-dev  
**Última actualización:** Enero 2025  
**Estado:** Development Build - Solo para desarrolladores 