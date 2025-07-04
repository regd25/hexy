# ===========================================
# SOL ARTIFACT TEMPLATE v2025.06
# Type: Indicator (Measurement Artifact)
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
# ├─ ⚠️  Measurement defined (REQUIRED - Define calculation method)
# └─ ⚠️  Targets set (REQUIRED - Set measurement targets)

Indicator:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourIndicatorNameInCamelCase]          # REQUIRED: Unique identifier (e.g., CustomerSatisfactionScore)
    version: "1.0.0"                           # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                    # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"               # REQUIRED: Last modification date
    status: draft                              # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                    # REQUIRED: Who created this indicator
    reviewedBy: []                             # OPTIONAL: Array of reviewers when ready
    dataOwner: "[Data Owner]"                  # REQUIRED: Who owns the data for this indicator
  
  # ┌─ CORE FOUNDATIONAL BLOCKS ─────────────┐
  intent:
    statement: >                               # REQUIRED: Clear measurement purpose
      [Replace with the purpose of this indicator.
      Explain what business question this indicator answers.
      Example: "Measure customer satisfaction levels to track 
      service quality and identify improvement opportunities 
      in the customer experience journey."]
    mode: declare                              # REQUIRED: Usually "declare" for indicators
    priority: [low|medium|high|critical]       # REQUIRED: Business importance of this measurement
  
  context:
    scope: "[Measurement scope/domain]"        # REQUIRED: What this indicator measures
                                              # Example: "All customer interactions and service touchpoints"
    timeframe: "[Measurement period]"          # REQUIRED: How often this is measured
                                              # Example: "Monthly measurement cycle"
    stakeholders:                             # REQUIRED: Who uses this indicator
      - "[Primary user]"                      # Example: "Customer Experience Manager"
      - "[Secondary user]"                    # Example: "Service delivery teams"
      - "[Executive user]"                    # Example: "Chief Customer Officer"
      # Add more stakeholders as needed
    conditions:                               # OPTIONAL: When this measurement applies
      - "[Measurement condition]"             # Example: "For completed service interactions"
      - "[Data availability condition]"       # Example: "When customer feedback is available"
      # Add more conditions as needed
  
  authority:
    actor: "[Indicator Owner]"                # REQUIRED: Who has authority over this indicator
                                             # Example: "Director of Customer Experience"
    basedOn: "[Framework/Strategy]"          # REQUIRED: What strategy/framework supports this
                                             # Example: "Customer Experience Excellence Strategy 2025"
    validFrom: "[YYYY-MM-DD]"                # REQUIRED: When this indicator becomes active
    validUntil: "[YYYY-MM-DD]"               # OPTIONAL: When this indicator expires (if applicable)
    level: [strategic|tactical|operational]   # REQUIRED: Level of this indicator
  
  evaluation:                                # RECOMMENDED: How the indicator itself is evaluated
    expected: "[Expected indicator performance]" # Example: "Consistent and actionable insights"
    method: "[Evaluation method]"            # Example: "Quarterly indicator effectiveness review"
    criteria:                                # Specific indicator quality metrics
      - metric: "[quality-metric]"           # Example: "data-quality-score"
        threshold: "[target value]"         # Example: "> 95%"
        description: "[What this measures]"  # Example: "Completeness and accuracy of source data"
    frequency: "[Review frequency]"          # Example: "Quarterly indicator review"
  
  # ┌─ INDICATOR-SPECIFIC CONTENT ───────────┐
  measurement:                              # REQUIRED: How this indicator is calculated
    definition: >                           # Clear definition of what is measured
      [Replace with precise definition of what this indicator measures.
      Should be specific and unambiguous.
      Example: "Average rating provided by customers on service 
      quality across all interaction channels, measured on a 
      scale of 1-5 where 5 represents highest satisfaction."]
    
    calculation:                            # How the indicator is calculated
      formula: "[Mathematical formula]"     # Example: "SUM(ratings) / COUNT(ratings)"
      method: "[Calculation method]"        # Example: "Weighted average based on interaction type"
      frequency: "[Calculation frequency]"   # Example: "Real-time with monthly aggregation"
    
    unit: "[Unit of measurement]"           # Example: "Score (1-5 scale)"
    dataType: "[Data type]"                 # Example: "Decimal number"
  
  targets:                                  # REQUIRED: Target values and thresholds
    primary:                                # Main target
      value: "[Target value]"               # Example: "4.2"
      description: "[Target description]"   # Example: "Target satisfaction score"
      timeframe: "[Achievement timeframe]"  # Example: "Maintain monthly average"
    
    thresholds:                             # Performance thresholds
      excellent: 
        value: "[Excellence threshold]"     # Example: "> 4.5"
        description: "[Excellence description]" # Example: "Exceptional customer satisfaction"
      good:
        value: "[Good threshold]"           # Example: "4.0 - 4.5"
        description: "[Good description]"   # Example: "Good customer satisfaction"
      warning:
        value: "[Warning threshold]"        # Example: "3.5 - 4.0"
        description: "[Warning description]" # Example: "Satisfaction below target"
      critical:
        value: "[Critical threshold]"       # Example: "< 3.5"
        description: "[Critical description]" # Example: "Critical satisfaction issues"
  
  dataSource:                               # REQUIRED: Where data comes from
    primary:                                # Main data source
      system: "[Source system]"            # Example: "Customer Feedback Management System"
      table: "[Data location]"             # Example: "customer_ratings table"
      updateFrequency: "[Update frequency]" # Example: "Real-time"
      owner: "[Data source owner]"         # Example: "Customer Service Operations"
    
    secondary:                              # Additional data sources if needed
      - system: "[Secondary system]"       # Example: "CRM System"
        purpose: "[Why this source]"       # Example: "Customer demographic data"
        updateFrequency: "[Update frequency]"
    
    qualityRequirements:                    # Data quality requirements
      completeness: "[Completeness req]"   # Example: "> 95% of interactions captured"
      accuracy: "[Accuracy requirement]"   # Example: "Validated customer responses only"
      timeliness: "[Timeliness requirement]" # Example: "Data available within 24 hours"
  
  reporting:                                # RECOMMENDED: How this indicator is reported
    dashboards:                             # Where this indicator appears
      - name: "[Dashboard name]"            # Example: "Customer Experience Dashboard"
        audience: "[Dashboard audience]"    # Example: "Executive leadership"
        frequency: "[Update frequency]"     # Example: "Daily"
    
    alerts:                                 # Automated alerts
      - condition: "[Alert condition]"      # Example: "Score drops below 3.5"
        recipients: "[Who gets alerted]"    # Example: "Customer Experience Manager"
        method: "[Alert method]"            # Example: "Email and Slack notification"
    
    reports:                                # Regular reports
      - type: "[Report type]"               # Example: "Monthly trend analysis"
        frequency: "[Report frequency]"     # Example: "Monthly"
        distribution: "[Who receives]"      # Example: "Leadership team and service managers"
  
  # ┌─ TRACEABILITY ─────────────────────────┐
  relationships:                            # OPTIONAL: Connections to other artifacts
    dependsOn: []                           # IDs of artifacts this indicator depends on
    supports: []                            # IDs of artifacts this indicator supports
    measures: []                            # IDs of artifacts this indicator measures
    relatedTo: []                           # IDs of related indicators
    influencedBy: []                        # IDs of processes that affect this indicator
  
  # ┌─ CLASSIFICATION ───────────────────────┐
  classification:
    area: "[Organizational Area]"           # Example: "Customer Experience"
    domain: "[Measurement Domain]"          # Example: "Service Quality"
    category: "[Indicator Category]"        # Example: "Customer KPI"
    type: "[Indicator Type]"                # Example: "Satisfaction Metric"
    frequency: "[Measurement Frequency]"    # Example: "Continuous"
    aggregation: "[Aggregation Level]"      # Example: "Monthly rollup"
    tags:                                   # Searchable tags
      - "[tag1]"                           # Example: "customer"
      - "[tag2]"                           # Example: "satisfaction"
      - "[tag3]"                           # Add more tags as needed
    maturity: initial                       # [initial|developing|defined|managed|optimizing]
    businessCriticality: [low|medium|high|critical] # Business importance of this metric

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Define clear calculation method and formula
# 3. Specify data sources and quality requirements
# 4. Set meaningful targets and thresholds
# 5. Map to business processes and outcomes
# 6. Configure appropriate reporting and alerts
# 7. Validate using SOL extension in VSCode
# =========================================== 