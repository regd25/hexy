# 📝 PROCEDURE TEMPLATE - Detailed Step-by-Step Instructions

Procedure:[ProcedureId]:                     # REQUIRED: Unique identifier for this procedure
                                            # Example: Procedure:RecuperacionContraseña
                                            # Example: Procedure:BackupBaseDatos
                                            # Example: Procedure:OnboardingEmpleado

  # ┌─ PROCEDURE DEFINITION ────────────────┐
  definition:
    name: "[Procedure Name]"                # REQUIRED: Human-readable name
                                           # Example: "Recuperación de contraseña usuario"
                                           # Example: "Backup diario base de datos"
    
    description: >                         # REQUIRED: What this procedure accomplishes
      [Detailed description of the procedure's purpose and outcome]
      # Example: "Procedimiento estándar para restablecer contraseñas de usuarios..."
    
    type: [operational|administrative|technical|emergency|compliance] # REQUIRED: Procedure type
    
    category: [routine|exception|emergency|maintenance] # REQUIRED: Procedure category
                                           # - routine: Regular operational procedure
                                           # - exception: Handles exceptional situations
                                           # - emergency: Emergency response procedure
                                           # - maintenance: System/process maintenance
    
    criticality: [low|medium|high|critical] # REQUIRED: How critical this procedure is
    
    frequency: [continuous|daily|weekly|monthly|quarterly|annual|asNeeded] # REQUIRED: How often executed

  # ┌─ FOUNDATIONAL COMPOSITION ────────────┐
  uses:                                    # REQUIRED: Composed from foundational artifacts
    intent: Intent:[IntentId]              # REQUIRED: Purpose this procedure serves
                                          # Example: Intent:SeguridadSistemas
    
    context: Context:[ContextId]           # REQUIRED: Context where this procedure applies
                                          # Example: Context:OperacionesTI
    
    authority: Authority:[AuthorityId]     # REQUIRED: Who has authority over this procedure
                                          # Example: Authority:AdministradorSistemasAuthority

  # ┌─ SCOPE & APPLICABILITY ───────────────┐
  scope:
    appliesTo:                             # REQUIRED: What this procedure applies to
      systems:                             # Systems involved
        - system: "[System name]"          # Example: "Sistema de autenticación"
          role: "[System role]"            # Example: "Target system"
          owner: Actor:[SystemOwnerActorId] # Example: Actor:AdministradorSistemas
      
      actors:                              # Actors involved
        - Actor:[ActorId]                  # Example: Actor:UsuarioFinal
        - Actor:[ActorId]                  # Example: Actor:SoporteTecnico
      
      areas:                               # Organizational areas
        - Area:[AreaId]                    # Example: Area:TecnologiaInformacion
    
    triggers:                              # REQUIRED: What triggers this procedure
      - trigger: "[Trigger description]"   # Example: "Usuario reporta olvido de contraseña"
        source: "[Trigger source]"         # Example: "Sistema de tickets"
        condition: "[Trigger condition]"   # Example: "Ticket categorizado como 'password reset'"
      # Add more triggers as needed
    
    preconditions:                         # REQUIRED: What must be true before execution
      - condition: "[Precondition]"        # Example: "Usuario debe estar registrado en sistema"
        verification: "[How to verify]"    # Example: "Verificar existencia en directorio LDAP"
      # Add more preconditions as needed

  # ┌─ DETAILED STEPS ──────────────────────┐
  steps:
    preparation:                           # REQUIRED: Preparation steps
      - step: "[Preparation step]"         # Example: "Verificar identidad del usuario"
        responsible: Actor:[ActorId]       # Example: Actor:SoporteTecnico
        duration: "[Expected duration]"    # Example: "5 minutos"
        tools: []                         # Tools needed for this step
        verification: "[How to verify completion]" # Example: "Documento de identidad validado"
      # Add more preparation steps as needed
    
    execution:                             # REQUIRED: Main execution steps
      - step: 1
        actor: Actor:[ActorId] → "[Action description]" # Example: Actor:SoporteTecnico → "Generar token temporal"
        inputs: [Actor:[ProviderActorId] → "[Input description]"] # Example: [Actor:UsuarioFinal → "Solicitud verificada"]
        outputs: [Actor:[ConsumerActorId] ← "[Output description]"] # Example: [Actor:SistemaEmail ← "Token generado"]
        duration: "[Expected duration]"    # Example: "2 minutos"
        tools: []                         # Tools used in this step
        validation: "[Validation required]" # Example: "Token debe ser único y válido por 24h"
      
      - step: 2
        actor: Actor:[ActorId] → "[Action description]" # Example: Actor:SistemaEmail → "Enviar email con token"
        dependsOn: [1]                     # Previous steps that must complete
        inputs: [Actor:[ProviderActorId] → "[Input description]"] # Example: [Actor:SoporteTecnico → "Token + email usuario"]
        outputs: [Actor:[ConsumerActorId] ← "[Output description]"] # Example: [Actor:UsuarioFinal ← "Email con instrucciones"]
        duration: "[Expected duration]"    # Example: "1 minuto"
        tools: []                         # Tools used in this step
        validation: "[Validation required]" # Example: "Email debe ser entregado exitosamente"
      # Add more execution steps as needed
    
    completion:                            # REQUIRED: Completion steps
      - step: "[Completion step]"          # Example: "Verificar que usuario puede acceder"
        responsible: Actor:[ActorId]       # Example: Actor:SoporteTecnico
        duration: "[Expected duration]"    # Example: "3 minutos"
        verification: "[How to verify]"    # Example: "Usuario confirma acceso exitoso"
      # Add more completion steps as needed
    
    postconditions:                        # REQUIRED: What must be true after execution
      - condition: "[Postcondition]"       # Example: "Usuario tiene acceso con nueva contraseña"
        verification: "[How to verify]"    # Example: "Login exitoso registrado en logs"
      # Add more postconditions as needed

  # ┌─ ROLES & RESPONSIBILITIES ────────────┐
  roles:
    primary:                               # REQUIRED: Primary responsible actors
      - Actor:[ActorId]                    # Example: Actor:SoporteTecnico
        responsibility: "[Primary responsibility]" # Example: "Execute procedure end-to-end"
        authority: "[Decision authority]"   # Example: "Can approve password reset"
    
    supporting:                            # OPTIONAL: Supporting actors
      - Actor:[ActorId]                    # Example: Actor:AdministradorSistemas
        responsibility: "[Supporting responsibility]" # Example: "Provide system access"
        availability: "[When available]"   # Example: "Business hours"
    
    approvals:                             # OPTIONAL: Approval requirements
      - step: [step_number]                # Which step requires approval
        approver: Actor:[ApproverActorId]  # Example: Actor:SupervisorSoporte
        criteria: "[Approval criteria]"    # Example: "High-privilege account reset"
        timeline: "[Approval timeline]"    # Example: "Within 1 hour"
    
    notifications:                         # OPTIONAL: Who gets notified
      - event: "[Notification trigger]"    # Example: "Procedure completed"
        notifies: Actor:[NotifiedActorId]  # Example: Actor:UsuarioFinal
        method: "[Notification method]"    # Example: "Email confirmation"
        timing: "[When to notify]"         # Example: "Immediately upon completion"

  # ┌─ RESOURCES & TOOLS ───────────────────┐
  resources:
    systems:                               # REQUIRED: Systems used
      - system: "[System name]"            # Example: "Active Directory"
        purpose: "[System purpose]"        # Example: "User authentication management"
        access: "[Access requirements]"    # Example: "Admin privileges required"
        owner: Actor:[SystemOwnerActorId]  # Example: Actor:AdministradorSistemas
    
    tools:                                 # REQUIRED: Tools needed
      - tool: "[Tool name]"                # Example: "Password reset utility"
        purpose: "[Tool purpose]"          # Example: "Generate secure temporary passwords"
        location: "[Tool location]"        # Example: "Admin toolkit server"
        license: "[License requirements]"  # Example: "Admin license required"
    
    documentation:                         # REQUIRED: Documentation needed
      - document: "[Document name]"        # Example: "Password policy guidelines"
        purpose: "[Document purpose]"      # Example: "Ensure compliance with security policy"
        location: "[Document location]"    # Example: "Internal wiki"
        version: "[Document version]"      # Example: "v2.1"
    
    templates:                             # OPTIONAL: Templates used
      - template: "[Template name]"        # Example: "Password reset email template"
        purpose: "[Template purpose]"      # Example: "Standardize user communication"
        location: "[Template location]"    # Example: "Email system templates"

  # ┌─ QUALITY & COMPLIANCE ────────────────┐
  quality:
    standards:                             # REQUIRED: Standards to follow
      - standard: "[Standard name]"        # Example: "NIST Cybersecurity Framework"
        requirement: "[Specific requirement]" # Example: "Strong authentication requirements"
        compliance: [mandatory|recommended] # Example: mandatory
    
    controls:                              # REQUIRED: Quality controls
      - control: "[Control description]"   # Example: "Verify user identity before reset"
        type: [preventive|detective|corrective] # Example: preventive
        implementation: "[How implemented]" # Example: "Multi-factor identity verification"
        responsible: Actor:[ControlOwnerActorId] # Example: Actor:SoporteTecnico
    
    metrics:                               # REQUIRED: Quality metrics
      - metric: "[Quality metric]"         # Example: "Password reset success rate"
        target: "[Target value]"           # Example: "> 95%"
        measurement: Indicator:[IndicatorId] # Example: Indicator:ExitoRecuperacionPassword
        frequency: "[Measurement frequency]" # Example: "Weekly"
    
    validation:                            # REQUIRED: How to validate execution
      method: "[Validation method]"        # Example: "Automated testing + manual verification"
      frequency: "[Validation frequency]"  # Example: "Each execution"
      responsible: Actor:[ValidatorActorId] # Example: Actor:SoporteTecnico

  # ┌─ EXCEPTION HANDLING ──────────────────┐
  exceptions:
    commonIssues:                          # REQUIRED: Common issues and solutions
      - issue: "[Issue description]"       # Example: "Email address not found in system"
        cause: "[Likely cause]"            # Example: "User account deactivated"
        solution: "[Solution steps]"       # Example: "Verify account status, reactivate if needed"
        responsible: Actor:[HandlerActorId] # Example: Actor:AdministradorSistemas
        escalation: Actor:[EscalationActorId] # Example: Actor:SupervisorSoporte
    
    emergencyProcedures:                   # OPTIONAL: Emergency procedures
      - scenario: "[Emergency scenario]"   # Example: "System unavailable during business hours"
        procedure: "[Emergency procedure]" # Example: "Use backup authentication system"
        responsible: Actor:[EmergencyActorId] # Example: Actor:AdministradorSistemas
        notification: Actor:[NotificationActorId] # Example: Actor:DirectorTI
    
    escalation:                            # REQUIRED: Escalation procedures
      - trigger: "[Escalation trigger]"    # Example: "Unable to verify user identity"
        escalateTo: Actor:[EscalationActorId] # Example: Actor:SupervisorSoporte
        timeline: "[Escalation timeline]"  # Example: "Immediately"
        information: "[Information to provide]" # Example: "User details + verification attempts"

  # ┌─ MONITORING & MEASUREMENT ────────────┐
  monitoring:
    execution:                             # REQUIRED: Execution monitoring
      tracking: "[How execution is tracked]" # Example: "Ticket system + audit logs"
      metrics: []                          # Key execution metrics
      alerts: []                           # When to generate alerts
    
    performance:                           # REQUIRED: Performance monitoring
      - metric: "[Performance metric]"     # Example: "Average completion time"
        target: "[Target value]"           # Example: "< 15 minutes"
        measurement: "[How measured]"      # Example: "Timestamp analysis"
        responsible: Actor:[MonitorActorId] # Example: Actor:SupervisorSoporte
    
    compliance:                            # REQUIRED: Compliance monitoring
      - requirement: "[Compliance requirement]" # Example: "All resets must be logged"
        verification: "[How verified]"     # Example: "Automated log analysis"
        frequency: "[Verification frequency]" # Example: "Daily"
        responsible: Actor:[ComplianceActorId] # Example: Actor:AuditorInterno

  # ┌─ RELATIONSHIPS ───────────────────────┐
  relationships:
    implementsPolicies:                    # OPTIONAL: Policies this procedure implements
      - Policy:[PolicyId]                  # Example: Policy:SeguridadAcceso
        aspect: "[Implementation aspect]"  # Example: "Password reset controls"
    
    supportsProcesses:                     # OPTIONAL: Processes this procedure supports
      - Process:[ProcessId]                # Example: Process:GestionAccesoUsuarios
        role: "[Procedure role]"           # Example: "Exception handling"
    
    triggersEvents:                        # OPTIONAL: Events this procedure can trigger
      - Event:[EventId]                    # Example: Event:PasswordResetCompleted
        condition: "[Trigger condition]"   # Example: "Successful password reset"
    
    producesResults:                       # OPTIONAL: Results this procedure produces
      - Result:[ResultId]                  # Example: Result:AccesoUsuarioRestaurado
        conditions: "[Production conditions]" # Example: "Successful completion"
    
    relatedProcedures:                     # OPTIONAL: Related procedures
      - Procedure:[RelatedProcedureId]     # Example: Procedure:BloqueoUsuarioSospechoso
        relationship: "[Relationship type]" # Example: "Alternative procedure"

  # ┌─ CATEGORIZATION ──────────────────────┐
  categorization:
    domain: "[Business Domain]"            # OPTIONAL: Business domain
                                          # Example: "IT Operations"
    
    area: Area:[AreaId]                    # OPTIONAL: Organizational area
                                          # Example: Area:TecnologiaInformacion
    
    classification: [public|internal|confidential|restricted] # REQUIRED: Security classification
    
    automation: [manual|semiAutomated|automated] # OPTIONAL: Automation level

  # ┌─ METADATA ────────────────────────────┐
  metadata:
    version: "1.0.0"                      # Template version
    lastUpdated: "[YYYY-MM-DD]"          # Last update date
    status: [active|inactive|deprecated]  # Procedure status
    
    approvedBy: Actor:[ApproverActorId]    # Example: Actor:DirectorTI
    approvalDate: "[YYYY-MM-DD]"          # When procedure was approved
    effectiveDate: "[YYYY-MM-DD]"         # When procedure became effective
    
    tags: []                              # Optional tags for categorization
    
    notes: >                              # Optional additional notes
      [Any additional context or notes about this procedure]

# ────────────────────────────────────────────────────────────────────────────────

# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Use semantic references: Actor:Name, Process:Name, etc.
# 3. Define clear step-by-step instructions
# 4. Map all roles and responsibilities
# 5. Establish proper quality controls and monitoring
# 6. Validate using SOL extension in VSCode
# 7. Ensure all referenced artifacts exist 