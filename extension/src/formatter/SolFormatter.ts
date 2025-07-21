/**
 * SOL Document Formatter
 *
 * Formats SOL documents following SOL principles:
 * - Semantic Coherence: Consistent structure and indentation
 * - Traceability: Clear artifact hierarchy and relationships
 * - Simplicity: Clean, readable formatting
 * - Documentation: Self-documenting code structure
 *
 * Based on the SOL project: https://github.com/regd25/sol
 *
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

export interface SolFormattingOptions {
  insertSpaces: boolean
  tabSize: number
  trimTrailingWhitespace: boolean
  insertFinalNewline: boolean
  trimFinalNewlines: boolean
}

export interface SolFormattingRule {
  pattern: RegExp
  indentLevel: number
  formatFunction?: (line: string) => string
}

export class SolFormatter {
  private readonly defaultOptions: SolFormattingOptions = {
    insertSpaces: true,
    tabSize: 2,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
    trimFinalNewlines: true,
  }

  private readonly formattingRules: SolFormattingRule[] = [
    // SOL header
    {
      pattern: /^#\s*SOL\s*-\s*Semantic\s*Operations\s*Language/,
      indentLevel: 0,
      formatFunction: (line) => line.trim(),
    },

    // Top-level artifact types
    {
      pattern:
        /^(Vision|Domain|Concept|Policy|Process|Actor|Indicator|Result|Signal|Observation|Authority|Protocol):\s*$/,
      indentLevel: 0,
    },

    // Artifact list items
    {
      pattern: /^-\s*id:\s*[A-Za-z0-9_]+/,
      indentLevel: 1,
      formatFunction: (line) => this.formatArtifactListItem(line),
    },

    // Single artifact ID
    {
      pattern: /^id:\s*[A-Za-z0-9_]+/,
      indentLevel: 1,
      formatFunction: (line) => this.formatField(line),
    },

    // Field definitions
    {
      pattern:
        /^(content|description|vision|premise|measurement|unit|goal|author|date|language|type|domain|version|reason|timestamp):\s*/,
      indentLevel: -1, // Dynamic based on context
      formatFunction: (line) => this.formatField(line),
    },

    // Array field headers
    {
      pattern:
        /^(actors|steps|tags|capabilities|indicators|policies|processes):\s*$/,
      indentLevel: -1, // Dynamic based on context
    },

    // Array items
    {
      pattern: /^-\s+/,
      indentLevel: -1, // Dynamic based on context
      formatFunction: (line) => this.formatArrayItem(line),
    },
  ]

  public formatDocument(
    text: string,
    options?: Partial<SolFormattingOptions>
  ): string {
    const opts = { ...this.defaultOptions, ...options }
    const lines = text.split("\n")
    const formattedLines: string[] = []

    let currentContext = this.createFormattingContext()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()

      // Handle empty lines
      if (trimmedLine === "") {
        formattedLines.push("")
        continue
      }

      // Handle comments
      if (trimmedLine.startsWith("#")) {
        const indent = this.getIndent(currentContext.commentIndentLevel, opts)
        formattedLines.push(indent + trimmedLine)
        continue
      }

      // Apply formatting rules
      const formattedLine = this.applyFormattingRules(
        trimmedLine,
        currentContext,
        opts
      )
      formattedLines.push(formattedLine)

      // Update context based on current line
      currentContext = this.updateContext(currentContext, trimmedLine)
    }

    let result = formattedLines.join("\n")

    // Apply final formatting options
    if (opts.trimTrailingWhitespace) {
      result = this.trimTrailingWhitespace(result)
    }

    if (opts.trimFinalNewlines) {
      result = result.replace(/\n+$/, "")
    }

    if (opts.insertFinalNewline && !result.endsWith("\n")) {
      result += "\n"
    }

    return result
  }

  private createFormattingContext() {
    return {
      currentIndentLevel: 0,
      insideArtifactList: false,
      insideFieldList: false,
      commentIndentLevel: 0,
      lastArtifactType: null as string | null,
    }
  }

  private applyFormattingRules(
    line: string,
    context: any,
    options: SolFormattingOptions
  ): string {
    for (const rule of this.formattingRules) {
      if (rule.pattern.test(line)) {
        let indentLevel = rule.indentLevel

        // Handle dynamic indent levels
        if (indentLevel === -1) {
          indentLevel = this.calculateDynamicIndent(line, context)
        }

        const indent = this.getIndent(indentLevel, options)
        const formattedContent = rule.formatFunction
          ? rule.formatFunction(line)
          : line

        return indent + formattedContent
      }
    }

    // Default formatting
    const indent = this.getIndent(context.currentIndentLevel, options)
    return indent + line
  }

  private calculateDynamicIndent(line: string, context: any): number {
    // Field definitions
    if (
      line.match(
        /^(content|description|vision|premise|measurement|unit|goal|author|date|language|type|domain|version|reason|timestamp):\s*/
      )
    ) {
      return context.insideArtifactList ? 2 : 1
    }

    // Array field headers
    if (
      line.match(
        /^(actors|steps|tags|capabilities|indicators|policies|processes):\s*$/
      )
    ) {
      return context.insideArtifactList ? 2 : 1
    }

    // Array items
    if (line.match(/^-\s+/) && context.insideFieldList) {
      return context.insideArtifactList ? 3 : 2
    }

    return context.currentIndentLevel
  }

  private updateContext(context: any, line: string) {
    const newContext = { ...context }

    // Top-level artifact types
    if (line.match(/^[A-Z][a-zA-Z]*:\s*$/)) {
      newContext.currentIndentLevel = 0
      newContext.insideArtifactList = false
      newContext.insideFieldList = false
      newContext.commentIndentLevel = 0
      newContext.lastArtifactType = line.replace(":", "").trim()
    }

    // Artifact list items
    else if (line.match(/^-\s*id:\s*[A-Za-z0-9_]+/)) {
      newContext.currentIndentLevel = 1
      newContext.insideArtifactList = true
      newContext.insideFieldList = false
      newContext.commentIndentLevel = 1
    }

    // Single artifact
    else if (line.match(/^id:\s*[A-Za-z0-9_]+/)) {
      newContext.currentIndentLevel = 1
      newContext.insideArtifactList = false
      newContext.insideFieldList = false
      newContext.commentIndentLevel = 1
    }

    // Array field headers
    else if (
      line.match(
        /^(actors|steps|tags|capabilities|indicators|policies|processes):\s*$/
      )
    ) {
      newContext.insideFieldList = true
      newContext.commentIndentLevel = newContext.insideArtifactList ? 2 : 1
    }

    return newContext
  }

  private getIndent(level: number, options: SolFormattingOptions): string {
    if (options.insertSpaces) {
      return " ".repeat(level * options.tabSize)
    } else {
      return "\t".repeat(level)
    }
  }

  private formatField(line: string): string {
    const match = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (match) {
      const [, field, value] = match
      if (value.trim() === "") {
        return `${field}:`
      }
      return `${field}: ${value.trim()}`
    }
    return line
  }

  private formatArtifactListItem(line: string): string {
    const match = line.match(/^-\s*id:\s*([A-Za-z0-9_]+)(.*)$/)
    if (match) {
      const [, id, rest] = match
      return `- id: ${id}${rest}`
    }
    return line
  }

  private formatArrayItem(line: string): string {
    const match = line.match(/^-\s+(.+)$/)
    if (match) {
      const [, content] = match
      return `- ${content.trim()}`
    }
    return line
  }

  private trimTrailingWhitespace(text: string): string {
    return text
      .split("\n")
      .map((line) => line.replace(/\s+$/, ""))
      .join("\n")
  }

  // Utility method for validating SOL document structure
  public validateStructure(text: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    const lines = text.split("\n")

    let hasSOLHeader = false
    let hasArtifacts = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.match(/^#\s*SOL\s*-\s*Semantic\s*Operations\s*Language/)) {
        hasSOLHeader = true
      }

      if (
        line.match(
          /^(Vision|Domain|Concept|Policy|Process|Actor|Indicator):\s*$/
        )
      ) {
        hasArtifacts = true
      }
    }

    if (!hasSOLHeader) {
      errors.push("Missing SOL header: # SOL - Semantic Operations Language")
    }

    if (!hasArtifacts) {
      errors.push("No SOL artifacts found in document")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
