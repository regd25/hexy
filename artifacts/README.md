# Semantic Operations Language (Artifacts)

![Artifacts Banner](https://img.shields.io/badge/Artifacts-Semantic%20Operations%20Language-blue)

## 🎯 Propósito

**Semantic Operations Language (Artifacts)** es un lenguaje semántico de propósito organizacional diseñado para modelar de manera explícita la intención, las condiciones de operación y los mecanismos de evaluación de sistemas vivos —ya sean organizaciones, procesos o ecosistemas digitales.

A diferencia de lenguajes formales orientados exclusivamente a la ejecución, este lenguaje prioriza la representación del significado operativo y contextual de un sistema, actuando como una capa intermedia entre la estrategia organizacional y la automatización técnica.

## ✅ Estado Actual

- ✅ **20 Artefactos** definidos conceptualmente con templates completos
- ✅ **Arquitectura semántica** implementada con composición explícita
- ✅ **Sistema de validación** automático para coherencia semántica
- ✅ **Extensiones VSCode** para desarrollo y validación
- ✅ **Documentación completa** con ejemplos prácticos

## 🧩 Arquitectura Semántica

Este lenguaje se basa en **bloques semánticos composables** y **artefactos especializados** organizados en tres categorías:

### 🧱 Bloques Fundacionales (4)
- **Intent** - Propósito y motivación
- **Context** - Contexto operacional  
- **Authority** - Autoridad y legitimidad
- **Evaluation** - Criterios de éxito

### 🏗️ Artefactos Estratégicos (6)
- **Vision** - Declaraciones aspiracionales
- **Policy** - Reglas obligatorias
- **Concept** - Definiciones organizacionales
- **Principle** - Normas guía
- **Guideline** - Recomendaciones flexibles
- **Indicator** - Métricas y KPIs

### ⚡ Artefactos Operativos (5)
- **Process** - Secuencias operacionales
- **Procedure** - Coreografía detallada
- **Event** - Sucesos observables
- **Observation** - Captura de eventos
- **Result** - Estados finales

### 🏢 Artefactos Organizacionales (2)
- **Actor** - Sujetos que ejecutan acciones
- **Area** - Dominios organizacionales

## 📋 Templates Implementados (20 Artefactos)

| Categoría | Cantidad | Artefactos |
|-----------|----------|------------|
| 🧠 **Fundacionales** | 4 | Intent, Context, Authority, Evaluation |
| 🏗️ **Estratégicos** | 6 | Vision, Policy, Concept, Principle, Guideline, Indicator |
| ⚡ **Operativos** | 5 | Process, Procedure, Event, Observation, Result |
| 🏢 **Organizacionales** | 2 | Actor, Area |

### ✅ Características Implementadas

- ✅ **Composición explícita** (elimina duplicación DRY)
- ✅ **Artefactos fundacionales independientes** 
- ✅ **Referencias semánticas** (`Actor:Name`, no strings)
- ✅ **Reglas anti-alucinación** para AI/LLM
- ✅ **Jerarquía organizacional** clara
- ✅ **Flujos semánticos** `Actor → acción`
- ✅ **Validación automática** de estructura

## 🚀 Casos de Uso

Este lenguaje ha sido probado en diferentes contextos organizacionales:

### 🏢 Empresa Tradicional
```yaml
Vision:LiderazgoTecnologico:
  uses:
    intent: Intent:TransformacionDigital
    context: Context:MercadoLatam
    authority: Authority:ConsejoDirectivo
    evaluation: Evaluation:IndicadoresEstrategicos
  
  aspirationalStatement: >
    "Ser el catalizador principal de la transformación digital 
    en América Latina, liderando la adopción de tecnologías 
    emergentes y creando valor sostenible para nuestros 
    stakeholders."
```

### 🚀 Startup Tecnológica
```yaml
Process:OnboardingEmpleados:
  uses:
    intent: Intent:IntegracionEfectiva
    context: Context:CulturaStartup
    authority: Authority:GerenteRRHH
  
  actors:
    primary: [Actor:RecrutadorSenior, Actor:GerenteRRHH]
    support: [Actor:AdministradorSistemas]
    external: [Actor:Candidato]
  
  flow:
    steps:
      - step: 1
        actor: Actor:RecrutadorSenior → "Verificar documentación"
        inputs: [Actor:Candidato → "Datos contacto"]
        outputs: [Actor:GerenteRRHH ← "Datos verificados"]
```

## 📚 Recursos

- **[Templates](docs/templates/)**: 20 artefactos con composición semántica
- **[Ejemplos](../examples/)**: Implementaciones en contextos reales
- **[Documentación](../docs/)**: Guías completas de uso
- **[Extensiones VSCode](../extension/)**: Herramientas de desarrollo

## ⚠️ Development Build - Solo para Desarrolladores

**Versión:** v0.0.3-dev  
**Estado:** Development Build  
**NO instalar para uso productivo.** Esta versión es solo para:

- Testing de conceptos y arquitectura
- Desarrollo de extensiones
- Validación de templates
- Contribuciones técnicas

## 🚀 Instalación para Desarrollo

```bash
git clone https://github.com/regd25/sol.git
cd sol
npm install
```

### Crear tu Primer Archivo de Artefactos

```yaml
# Semantic Operations Language
# Archivo: mi-primer-artefacto.sop

Intent:MiPrimerIntent:
  statement: "Definir el propósito específico de mi primer artefacto"
  mode: declare
  priority: high
  measurability:
    criteria: "Criterios claros de éxito"
    metrics: "Métricas específicas"

Context:MiPrimerContext:
  scope: "Alcance y límites del contexto"
  timeframe: "Marco temporal relevante"
  stakeholders: "Partes interesadas involucradas"
```

## 🤝 Contribuir

Este proyecto está en constante evolución. Las contribuciones son bienvenidas siguiendo estos principios:

- **Simplicidad semántica** - Claridad sobre complejidad
- **Composición explícita** - Reutilización sin duplicación
- **Validación automática** - Coherencia garantizada
- **Documentación viva** - Ejemplos prácticos y claros

---

**Versión:** v0.0.3-dev  
**Build:** Development  
**Estado:** Solo para desarrolladores