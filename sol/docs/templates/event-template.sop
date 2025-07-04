# ===========================================
# SOL ARTIFACT TEMPLATE v2025.06
# Type: Event (Operational Artifact)
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
# ├─ ⚠️  Event definition (REQUIRED - Define event structure)
# └─ ⚠️  Subscribers mapped (RECOMMENDED - Add event consumers)

Event:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourEventNameInCamelCase]              # REQUIRED: Unique identifier (e.g., NewRequestRegistered)
    version: "1.0.0"                           # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                    # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"               # REQUIRED: Last modification date
    status: draft                              # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                    # REQUIRED: Who created this event
    reviewedBy: []                             # OPTIONAL: Array of reviewers when ready
  
  # ┌─ CORE FOUNDATIONAL BLOCKS ─────────────┐
  intent:
    statement: >                               # REQUIRED: Clear event purpose
      [Replace with the purpose of this event.
      Explain what business need this event serves.
      Example: "Notify systems when a new customer request 
      is registered and requires processing according to 
      established business rules."]
    mode: declare                              # REQUIRED: Always "declare" for events
    priority: [low|medium|high|critical]       # REQUIRED: Event priority level
  
  context:
    scope: "[Event scope/domain]"              # REQUIRED: Where this event applies
                                              # Example: "Customer request management system"
    timeframe: "[Event lifecycle]"             # REQUIRED: Event validity period
                                              # Example: "Real-time processing"
    stakeholders:                             # REQUIRED: Who uses/consumes this event
      - "[Primary consumer]"                  # Example: "Request processing service"
      - "[Secondary consumer]"                # Example: "Notification service"
      - "[Monitoring system]"                 # Example: "Metrics collection service"
      # Add more stakeholders as needed
    conditions:                               # OPTIONAL: When this event is triggered
      - "[Trigger condition]"                 # Example: "Valid request form submitted"
      - "[System condition]"                  # Example: "System operational and available"
      # Add more conditions as needed
  
  authority:
    actor: "[Event Owner]"                    # REQUIRED: Who has authority over this event
                                             # Example: "Systems Architect"
    basedOn: "[System Specification]"        # REQUIRED: What specification defines this event
                                             # Example: "Event-Driven Architecture Specification v2.1"
    validFrom: "[YYYY-MM-DD]"                # REQUIRED: When this event becomes active
    validUntil: "[YYYY-MM-DD]"               # OPTIONAL: When this event expires (if applicable)
    level: operational                        # REQUIRED: Always "operational" for events
  
  evaluation:                                # OPTIONAL: How event performance is measured
    expected: "[Expected behavior]"           # Example: "Reliable delivery to all subscribers"
    method: "[Evaluation method]"            # Example: "Event delivery monitoring and metrics"
    criteria:                                # Specific performance metrics
      - metric: "[delivery-metric]"          # Example: "event-delivery-success-rate"
        threshold: "[target value]"         # Example: "> 99.9%"
        description: "[What this measures]"  # Example: "Successful delivery to subscribers"
    frequency: "[Review frequency]"          # Example: "Continuous monitoring"
  
  # ┌─ EVENT-SPECIFIC CONTENT ───────────────┐
  eventDefinition:                           # REQUIRED: Event structure definition
    trigger: "[What triggers this event]"    # REQUIRED: Event trigger condition
                                             # Example: "Customer request form submitted successfully"
    source: "[Event source]"                # REQUIRED: System/Actor that originates event
                                             # Example: "Web Application / Mobile App"
    destination: "[Event destination]"       # REQUIRED: Target system/queue
                                             # Example: "Request processing queue"
    eventType: [business|system|user|integration] # REQUIRED: Type of event
  
  eventData:                                 # REQUIRED: Event payload structure
    required:                                # Mandatory event fields
      - field: "eventId"                     # Field name
        type: "unique-identifier"            # Data type
        description: "[Field description]"   # Example: "Unique event identifier"
      - field: "timestamp"                   
        type: "datetime"
        description: "[Field description]"   # Example: "Event occurrence timestamp"
      - field: "source"
        type: "string"
        description: "[Field description]"   # Example: "Originating system identifier"
      # Add more required fields as needed
    
    optional:                                # Optional event fields
      - field: "metadata"
        type: "object"
        description: "[Field description]"   # Example: "Additional event metadata"
      - field: "correlationId"
        type: "string"
        description: "[Field description]"   # Example: "Request correlation identifier"
      # Add more optional fields as needed
  
  processing:                                # REQUIRED: Event processing definition
    triggeredActions:                        # Actions automatically executed
      - action: "[Action name]"              # Example: "AssignRequestToTeam"
        description: "[Action description]"  # Example: "Assign request to processing team"
        executor: "[System/Service]"         # Example: "Request Assignment Service"
      # Add more actions as needed
    
    subscribers:                             # Systems/services consuming this event
      - subscriber: "[Service name]"         # Example: "ProcessingService"
        purpose: "[Why it subscribes]"       # Example: "Process customer requests"
        acknowledgment: [required|optional]  # Whether acknowledgment is needed
      # Add more subscribers as needed
  
  # ┌─ TRACEABILITY ─────────────────────────┐
  relationships:                             # OPTIONAL: Connections to other artifacts
    relatedActors:                           # Actors involved with this event
      - Actor:[ActorId]                      # Example: Actor:RequestProcessor
      - Actor:[ActorId]                      # Example: Actor:CustomerServiceRep
      # Add more related actors as needed
    
    relatedProcesses:                        # Processes that use this event
      - Process:[ProcessId]                  # Example: Process:RequestProcessing
      # Add more related processes as needed
    
    triggersProcesses:                       # Processes triggered by this event
      - Process:[ProcessId]                  # Example: Process:NotificationDelivery
      # Add more triggered processes as needed
    
    supportsVision:                          # Vision this event supports
      - Vision:[VisionId]                    # Example: Vision:CustomerExcellence
    
    measuredBy:                              # Indicators measuring this event
      - Indicator:[IndicatorId]              # Example: Indicator:EventProcessingTime
  
  # ┌─ CLASSIFICATION ───────────────────────┐
  classification:
    category: operacional                    # Always "operacional" for events
    domain: "[Event Domain]"                 # Example: "Customer Request Management"
    area: Area:[AreaId]                      # Example: Area:CustomerService
    priority: [low|medium|high|critical]     # Event priority level
    frequency: [real-time|batch|scheduled]   # Event occurrence frequency
    criticality: [low|medium|high|critical]  # Business criticality
    tags:                                    # Searchable tags
      - "event"                              # Always include "event"
      - "[domain-tag]"                       # Example: "customer-service"
      - "[category-tag]"                     # Example: "request-processing"
      # Add more tags as needed
    maturity: initial                        # [initial|developing|defined|managed|optimizing]

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Define clear event trigger and payload structure
# 3. Specify all subscribers and their purposes
# 4. Map relationships to related actors and processes
# 5. Ensure event follows pub/sub patterns
# 6. Validate using SOL extension in VSCode
