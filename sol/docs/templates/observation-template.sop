# 👁️ OBSERVATION TEMPLATE - Operational Monitoring Point

Observation:[ObservationId]:                 # REQUIRED: Unique identifier for this observation
                                            # Example: Observation:TiempoRespuestaFueraRango
                                            # Example: Observation:CapacidadServidorAlta
                                            # Example: Observation:ErroresAutenticacion

  # ┌─ OBSERVATION DEFINITION ──────────────┐
  definition:
    name: "[Observation Name]"              # REQUIRED: Human-readable name
                                           # Example: "Tiempo de respuesta fuera de rango"
                                           # Example: "Capacidad de servidor alta"
    
    description: >                         # REQUIRED: What is being observed
      [Detailed description of what this observation monitors and why it matters]
      # Example: "Monitoreo continuo del tiempo de respuesta de APIs críticas..."
    
    type: [performance|security|availability|compliance|business|technical] # REQUIRED: Observation type
    
    criticality: [low|medium|high|critical] # REQUIRED: How critical this observation is
    
    category: [proactive|reactive|predictive] # REQUIRED: Observation category
                                           # - proactive: Monitors to prevent issues
                                           # - reactive: Responds to issues that occurred
                                           # - predictive: Forecasts potential issues

  # ┌─ MONITORING SCOPE ────────────────────┐
  scope:
    target: "[What is being monitored]"     # REQUIRED: Target of observation
                                           # Example: "API endpoints principales"
                                           # Example: "Servidores de aplicación"
    
    area: Area:[AreaId]                     # REQUIRED: Organizational area responsible
                                           # Example: Area:Tecnologia
                                           # Example: Area:Operaciones
    
    systems:                               # REQUIRED: Systems involved
      - system: "[System name]"            # Example: "Sistema de monitoreo APM"
        role: "[System role]"              # Example: "Fuente de métricas"
        owner: Actor:[SystemOwnerActorId]   # Example: Actor:AdministradorSistemas
      # Add more systems as needed
    
    boundaries:                            # REQUIRED: What's included/excluded
      included: []                         # What's included in monitoring
      excluded: []                         # What's explicitly excluded
      
    timeScope:                             # REQUIRED: Temporal scope
      continuous: [true|false]             # Whether monitoring is continuous
      schedule: "[Monitoring schedule]"    # Example: "24/7" or "Horario laboral"
      retention: "[Data retention period]" # Example: "90 días"

  # ┌─ MEASUREMENT CRITERIA ────────────────┐
  measurement:
    metric: "[Primary metric]"             # REQUIRED: What metric is measured
                                          # Example: "Tiempo de respuesta promedio"
                                          # Example: "Porcentaje CPU utilizado"
    
    unit: "[Measurement unit]"             # REQUIRED: Unit of measurement
                                          # Example: "milisegundos"
                                          # Example: "porcentaje"
    
    method: "[Measurement method]"         # REQUIRED: How measurement is taken
                                          # Example: "Promedio móvil 5 minutos"
                                          # Example: "Muestreo cada 30 segundos"
    
    baseline: "[Normal baseline]"          # REQUIRED: Normal/expected value
                                          # Example: "< 200ms"
                                          # Example: "< 70%"
    
    thresholds:                           # REQUIRED: Alert thresholds
      warning: "[Warning threshold]"       # Example: "> 300ms"
      critical: "[Critical threshold]"     # Example: "> 500ms"
      emergency: "[Emergency threshold]"   # Example: "> 1000ms"
    
    dataSource:                           # REQUIRED: Where data comes from
      primary: "[Primary data source]"     # Example: "Application Performance Monitoring"
      backup: "[Backup data source]"      # Example: "Server logs"
      responsible: Actor:[DataOwnerActorId] # Example: Actor:EquipoMonitoreo

  # ┌─ DETECTION & ALERTING ────────────────┐
  detection:
    frequency: "[Detection frequency]"     # REQUIRED: How often to check
                                          # Example: "Cada 30 segundos"
                                          # Example: "Continuo en tiempo real"
    
    algorithm: "[Detection algorithm]"     # REQUIRED: How anomalies are detected
                                          # Example: "Umbral fijo"
                                          # Example: "Desviación estándar"
                                          # Example: "Machine learning baseline"
    
    sensitivity: [low|medium|high]         # REQUIRED: Detection sensitivity
    
    falsePositiveRate: "[Expected rate]"   # OPTIONAL: Expected false positive rate
                                          # Example: "< 5%"

  alerting:
    immediate:                            # REQUIRED: Immediate alert configuration
      enabled: [true|false]               # Whether immediate alerts are enabled
      channels: []                        # Alert channels (email, SMS, Slack, etc.)
      recipients:                         # Who gets immediate alerts
        - Actor:[AlertRecipientActorId]   # Example: Actor:EquipoOperaciones
        - Actor:[AlertRecipientActorId]   # Example: Actor:AdministradorSistemas
    
    escalation:                           # REQUIRED: Escalation procedures
      - level: 1
        trigger: "[Escalation trigger]"   # Example: "Sin respuesta en 15 minutos"
        escalateTo: Actor:[EscalationActorId] # Example: Actor:SupervisorOperaciones
        method: "[Escalation method]"     # Example: "Llamada telefónica"
      
      - level: 2
        trigger: "[Next escalation trigger]" # Example: "Sin respuesta en 30 minutos"
        escalateTo: Actor:[EscalationActorId] # Example: Actor:DirectorTecnologia
        method: "[Escalation method]"     # Example: "SMS + llamada"
      # Add more escalation levels as needed
    
    suppression:                          # OPTIONAL: Alert suppression rules
      conditions: []                      # When to suppress alerts
      duration: "[Suppression duration]"  # Example: "Durante ventanas mantenimiento"

  # ┌─ RESPONSE PROCEDURES ─────────────────┐
  response:
    automated:                            # OPTIONAL: Automated responses
      - trigger: "[Response trigger]"     # Example: "Threshold crítico alcanzado"
        action: "[Automated action]"      # Example: "Reiniciar servicio automáticamente"
        system: "[System performing action]" # Example: "Orchestrator Kubernetes"
        fallback: "[Fallback if automation fails]" # Example: "Alerta manual inmediata"
      # Add more automated responses as needed
    
    manual:                               # REQUIRED: Manual response procedures
      firstResponse:                      # REQUIRED: First response procedures
        responsible: Actor:[ResponsibleActorId] # Example: Actor:EquipoOperaciones
        timeline: "[Response timeline]"   # Example: "< 5 minutos"
        actions: []                       # List of immediate actions to take
      
      investigation:                      # REQUIRED: Investigation procedures
        responsible: Actor:[InvestigatorActorId] # Example: Actor:EquipoSoporte
        timeline: "[Investigation timeline]" # Example: "< 30 minutos"
        process: Process:[ProcessId]      # Example: Process:InvestigacionIncidentes
      
      resolution:                         # REQUIRED: Resolution procedures
        responsible: Actor:[ResolverActorId] # Example: Actor:EquipoDesarrollo
        timeline: "[Resolution timeline]" # Example: "< 2 horas"
        escalation: Actor:[EscalationActorId] # Example: Actor:TechLead

  # ┌─ REPORTING & ANALYSIS ────────────────┐
  reporting:
    realTime:                             # REQUIRED: Real-time reporting
      dashboard: "[Dashboard location]"   # Example: "Grafana Operations Dashboard"
      access:                             # Who has access to real-time data
        - Actor:[ViewerActorId]           # Example: Actor:EquipoOperaciones
        - Actor:[ViewerActorId]           # Example: Actor:DirectorTecnologia
    
    periodic:                             # REQUIRED: Periodic reporting
      frequency: "[Report frequency]"     # Example: "Semanal"
      format: "[Report format]"           # Example: "Executive summary + detailed metrics"
      recipients:                         # Who receives periodic reports
        - Actor:[RecipientActorId]        # Example: Actor:DirectorTecnologia
        - Area:[RecipientAreaId]          # Example: Area:Estrategia
      
      content:                            # What's included in reports
        - "[Report content item]"         # Example: "Tendencias tiempo respuesta"
        - "[Report content item]"         # Example: "Análisis incidentes"
        # Add more content items as needed
    
    analysis:                             # REQUIRED: Data analysis
      trends: "[Trend analysis]"          # Example: "Análisis tendencias mensuales"
      patterns: "[Pattern analysis]"      # Example: "Detección patrones horarios"
      correlations: "[Correlation analysis]" # Example: "Correlación con carga sistema"
      responsible: Actor:[AnalystActorId] # Example: Actor:AnalistaDatos

  # ┌─ CONTINUOUS IMPROVEMENT ──────────────┐
  improvement:
    review:                               # REQUIRED: Regular review process
      frequency: "[Review frequency]"     # Example: "Mensual"
      participants:                       # Who participates in reviews
        - Actor:[ReviewerActorId]         # Example: Actor:EquipoOperaciones
        - Actor:[ReviewerActorId]         # Example: Actor:EquipoDesarrollo
      
      scope: []                           # What's reviewed (thresholds, procedures, etc.)
    
    optimization:                         # OPTIONAL: Optimization activities
      - area: "[Optimization area]"       # Example: "Reducción falsos positivos"
        responsible: Actor:[OptimizerActorId] # Example: Actor:EquipoMonitoreo
        timeline: "[Optimization timeline]" # Example: "Trimestral"
      # Add more optimization areas as needed
    
    evolution:                            # OPTIONAL: Evolution planning
      nextVersion: "[Next version plan]"  # Example: "Implementar ML para detección"
      timeline: "[Evolution timeline]"    # Example: "Próximos 6 meses"
      responsible: Actor:[EvolutionOwnerActorId] # Example: Actor:ArquitectoSistemas

  # ┌─ RELATIONSHIPS ───────────────────────┐
  relationships:
    triggersEvents:                       # OPTIONAL: Events this observation can trigger
      - Event:[EventId]                   # Example: Event:AlertaRendimientoSistema
        condition: "[Trigger condition]"  # Example: "Threshold crítico alcanzado"
    
    supportsIndicators:                   # OPTIONAL: Indicators this observation feeds
      - Indicator:[IndicatorId]           # Example: Indicator:DisponibilidadSistema
        contribution: "[How it contributes]" # Example: "Datos tiempo respuesta"
    
    relatedObservations:                  # OPTIONAL: Related observations
      - Observation:[RelatedObservationId] # Example: Observation:ErroresAplicacion
        relationship: "[Relationship type]" # Example: "Correlacionado"
    
    implementsPolicy:                     # OPTIONAL: Policies this observation implements
      - Policy:[PolicyId]                 # Example: Policy:MonitoreoSistemas
    
    enablesProcess:                       # OPTIONAL: Processes this observation enables
      - Process:[ProcessId]               # Example: Process:GestionIncidentes

  # ┌─ CATEGORIZATION ──────────────────────┐
  categorization:
    domain: "[Business Domain]"           # OPTIONAL: Business domain
                                         # Example: "Operaciones IT"
    
    layer: [infrastructure|platform|application|business] # OPTIONAL: Monitoring layer
    
    priority: [p1|p2|p3|p4]              # OPTIONAL: Business priority
    
    compliance:                          # OPTIONAL: Compliance requirements
      - "[Compliance requirement]"       # Example: "SOX IT controls"
      - "[Compliance requirement]"       # Example: "ISO 27001"

  # ┌─ METADATA ────────────────────────────┐
  metadata:
    version: "1.0.0"                     # Template version
    lastUpdated: "[YYYY-MM-DD]"         # Last update date
    status: [active|inactive|deprecated] # Observation status
    
    implementationDate: "[YYYY-MM-DD]"   # When observation was implemented
    
    tags: []                             # Optional tags for categorization
    
    notes: >                             # Optional additional notes
      [Any additional context or notes about this observation]

# ────────────────────────────────────────────────────────────────────────────────

# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Use semantic references: Actor:Name, Area:Name, etc.
# 3. Define clear measurement criteria and thresholds
# 4. Establish proper alerting and escalation procedures
# 5. Map all responsible parties and systems
# 6. Validate using SOL extension in VSCode
# 7. Ensure all referenced artifacts exist 