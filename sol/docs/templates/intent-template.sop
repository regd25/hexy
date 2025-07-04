# ===========================================
# SOL ARTIFACT TEMPLATE v2025.07
# Type: Intent (Foundational Artifact)
# ===========================================

# ✅ SEMANTIC VALIDATION (Updated by tools)
# ├─ 🟡 References: Check Actor: notation
# ├─ 🟡 Reusability: Ensure DRY compliance
# ├─ 🟡 Clarity: Statement must be measurable
# └─ 🟡 Scope: Define organizational boundaries

Intent:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourIntentNameInCamelCase]           # REQUIRED: Unique identifier (e.g., TransformacionDigitalIntent)
    version: "1.0.0"                         # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                  # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"             # REQUIRED: Last modification date
    status: draft                            # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                  # REQUIRED: Who created this intent
    reviewedBy: []                           # OPTIONAL: Array of reviewers when ready
  
  # ┌─ INTENT DEFINITION ────────────────────┐
  statement: >                               # REQUIRED: Clear, actionable intent statement
    [Replace with your specific intent statement.
    Should be clear, measurable, and outcome-focused.
    Example: "Liderar la transformación digital sustentable
    en el mercado latinoamericano de tecnología, estableciendo
    nuestra organización como referente en innovación responsable."]
  
  mode: [declare|require|propose|prohibit]   # REQUIRED: Intent mode
                                            # - declare: Statement of direction/vision
                                            # - require: Mandatory action/compliance
                                            # - propose: Recommended action/guideline  
                                            # - prohibit: Forbidden action/restriction
  
  priority: [low|medium|high|critical]       # REQUIRED: Business importance level
  
  # ┌─ ORGANIZATIONAL CONTEXT ──────────────┐
  organizational:
    area: Area:[AreaId]                      # REQUIRED: Organizational area (e.g., Area:EstrategiaEmpresarial)
    level: [strategic|tactical|operational]   # REQUIRED: Organizational level
    createdBy: Actor:[ActorId]               # REQUIRED: Who created this intent (e.g., Actor:ConsejoDirectivo)
    appliesTo:                               # REQUIRED: Who this intent applies to
      - Area:[AreaId]                        # Example: Area:Tecnologia
      - Actor:[ActorId]                      # Example: Actor:EquipoDesarrollo
      # Add more targets as needed
  
  # ┌─ MEASURABILITY ────────────────────────┐
  measurability:
    outcomeType: [quantitative|qualitative|mixed] # REQUIRED: Type of expected outcome
    measuredBy:                              # OPTIONAL: How success is measured
      - Indicator:[IndicatorId]              # Example: Indicator:ParticipacionMercadoLatam
      - Indicator:[IndicatorId]              # Example: Indicator:IndiceSustentabilidad
      # Add more indicators as needed
    
    successCriteria:                         # OPTIONAL: Specific success criteria
      - criterion: "[Specific measurable outcome]" # Example: "Alcanzar 25% participación mercado LATAM"
        timeframe: "[When this should be achieved]" # Example: "Para diciembre 2030"
        target: "[Specific target value]"    # Example: "> 25%"
      # Add more criteria as needed
  
  # ┌─ REUSABILITY ─────────────────────────┐
  reusability:
    usedBy:                                  # GENERATED: Artifacts that reference this intent
      - Vision:[VisionId]                    # Example: Vision:LiderazgoTecnologico
      - Policy:[PolicyId]                    # Example: Policy:InnovacionSustentable
      # This section is updated automatically by tools
    
    relatedIntents:                          # OPTIONAL: Related intents
      - Intent:[RelatedIntentId]             # Example: Intent:InnovacionResponsable
      - Intent:[RelatedIntentId]             # Example: Intent:ExcelenciaOperacional
      # Add more related intents as needed
  
  # ┌─ EVOLUTION ────────────────────────────┐
  evolution:
    derivedFrom: Intent:[ParentIntentId]     # OPTIONAL: Parent intent if this is a refinement
    supersedes: Intent:[PreviousIntentId]    # OPTIONAL: Previous intent this replaces
    expectedLifecycle: "[Duration]"          # OPTIONAL: How long this intent should remain valid
                                            # Example: "5-10 años estratégicos"
  
  # ┌─ CATEGORIZATION ───────────────────────┐
  classification:
    domain: "[Business Domain]"              # OPTIONAL: Business domain
                                            # Example: "Transformación Digital"
    tags:                                   # OPTIONAL: Searchable tags
      - "[tag1]"                           # Example: "transformacion"
      - "[tag2]"                           # Example: "sustentabilidad"
      - "[tag3]"                           # Example: "liderazgo"
      # Add more tags as needed
    maturity: initial                       # OPTIONAL: [initial|developing|defined|managed|optimizing]

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Use semantic references: Actor:Name, Area:Name, etc.
# 3. Ensure statement is clear and measurable
# 4. Define success criteria when applicable
# 5. Validate using SOL extension in VSCode
# 6. This intent can be referenced by multiple artifacts
# =========================================== 