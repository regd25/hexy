# 📋 GUIDELINE TEMPLATE - Operational Guidance and Best Practices

Guideline:[GuidelineId]:                     # REQUIRED: Unique identifier for this guideline
                                            # Example: Guideline:RevisionCodigoPares
                                            # Example: Guideline:ComunicacionClientes
                                            # Example: Guideline:SeguridadDatos

  # ┌─ GUIDELINE DEFINITION ────────────────┐
  definition:
    name: "[Guideline Name]"                # REQUIRED: Human-readable name
                                           # Example: "Revisión de código por pares"
                                           # Example: "Comunicación efectiva con clientes"
    
    description: >                         # REQUIRED: What this guideline covers
      [Detailed description of the guideline's purpose and scope]
      # Example: "Directrices para asegurar calidad y consistencia en el proceso de revisión de código..."
    
    type: [operational|technical|behavioral|procedural|safety|quality] # REQUIRED: Guideline type
    
    category: [mandatory|recommended|optional] # REQUIRED: Compliance level
                                           # - mandatory: Must be followed
                                           # - recommended: Should be followed
                                           # - optional: Good practice but not required
    
    criticality: [low|medium|high|critical] # REQUIRED: How critical adherence is

  # ┌─ SCOPE & APPLICABILITY ───────────────┐
  scope:
    appliesTo:                             # REQUIRED: Who this guideline applies to
      actors:                              # Specific actors
        - Actor:[ActorId]                  # Example: Actor:EquipoDesarrollo
        - Actor:[ActorId]                  # Example: Actor:TechLead
      
      areas:                               # Organizational areas
        - Area:[AreaId]                    # Example: Area:Tecnologia
        - Area:[AreaId]                    # Example: Area:Desarrollo
      
      processes:                           # Specific processes
        - Process:[ProcessId]              # Example: Process:DesarrolloSoftware
        - Process:[ProcessId]              # Example: Process:DeployProduccion
    
    situations:                            # REQUIRED: When this guideline applies
      - situation: "[Situation description]" # Example: "Durante revisiones de pull requests"
        trigger: "[Trigger condition]"     # Example: "Cambios en código crítico"
        frequency: "[How often]"           # Example: "Cada pull request"
      # Add more situations as needed
    
    boundaries:                            # REQUIRED: What's included/excluded
      included: []                         # What's explicitly included
      excluded: []                         # What's explicitly excluded
      exceptions: []                       # Documented exceptions

  # ┌─ GUIDANCE CONTENT ────────────────────┐
  guidance:
    principles:                            # REQUIRED: Core principles
      - principle: "[Principle statement]" # Example: "Todo código debe ser revisado por al menos dos pares"
        rationale: "[Why this principle]"  # Example: "Reduce defectos y mejora conocimiento compartido"
        priority: [high|medium|low]        # Example: high
      # Add more principles as needed
    
    practices:                             # REQUIRED: Specific practices
      - practice: "[Practice description]" # Example: "Usar checklist de revisión estándar"
        steps: []                          # Specific steps to follow
        tools: []                          # Tools to use
        examples: []                       # Examples of good practice
        antipatterns: []                   # What NOT to do
      # Add more practices as needed
    
    standards:                             # OPTIONAL: Standards to follow
      - standard: "[Standard name]"        # Example: "Coding standards Java"
        reference: "[Standard reference]"  # Example: "Google Java Style Guide"
        version: "[Standard version]"      # Example: "v1.7"
        mandatory: [true|false]            # Whether adherence is mandatory
      # Add more standards as needed
    
    templates:                             # OPTIONAL: Templates to use
      - template: "[Template name]"        # Example: "Pull request template"
        location: "[Template location]"    # Example: "/.github/pull_request_template.md"
        usage: "[When to use]"             # Example: "All pull requests"
      # Add more templates as needed

  # ┌─ IMPLEMENTATION GUIDANCE ─────────────┐
  implementation:
    prerequisites:                         # REQUIRED: What's needed before implementation
      - prerequisite: "[Prerequisite]"    # Example: "Configurar herramientas de revisión"
        responsible: Actor:[ActorId]       # Example: Actor:AdministradorSistemas
        timeline: "[Implementation time]"  # Example: "1 semana"
      # Add more prerequisites as needed
    
    steps:                                 # REQUIRED: Implementation steps
      - step: 1
        action: "[Action description]"     # Example: "Configurar reglas de revisión en GitHub"
        responsible: Actor:[ActorId]       # Example: Actor:TechLead
        duration: "[Expected duration]"    # Example: "2 horas"
        deliverable: "[What's produced]"   # Example: "Branch protection rules configuradas"
      # Add more steps as needed
    
    tools:                                 # REQUIRED: Tools needed
      - tool: "[Tool name]"                # Example: "GitHub Enterprise"
        purpose: "[Tool purpose]"          # Example: "Gestión pull requests"
        configuration: "[Configuration needed]" # Example: "Branch protection + required reviewers"
        owner: Actor:[ToolOwnerActorId]    # Example: Actor:AdministradorSistemas
      # Add more tools as needed
    
    training:                              # OPTIONAL: Training requirements
      - audience: Actor:[ActorId]          # Example: Actor:EquipoDesarrollo
        content: "[Training content]"      # Example: "Técnicas de revisión efectiva"
        duration: "[Training duration]"    # Example: "4 horas"
        frequency: "[Training frequency]"  # Example: "Anual"
        provider: Actor:[TrainerActorId]   # Example: Actor:TechLead

  # ┌─ COMPLIANCE & MONITORING ─────────────┐
  compliance:
    measurement:                           # REQUIRED: How compliance is measured
      - metric: "[Compliance metric]"      # Example: "Porcentaje PRs con revisión completa"
        target: "[Target value]"           # Example: "> 95%"
        measurement: Indicator:[IndicatorId] # Example: Indicator:ComplianceRevisionCodigo
        frequency: "[Measurement frequency]" # Example: "Semanal"
      # Add more metrics as needed
    
    monitoring:                            # REQUIRED: How adherence is monitored
      method: "[Monitoring method]"        # Example: "Automated dashboard + manual review"
      frequency: "[Monitoring frequency]"  # Example: "Continuo"
      responsible: Actor:[MonitorActorId]  # Example: Actor:TechLead
      escalation: Actor:[EscalationActorId] # Example: Actor:DirectorTecnologia
    
    enforcement:                           # REQUIRED: How non-compliance is handled
      - violation: "[Violation type]"      # Example: "PR sin revisión adecuada"
        consequence: "[Consequence]"       # Example: "PR bloqueado hasta revisión"
        responsible: Actor:[EnforcerActorId] # Example: Actor:TechLead
        escalation: Actor:[EscalationActorId] # Example: Actor:DirectorTecnologia
      # Add more enforcement rules as needed
    
    exceptions:                            # OPTIONAL: Exception handling
      process: Process:[ExceptionProcessId] # Example: Process:ExcepcionesGuidelines
      approver: Actor:[ApproverActorId]    # Example: Actor:DirectorTecnologia
      documentation: "[Exception documentation]" # Example: "Justificación + timeline"

  # ┌─ CONTINUOUS IMPROVEMENT ──────────────┐
  improvement:
    review:                                # REQUIRED: Regular review process
      frequency: "[Review frequency]"      # Example: "Trimestral"
      participants:                        # Who participates in reviews
        - Actor:[ReviewerActorId]          # Example: Actor:TechLead
        - Actor:[ReviewerActorId]          # Example: Actor:EquipoDesarrollo
      
      criteria:                            # What's reviewed
        - "[Review criteria]"              # Example: "Efectividad en reducir defectos"
        - "[Review criteria]"              # Example: "Facilidad de implementación"
        # Add more criteria as needed
    
    feedback:                              # REQUIRED: Feedback collection
      sources:                             # Where feedback comes from
        - Actor:[FeedbackSourceActorId]    # Example: Actor:EquipoDesarrollo
        - Process:[ProcessId]              # Example: Process:RevisionProcesos
      
      collection: "[Feedback method]"      # Example: "Encuestas + retrospectivas"
      frequency: "[Collection frequency]"  # Example: "Mensual"
      responsible: Actor:[FeedbackOwnerActorId] # Example: Actor:TechLead
    
    evolution:                             # OPTIONAL: Evolution planning
      nextVersion: "[Next version plan]"   # Example: "Automatizar más validaciones"
      timeline: "[Evolution timeline]"     # Example: "Próximos 6 meses"
      responsible: Actor:[EvolutionOwnerActorId] # Example: Actor:TechLead

  # ┌─ RELATIONSHIPS ───────────────────────┐
  relationships:
    supportsPolicies:                      # OPTIONAL: Policies this guideline supports
      - Policy:[PolicyId]                  # Example: Policy:CalidadSoftware
        relationship: "[How it supports]"  # Example: "Implementa controles de calidad"
    
    enablesProcesses:                      # OPTIONAL: Processes this guideline enables
      - Process:[ProcessId]                # Example: Process:DesarrolloSoftware
        role: "[Guideline role]"           # Example: "Quality assurance"
    
    implementedBy:                         # OPTIONAL: What implements this guideline
      - Actor:[ImplementerActorId]         # Example: Actor:EquipoDesarrollo
        role: "[Implementation role]"      # Example: "Primary implementer"
    
    relatedGuidelines:                     # OPTIONAL: Related guidelines
      - Guideline:[RelatedGuidelineId]     # Example: Guideline:PruebasUnitarias
        relationship: "[Relationship type]" # Example: "Complementary"
    
    measuredBy:                            # OPTIONAL: Indicators measuring this guideline
      - Indicator:[IndicatorId]            # Example: Indicator:AdherenciaGuidelines
        aspect: "[What aspect measured]"   # Example: "Compliance rate"

  # ┌─ CATEGORIZATION ──────────────────────┐
  categorization:
    domain: "[Business Domain]"            # OPTIONAL: Business domain
                                          # Example: "Desarrollo de Software"
    
    area: Area:[AreaId]                    # OPTIONAL: Organizational area
                                          # Example: Area:Tecnologia
    
    discipline: "[Discipline]"             # OPTIONAL: Professional discipline
                                          # Example: "Software Engineering"
    
    maturity: [basic|intermediate|advanced] # OPTIONAL: Maturity level required

  # ┌─ METADATA ────────────────────────────┐
  metadata:
    version: "1.0.0"                      # Template version
    lastUpdated: "[YYYY-MM-DD]"          # Last update date
    status: [active|inactive|deprecated]  # Guideline status
    
    approvedBy: Actor:[ApproverActorId]    # Example: Actor:DirectorTecnologia
    approvalDate: "[YYYY-MM-DD]"          # When guideline was approved
    
    tags: []                              # Optional tags for categorization
    
    notes: >                              # Optional additional notes
      [Any additional context or notes about this guideline]

# ────────────────────────────────────────────────────────────────────────────────

# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Use semantic references: Actor:Name, Area:Name, etc.
# 3. Define clear guidance and implementation steps
# 4. Establish proper compliance and monitoring
# 5. Map all stakeholders and relationships
# 6. Validate using SOL extension in VSCode
# 7. Ensure all referenced artifacts exist 