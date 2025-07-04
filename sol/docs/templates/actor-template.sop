# ===========================================
# SOL ARTIFACT TEMPLATE v2025.06
# Type: Actor (Organizational Artifact)
# ===========================================

# ✅ VALIDATION STATUS (Updated automatically by tools)
# ├─ 🟡 Syntax: Template (Requires customization)
# ├─ 🟡 Schema: Template (Requires customization)
# ├─ 🟡 Dependencies: Template (Requires customization)
# ├─ 🟡 Review: Pending (Requires customization)
# └─ 🟡 Testing: Pending (Requires customization)

# ✅ COMPLETION CHECKLIST
# ├─ ⚠️  Intent defined (REQUIRED - Replace [placeholders])
# ├─ ⚠️  Context specified (REQUIRED - Replace [placeholders])
# ├─ ⚠️  Authority established (REQUIRED - Replace [placeholders])
# ├─ ⚠️  Actor definition (REQUIRED - Define actor role and responsibilities)
# └─ ⚠️  Interactions mapped (RECOMMENDED - Add actor relationships)

Actor:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourActorNameInCamelCase]              # REQUIRED: Unique identifier (e.g., ChiefTechnologyOfficer, SoftwareArchitect)
    version: "1.0.0"                           # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                    # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"               # REQUIRED: Last modification date
    status: draft                              # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                    # REQUIRED: Who created this actor definition
    reviewedBy: []                             # OPTIONAL: Array of reviewers when ready
  
  # ┌─ CORE FOUNDATIONAL BLOCKS ─────────────┐
  intent:
    statement: >                               # REQUIRED: Clear actor purpose
      [Replace with the purpose of this actor role.
      Explain what value this actor brings to the organization.
      Example: "Provide technical leadership and architectural guidance 
      to ensure high-quality software development and technology decisions."]
    mode: declare                              # REQUIRED: Always "declare" for actors
    priority: [low|medium|high|critical]       # REQUIRED: Strategic importance of this actor
  
  context:
    scope: "[Actor scope/domain]"              # REQUIRED: Where this actor operates
                                              # Example: "Technology development and architecture decisions"
    timeframe: "[Actor lifecycle]"             # REQUIRED: Actor validity period
                                              # Example: "Permanent organizational role"
    stakeholders:                             # REQUIRED: Who interacts with this actor
      - "[Internal stakeholder]"              # Example: "Development teams"
      - "[Management stakeholder]"            # Example: "Technology leadership"
      - "[External stakeholder]"              # Example: "Technology vendors"
      # Add more stakeholders as needed
    conditions:                               # OPTIONAL: When this actor is active
      - "[Operating condition]"               # Example: "During technology projects"
      - "[Decision condition]"                # Example: "When architectural decisions are needed"
      # Add more conditions as needed
  
  authority:
    actor: "[Role Authority]"                 # REQUIRED: Who defines this actor's authority
                                             # Example: "Chief Technology Officer"
    basedOn: "[Authority Basis]"             # REQUIRED: What defines this actor's authority
                                             # Example: "Technology Organization Charter"
    validFrom: "[YYYY-MM-DD]"                # REQUIRED: When this actor role becomes active
    validUntil: "[YYYY-MM-DD]"               # OPTIONAL: When this role expires (if applicable)
    level: [strategic|tactical|operational]   # REQUIRED: Authority level of this actor
  
  evaluation:                                # OPTIONAL: How actor performance is measured
    expected: "[Expected performance]"        # Example: "High-quality technical leadership and delivery"
    method: "[Evaluation method]"            # Example: "Quarterly performance review and 360 feedback"
    criteria:                                # Specific performance metrics
      - metric: "[performance-metric]"       # Example: "technical-decision-quality"
        threshold: "[target value]"         # Example: "> 90% positive feedback"
        description: "[What this measures]"  # Example: "Quality of technical decisions and guidance"
    frequency: "[Review frequency]"          # Example: "Quarterly performance review"
  
  # ┌─ ACTOR-SPECIFIC CONTENT ───────────────┐
  definition:                                # REQUIRED: Actor definition
    name: "[Actor Name]"                     # REQUIRED: Human-readable name
                                            # Example: "Software Architect"
    description: >                          # REQUIRED: What this actor represents
      [Actor description explaining their role, responsibilities, and context.
      Example: "Senior technical role responsible for software architecture 
      decisions, technical standards, and guiding development teams."]
    
    type: [internal|external|system]        # REQUIRED: Actor type
                                           # - internal: Employee, department, role within organization
                                           # - external: Customer, supplier, regulator, partner
                                           # - system: Automated system acting as an actor
    
    category: [individual|group|organization|system] # REQUIRED: Actor category
                                           # - individual: Single person role
                                           # - group: Team or committee
                                           # - organization: External organization
                                           # - system: Automated system
  
  organizational:                            # REQUIRED: Organizational context
    area: Area:[AreaId]                      # OPTIONAL: Organizational area this actor belongs to
                                            # Example: Area:Technology
    
    level: [strategic|tactical|operational]  # REQUIRED: Organizational level
                                            # - strategic: C-level, board, strategic decision makers
                                            # - tactical: Middle management, department heads
                                            # - operational: Individual contributors, specialists
    
    reportingStructure:                      # OPTIONAL: Reporting relationships
      reportsTo: Actor:[SuperiorActorId]     # Example: Actor:ChiefTechnologyOfficer
      manages:                               # Who reports to this actor
        - Actor:[SubordinateActorId]         # Example: Actor:SeniorDeveloper
        - Actor:[SubordinateActorId]         # Example: Actor:QAEngineer
        # Add more subordinates as needed
  
  responsibilities:                          # REQUIRED: Actor responsibilities
    primary:                                 # Primary responsibilities
      - responsibility: "[Primary responsibility]" # Example: "Define software architecture"
        scope: "[Responsibility scope]"      # Example: "All development projects"
        authority: Authority:[AuthorityId]   # Example: Authority:TechnicalArchitectureAuthority
      # Add more primary responsibilities as needed
    
    secondary:                               # Secondary responsibilities
      - responsibility: "[Secondary responsibility]" # Example: "Mentor junior developers"
        scope: "[Responsibility scope]"      # Example: "Development team"
      # Add more secondary responsibilities as needed
    
    accountabilities:                        # What this actor is accountable for
      - accountability: "[What they're accountable for]" # Example: "Technical code quality"
        measuredBy: Indicator:[IndicatorId]  # Example: Indicator:CodeQualityMetrics
        target: "[Target value]"            # Example: "> 80% test coverage"
      # Add more accountabilities as needed
  
  capabilities:                              # REQUIRED: Actor capabilities
    required:                                # Capabilities this actor must have
      - capability: "[Required capability]"  # Example: "Software architecture design"
        level: [basic|intermediate|advanced|expert] # Example: expert
        critical: [true|false]              # Whether this capability is critical
      # Add more required capabilities as needed
    
    preferred:                               # Preferred additional capabilities
      - capability: "[Preferred capability]" # Example: "Team leadership"
        level: [basic|intermediate|advanced|expert] # Example: advanced
      # Add more preferred capabilities as needed
    
    development:                             # Capabilities under development
      - capability: "[Developing capability]" # Example: "Cloud architecture"
        currentLevel: [basic|intermediate|advanced|expert] # Example: intermediate
        targetLevel: [basic|intermediate|advanced|expert]  # Example: expert
        timeline: "[Development timeline]"   # Example: "12 months"
      # Add more development areas as needed
  
  interactions:                              # REQUIRED: Actor interactions
    internal:                                # Internal organizational interactions
      - interactsWith: Actor:[ActorId]       # Example: Actor:ProductOwner
        frequency: [daily|weekly|monthly|quarterly|asNeeded] # Example: daily
        purpose: "[Interaction purpose]"     # Example: "Technical requirements alignment"
        channel: "[Communication channel]"   # Example: "Daily standup meetings"
      # Add more internal interactions as needed
    
    external:                                # External interactions
      - interactsWith: Actor:[ExternalActorId] # Example: Actor:TechnologyVendor
        frequency: [daily|weekly|monthly|quarterly|asNeeded] # Example: monthly
        purpose: "[Interaction purpose]"     # Example: "Technology evaluation and procurement"
        channel: "[Communication channel]"   # Example: "Vendor review meetings"
      # Add more external interactions as needed
    
    crossArea:                               # Cross-area interactions (via Events)
      - communicatesWith: Area:[AreaId]      # Example: Area:Sales
        via: Event:[EventId]                 # Example: Event:TechnicalSupportRequest
        purpose: "[Communication purpose]"   # Example: "Provide technical consultation"
      # Add more cross-area communications as needed
  
  decisionAuthority:                         # REQUIRED: Decision-making authority
    decisionRights:                          # What decisions this actor can make
      - decision: "[Decision type]"          # Example: "Technology stack selection"
        scope: "[Decision scope]"            # Example: "Assigned projects"
        limitations: []                      # Any limitations on decision authority
        escalation: Actor:[EscalationActorId] # Example: Actor:ChiefTechnologyOfficer
      # Add more decision rights as needed
    
    approvalRights:                          # What this actor can approve
      - approval: "[Approval type]"          # Example: "Code architecture reviews"
        scope: "[Approval scope]"            # Example: "Team repositories"
        criteria: []                         # Approval criteria
      # Add more approval rights as needed
    
    budgetAuthority:                         # Budget authority if any
      limit: "[Budget limit]"                # Example: "$25,000 USD"
      scope: "[Budget scope]"                # Example: "Development tools and training"
      approvalRequired: Actor:[ApproverActorId] # Example: Actor:ChiefTechnologyOfficer
  
  # ┌─ TRACEABILITY ─────────────────────────┐
  relationships:                             # OPTIONAL: Connections to other artifacts
    participatesIn:                          # Processes this actor participates in
      - Process:[ProcessId]                  # Example: Process:SoftwareDevelopment
        role: "[Actor's role in process]"    # Example: "Technical reviewer"
      # Add more process participations as needed
    
    implementsPolicies:                      # Policies this actor implements
      - Policy:[PolicyId]                    # Example: Policy:CodeQuality
      # Add more implemented policies as needed
    
    supportsVisions:                         # Visions this actor supports
      - Vision:[VisionId]                    # Example: Vision:TechnicalExcellence
      # Add more supported visions as needed
    
    usesAuthority:                           # Authority artifacts this actor uses
      - Authority:[AuthorityId]              # Example: Authority:TechnicalDecisionAuthority
      # Add more used authorities as needed
    
    generatesEvents:                         # Events this actor can generate
      - Event:[EventId]                      # Example: Event:ArchitectureReviewCompleted
      # Add more generated events as needed
    
    measurementBy:                           # Indicators measuring this actor
      - Indicator:[IndicatorId]              # Example: Indicator:TechnicalLeadershipEffectiveness
      # Add more measurement indicators as needed
  
  # ┌─ CLASSIFICATION ───────────────────────┐
  classification:
    category: organizacional                 # Always "organizacional" for actors
    domain: "[Actor Domain]"                 # Example: "Technology and Development"
    area: Area:[AreaId]                      # Example: Area:Technology
    level: [strategic|tactical|operational]  # Organizational level
    type: [leadership|management|contributor|specialist] # Actor type
    criticality: [low|medium|high|critical]  # Business criticality
    tags:                                    # Searchable tags
      - "actor"                              # Always include "actor"
      - "[role-tag]"                         # Example: "architect"
      - "[domain-tag]"                       # Example: "technology"
      # Add more tags as needed
    maturity: initial                        # [initial|developing|defined|managed|optimizing]

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Define clear actor role and responsibilities
# 3. Specify required capabilities and authority levels
# 4. Map interactions with other actors and areas
# 5. Use semantic references (Actor:Name, Area:Name, etc.)
# 6. Validate using SOL extension in VSCode
# =========================================== 