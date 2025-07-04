# ===========================================
# SOL ARTIFACT TEMPLATE v2025.07
# Type: Authority (Support Artifact)
# ===========================================

# ✅ SEMANTIC VALIDATION (Updated by tools)
# ├─ 🟡 References: Check Actor: notation
# ├─ 🟡 Hierarchy: Validate organizational level
# ├─ 🟡 Scope: Define decision boundaries
# └─ 🟡 Legitimacy: Ensure proper backing

Authority:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourAuthorityNameInCamelCase]        # REQUIRED: Unique identifier (e.g., ConsejoDirectivoAuthority)
    version: "1.0.0"                         # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                  # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"             # REQUIRED: Last modification date
    status: draft                            # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                  # REQUIRED: Who created this authority
    reviewedBy: []                           # OPTIONAL: Array of reviewers when ready
  
  # ┌─ AUTHORITY DEFINITION ─────────────────┐
  level: [strategic|tactical|operational]    # REQUIRED: Authority level
                                            # - strategic: Board/C-level decisions
                                            # - tactical: Department/management decisions  
                                            # - operational: Daily/process decisions
  
  actor: Actor:[ActorId]                     # REQUIRED: Who has this authority
                                            # Example: Actor:ConsejoDirectivo
                                            # Example: Actor:DirectorTecnologia
                                            # Example: Actor:AdministradorSistema
  
  scope: >                                   # REQUIRED: What decisions this authority covers
    [Replace with specific scope of authority.
    Should clearly define decision boundaries and limits.
    Example: "Decisiones estratégicas corporativas incluyendo
    definición de visión, asignación de recursos mayores,
    y aprobación de iniciativas de transformación digital."]
  
  # ┌─ LEGITIMACY ───────────────────────────┐
  legitimacy:
    basedOn: [Policy|Principle|Vision|Legal]:[ReferenceId] # REQUIRED: What grants this authority
                                            # Example: Policy:EstructuraGobiernoCorporativo
                                            # Example: Legal:EstatutosSociales
    
    grantedBy: Actor:[GrantingActorId]       # REQUIRED: Who granted this authority
                                            # Example: Actor:JuntaAccionistas
                                            # Example: Actor:DirectorGeneral
    
    legalFramework:                          # OPTIONAL: Legal/regulatory framework
      - framework: "[Legal framework]"      # Example: "Código de Gobierno Corporativo"
        reference: "[Specific reference]"   # Example: "Artículo 25 - Funciones del Consejo"
        jurisdiction: "[Jurisdiction]"      # Example: "México"
      # Add more frameworks as needed
  
  # ┌─ VALIDITY ─────────────────────────────┐
  validity:
    validFrom: "[YYYY-MM-DD]"               # REQUIRED: When this authority becomes active
    validUntil: "[YYYY-MM-DD]"              # OPTIONAL: When this authority expires (if applicable)
    
    reviewSchedule:                          # OPTIONAL: When to review this authority
      frequency: "[Review frequency]"       # Example: "Anual"
      nextReview: "[YYYY-MM-DD]"           # Example: "2025-12-31"
      reviewedBy: Actor:[ReviewActorId]     # Example: Actor:ComiteGobierno
    
    revocationConditions:                    # OPTIONAL: Under what conditions this authority can be revoked
      - condition: "[Revocation condition]" # Example: "Cambio en estructura organizacional"
        triggeredBy: "[Who can trigger]"    # Example: "Junta de Accionistas"
      # Add more conditions as needed
  
  # ┌─ DELEGATION ───────────────────────────┐
  delegation:
    canDelegate: true                        # REQUIRED: Whether this authority can be delegated
    
    delegatedTo:                             # OPTIONAL: Current delegations
      - delegatee: Actor:[DelegateeActorId]  # Example: Actor:DirectorTecnologia
        scope: "[Delegated scope]"          # Example: "Decisiones tecnológicas operativas"
        limitations: []                     # Any limitations on delegated authority
        validUntil: "[YYYY-MM-DD]"         # When delegation expires
      # Add more delegations as needed
    
    delegationRules:                         # OPTIONAL: Rules for delegation
      - rule: "[Delegation rule]"           # Example: "Máximo 2 niveles de delegación"
        rationale: "[Why this rule]"        # Example: "Mantener accountability"
      # Add more rules as needed
  
  # ┌─ DECISION BOUNDARIES ──────────────────┐
  decisionBoundaries:
    canDecideOn:                             # REQUIRED: What this authority can decide
      - area: "[Decision area]"             # Example: "Estrategia tecnológica"
        scope: "[Specific scope]"          # Example: "Tecnologías mayores a $100K"
        limitations: []                     # Any limitations within this area
      # Add more decision areas as needed
    
    cannotDecideOn:                          # OPTIONAL: Explicit exclusions
      - area: "[Excluded area]"             # Example: "Contratación personal"
        reason: "[Why excluded]"            # Example: "Responsabilidad de RRHH"
      # Add more exclusions as needed
    
    escalationPath:                          # OPTIONAL: When to escalate decisions
      - scenario: "[Escalation scenario]"   # Example: "Decisiones > $1M"
        escalateTo: Actor:[EscalationActorId] # Example: Actor:ConsejoDirectivo
        process: "[Escalation process]"     # Example: "Solicitud formal con justificación"
      # Add more escalation scenarios as needed
  
  # ┌─ ACCOUNTABILITY ───────────────────────┐
  accountability:
    reportingTo: Actor:[SuperiorActorId]     # REQUIRED: Who this authority reports to
                                            # Example: Actor:JuntaAccionistas
    
    reportingSchedule:                       # OPTIONAL: Reporting requirements
      frequency: "[Reporting frequency]"    # Example: "Trimestral"
      format: "[Report format]"            # Example: "Informe ejecutivo"
      topics: []                           # What must be reported
    
    auditRequirements:                       # OPTIONAL: Audit requirements
      - requirement: "[Audit requirement]"  # Example: "Auditoría anual de decisiones"
        auditor: Actor:[AuditorActorId]     # Example: Actor:AuditorInterno
        frequency: "[Audit frequency]"      # Example: "Anual"
      # Add more audit requirements as needed
  
  # ┌─ REUSABILITY ─────────────────────────┐
  reusability:
    usedBy:                                  # GENERATED: Artifacts that reference this authority
      - Vision:[VisionId]                    # Example: Vision:LiderazgoTecnologico
      - Policy:[PolicyId]                    # Example: Policy:GobiernoTI
      # This section is updated automatically by tools
    
    relatedAuthorities:                      # OPTIONAL: Related authorities
      - Authority:[RelatedAuthorityId]       # Example: Authority:DirectorTecnologiaAuthority
        relationship: "[Relationship type]" # Example: "Delegates to"
      # Add more related authorities as needed
  
  # ┌─ CATEGORIZATION ───────────────────────┐
  classification:
    domain: "[Authority Domain]"             # OPTIONAL: Domain of authority
                                            # Example: "Gobierno Corporativo"
    authorityType: [executive|legislative|judicial|administrative] # OPTIONAL: Type of authority
    tags:                                   # OPTIONAL: Searchable tags
      - "[tag1]"                           # Example: "gobierno"
      - "[tag2]"                           # Example: "estrategia"
      - "[tag3]"                           # Example: "tecnologia"
      # Add more tags as needed
    maturity: initial                       # OPTIONAL: [initial|developing|defined|managed|optimizing]

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Use semantic references: Actor:Name, Policy:Name, etc.
# 3. Clearly define scope and boundaries
# 4. Establish legitimacy and legal backing
# 5. Define delegation rules if applicable
# 6. Validate using SOL extension in VSCode
# 7. This authority can be referenced by multiple artifacts
# =========================================== 