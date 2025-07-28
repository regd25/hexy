/**
 * SOL Completion Provider for IntelliSense
 *
 * Provides intelligent autocompletion for SOL artifacts, fields, and references.
 * Supports all 20 SOL artifact types and semantic validation.
 *
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

import * as vscode from "vscode"

export class CompletionProvider implements vscode.CompletionItemProvider {
  private readonly SOL_ARTIFACT_TYPES = [
    // Foundational (4)
    "Intent", "Context", "Authority", "Evaluation",
    // Strategic (6) 
    "Vision", "Policy", "Concept", "Principle", "Guideline", "Indicator",
    // Operational (5)
    "Process", "Procedure", "Event", "Observation", "Result",
    // Organizational (2)
    "Actor", "Area"
  ]

  private readonly SOL_FOUNDATIONAL_FIELDS = [
    "intent", "context", "authority", "evaluation", "uses", "relates"
  ]

  private readonly SOL_METADATA_FIELDS = [
    "meta", "id", "version", "created", "lastModified", "status", "author", "reviewedBy", "tags", "notes", "links", "attachments"
  ]

  private readonly SOL_INTENT_FIELDS = [
    "statement", "mode", "priority"
  ]

  private readonly SOL_CONTEXT_FIELDS = [
    "scope", "timeframe", "stakeholders", "conditions", "assumptions", "constraints"
  ]

  private readonly SOL_AUTHORITY_FIELDS = [
    "actor", "basedOn", "validFrom", "validUntil", "level"
  ]

  private readonly SOL_EVALUATION_FIELDS = [
    "criteria", "expected", "method", "frequency", "baseline", "target", "threshold"
  ]

  private readonly SOL_COMMON_FIELDS = [
    "description", "type", "name", "value", "category", "classification"
  ]

  private readonly SOL_VALUES = {
    status: ["draft", "active", "deprecated", "pending", "complete", "in-progress", "planned", "reviewing"],
    priority: ["low", "medium", "high", "critical", "urgent"],
    mode: ["declare", "execute", "evaluate", "monitor", "observe", "measure"],
    level: ["strategic", "tactical", "operational", "enterprise", "department", "team", "individual"],
    type: ["internal", "external", "system", "human", "organization", "role", "individual", "group", "automated"],
    frequency: ["daily", "weekly", "monthly", "quarterly", "annually", "continuously", "asNeeded", "onDemand"]
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    
    const line = document.lineAt(position).text
    const linePrefix = line.substring(0, position.character)
    
    // Check if we're in a SOL context
    if (!this.isInSolContext(document)) {
      return []
    }

    // Artifact type completion at start of line
    if (this.shouldCompleteArtifactType(linePrefix)) {
      return this.getArtifactTypeCompletions()
    }

    // Field completion after indentation
    if (this.shouldCompleteField(linePrefix)) {
      const artifactType = this.getCurrentArtifactType(document, position)
      return this.getFieldCompletions(artifactType, linePrefix)
    }

    // Reference completion (Type:)
    if (this.shouldCompleteReference(linePrefix)) {
      return this.getReferenceCompletions(document)
    }

    // Value completion for specific fields
    if (this.shouldCompleteValue(linePrefix)) {
      return this.getValueCompletions(linePrefix)
    }

    return []
  }

  private isInSolContext(document: vscode.TextDocument): boolean {
    const text = document.getText()
    return text.includes("SOL - Semantic Operations Language") ||
           this.SOL_ARTIFACT_TYPES.some(type => 
             new RegExp(`^\\s*${type}\\s*:`, 'm').test(text)
           )
  }

  private shouldCompleteArtifactType(linePrefix: string): boolean {
    return /^\s*[A-Z]*$/.test(linePrefix)
  }

  private shouldCompleteField(linePrefix: string): boolean {
    return /^\s{2,}[a-z]*$/.test(linePrefix)
  }

  private shouldCompleteReference(linePrefix: string): boolean {
    return /\b[A-Z][a-zA-Z]*:$/.test(linePrefix) ||
           /:\s*[A-Z]*$/.test(linePrefix)
  }

  private shouldCompleteValue(linePrefix: string): boolean {
    return /(status|priority|mode|level|type|frequency):\s*[a-z]*$/i.test(linePrefix)
  }

  private getArtifactTypeCompletions(): vscode.CompletionItem[] {
    return this.SOL_ARTIFACT_TYPES.map(type => {
      const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Class)
      item.detail = `SOL ${this.getArtifactCategory(type)} Artifact`
      item.documentation = new vscode.MarkdownString(this.getArtifactDocumentation(type))
      item.insertText = new vscode.SnippetString(`${type}:\n  meta:\n    id: \${1:${type}Id}\n    version: "\${2:1.0.0}"\n    created: "\${3:${new Date().toISOString().split('T')[0]}}"\n    status: \${4|draft,active,deprecated|}\n    author: "\${5:Author Name}"\n  \${0}`)
      return item
    })
  }

  private getFieldCompletions(artifactType: string | null, linePrefix: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = []
    const indentLevel = this.getIndentLevel(linePrefix)

    // Always include metadata fields at top level
    if (indentLevel === 2) {
      items.push(...this.createFieldCompletions(this.SOL_METADATA_FIELDS, "Metadata"))
      items.push(...this.createFieldCompletions(this.SOL_FOUNDATIONAL_FIELDS, "Foundational"))
      items.push(...this.createFieldCompletions(this.SOL_COMMON_FIELDS, "Common"))
    }

    // Add artifact-specific fields
    if (artifactType && indentLevel >= 2) {
      items.push(...this.getArtifactSpecificFields(artifactType))
    }

    // Add sub-fields based on parent field
    if (indentLevel >= 4) {
      const parentField = this.getParentField(linePrefix)
      items.push(...this.getSubFields(parentField))
    }

    return items
  }

  private getReferenceCompletions(document: vscode.TextDocument): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = []
    
    // Add artifact type references
    for (const type of this.SOL_ARTIFACT_TYPES) {
      const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Reference)
      item.detail = `Reference to ${type} artifact`
      item.insertText = `${type}:`
      items.push(item)
    }

    // Add existing artifact IDs from document
    const existingArtifacts = this.findExistingArtifacts(document)
    for (const artifact of existingArtifacts) {
      const item = new vscode.CompletionItem(
        `${artifact.type}:${artifact.id}`, 
        vscode.CompletionItemKind.Value
      )
      item.detail = `Reference to existing ${artifact.type}`
      item.insertText = `${artifact.type}:${artifact.id}`
      items.push(item)
    }

    return items
  }

  private getValueCompletions(linePrefix: string): vscode.CompletionItem[] {
    const fieldMatch = linePrefix.match(/(status|priority|mode|level|type|frequency):\s*[a-z]*$/i)
    if (!fieldMatch) return []

    const fieldName = fieldMatch[1].toLowerCase()
    const solValues = this.SOL_VALUES as Record<string, string[]>
    const values = solValues[fieldName]
    
    if (!values) return []

    return values.map(value => {
      const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.EnumMember)
      item.detail = `${fieldName} value`
      return item
    })
  }

  private getCurrentArtifactType(document: vscode.TextDocument, position: vscode.Position): string | null {
    for (let i = position.line - 1; i >= 0; i--) {
      const line = document.lineAt(i).text
      const match = line.match(/^([A-Z][a-zA-Z]*):/)
      if (match && this.SOL_ARTIFACT_TYPES.includes(match[1])) {
        return match[1]
      }
    }
    return null
  }

  private getIndentLevel(line: string): number {
    const match = line.match(/^(\s*)/)
    return match ? match[1].length : 0
  }

  private getParentField(linePrefix: string): string | null {
    // This would need to analyze the parent structure
    return null
  }

  private createFieldCompletions(fields: string[], category: string): vscode.CompletionItem[] {
    return fields.map(field => {
      const item = new vscode.CompletionItem(field, vscode.CompletionItemKind.Field)
      item.detail = `SOL ${category} Field`
      item.insertText = `${field}: `
      return item
    })
  }

  private getArtifactSpecificFields(artifactType: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = []

    switch (artifactType) {
      case "Intent":
        items.push(...this.createFieldCompletions(this.SOL_INTENT_FIELDS, "Intent"))
        break
      case "Context":
        items.push(...this.createFieldCompletions(this.SOL_CONTEXT_FIELDS, "Context"))
        break
      case "Authority":
        items.push(...this.createFieldCompletions(this.SOL_AUTHORITY_FIELDS, "Authority"))
        break
      case "Evaluation":
        items.push(...this.createFieldCompletions(this.SOL_EVALUATION_FIELDS, "Evaluation"))
        break
      case "Vision":
        items.push(this.createFieldCompletion("aspirationalStatement", "Vision"))
        break
      case "Process":
        items.push(...this.createFieldCompletions(["steps", "flow", "inputs", "outputs", "roles", "resources"], "Process"))
        break
      case "Actor":
        items.push(...this.createFieldCompletions(["capabilities", "responsibilities", "interactions"], "Actor"))
        break
      case "Area":
        items.push(...this.createFieldCompletions(["structure", "hierarchy", "teams", "governance"], "Area"))
        break
      // Add more artifact-specific fields as needed
    }

    return items
  }

  private createFieldCompletion(field: string, category: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(field, vscode.CompletionItemKind.Field)
    item.detail = `SOL ${category} Field`
    item.insertText = `${field}: `
    return item
  }

  private getSubFields(parentField: string | null): vscode.CompletionItem[] {
    // Implementation for sub-fields based on parent
    return []
  }

  private findExistingArtifacts(document: vscode.TextDocument): Array<{type: string, id: string}> {
    const artifacts: Array<{type: string, id: string}> = []
    const text = document.getText()
    
    for (const type of this.SOL_ARTIFACT_TYPES) {
      const pattern = new RegExp(`^\\s*${type}\\s*:\\s*([A-Z][a-zA-Z0-9_]*)`, "gm")
      let match: RegExpExecArray | null
      
      while ((match = pattern.exec(text)) !== null) {
        artifacts.push({ type, id: match[1] })
      }

      // Also check for id fields in artifact blocks
      const blockPattern = new RegExp(`^\\s*${type}\\s*:\\s*$[\\s\\S]*?^\\s*id:\\s*([A-Z][a-zA-Z0-9_]*)`, "gm")
      while ((match = blockPattern.exec(text)) !== null) {
        artifacts.push({ type, id: match[1] })
      }
    }

    return artifacts
  }

  private getArtifactCategory(type: string): string {
    if (["Intent", "Context", "Authority", "Evaluation"].includes(type)) return "Foundational"
    if (["Vision", "Policy", "Concept", "Principle", "Guideline", "Indicator"].includes(type)) return "Strategic"
    if (["Process", "Procedure", "Event", "Observation", "Result"].includes(type)) return "Operational"
    if (["Actor", "Area"].includes(type)) return "Organizational"
    return "Legacy"
  }

  private getArtifactDocumentation(type: string): string {
    const docs: Record<string, string> = {
      "Intent": "Defines the purpose and motivation behind an initiative",
      "Context": "Establishes the operational context and boundaries",
      "Authority": "Defines who has the authority and legitimacy",
      "Evaluation": "Specifies success criteria and measurement methods",
      "Vision": "Strategic aspirational statements for the organization",
      "Policy": "Mandatory rules and regulations",
      "Concept": "Fundamental definitions and organizational concepts",
      "Principle": "Core guiding principles for decision-making",
      "Guideline": "Recommended practices and approaches",
      "Indicator": "Measurable metrics and KPIs",
      "Process": "Operational workflows and procedures",
      "Procedure": "Detailed step-by-step instructions",
      "Event": "Discrete occurrences that trigger actions",
      "Observation": "Monitoring points and data collection",
      "Result": "Outputs and deliverables from processes",
      "Actor": "Roles and responsibilities within the organization",
      "Area": "Organizational departments and domains"
    }
    return docs[type] || "SOL artifact definition"
  }
} 