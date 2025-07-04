# ===========================================
# SOL ARTIFACT TEMPLATE v2025.07
# Type: Process (Operational Artifact)
# ===========================================

# ✅ COMPOSITION VALIDATION (Updated by tools)
# ├─ 🟡 Intent: Reference to Intent.[IntentId] (REQUIRED)
# ├─ 🟡 Context: Reference to Context.[ContextId] (REQUIRED)
# ├─ 🟡 Authority: Reference to Authority.[AuthorityId] (REQUIRED)
# ├─ 🟡 Flow: Semantic Actor → action representation (REQUIRED)
# └─ 🟡 Actors: All participants properly referenced

Process:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourProcessNameInCamelCase]          # REQUIRED: Unique identifier (e.g., OnboardingEmpleadosProcess)
    version: "1.0.0"                         # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                  # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"             # REQUIRED: Last modification date
    status: draft                            # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                  # REQUIRED: Who created this process
    reviewedBy: []                           # OPTIONAL: Array of reviewers when ready
  
  # ┌─ FOUNDATIONAL COMPOSITION ─────────────┐
  uses:                                      # REQUIRED: Composed from foundational artifacts
    intent: Intent:[IntentId]                # REQUIRED: Purpose this process serves
                                            # Example: Intent:MejoraExperienciaEmpleado
    
    context: Context:[ContextId]             # REQUIRED: Context where this process applies
                                            # Example: Context:RecursosHumanosContext
    
    authority: Authority:[AuthorityId]       # REQUIRED: Who has authority over this process
                                            # Example: Authority:DirectorRRHHAuthority
  
  # ┌─ PROCESS DEFINITION ───────────────────┐
  description: >                             # REQUIRED: Clear process description
    [Replace with specific process description.
    Should explain what the process achieves and why it's needed.
    Example: "Proceso estandarizado para la incorporación de nuevos
    empleados, asegurando una experiencia consistente y cumplimiento
    de políticas organizacionales."]
  
  # ┌─ PARTICIPANTS (ACTORS) ────────────────┐
  actors:                                    # REQUIRED: All process participants
    primary:                                 # REQUIRED: Primary actors who execute the process
      - Actor:[PrimaryActorId]               # Example: Actor:GerenteRRHH
      - Actor:[PrimaryActorId]               # Example: Actor:NuevoEmpleado
      # Add more primary actors as needed
    
    supporting:                              # OPTIONAL: Supporting actors
      - Actor:[SupportingActorId]            # Example: Actor:AdministradorSistemas
      - Actor:[SupportingActorId]            # Example: Actor:SupervisorDirecto
      # Add more supporting actors as needed
    
    external:                                # OPTIONAL: External actors
      - Actor:[ExternalActorId]              # Example: Actor:ProveedorBeneficios
      # Add more external actors as needed
  
  # ┌─ PROCESS FLOW (SEMANTIC NOTATION) ─────┐
  flow:                                      # REQUIRED: Process steps with semantic Actor → action
    startCondition: "[What triggers this process]" # Example: "Nueva contratación aprobada"
    
    steps:                                   # REQUIRED: Sequential process steps
      - step: 1
        actor: Actor:[ActorId] → "[Action description]"  # Example: Actor:GerenteRRHH → "Crear expediente digital empleado"
        inputs: [Actor:[ProviderActorId] → "[Input description]"]  # Example: [Actor:RecrutadorSenior → "Datos personales verificados"]
        outputs: [Actor:[ConsumerActorId] ← "[Output description]"] # Example: [Actor:AdministradorSistemas ← "Expediente digital creado"]
        duration: "[Expected duration]"      # Example: "30 minutos"
        
      - step: 2
        actor: Actor:[ActorId] → "[Action description]"  # Example: Actor:AdministradorSistemas → "Configurar accesos sistemas"
        dependsOn: [1]                       # Which steps must complete first
        inputs: [Actor:[ProviderActorId] → "[Input description]"]  # Example: [Actor:SupervisorDirecto → "Lista de sistemas requeridos"]
        outputs: [Actor:[ConsumerActorId] ← "[Output description]"] # Example: [Actor:NuevoEmpleado ← "Credenciales de acceso generadas"]
        duration: "[Expected duration]"      # Example: "45 minutos"
        
      # Add more steps following the same pattern
      # Each step should follow: Actor → action pattern
    
    endCondition: "[What indicates process completion]" # Example: "Empleado completó primer día exitosamente"
    
    totalDuration: "[Total process duration]" # Example: "3-5 días laborales"
  
  # ┌─ PROCESS GOVERNANCE ───────────────────┐
  governance:
    owner: Actor:[ProcessOwnerActorId]       # REQUIRED: Process owner
                                            # Example: Actor:DirectorRRHH
    
    reviewCycle: "[Review frequency]"        # REQUIRED: How often to review process
                                            # Example: "Semestral"
    
    approvalRequired:                        # OPTIONAL: Steps requiring approval
      - step: [step_number]                  # Which step requires approval
        approvedBy: Actor:[ApproverActorId]  # Example: Actor:GerenteRRHH
        criteria: "[Approval criteria]"      # Example: "Documentación completa"
      # Add more approval points as needed
  
  # ┌─ QUALITY & COMPLIANCE ─────────────────┐
  qualityControls:                           # OPTIONAL: Quality control measures
    checkpoints:                             # Quality checkpoints
      - checkpoint: "[Checkpoint description]" # Example: "Verificación documentos legales"
        step: [step_number]                  # Which step includes this checkpoint
        verifiedBy: Actor:[VerifierActorId]  # Example: Actor:AbogadoEmpresarial
        criteria: []                        # Verification criteria
      # Add more checkpoints as needed
    
    metrics:                                 # Process performance metrics
      - metric: "[Metric name]"             # Example: "tiempo-promedio-onboarding"
        measurement: "[How to measure]"      # Example: "Días desde inicio hasta activación"
        target: "[Target value]"            # Example: "< 5 días laborales"
        measuredBy: Indicator:[IndicatorId]  # Example: Indicator:TiempoOnboarding
      # Add more metrics as needed
  
  # ┌─ INTEGRATION & DEPENDENCIES ───────────┐
  integration:
    requiredSystems:                         # OPTIONAL: Systems this process uses
      - system: "[System name]"             # Example: "HRIS Sistema Nómina"
        purpose: "[Why system is needed]"   # Example: "Registro datos empleado"
        owner: Actor:[SystemOwnerActorId]    # Example: Actor:AdministradorSistemas
      # Add more systems as needed
    
    dataFlows:                               # OPTIONAL: Data flows between systems
      - from: "[Source system]"             # Example: "HRIS"
        to: "[Target system]"               # Example: "Sistema Accesos"
        data: "[Data description]"          # Example: "Datos identificación empleado"
        frequency: "[Transfer frequency]"    # Example: "Tiempo real"
      # Add more data flows as needed
    
    dependsOnProcesses:                      # OPTIONAL: Other processes this depends on
      - Process:[DependentProcessId]         # Example: Process:SeleccionPersonal
        relationship: "[Dependency type]"    # Example: "Must complete before"
      # Add more dependencies as needed
  
  # ┌─ EXCEPTION HANDLING ───────────────────┐
  exceptionHandling:                         # OPTIONAL: How to handle exceptions
    commonExceptions:                        # Common exception scenarios
      - exception: "[Exception description]" # Example: "Documentos incompletos"
        trigger: "[What causes this]"       # Example: "Falta certificado estudios"
        handling: "[How to handle]"         # Example: "Solicitar documentos faltantes"
        handledBy: Actor:[HandlerActorId]   # Example: Actor:GerenteRRHH
        escalation: Actor:[EscalationActorId] # Example: Actor:DirectorRRHH
      # Add more exceptions as needed
    
    escalationPaths:                         # Escalation procedures
      - scenario: "[Escalation scenario]"    # Example: "Retraso > 7 días"
        escalateTo: Actor:[EscalationActorId] # Example: Actor:DirectorRRHH
        timeline: "[Escalation timeline]"    # Example: "Inmediato"
      # Add more escalation paths as needed
  
  # ┌─ COMMUNICATION & EVENTS ───────────────┐
  communication:                             # OPTIONAL: Communication within process
    notifications:                           # Process notifications
      - event: "[Notification trigger]"     # Example: "Proceso iniciado"
        notifies: Actor:[NotifiedActorId]    # Example: Actor:SupervisorDirecto
        method: "[Notification method]"      # Example: "Email automático"
        timing: "[When to notify]"          # Example: "Inmediato"
      # Add more notifications as needed
    
    crossAreaCommunication:                  # Communication with other areas
      - communicatesWith: Area:[AreaId]      # Example: Area:Tecnologia
        purpose: "[Communication purpose]"   # Example: "Solicitar accesos sistemas"
        channel: "[Communication channel]"   # Example: "Ticket sistema ITSM"
        frequency: "[Communication frequency]" # Example: "Por cada nuevo empleado"
      # Add more cross-area communications as needed
  
  # ┌─ TRACEABILITY ─────────────────────────┐
  relationships:                             # OPTIONAL: Connections to other artifacts
    implementsPolicy:                        # Policies this process implements
      - Policy:[PolicyId]                    # Example: Policy:GestionRecursosHumanos
    
    supportsVision:                          # Visions this process supports
      - Vision:[VisionId]                    # Example: Vision:ExcelenciaOperacional
    
    generateEvents:                          # Events this process can generate
      - Event:[EventId]                      # Example: Event:EmpleadoOnboardingCompleto
    
    producesResults:                         # Results this process produces
      - Result:[ResultId]                    # Example: Result:EmpleadoActivoSistema
    
    measuredBy:                              # Indicators measuring this process
      - Indicator:[IndicatorId]              # Example: Indicator:EficienciaOnboarding
  
  # ┌─ CATEGORIZATION ───────────────────────┐
  classification:
    domain: "[Process Domain]"               # OPTIONAL: Business domain
                                            # Example: "Gestión Recursos Humanos"
    area: Area:[ProcessAreaId]               # OPTIONAL: Organizational area
                                            # Example: Area:RecursosHumanos
    processType: [core|support|management]   # OPTIONAL: Type of process
    complexity: [simple|moderate|complex]    # OPTIONAL: Process complexity
    criticality: [low|medium|high|critical]  # OPTIONAL: Business criticality
    tags:                                    # OPTIONAL: Searchable tags
      - "[tag1]"                            # Example: "onboarding"
      - "[tag2]"                            # Example: "rrhh"
      - "[tag3]"                            # Example: "integracion"
      # Add more tags as needed
    maturity: initial                        # OPTIONAL: [initial|developing|defined|managed|optimizing]

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Create referenced foundational artifacts first:
#    - Intent.[IntentId] - Process purpose
#    - Context.[ContextId] - Operating context
#    - Authority.[AuthorityId] - Process authority
# 3. Use semantic flow notation: Actor → action
# 4. Define clear inputs/outputs for each step
# 5. Map all actor references to actual Actor artifacts
# 6. Use dot notation for hierarchies: Area:SubArea
# 7. Validate using SOL extension in VSCode
# 8. Ensure all referenced artifacts exist
# =========================================== 