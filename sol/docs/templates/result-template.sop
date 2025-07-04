# 🎯 RESULT TEMPLATE - Process or Activity Outcome

Result:[ResultId]:                           # REQUIRED: Unique identifier for this result
                                            # Example: Result:CuentaCreada
                                            # Example: Result:EmpleadoOnboardingCompleto
                                            # Example: Result:AuditoriaCompletada

  # ┌─ RESULT DEFINITION ───────────────────┐
  definition:
    name: "[Result Name]"                   # REQUIRED: Human-readable name
                                           # Example: "Cuenta de cliente creada"
                                           # Example: "Empleado onboarding completado"
    
    description: >                         # REQUIRED: What this result represents
      [Detailed description of what constitutes this result and its significance]
      # Example: "Cuenta de cliente completamente configurada y activa en el sistema..."
    
    type: [deliverable|outcome|milestone|artifact|state] # REQUIRED: Result type
                                           # - deliverable: Tangible output
                                           # - outcome: Achieved state or condition
                                           # - milestone: Significant progress point
                                           # - artifact: Created document or asset
                                           # - state: System or business state change
    
    category: [business|technical|operational|strategic] # REQUIRED: Result category
    
    criticality: [low|medium|high|critical] # REQUIRED: How critical this result is

  # ┌─ CREATION CONTEXT ────────────────────┐
  creation:
    producedBy:                            # REQUIRED: What produces this result
      processes:                           # Processes that create this result
        - Process:[ProcessId]              # Example: Process:CreacionCuentaCliente
          role: "[Process role]"           # Example: "Primary producer"
        # Add more processes as needed
      
      actors:                              # Actors responsible for creating this result
        - Actor:[ActorId]                  # Example: Actor:GerenteVentas
          role: "[Actor role]"             # Example: "Result owner"
        # Add more actors as needed
    
    triggers:                              # REQUIRED: What triggers creation of this result
      - trigger: "[Trigger description]"   # Example: "Cliente completa formulario registro"
        source: "[Trigger source]"         # Example: "Sistema web registro"
        condition: "[Trigger condition]"   # Example: "Todos los campos obligatorios completos"
      # Add more triggers as needed
    
    prerequisites:                         # REQUIRED: What must exist before this result
      - prerequisite: "[Prerequisite description]" # Example: "Validación identidad cliente"
        providedBy: Actor:[ProviderActorId] # Example: Actor:EquipoVerificacion
        verification: "[How to verify]"    # Example: "Documento identidad verificado"
      # Add more prerequisites as needed

  # ┌─ RESULT SPECIFICATION ────────────────┐
  specification:
    components:                            # REQUIRED: What this result contains/includes
      - component: "[Component name]"      # Example: "Perfil cliente básico"
        description: "[Component description]" # Example: "Datos personales y contacto"
        mandatory: [true|false]            # Whether this component is mandatory
        format: "[Component format]"       # Example: "JSON object"
      # Add more components as needed
    
    attributes:                            # REQUIRED: Key attributes of this result
      - attribute: "[Attribute name]"      # Example: "Estado cuenta"
        value: "[Attribute value]"         # Example: "ACTIVE"
        dataType: "[Data type]"            # Example: "String"
        constraints: []                    # Any constraints on this attribute
      # Add more attributes as needed
    
    format:                                # REQUIRED: Result format/structure
      structure: "[Result structure]"      # Example: "Database record + configuration files"
      schema: "[Schema reference]"         # Example: "CustomerAccount.schema.json"
      encoding: "[Encoding format]"        # Example: "UTF-8"
    
    size:                                  # OPTIONAL: Result size characteristics
      typical: "[Typical size]"            # Example: "~2KB per account"
      maximum: "[Maximum size]"            # Example: "< 10KB"
      
    persistence:                           # REQUIRED: How result is persisted
      storage: "[Storage location]"        # Example: "Primary customer database"
      retention: "[Retention period]"      # Example: "Lifetime of customer relationship"
      backup: "[Backup strategy]"          # Example: "Daily incremental + weekly full"

  # ┌─ QUALITY CRITERIA ────────────────────┐
  quality:
    completeness:                          # REQUIRED: Completeness criteria
      criteria: "[Completeness definition]" # Example: "All mandatory fields populated"
      verification: "[How to verify]"      # Example: "Automated validation rules"
      measuredBy: Indicator:[IndicatorId]  # Example: Indicator:CompletenessScore
    
    accuracy:                              # REQUIRED: Accuracy criteria
      criteria: "[Accuracy definition]"    # Example: "Data matches source documents"
      verification: "[How to verify]"      # Example: "Cross-reference with ID documents"
      tolerance: "[Acceptable tolerance]"  # Example: "99.9% accuracy required"
    
    timeliness:                            # REQUIRED: Timeliness criteria
      target: "[Timeliness target]"        # Example: "Created within 24 hours of request"
      measurement: "[How to measure]"      # Example: "Timestamp comparison"
      sla: "[Service level agreement]"     # Example: "95% within target timeframe"
    
    consistency:                           # OPTIONAL: Consistency requirements
      criteria: "[Consistency definition]" # Example: "Format consistent across all accounts"
      validation: "[Validation method]"    # Example: "Schema validation"
    
    integrity:                             # REQUIRED: Data/result integrity
      checksums: "[Integrity verification]" # Example: "MD5 hash verification"
      validation: "[Validation rules]"     # Example: "Business rule validation"
      auditTrail: "[Audit requirements]"   # Example: "Full creation history logged"

  # ┌─ USAGE & CONSUMPTION ─────────────────┐
  usage:
    consumers:                             # REQUIRED: Who/what consumes this result
      - consumer: Actor:[ConsumerActorId]  # Example: Actor:EquipoSoporte
        purpose: "[Usage purpose]"         # Example: "Customer support queries"
        frequency: "[Usage frequency]"     # Example: "As needed"
        access: "[Access method]"          # Example: "CRM system interface"
      
      - consumer: Process:[ProcessId]      # Example: Process:ActivacionServicios
        purpose: "[Usage purpose]"         # Example: "Service activation"
        frequency: "[Usage frequency]"     # Example: "Immediately after creation"
        dependencies: []                   # What this consumer depends on
      # Add more consumers as needed
    
    interfaces:                            # REQUIRED: How result is accessed
      - interface: "[Interface name]"      # Example: "Customer Account API"
        type: [api|ui|file|database|message] # Example: api
        access: "[Access method]"          # Example: "REST API endpoints"
        authentication: "[Auth requirements]" # Example: "OAuth 2.0 token"
        authorization: "[Authorization rules]" # Example: "Role-based access control"
      # Add more interfaces as needed
    
    distribution:                          # OPTIONAL: How result is distributed
      automatic:                           # Automatic distribution
        - target: Actor:[TargetActorId]    # Example: Actor:EquipoActivacion
          method: "[Distribution method]"  # Example: "Message queue notification"
          timing: "[When distributed]"     # Example: "Immediately upon creation"
      
      onDemand:                            # On-demand access
        - requestor: Actor:[RequestorActorId] # Example: Actor:ClienteServicio
          method: "[Access method]"        # Example: "Self-service portal"
          authorization: "[Auth requirements]" # Example: "Customer authentication"

  # ┌─ LIFECYCLE MANAGEMENT ────────────────┐
  lifecycle:
    states:                                # REQUIRED: Possible states of this result
      - state: "[State name]"              # Example: "CREATED"
        description: "[State description]" # Example: "Initial creation completed"
        nextStates: []                     # Possible next states
        triggers: []                       # What triggers transition to this state
      
      - state: "[State name]"              # Example: "VALIDATED"
        description: "[State description]" # Example: "All validations passed"
        nextStates: []                     # Possible next states
        triggers: []                       # What triggers transition to this state
      # Add more states as needed
    
    transitions:                           # REQUIRED: State transitions
      - from: "[From state]"               # Example: "CREATED"
        to: "[To state]"                   # Example: "VALIDATED"
        trigger: "[Transition trigger]"    # Example: "Validation process completion"
        responsible: Actor:[ActorId]       # Example: Actor:SistemaValidacion
        conditions: []                     # Conditions for transition
      # Add more transitions as needed
    
    versioning:                            # OPTIONAL: Version management
      strategy: "[Versioning strategy]"    # Example: "Semantic versioning"
      retention: "[Version retention]"     # Example: "Keep last 5 versions"
      migration: "[Migration approach]"    # Example: "Automatic schema migration"
    
    archival:                              # REQUIRED: Archival/retirement process
      criteria: "[Archival criteria]"      # Example: "Customer account inactive > 7 years"
      process: Process:[ArchivalProcessId] # Example: Process:ArchivalDatos
      responsible: Actor:[ArchivalActorId] # Example: Actor:AdministradorDatos

  # ┌─ MONITORING & MEASUREMENT ────────────┐
  monitoring:
    metrics:                               # REQUIRED: How this result is measured
      - metric: "[Metric name]"            # Example: "Account creation success rate"
        measurement: Indicator:[IndicatorId] # Example: Indicator:CreationSuccessRate
        target: "[Target value]"           # Example: "> 99.5%"
        frequency: "[Measurement frequency]" # Example: "Real-time"
      # Add more metrics as needed
    
    tracking:                              # REQUIRED: How result is tracked
      identifier: "[Unique identifier]"    # Example: "Account ID + creation timestamp"
      logging: "[Logging requirements]"    # Example: "Full audit log required"
      retention: "[Log retention]"         # Example: "7 years for compliance"
    
    alerting:                              # OPTIONAL: Alerting on result issues
      - condition: "[Alert condition]"     # Example: "Creation failure rate > 1%"
        severity: [low|medium|high|critical] # Example: high
        notifies: Actor:[NotifiedActorId]  # Example: Actor:EquipoOperaciones
        escalation: Actor:[EscalationActorId] # Example: Actor:GerenteOperaciones

  # ┌─ COMPLIANCE & GOVERNANCE ─────────────┐
  compliance:
    regulations:                           # REQUIRED: Regulatory requirements
      - regulation: "[Regulation name]"    # Example: "GDPR"
        requirement: "[Specific requirement]" # Example: "Data subject consent recorded"
        evidence: "[Compliance evidence]"  # Example: "Consent timestamp and method"
        responsible: Actor:[ComplianceActorId] # Example: Actor:OficialPrivacidad
      # Add more regulations as needed
    
    policies:                              # REQUIRED: Internal policies
      - policy: Policy:[PolicyId]          # Example: Policy:ProteccionDatos
        requirement: "[Policy requirement]" # Example: "Encryption at rest required"
        implementation: "[How implemented]" # Example: "AES-256 encryption"
    
    auditability:                          # REQUIRED: Audit requirements
      auditTrail: "[Audit trail requirements]" # Example: "Complete creation and modification history"
      retention: "[Audit retention]"       # Example: "10 years"
      access: "[Audit access]"             # Example: "Internal audit team only"
      responsible: Actor:[AuditActorId]    # Example: Actor:AuditorInterno

  # ┌─ RELATIONSHIPS ───────────────────────┐
  relationships:
    derivedFrom:                           # OPTIONAL: What this result is derived from
      - source: "[Source description]"     # Example: "Customer registration form"
        relationship: "[Relationship type]" # Example: "Direct transformation"
    
    enablesProcesses:                      # OPTIONAL: Processes this result enables
      - Process:[ProcessId]                # Example: Process:ActivacionServicios
        dependency: "[Dependency type]"    # Example: "Required input"
    
    triggersEvents:                        # OPTIONAL: Events this result can trigger
      - Event:[EventId]                    # Example: Event:CuentaClienteCreada
        condition: "[Trigger condition]"   # Example: "Upon successful creation"
    
    supportsVisions:                       # OPTIONAL: Visions this result supports
      - Vision:[VisionId]                  # Example: Vision:ExperienciaClienteExcelente
        contribution: "[How it supports]"  # Example: "Enables rapid customer onboarding"
    
    measuredBy:                            # OPTIONAL: Indicators measuring this result
      - Indicator:[IndicatorId]            # Example: Indicator:CalidadDatosCuenta
        aspect: "[What aspect measured]"   # Example: "Data quality score"

  # ┌─ CATEGORIZATION ──────────────────────┐
  categorization:
    domain: "[Business Domain]"            # OPTIONAL: Business domain
                                          # Example: "Customer Management"
    
    area: Area:[AreaId]                    # OPTIONAL: Organizational area
                                          # Example: Area:Ventas
    
    visibility: [public|internal|confidential|restricted] # REQUIRED: Result visibility
    
    classification: "[Data classification]" # OPTIONAL: Data classification
                                          # Example: "Customer PII - Confidential"

  # ┌─ METADATA ────────────────────────────┐
  metadata:
    version: "1.0.0"                      # Template version
    lastUpdated: "[YYYY-MM-DD]"          # Last update date
    status: [active|inactive|deprecated]  # Result status
    
    firstProduced: "[YYYY-MM-DD]"         # When first instance was produced
    
    tags: []                              # Optional tags for categorization
    
    notes: >                              # Optional additional notes
      [Any additional context or notes about this result]

# ────────────────────────────────────────────────────────────────────────────────

# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Use semantic references: Actor:Name, Process:Name, etc.
# 3. Define clear quality criteria and specifications
# 4. Map all consumers and usage patterns
# 5. Establish proper lifecycle and governance
# 6. Validate using SOL extension in VSCode
# 7. Ensure all referenced artifacts exist 