# ===========================================
# SOL ARTIFACT TEMPLATE v2025.06
# Type: Concept (Organizational Artifact)
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
# ├─ ⚠️  Definition provided (REQUIRED - Define the concept)
# └─ ⚠️  Relationships mapped (RECOMMENDED - Connect to other concepts)

Concept:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourConceptNameInCamelCase]            # REQUIRED: Unique identifier (e.g., Customer, Invoice, Project)
    version: "1.0.0"                           # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                    # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"               # REQUIRED: Last modification date
    status: draft                              # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                    # REQUIRED: Who created this concept
    reviewedBy: []                             # OPTIONAL: Array of reviewers when ready
  
  # ┌─ CORE FOUNDATIONAL BLOCKS ─────────────┐
  intent:
    statement: >                               # REQUIRED: Clear definition intent
      [Replace with the purpose of defining this concept.
      Explain why this concept needs clear definition.
      Example: "Define what constitutes a Customer for the 
      organization, establishing clear criteria for identification 
      and classification across all business operations."]
    mode: declare                              # REQUIRED: Always "declare" for concepts
    priority: [low|medium|high|critical]       # REQUIRED: Business importance of this concept
  
  context:
    scope: "[Business scope/domain]"           # REQUIRED: Where this concept applies
                                              # Example: "All customer-facing operations and systems"
    timeframe: "[Validity period]"             # REQUIRED: How long this definition is valid
                                              # Example: "Permanent until business model changes"
    stakeholders:                             # REQUIRED: Who uses/needs this concept
      - "[Primary user group]"                # Example: "Sales and marketing teams"
      - "[Secondary user group]"              # Example: "Customer service representatives"
      - "[System group]"                      # Example: "CRM and billing systems"
      # Add more stakeholders as needed
    conditions:                               # OPTIONAL: When this concept applies
      - "[Usage condition]"                   # Example: "When engaging in commercial relationships"
      - "[Exception condition]"               # Example: "Excluding internal test accounts"
      # Add more conditions as needed
  
  authority:
    actor: "[Concept Owner]"                  # REQUIRED: Who has authority over this definition
                                             # Example: "Chief Commercial Officer"
    basedOn: "[Business Model/Framework]"    # REQUIRED: What business framework supports this
                                             # Example: "Customer Relationship Management Framework 2025"
    validFrom: "[YYYY-MM-DD]"                # REQUIRED: When this definition becomes active
    validUntil: "[YYYY-MM-DD]"               # OPTIONAL: When this definition expires (if applicable)
    level: [strategic|tactical|operational]   # REQUIRED: Level of this concept definition
  
  evaluation:                                # OPTIONAL: How this concept's usage is measured
    expected: "[Expected usage/clarity]"      # Example: "Consistent usage across all teams"
    method: "[Evaluation method]"            # Example: "Quarterly business terminology review"
    criteria:                                # Specific clarity/usage metrics
      - metric: "[usage-metric]"             # Example: "terminology-consistency-score"
        threshold: "[target value]"         # Example: "> 90%"
        description: "[What this measures]"  # Example: "Consistent definition usage across teams"
    frequency: "[Review frequency]"          # Example: "Quarterly terminology review"
  
  # ┌─ CONCEPT-SPECIFIC CONTENT ─────────────┐
  definition:                               # REQUIRED: Clear, unambiguous definition
    primary: >                              # Main definition
      [Replace with clear, precise definition of the concept.
      Should be unambiguous and complete.
      Example: "A Customer is any individual or organization 
      that has entered into a commercial relationship with our 
      company through purchase of products, services, or 
      participation in commercial programs."]
    
    scope:                                  # What is included/excluded
      includes:                             # What IS part of this concept
        - "[Included item]"                 # Example: "Active paying customers"
        - "[Another included item]"         # Example: "Trial users with signed agreements"
        # Add more items as needed
      excludes:                             # What is NOT part of this concept
        - "[Excluded item]"                 # Example: "Internal test accounts"
        - "[Another excluded item]"         # Example: "Website visitors without engagement"
        # Add more items as needed
  
  attributes:                               # RECOMMENDED: Key properties of this concept
    core:                                   # Essential attributes
      - name: "[attribute-name]"            # Example: "customer-id"
        type: "[data-type]"                 # Example: "unique-identifier"
        description: "[What this represents]" # Example: "Unique system identifier"
        required: true                      # Whether this attribute is mandatory
      # Add more core attributes as needed
    
    optional:                               # Non-essential but useful attributes
      - name: "[optional-attribute]"        # Example: "preferred-communication-channel"
        type: "[data-type]"                 # Example: "enumeration"
        description: "[What this represents]" # Example: "Customer's preferred contact method"
        required: false
      # Add more optional attributes as needed
  
  types:                                    # OPTIONAL: Subtypes or categories
    classifications:                        # Different ways to classify this concept
      by-relationship:                      # Classification by relationship type
        - type: "[type-name]"               # Example: "active-customer"
          criteria: "[Classification rule]" # Example: "Has made purchase in last 12 months"
          description: "[Type description]"  # Example: "Customers with recent activity"
      # Add more classification schemes as needed
  
  # ┌─ TRACEABILITY ─────────────────────────┐
  relationships:                            # RECOMMENDED: Connections to other concepts
    dependsOn: []                           # IDs of concepts this concept depends on
    supports: []                            # IDs of concepts this concept supports
    relatedTo: []                           # IDs of related concepts
    usedIn: []                              # IDs of processes that use this concept
    measuredBy: []                          # IDs of indicators that track this concept
  
  businessRelationships:                    # RECOMMENDED: Business relationships
    - relationship: "[Relationship type]"   # Example: "creates"
      target: "[Related concept]"           # Example: "Invoice"
      description: "[Relationship description]" # Example: "Customers create invoices through purchases"
    # Add more business relationships as needed
  
  # ┌─ CLASSIFICATION ───────────────────────┐
  classification:
    area: "[Organizational Area]"           # Example: "Commercial Operations"
    domain: "[Business Domain]"             # Example: "Customer Management"
    category: "[Concept Category]"          # Example: "Business Entity"
    tags:                                   # Searchable tags
      - "[tag1]"                           # Example: "customer"
      - "[tag2]"                           # Example: "business-entity"
      - "[tag3]"                           # Add more tags as needed
    maturity: initial                       # [initial|developing|defined|managed|optimizing]
    businessCriticality: [low|medium|high|critical] # How critical this concept is to business

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Provide clear, unambiguous definition
# 3. Define essential attributes and types
# 4. Map relationships to other business concepts
# 5. Ensure definition aligns with business model
# 6. Validate using SOL extension in VSCode
# =========================================== 