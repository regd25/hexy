# ===========================================
# SOL ARTIFACT TEMPLATE v2025.06
# Type: Policy (Normative Artifact)
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
# ├─ ⚠️  Rules defined (REQUIRED - Define policy rules)
# └─ ⚠️  Compliance mapped (RECOMMENDED - Add compliance criteria)

Policy:
  # ┌─ METADATA ─────────────────────────────┐
  meta:
    id: [YourPolicyNameInCamelCase]             # REQUIRED: Unique identifier (e.g., DataPrivacyPolicy)
    version: "1.0.0"                           # REQUIRED: Semantic versioning
    created: "[YYYY-MM-DD]"                    # REQUIRED: Creation date (ISO format)
    lastModified: "[YYYY-MM-DD]"               # REQUIRED: Last modification date
    status: draft                              # REQUIRED: [draft|active|deprecated]
    author: "[Author Name]"                    # REQUIRED: Who created this policy
    reviewedBy: []                             # OPTIONAL: Array of reviewers when ready
    approvedBy: "[Approver Name]"              # RECOMMENDED: Who approved this policy
  
  # ┌─ CORE FOUNDATIONAL BLOCKS ─────────────┐
  intent:
    statement: >                               # REQUIRED: Clear policy statement
      [Replace with your policy statement. 
      Should clearly define what is required, prohibited, 
      or mandated. Be specific about obligations and restrictions.
      Example: "All user data must be protected according to 
      industry security standards and privacy regulations."]
    mode: [require|prohibit]                   # REQUIRED: "require" for mandatory actions, "prohibit" for restrictions
    priority: [low|medium|high|critical]       # REQUIRED: Enforcement priority level
  
  context:
    scope: "[Specific scope/domain]"           # REQUIRED: Where this policy applies
                                              # Example: "All systems handling personal data"
    timeframe: "[Validity period]"             # REQUIRED: How long this policy is valid
                                              # Example: "Permanent until superseded"
    stakeholders:                             # REQUIRED: Who must comply with this policy
      - "[Primary affected group]"            # Example: "Development teams"
      - "[Secondary affected group]"          # Example: "Data administrators"
      - "[Oversight group]"                   # Example: "Security team"
      # Add more stakeholders as needed
    conditions:                               # OPTIONAL: When this policy applies
      - "[Triggering condition]"              # Example: "When handling personal data"
      - "[Exception condition]"               # Example: "Except for anonymized datasets"
      # Add more conditions as needed
  
  authority:
    actor: "[Policy Owner]"                   # REQUIRED: Who has authority over this policy
                                             # Example: "Chief Information Security Officer"
    basedOn: "[Legal/Regulatory Basis]"      # REQUIRED: What law/regulation/standard supports this
                                             # Example: "GDPR Article 32 - Security of processing"
    validFrom: "[YYYY-MM-DD]"                # REQUIRED: When this policy becomes effective
    validUntil: "[YYYY-MM-DD]"               # OPTIONAL: When this policy expires (if applicable)
    level: [strategic|tactical|operational]   # REQUIRED: Authority level of this policy
  
  evaluation:                                # RECOMMENDED: How compliance is measured
    expected: "[Expected compliance state]"   # Example: "100% compliance across all systems"
    method: "[Evaluation method]"            # Example: "Automated security scanning + manual audits"
    criteria:                                # Specific compliance metrics
      - metric: "[compliance-metric]"        # Example: "encryption-coverage-percentage"
        threshold: "[target value]"         # Example: "= 100%"
        description: "[What this measures]"  # Example: "All data at rest is encrypted"
      - metric: "[another-metric]"           # Add more criteria as needed
        threshold: "[target value]"
        description: "[Description]"
    frequency: "[Review frequency]"          # Example: "Monthly compliance review"
  
  # ┌─ POLICY-SPECIFIC CONTENT ──────────────┐
  rules:                                     # REQUIRED: Specific policy rules
    mandatory:                               # What MUST be done
      - rule: "[Mandatory requirement]"      # Example: "Encrypt all personal data at rest"
        rationale: "[Why this is required]"  # Example: "Prevents unauthorized access to sensitive data"
        implementation: "[How to comply]"    # Example: "Use AES-256 encryption standard"
      # Add more mandatory rules as needed
    
    prohibited:                              # What MUST NOT be done
      - rule: "[Prohibited action]"          # Example: "Store passwords in plain text"
        rationale: "[Why this is prohibited]" # Example: "Creates security vulnerability"
        consequence: "[Penalty for violation]" # Example: "Immediate remediation required"
      # Add more prohibited actions as needed
    
    conditional:                             # Rules that apply under specific conditions
      - condition: "[When this applies]"     # Example: "When processing EU citizen data"
        rule: "[Conditional requirement]"    # Example: "Obtain explicit consent"
        rationale: "[Why this is needed]"    # Example: "GDPR compliance requirement"
      # Add more conditional rules as needed
  
  compliance:                                # RECOMMENDED: Compliance requirements
    monitoring:
      - method: "[Monitoring approach]"      # Example: "Automated vulnerability scanning"
        frequency: "[How often]"            # Example: "Weekly"
        responsible: "[Who monitors]"       # Example: "Security Operations Center"
    
    reporting:
      - trigger: "[When to report]"         # Example: "Policy violation detected"
        audience: "[Who to notify]"         # Example: "CISO and Legal team"
        timeline: "[Response time]"         # Example: "Within 24 hours"
    
    exceptions:                              # OPTIONAL: Approved exceptions process
      process: "[Exception process]"        # Example: "Submit exception request to Risk Committee"
      approval: "[Who approves]"            # Example: "Chief Risk Officer"
      duration: "[Exception validity]"      # Example: "Maximum 90 days"
  
  # ┌─ TRACEABILITY ─────────────────────────┐
  relationships:                            # OPTIONAL: Connections to other artifacts
    dependsOn: []                           # IDs of artifacts this policy depends on
    supports: []                            # IDs of artifacts this policy supports
    relatedTo: []                           # IDs of related policies or guidelines
    enforcedBy: []                          # IDs of processes that enforce this policy
    measuredBy: []                          # IDs of indicators that measure compliance
  
  # ┌─ CLASSIFICATION ───────────────────────┐
  classification:
    area: "[Organizational Area]"           # Example: "Information Security"
    domain: "[Policy Domain]"               # Example: "Data Protection"
    type: "[Policy Type]"                   # Example: "Security Policy"
    tags:                                   # Searchable tags
      - "[tag1]"                           # Example: "security"
      - "[tag2]"                           # Example: "compliance"
      - "[tag3]"                           # Add more tags as needed
    maturity: initial                       # [initial|developing|defined|managed|optimizing]
    riskLevel: [low|medium|high|critical]   # Risk level if not complied with

# ===========================================
# TEMPLATE INSTRUCTIONS:
# 1. Replace ALL [placeholders] with actual values
# 2. Choose appropriate intent.mode (require/prohibit)
# 3. Define clear, actionable rules
# 4. Specify monitoring and compliance procedures
# 5. Link to supporting legal/regulatory framework
# 6. Validate using SOL extension in VSCode
# =========================================== 