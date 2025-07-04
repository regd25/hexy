# ===========================================
# SOL ARTIFACT TEMPLATE v2025.07
# Type: Context (Foundational Artifact)
# ===========================================

# ✅ SEMANTIC VALIDATION (Updated by tools)
# ├─ 🟡 References: Check Actor: notation
# ├─ 🟡 Scope: Define clear boundaries
# ├─ 🟡 Stakeholders: All relevant actors listed
# └─ 🟡 Reusability: Ensure DRY compliance

Context:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourContextNameInCamelCase]          # REQUIRED: Unique identifier (e.g., MercadoLatamContext)
    version: "1.0.0"                         # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                  # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"             # REQUIRED: Last modification date
    status: draft                            # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                  # REQUIRED: Who created this context
    reviewedBy: []                           # OPTIONAL: Array of reviewers when ready
  
  # ┌─ CONTEXT DEFINITION ───────────────────┐
  scope: >                                   # REQUIRED: Clear definition of boundaries
    [Replace with specific scope definition.
    Should clearly define where this context applies.
    Example: "Mercado latinoamericano de tecnología,
    incluyendo operaciones comerciales, desarrollo de productos
    y relaciones estratégicas en países de LATAM."]
  
  timeframe: "[Specific timeframe]"          # REQUIRED: When this context is relevant
                                            # Example: "5-10 años estratégicos (2025-2030)"
                                            # Example: "Operación continua 24/7"
                                            # Example: "Ciclo mensual de medición"
  
  # ┌─ STAKEHOLDERS ─────────────────────────┐
  stakeholders:
    primary:                                 # REQUIRED: Primary stakeholders
      - Actor:[PrimaryActorId]               # Example: Actor:ClientesCorporativos
      - Area:[PrimaryAreaId]                 # Example: Area:Ventas
      # Add more primary stakeholders as needed
    
    secondary:                               # OPTIONAL: Secondary stakeholders
      - Actor:[SecondaryActorId]             # Example: Actor:InversionistasEstrategicos
      - Area:[SecondaryAreaId]               # Example: Area:Marketing
      # Add more secondary stakeholders as needed
    
    external:                                # OPTIONAL: External stakeholders
      - Actor:[ExternalActorId]              # Example: Actor:ReguladoresAmbientales
      - "[External entity name]"            # Example: "Comunidades locales"
      # Add more external stakeholders as needed
  
  # ┌─ CONDITIONS ───────────────────────────┐
  conditions:
    prerequisites:                           # REQUIRED: Prerequisites for this context
      - condition: "[Prerequisite condition]" # Example: "mercado-tecnologico-en-crecimiento"
        description: "[Detailed description]" # Example: "Crecimiento sostenido del sector tech"
        required: true                       # Whether this is mandatory
      # Add more prerequisites as needed
    
    assumptions:                             # OPTIONAL: Assumptions made
      - assumption: "[Assumption]"           # Example: "regulaciones-ambientales-estrictas"
        description: "[Why this assumption]" # Example: "Tendencia hacia regulación ambiental"
        confidence: [high|medium|low]        # Confidence level in this assumption
      # Add more assumptions as needed
    
    constraints:                             # OPTIONAL: Known constraints
      - constraint: "[Constraint description]" # Example: "presupuesto-tecnologico-limitado"
        impact: [high|medium|low]            # Impact level of this constraint
        mitigation: "[Mitigation strategy]"  # How to address this constraint
      # Add more constraints as needed
  
  # ┌─ ENVIRONMENTAL FACTORS ────────────────┐
  environment:
    geographic:                              # OPTIONAL: Geographic scope
      regions: []                           # Example: ["LATAM", "Mexico", "Brasil"]
      markets: []                           # Example: ["B2B", "Enterprise", "SME"]
    
    temporal:                                # OPTIONAL: Temporal characteristics
      businessHours: "[Operating hours]"    # Example: "24/7 operación continua"
      seasonality: "[Seasonal factors]"     # Example: "Mayor demanda Q4"
      lifecycle: "[Context lifecycle]"      # Example: "5-año estratégico"
    
    technological:                           # OPTIONAL: Technology environment
      platforms: []                         # Example: ["Cloud", "Mobile", "Web"]
      standards: []                         # Example: ["ISO27001", "GDPR", "SOX"]
      dependencies: []                      # Example: ["Internet", "AWS", "APIs"]
  
  # ┌─ REUSABILITY ─────────────────────────┐
  reusability:
    usedBy:                                  # GENERATED: Artifacts that reference this context
      - Vision:[VisionId]                    # Example: Vision:LiderazgoTecnologico
      - Process:[ProcessId]                  # Example: Process:ExpansionMercados
      # This section is updated automatically by tools
    
    relatedContexts:                         # OPTIONAL: Related contexts
      - Context:[RelatedContextId]           # Example: Context:MercadoNorteamericano
      - Context:[RelatedContextId]           # Example: Context:InnovacionTecnologica
      # Add more related contexts as needed
    
    variants:                                # OPTIONAL: Context variants for different scenarios
      - variant: "[Variant name]"           # Example: "Mercado emergente"
        scope: "[Modified scope]"           # How scope changes for this variant
        conditions: []                      # Modified conditions for variant
      # Add more variants as needed
  
  # ┌─ VALIDATION ───────────────────────────┐
  validation:
    reviewCriteria:                          # OPTIONAL: How to validate this context
      - criterion: "[Review criterion]"     # Example: "Stakeholders identificados completos"
        method: "[Validation method]"       # Example: "Revisión con área comercial"
      # Add more criteria as needed
    
    updateTriggers:                          # OPTIONAL: When to update this context
      - trigger: "[Update trigger]"         # Example: "Cambio regulatorio significativo"
        action: "[Required action]"         # Example: "Revisar constraints y conditions"
      # Add more triggers as needed
  
  # ┌─ CATEGORIZATION ───────────────────────┐
  classification:
    domain: "[Business Domain]"              # OPTIONAL: Business domain
                                            # Example: "Expansión Mercados"
    contextType: [strategic|operational|tactical|technical] # OPTIONAL: Type of context
    tags:                                   # OPTIONAL: Searchable tags
      - "[tag1]"                           # Example: "mercado"
      - "[tag2]"                           # Example: "latam"
      - "[tag3]"                           # Example: "expansion"
      # Add more tags as needed
    maturity: initial                       # OPTIONAL: [initial|developing|defined|managed|optimizing]

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Use semantic references: Actor:Name, Area:Name, etc.
# 3. Clearly define scope boundaries
# 4. List all relevant stakeholders
# 5. Define prerequisites and assumptions
# 6. Validate using SOL extension in VSCode
# 7. This context can be referenced by multiple artifacts
# =========================================== 