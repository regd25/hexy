# ===========================================
# SOL ARTIFACT TEMPLATE v2025.07
# Type: Vision (Strategic Artifact)
# ===========================================

# ✅ COMPOSITION VALIDATION (Updated by tools)
# ├─ 🟡 Intent: Reference to Intent.[IntentId] (REQUIRED)
# ├─ 🟡 Context: Reference to Context.[ContextId] (REQUIRED)  
# ├─ 🟡 Authority: Reference to Authority.[AuthorityId] (REQUIRED)
# ├─ 🟡 Evaluation: Reference to Evaluation.[EvaluationId] (RECOMMENDED)
# └─ 🟡 Vision Content: Specific vision elements defined

Vision:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourVisionNameInCamelCase]              # REQUIRED: Unique identifier (e.g., LiderazgoTecnologicoVision)
    version: "1.0.0"                            # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                     # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"                # REQUIRED: Last modification date
    status: draft                               # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                     # REQUIRED: Who created this vision
    reviewedBy: []                              # OPTIONAL: Array of reviewers when ready
  
  # ┌─ FOUNDATIONAL COMPOSITION ─────────────┐
  uses:                                         # REQUIRED: Composed from foundational artifacts
    intent: Intent:[IntentId]                   # REQUIRED: Strategic intent this vision embodies
                                               # Example: Intent:TransformacionDigitalIntent
    
    context: Context:[ContextId]                # REQUIRED: Context where this vision applies
                                               # Example: Context:MercadoLatamContext
    
    authority: Authority:[AuthorityId]          # REQUIRED: Who has authority over this vision
                                               # Example: Authority:ConsejoDirectivoAuthority
    
    evaluation: Evaluation:[EvaluationId]       # RECOMMENDED: How success will be evaluated
                                               # Example: Evaluation:IndicadoresEstrategicosEvaluation
  
  # ┌─ VISION-SPECIFIC CONTENT ──────────────┐
  aspirationalStatement: >                      # REQUIRED: Inspiring vision statement
    [Replace with your aspirational vision statement.
    Should complement the intent with inspirational language.
    Focus on the desired future state and impact.
    Example: "Ser reconocidos como el catalizador principal de la
    transformación digital sustentable en América Latina, creando
    ecosistemas tecnológicos que generen valor compartido."]
  
  businessImpact:                               # REQUIRED: Expected strategic outcomes
    - impact: "[Strategic impact]"              # Example: "Liderazgo en mercado LATAM"
      description: "[Impact description]"       # Example: "Posición #1 en tecnología sustentable"
      timeframe: "[Achievement timeframe]"      # Example: "2030"
      measuredBy: Indicator:[IndicatorId]       # Example: Indicator:ParticipacionMercado
    # Add more impacts as needed
  
  strategicPillars:                             # REQUIRED: Key pillars supporting the vision
    - pillar: "[Pillar name]"                   # Example: "InnovacionSustentable"
      description: >                            # Example: "Desarrollo de soluciones tech verdes"
        [Pillar description explaining its role]
      enabledBy:                                # OPTIONAL: What enables this pillar
        - Process:[ProcessId]                   # Example: Process:InnovacionProductos
        - Policy:[PolicyId]                     # Example: Policy:InnovacionSustentable
    # Add more pillars as needed
  
  # ┌─ ORGANIZATIONAL ALIGNMENT ─────────────┐
  alignment:
    strategicObjectives:                        # OPTIONAL: Connected strategic objectives
      - objective: "[Objective description]"    # Example: "Expansión LATAM sustentable"
        supportedBy: Vision:[RelatedVisionId]   # Example: Vision:ExpansionMercados
        measuredBy: Indicator:[IndicatorId]     # Example: Indicator:CrecimientoRegional
    # Add more objectives as needed
    
    organizationalValues:                       # OPTIONAL: Values this vision embodies
      - value: "[Value name]"                   # Example: "Sustentabilidad"
        manifestation: "[How vision shows this]"# Example: "Soluciones tech carbono-neutrales"
      # Add more values as needed
  
  # ┌─ IMPLEMENTATION GUIDANCE ──────────────┐
  implementation:
    keyInitiatives:                             # OPTIONAL: Major initiatives to achieve vision
      - initiative: "[Initiative name]"         # Example: "Programa Transformación Verde"
        description: "[Initiative description]" # Example: "Migración a tech sustentable"
        timeline: "[Implementation timeline]"   # Example: "18 meses"
        ownedBy: Actor:[ActorId]               # Example: Actor:DirectorInnovacion
    # Add more initiatives as needed
    
    enablers:                                   # OPTIONAL: Critical enablers needed
      - enabler: "[Enabler type]"              # Example: "Capacidades tecnológicas"
        description: "[What's needed]"          # Example: "Expertise en green tech"
        providedBy: Area:[AreaId]              # Example: Area:DesarrolloTecnologico
    # Add more enablers as needed
    
    risks:                                      # OPTIONAL: Key risks to vision achievement
      - risk: "[Risk description]"             # Example: "Cambios regulatorios ambientales"
        impact: [high|medium|low]              # Risk impact level
        mitigation: "[Mitigation approach]"    # Example: "Monitoreo regulatorio continuo"
    # Add more risks as needed
  
  # ┌─ STAKEHOLDER IMPACT ───────────────────┐
  stakeholderValue:                            # OPTIONAL: Value created for each stakeholder
    - stakeholder: Actor:[StakeholderActorId]  # Example: Actor:ClientesCorporativos
      valueProposition: "[Value for them]"     # Example: "Soluciones tech más eficientes"
      benefits: []                            # List of specific benefits
    # Add more stakeholders as needed
  
  # ┌─ TRACEABILITY ─────────────────────────┐
  relationships:                               # OPTIONAL: Connections to other artifacts
    derivedFrom:                               # Parent visions or strategies
      - Vision:[ParentVisionId]                # Example: Vision:EstrategiaCorporativa
    
    supportsVisions:                           # Child or supporting visions
      - Vision:[SupportedVisionId]             # Example: Vision:ExcelenciaOperacional
    
    enabledBy:                                 # Artifacts that enable this vision
      - Policy:[PolicyId]                      # Example: Policy:GobiernoInnovacion
      - Process:[ProcessId]                    # Example: Process:GestionEstrategica
    
    measuredBy:                                # Indicators measuring this vision
      - Indicator:[IndicatorId]                # Example: Indicator:IndiceLiderazgoTech
    
    constrainedBy:                             # Policies or principles that constrain
      - Policy:[ConstraintPolicyId]            # Example: Policy:SustentabilidadAmbiental
  
  # ┌─ CATEGORIZATION ───────────────────────┐
  classification:
    domain: "[Strategic Domain]"                # OPTIONAL: Strategic domain
                                               # Example: "TransformacionDigital"
    area: Area:[OrganizationalAreaId]          # OPTIONAL: Organizational area
                                               # Example: Area:EstrategiaEmpresarial
    scope: [global|regional|national|local]     # OPTIONAL: Geographic scope
    horizon: [short|medium|long]               # OPTIONAL: Time horizon (short: 1-2yr, medium: 3-5yr, long: 5-10yr)
    tags:                                      # OPTIONAL: Searchable tags
      - "[tag1]"                              # Example: "transformacion"
      - "[tag2]"                              # Example: "sustentabilidad"
      - "[tag3]"                              # Example: "liderazgo"
      # Add more tags as needed
    maturity: initial                          # OPTIONAL: [initial|developing|defined|managed|optimizing]

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Create referenced foundational artifacts first:
#    - Intent.[IntentId] - Strategic intent
#    - Context.[ContextId] - Operating context
#    - Authority.[AuthorityId] - Decision authority
#    - Evaluation.[EvaluationId] - Success metrics
# 3. Use semantic references: Actor:Name, Area:Name, etc.
# 4. Focus on aspirational and strategic content
# 5. Define clear business impact and pillars
# 6. Validate using SOL extension in VSCode
# 7. Ensure all referenced artifacts exist
# =========================================== 