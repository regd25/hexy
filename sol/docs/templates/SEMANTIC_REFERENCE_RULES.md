# 🧠 REGLAS SEMÁNTICAS Y REFERENCIAS SOL - Anti-Alucinaciones

## 🎯 **PROPÓSITO**

Este documento establece las **reglas semánticas fundamentales** del lenguaje SOL para:

- ✅ **Eliminar alucinaciones** en sistemas AI/LLM
- ✅ **Clarificar referencias** entre artefactos
- ✅ **Definir jerarquía organizacional** y comunicación
- ✅ **Garantizar principio DRY** (Don't Repeat Yourself)
- ✅ **Hacer el lenguaje meta-construible** y reutilizable

---

## 📖 **1. REGLAS DE REFERENCIACIÓN SEMÁNTICA**

### **1.1 Notación de Referencias Directas**

**❌ INCORRECTO - Strings genéricos:**

```yaml
authority:
  actor: "[ResponsibleActorId]"
  basedOn: "[FoundationalDocumentId]"
```

**✅ CORRECTO - Referencias semánticas:**

```yaml
uses:
  authority: Authority:ConsejoDirectivo
```

### **1.2 Jerarquía con Notación de Punto (.)**

**❌ INCORRECTO - Anidamiento confuso:**

```yaml
Area:Marketing.Ventas  # ❌ Confuso
Process:Area:Marketing.GeneracionLeads  # ❌ Mezcla tipos
```

**✅ CORRECTO - Notación jerárquica clara:**

```yaml
Area:Marketing.Ventas  # ✅ Jerarquía clara
Process:Marketing.GeneracionLeads  # ✅ Proceso en contexto Marketing
```

### **1.3 Referencias Entre Contextos Organizacionales**

**✅ REGLA FUNDAMENTAL:** Solo puedes referenciar:

1. **Mismo contexto** (mismo departamento/área)
2. **Contexto superior** (nivel organizacional superior)
3. **Comunicación externa** requiere **Events**

**✅ CORRECTO - Referencias permitidas:**

```yaml
# Mismo contexto (Tecnología → Tecnología)
Process:Desarrollo.CodeReview → Actor:TechLead

# Contexto superior (Tecnología → Empresa)
Process:Desarrollo.Arquitectura → Vision:LiderazgoTecnologico

# Contexto hermano VÍA Events (Tecnología ↔ Ventas)
Event:SolicitudSoporteTecnico ← Ventas
Event:SolucionSoporteEntregada → Ventas
```

**❌ INCORRECTO - Referencias prohibidas:**

```yaml
# ❌ Cross-área directa sin Event
Process:Desarrollo.Deploy → Process:Ventas.FollowUpCliente

# ❌ Referencias hacia abajo sin delegación
Vision:Corporativa → Process:Desarrollo.UnitTests
```

---

## 🏢 **2. JERARQUÍA ORGANIZACIONAL Y COMUNICACIÓN**

### **2.1 Estructura Jerárquica**

```
Organización (Nivel 0)
├── Estratégico (Nivel 1)
│   ├── Vision:LiderazgoTecnologico
│   └── Principle:InnovacionSustentable
├── Táctico (Nivel 2)
│   ├── Area:Tecnologia
│   │   ├── Process:Desarrollo.CodeReview
│   │   └── Actor:TechLead
│   └── Area:Ventas
│       ├── Process:Ventas.FollowUp
│       └── Actor:VentasManager
└── Operacional (Nivel 3)
    ├── ProcedimientoEspecifico
    └── TareasDiarias
```

### **2.2 Reglas de Comunicación**

#### **🔄 Comunicación Interna (Mismo Contexto)**

```yaml
# ✅ PERMITIDO - Mismo departamento
Actor:TechLead → Process:Desarrollo.CodeReview
Process:Desarrollo.Deploy → Actor:DevOpsEngineer
```

#### **⬆️ Comunicación Ascendente (Hacia Superior)**

```yaml
# ✅ PERMITIDO - Hacia nivel superior
Process:Desarrollo.Arquitectura → Vision:LiderazgoTecnologico
Actor:TechLead → Authority:DirectorTecnologia
```

#### **↔️ Comunicación Entre Contextos (Solo vía Events)**

```yaml
# ✅ CORRECTO - Usando Events para comunicación cross-área
Area:Tecnologia → Event:SolicitudRecursosIT
Event:RecursosAprobados → Area:Tecnologia

Area:Ventas → Event:SolicitudSoporteTecnico
Event:SoporteTecnicoEntregado → Area:Ventas
```

#### **❌ Comunicación Prohibida**

```yaml
# ❌ Cross-área directa
Process:Desarrollo.Deploy → Process:Ventas.ClienteFollowUp

# ❌ Referencias descendentes directas
Vision:Corporativa → Process:Desarrollo.UnitTesting

# ❌ Salto de niveles sin delegación
Actor:Developer → Authority:ConsejoDirectivo
```

---

## 🔧 **3. COMPOSICIÓN vs HERENCIA**

### **3.1 Principio DRY con Composición Explícita**

**❌ MAL - Duplicación masiva:**

```yaml
Vision:
  intent:
    statement: "..." # Duplicado en 18+ artefactos
    mode: declare
  context:
    scope: "..." # Duplicado en 18+ artefactos
  authority:
    actor: "..." # Duplicado en 18+ artefactos
```

**✅ BIEN - Composición explícita:**

```yaml
Vision:
  uses: # Composición explícita
    intent: Intent:TransformacionDigital # Reutilizable
    context: Context:MercadoLatam # Reutilizable
    authority: Authority:ConsejoDirectivo # Reutilizable

  aspirationalStatement: > # Solo contenido específico de Vision
    "Ser el catalizador principal..."
```

### **3.2 Artefactos Fundacionales Independientes**

**✅ Artefactos fundacionales reutilizables:**

```yaml
Intent:TransformacionDigital: # Independiente y reutilizable
  statement: "Liderar transformación digital sustentable..."
  mode: declare
  priority: critical

Context:MercadoLatam: # Independiente y reutilizable
  scope: "Mercado latinoamericano tecnología..."
  timeframe: "5-10 años estratégicos"
  stakeholders: [...]

Authority:ConsejoDirectivo: # Independiente y reutilizable
  level: strategic
  actor: Actor:ConsejoDirectivo
  scope: "Decisiones estratégicas corporativas..."
```

---

## 🌊 **4. SEMÁNTICA DE FLUJOS (PROCESOS)**

### **4.1 Notación Actor → Acción**

**❌ INCORRECTO - Sin semántica:**

```yaml
flow:
  steps:
    - step: 1
      actor: Actor:GerenteRRHH # ❌ Actor específico
      action: "Crear expediente digital empleado" # ❌ Acción clara
      inputs: # ❌ Declaracion de inputs sin notacion semantica
        - input: "Datos personales verificados"
          providedBy: Actor:RecrutadorSenior
      outputs: # ❌ Declaracion de outputs sin notacion semantica
        - output: "Expediente digital creado"
          consumedBy: Actor:AdministradorSistemas
```

**✅ CORRECTO - Semántica Actor → Acción:**

```yaml
flow:
  startCondition: "Nueva contratación aprobada"

  steps:
    - step: 1
      actor: Actor:GerenteRRHH → "Crear expediente digital"
      inputs: [Actor:RecrutadorSenior → "Datos verificados"]
      outputs: [Actor:AdministradorSistemas ← "Expediente creado"]

    - step: 2
      actor: Actor:AdministradorSistemas → "Configurar accesos sistemas"
      inputs: [Actor:SupervisorDirecto → "Lista sistemas requeridos"]
      outputs: [Actor:NuevoEmpleado ← "Credenciales acceso"]

  endCondition: "Empleado activo en sistemas"
```

---

## 📚 **5. CATÁLOGO DE TIPOS DE REFERENCIA**

### **5.1 Referencias Directas (Mismo Tipo)**

```yaml
Vision:LiderazgoTecnologico → Vision:InnovacionSustentable  # Vision a Vision
Process:Onboarding → Process:CapacitacionInicial           # Process a Process
Actor:TechLead → Actor:SeniorDeveloper                     # Actor a Actor
```

### **5.2 Referencias de Composición**

```yaml
Vision:LiderazgoTecnologico:
  uses:
    intent: Intent:TransformacionDigital # Vision usa Intent
    authority: Authority:ConsejoDirectivo # Vision usa Authority
    evaluation: Evaluation:IndicadoresKPI # Vision usa Evaluation
```

### **5.3 Referencias de Implementación**

```yaml
Process:Desarrollo:
  implementsPolicy: Policy:CalidadSoftware # Process implementa Policy
  supportsVision: Vision:ExcelenciaTecnica # Process soporta Vision
  generateEvents: Event:CodeDeployed # Process genera Event
```

### **5.4 Referencias de Medición**

```yaml
Vision:LiderazgoTecnologico:
  measuredBy:
    - Indicator:ParticipacionMercado # Vision medida por Indicator
    - Indicator:IndiceInnovacion # Vision medida por Indicator
```

---

## 🚨 **6. VALIDACIONES SEMÁNTICAS**

### **6.1 Validaciones Automáticas Requeridas**

**✅ VALIDACIONES OBLIGATORIAS:**

1. **Referencias existen:** Todo `Actor:X`, `Area:Y`, `Process:Z` debe existir
2. **Jerarquía respetada:** Solo referencias permitidas según nivel organizacional
3. **Notación correcta:** Usar `:` para jerarquía, no `.`
4. **Composición DRY:** No duplicar bloques fundacionales
5. **Flujos semánticos:** Cada step debe tener `Actor → acción`

### **6.2 Herramientas de Validación**

```bash
# Validación semántica
sol validate --semantic-references
sol validate --dry-compliance
sol validate --hierarchy-rules
sol validate --flow-semantics
```

---

## 🎯 **7. PATRONES ANTI-ALUCINACIÓN**

### **7.1 Para Sistemas AI/LLM**

**✅ PATRONES SEGUROS para AI:**

```yaml
# ✅ Referencias explícitas y verificables
actor: Actor:ConsejoDirectivo # AI puede verificar existencia
area: Area:Tecnologia.Desarrollo # AI entiende jerarquía
measuredBy: Indicator:ParticipacionMercado # AI puede trazar relación

# ✅ Estructura predecible
uses: # AI sabe que aquí van referencias
  intent: Intent:X # AI sabe el tipo esperado
  context: Context:Y # AI sabe el tipo esperado
  authority: Authority:Z # AI sabe el tipo esperado
```

**❌ PATRONES PELIGROSOS para AI:**

```yaml
# ❌ Strings ambiguos
actor: "[ResponsibleActorId]"           # AI no puede validar
area: "[OrganizationalArea]"            # AI no sabe qué poner

# ❌ Herencia oculta
Vision extends FoundationalBlock        # AI no ve campos disponibles
```

### **7.2 Patrones de Documentación Auto-explicativa**

**✅ COMENTARIOS SEMÁNTICOS:**

```yaml
actor: Actor:ConsejoDirectivo # Example: Actor.ConsejoDirectivo
area: Area:[AreaId] # Example: Area.Tecnologia
uses:
  intent:
    Intent:[IntentId] # REQUIRED: Strategic intent this vision embodies
    # Example: Intent:TransformacionDigital
```

---

## 📋 **8. CHECKLIST DE CUMPLIMIENTO**

### **8.1 Para Crear Artefactos**

**✅ ANTES DE CREAR:**

- [ ] Artefactos fundacionales existen (`Intent:X`, `Context:Y`, etc.)
- [ ] Referencias usan notación correcta (`Actor:Name`, `Area:Name`)
- [ ] Jerarquía organizacional respetada
- [ ] No duplico bloques fundacionales
- [ ] Flujos usan semántica `Actor → acción`

### **8.2 Para Revisar Artefactos**

**✅ REVISIÓN SEMÁNTICA:**

- [ ] Todas las referencias existen y son correctas
- [ ] No hay violations de jerarquía organizacional
- [ ] Principio DRY respetado (sin duplicación)
- [ ] Comunicación cross-área usa Events
- [ ] Flujos siguen notación semántica

---

## 🔍 **9. EJEMPLOS DE REFERENCIA CORRECTA**

### **9.1 Vision con Composición Correcta**

```yaml
Vision:LiderazgoTecnologicoSustentable:
  uses:
    intent: Intent:TransformacionDigitalSustentable
    context: Context:MercadoLatinamericano
    authority: Authority:ConsejoDirectivoAuthority
    evaluation: Evaluation:IndicadoresEstrategicos

  aspirationalStatement: >
    "Ser reconocidos como el catalizador principal..."

  strategicPillars:
    - pillar: "InnovacionSustentable"
      enabledBy:
        - Process:Innovacion.DesarrolloProductosVerdes
        - Policy:SustentabilidadAmbiental
```

### **9.2 Process con Flujo Semántico**

```yaml
Process:Desarrollo.CodeReview:
  uses:
    intent: Intent:CalidadSoftwareExcelente
    context: Context:DesarrolloAgilContext
    authority: Authority:TechLeadAuthority

  flow:
    steps:
      - step: 1
        actor: Actor:Developer → "Crear pull request"
        inputs: [Actor:Developer ← "Código completado"]
        outputs: [Actor:TechLead ← "PR para revisión"]

      - step: 2
        actor: Actor:TechLead → "Revisar código calidad"
        inputs: [Actor:Developer ← "Pull request"]
        outputs: [Actor:Developer ← "Feedback revisión"]
```

### **9.3 Comunicación Cross-Area con Events**

```yaml
# ✅ CORRECTO - Tecnología comunica con Ventas vía Events
Event:SolicitudSoporteTecnico:
  triggeredBy: Area:Ventas
  description: "Cliente reporta problema técnico"
  handledBy: Area:Tecnologia

Event:SoporteTecnicoResuelto:
  triggeredBy: Area:Tecnologia
  description: "Problema técnico solucionado"
  notifies: Area:Ventas
```

---

## ⚖️ **10. PRINCIPIOS FUNDAMENTALES SOL**

### **10.1 Meta-Construcción y Reutilización**

- **DRY Total:** Ningún bloque fundacional se duplica
- **Composición Explícita:** `uses:` hace visible todas las dependencias
- **Referencias Semánticas:** `Actor:Name`, no strings genéricos
- **Trazabilidad Completa:** Toda relación es bidireccional y verificable

### **10.2 Jerarquía Organizacional Real**

- **Comunicación Natural:** Refleja cómo se comunican departamentos reales
- **Events para Cross-Area:** Simula llamadas/solicitudes entre departamentos
- **Autoridad Respetada:** Referencias ascendentes/descendentes según jerarquía
- **Contexto Relevante:** Cada artefacto conoce su alcance organizacional

---

**🎯 Al seguir estas reglas semánticas, garantizamos que SOL sea:**

- ✅ **Libre de alucinaciones AI**
- ✅ **Intuitivo para desarrolladores**
- ✅ **Consistente y predecible**
- ✅ **Escalable y mantenible**
- ✅ **Reflejo fiel de la organización real**
