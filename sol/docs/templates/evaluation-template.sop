# ===========================================
# SOL ARTIFACT TEMPLATE v2025.07
# Type: Evaluation (Foundational Artifact)
# ===========================================

# ✅ SEMANTIC VALIDATION (Updated by tools)
# ├─ 🟡 References: Check Indicator: notation
# ├─ 🟡 Measurability: Ensure criteria are measurable
# ├─ 🟡 Methods: Define clear evaluation methods
# └─ 🟡 Reusability: Ensure DRY compliance

Evaluation:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourEvaluationNameInCamelCase]       # REQUIRED: Unique identifier (e.g., IndicadoresEstrategicosEvaluation)
    version: "1.0.0"                         # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                  # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"             # REQUIRED: Last modification date
    status: draft                            # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                  # REQUIRED: Who created this evaluation
    reviewedBy: []                           # OPTIONAL: Array of reviewers when ready
  
  # ┌─ EVALUATION DEFINITION ────────────────┐
  expected: >                                # REQUIRED: Expected outcome or state
    [Replace with clear expected result.
    Should be specific and measurable.
    Example: "Posicionamiento como líder reconocido
    en tecnología sustentable en LATAM, con participación
    de mercado superior al 25% y reconocimiento top-3."]
  
  method: >                                  # REQUIRED: How evaluation will be conducted
    [Replace with specific evaluation method.
    Should describe the approach and process.
    Example: "Evaluación anual basada en indicadores
    estratégicos cuantitativos y cualitativos, con
    revisión trimestral de avance y ajustes."]
  
  frequency: "[Evaluation frequency]"        # REQUIRED: How often evaluation occurs
                                            # Example: "Anual con revisiones trimestrales"
                                            # Example: "Mensual"
                                            # Example: "Continua con reportes semanales"
  
  # ┌─ CRITERIA ─────────────────────────────┐
  criteria:
    quantitative:                            # OPTIONAL: Quantitative success criteria
      - criterion:
          metric: "[Metric name]"           # Example: "participacion-mercado-latam"
          threshold: "[Threshold value]"    # Example: "> 25%"
          measurement: Indicator:[IndicatorId] # Example: Indicator:ParticipacionMercadoLatam
          weight: [number]                  # Example: 0.4 (40% weight)
          target: "[Target value]"          # Example: "30%"
          baseline: "[Baseline value]"      # Example: "15% actual"
      # Add more quantitative criteria as needed
    
    qualitative:                             # OPTIONAL: Qualitative success criteria
      - criterion:
          metric: "[Qualitative metric]"    # Example: "reconocimiento-marca-verde"
          assessment: "[Assessment method]"  # Example: "Encuestas de percepción de marca"
          threshold: "[Success threshold]"   # Example: "top-3 en rankings independientes"
          evaluatedBy: Actor:[EvaluatorId]  # Example: Actor:ComiteEstrategia
          weight: [number]                  # Example: 0.3 (30% weight)
      # Add more qualitative criteria as needed
    
    compliance:                              # OPTIONAL: Compliance criteria
      - criterion:
          requirement: "[Compliance requirement]" # Example: "Cumplimiento regulatorio ambiental"
          standard: "[Standard reference]"   # Example: "ISO 14001"
          threshold: "[Compliance level]"    # Example: "100% cumplimiento"
          verifiedBy: Actor:[VerifierActorId] # Example: Actor:AuditorExterno
          weight: [number]                  # Example: 0.3 (30% weight)
      # Add more compliance criteria as needed
  
  # ┌─ THRESHOLDS ───────────────────────────┐
  thresholds:
    excellent:                               # OPTIONAL: Excellence threshold
      value: "[Excellence value]"           # Example: "> 35% participación mercado"
      description: "[What constitutes excellence]" # Example: "Superación significativa de objetivos"
    
    good:                                    # REQUIRED: Good/target threshold
      value: "[Good value]"                 # Example: "25-35% participación mercado"
      description: "[What constitutes good performance]" # Example: "Cumplimiento de objetivos estratégicos"
    
    acceptable:                              # REQUIRED: Acceptable threshold
      value: "[Acceptable value]"           # Example: "20-25% participación mercado"
      description: "[What constitutes acceptable]" # Example: "Progreso hacia objetivos"
    
    poor:                                    # OPTIONAL: Poor performance threshold
      value: "[Poor value]"                 # Example: "< 20% participación mercado"
      description: "[What constitutes poor performance]" # Example: "Requiere plan de mejora"
      actionRequired: "[Required action]"    # Example: "Revisión estratégica inmediata"
  
  # ┌─ EVALUATION PROCESS ───────────────────┐
  process:
    phases:                                  # REQUIRED: Evaluation phases
      - phase: "[Phase name]"               # Example: "Recolección de datos"
        duration: "[Phase duration]"        # Example: "2 semanas"
        responsible: Actor:[ResponsibleActorId] # Example: Actor:EquipoAnalisis
        activities: []                      # List of activities in this phase
        deliverables: []                    # Expected deliverables
      # Add more phases as needed
    
    dataCollection:                          # REQUIRED: How data is collected
      sources:                              # Data sources
        - source: "[Data source]"           # Example: "Sistema CRM"
          type: "[Source type]"             # Example: "automated"
          responsible: Actor:[SourceActorId] # Example: Actor:AdministradorDatos
          frequency: "[Collection frequency]" # Example: "Semanal"
        # Add more sources as needed
      
      validation:                           # Data validation approach
        method: "[Validation method]"       # Example: "Auditoría cruzada de fuentes"
        validatedBy: Actor:[ValidatorActorId] # Example: Actor:ControllerFinanciero
    
    reporting:                               # REQUIRED: How results are reported
      format: "[Report format]"            # Example: "Dashboard + informe ejecutivo"
      audience:                             # Who receives the evaluation
        - Actor:[AudienceActorId]           # Example: Actor:ConsejoDirectivo
        - Area:[AudienceAreaId]             # Example: Area:Estrategia
      deliverables: []                      # What deliverables are produced
  
  # ┌─ STAKEHOLDERS ─────────────────────────┐
  stakeholders:
    evaluators:                              # REQUIRED: Who conducts the evaluation
      - Actor:[EvaluatorActorId]            # Example: Actor:DirectorEstrategia
      - Actor:[EvaluatorActorId]            # Example: Actor:AnalistaNegocio
    
    reviewers:                               # REQUIRED: Who reviews evaluation results
      - Actor:[ReviewerActorId]             # Example: Actor:ConsejoDirectivo
      - Actor:[ReviewerActorId]             # Example: Actor:ComiteEstrategia
    
    informedParties:                         # OPTIONAL: Who is informed of results
      - Actor:[InformedActorId]             # Example: Actor:EquipoEjecutivo
      - Area:[InformedAreaId]               # Example: Area:Comunicaciones
  
  # ┌─ IMPROVEMENT ──────────────────────────┐
  improvement:
    actionTriggers:                          # OPTIONAL: When to take action based on results
      - trigger: "[Action trigger]"         # Example: "Resultado por debajo de 'acceptable'"
        action: "[Required action]"         # Example: "Plan de mejora 90 días"
        responsible: Actor:[ActionActorId]  # Example: Actor:DirectorEstrategia
        timeline: "[Action timeline]"       # Example: "30 días para plan"
      # Add more triggers as needed
    
    continuousImprovement:                   # OPTIONAL: Continuous improvement approach
      reviewCycle: "[Review cycle]"         # Example: "Revisión anual de criterios"
      improvementProcess: "[Improvement process]" # Example: "Kaizen mensual"
      responsible: Actor:[ImprovementActorId] # Example: Actor:ComiteMejoraContinua
  
  # ┌─ REUSABILITY ─────────────────────────┐
  reusability:
    usedBy:                                  # GENERATED: Artifacts that reference this evaluation
      - Vision:[VisionId]                    # Example: Vision:LiderazgoTecnologico
      - Policy:[PolicyId]                    # Example: Policy:GestionRendimiento
      # This section is updated automatically by tools
    
    relatedEvaluations:                      # OPTIONAL: Related evaluations
      - Evaluation:[RelatedEvaluationId]     # Example: Evaluation:IndicadoresOperacionales
        relationship: "[Relationship type]" # Example: "Complementary"
      # Add more related evaluations as needed
    
    variants:                                # OPTIONAL: Evaluation variants
      - variant: "[Variant name]"           # Example: "Evaluación simplificada"
        differences: "[How it differs]"     # Example: "Solo criterios cuantitativos"
        usedFor: "[When to use variant]"    # Example: "Revisiones trimestrales"
      # Add more variants as needed
  
  # ┌─ CATEGORIZATION ───────────────────────┐
  classification:
    domain: "[Evaluation Domain]"            # OPTIONAL: Domain of evaluation
                                            # Example: "Estrategia Corporativa"
    evaluationType: [strategic|tactical|operational|compliance] # OPTIONAL: Type of evaluation
    complexity: [simple|moderate|complex]    # OPTIONAL: Evaluation complexity
    tags:                                   # OPTIONAL: Searchable tags
      - "[tag1]"                           # Example: "estrategia"
      - "[tag2]"                           # Example: "mercado"
      - "[tag3]"                           # Example: "sustentabilidad"
      # Add more tags as needed
    maturity: initial                       # OPTIONAL: [initial|developing|defined|managed|optimizing]

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Use semantic references: Indicator:Name, Actor:Name, etc.
# 3. Define clear, measurable criteria
# 4. Establish evaluation process and timeline
# 5. Define thresholds for different performance levels
# 6. Validate using SOL extension in VSCode
# 7. This evaluation can be referenced by multiple artifacts
# =========================================== 