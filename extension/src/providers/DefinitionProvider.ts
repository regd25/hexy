/**
 * SOL Definition Provider for Go to Definition (Ctrl+Click)
 *
 * Provides go-to-definition functionality for SOL artifact references.
 * Supports all 20 SOL artifact types and hierarchical references.
 *
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

import * as vscode from "vscode"

export class DefinitionProvider implements vscode.DefinitionProvider {
  private readonly SOL_ARTIFACT_TYPES = [
    // Foundational (4)
    "Intent",
    "Context",
    "Authority",
    "Evaluation",
    // Strategic (6)
    "Vision",
    "Policy",
    "Concept",
    "Principle",
    "Guideline",
    "Indicator",
    // Operational (5)
    "Process",
    "Procedure",
    "Event",
    "Observation",
    "Result",
    // Organizational (2)
    "Actor",
    "Area",
  ]

  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    // Enhanced pattern to match SOL references including hierarchical ones
    const wordRange = document.getWordRangeAtPosition(
      position,
      /(Intent|Context|Authority|Evaluation|Vision|Policy|Concept|Principle|Guideline|Indicator|Process|Procedure|Event|Observation|Result|Actor|Area|Domain)\s*:\s*([A-Z][a-zA-Z0-9_]*(?:\.[A-Z][a-zA-Z0-9_]*)*)/
    )

    if (!wordRange) {
      return undefined
    }

    const text = document.getText(wordRange)
    const match = text.match(
      /(Intent|Context|Authority|Evaluation|Vision|Policy|Concept|Principle|Guideline|Indicator|Process|Procedure|Event|Observation|Result|Actor|Area|Domain)\s*:\s*([A-Z][a-zA-Z0-9_]*(?:\.[A-Z][a-zA-Z0-9_]*)*)/
    )

    if (!match) {
      return undefined
    }

    const artifactType = match[1]
    const artifactId = match[2]

    // Find definition in current document
    const definitionLocation = this.findDefinitionLocation(
      document,
      artifactType,
      artifactId
    )

    if (definitionLocation) {
      return new vscode.Location(document.uri, definitionLocation)
    }

    // Search in workspace for definitions in other files
    return this.searchWorkspaceForDefinition(artifactType, artifactId)
  }

  private findDefinitionLocation(
    document: vscode.TextDocument,
    artifactType: string,
    artifactId: string
  ): vscode.Position | undefined {
    const text = document.getText()

    // Handle hierarchical references (e.g., Area:Technology.Development)
    const idParts = artifactId.split(".")
    const baseId = idParts[0]
    const isHierarchical = idParts.length > 1

    // Pattern 1: Direct artifact definition (e.g., Vision: or Vision:MyVisionId)
    const directPattern = new RegExp(
      `^\\s*${artifactType}\\s*:\\s*${artifactId}\\s*$`,
      "gm"
    )
    let match: RegExpExecArray | null = directPattern.exec(text)
    if (match) {
      return document.positionAt(match.index + match[0].indexOf(artifactId))
    }

    // Pattern 2: Artifact block with separate id field
    const blockPattern = new RegExp(`^\\s*${artifactType}\\s*:\\s*$`, "gm")
    blockPattern.lastIndex = 0

    while ((match = blockPattern.exec(text)) !== null) {
      const position = document.positionAt(match.index)
      const nextLines = this.getNextLines(document, position.line, 20) // Increased search range

      // Look for id field in the block
      if (this.checkIdInLines(nextLines, baseId)) {
        const idPattern = new RegExp(`^\\s*id:\\s*${baseId}\\s*$`, "m")
        for (let i = 0; i < nextLines.length; i++) {
          const idMatch = nextLines[i].match(idPattern)
          if (idMatch) {
            const idLineOffset = i + 1
            const idPosition = new vscode.Position(
              position.line + idLineOffset,
              nextLines[i].indexOf(baseId)
            )
            return idPosition
          }
        }
      }

      // For hierarchical references, also check if this is a parent structure
      if (isHierarchical) {
        const parentIdPattern = new RegExp(`^\\s*id:\\s*${baseId}\\s*$`, "m")
        for (let i = 0; i < nextLines.length; i++) {
          if (parentIdPattern.test(nextLines[i])) {
            // Found parent, now look for hierarchical child definition
            const childId = idParts.slice(1).join(".")
            const hierarchicalPosition = this.findHierarchicalChild(
              document,
              position.line + i + 1,
              childId
            )
            if (hierarchicalPosition) {
              return hierarchicalPosition
            }
          }
        }
      }
    }

    // Pattern 3: Template-style definition with brackets
    const templatePattern = new RegExp(
      `^\\s*${artifactType}\\s*:\\s*\\[${artifactId}\\]`,
      "gm"
    )
    templatePattern.lastIndex = 0
    while ((match = templatePattern.exec(text)) !== null) {
      return document.positionAt(
        match.index + match[0].indexOf(`[${artifactId}]`) + 1
      )
    }

    // Pattern 4: Array item definition
    const arrayPattern = new RegExp(`^\\s*-\\s*id:\\s*${artifactId}\\s*$`, "gm")
    arrayPattern.lastIndex = 0
    while ((match = arrayPattern.exec(text)) !== null) {
      return document.positionAt(match.index + match[0].indexOf(artifactId))
    }

    return undefined
  }

  private findHierarchicalChild(
    document: vscode.TextDocument,
    startLine: number,
    childPath: string
  ): vscode.Position | undefined {
    const childParts = childPath.split(".")
    let currentSearchLine = startLine

    for (const part of childParts) {
      const childPattern = new RegExp(`^\\s*${part}\\s*:`, "m")
      const remainingText = document.getText(
        new vscode.Range(
          new vscode.Position(currentSearchLine, 0),
          new vscode.Position(document.lineCount - 1, 0)
        )
      )

      const match = childPattern.exec(remainingText)
      if (match) {
        const matchPosition = document.positionAt(
          document.offsetAt(new vscode.Position(currentSearchLine, 0)) +
            match.index
        )
        currentSearchLine = matchPosition.line + 1

        // If this is the last part, return its position
        if (part === childParts[childParts.length - 1]) {
          return new vscode.Position(
            matchPosition.line,
            match.index + match[0].indexOf(part)
          )
        }
      } else {
        return undefined
      }
    }

    return undefined
  }

  private getNextLines(
    document: vscode.TextDocument,
    startLine: number,
    count: number
  ): string[] {
    const lines: string[] = []
    const maxLine = Math.min(startLine + count, document.lineCount - 1)

    for (let i = startLine + 1; i <= maxLine; i++) {
      lines.push(document.lineAt(i).text)
    }

    return lines
  }

  private checkIdInLines(lines: string[], targetId: string): boolean {
    return lines.some((line) => {
      const idMatch = line.match(/^\s*(?:-\s*)?id:\s*([A-Za-z0-9_]+)/)
      return idMatch && idMatch[1] === targetId
    })
  }

  private async searchWorkspaceForDefinition(
    artifactType: string,
    artifactId: string
  ): Promise<vscode.Location[]> {
    const locations: vscode.Location[] = []

    try {
      // Search for SOL files in workspace
      const solFiles = await vscode.workspace.findFiles(
        "**/*.{sop,yml,mdop}",
        "**/node_modules/**"
      )

      for (const file of solFiles) {
        const document = await vscode.workspace.openTextDocument(file)
        const definition = this.findDefinitionLocation(
          document,
          artifactType,
          artifactId
        )

        if (definition) {
          locations.push(new vscode.Location(file, definition))
        }
      }
    } catch (error) {
      console.error("Error searching workspace for SOL definitions:", error)
    }

    return locations
  }
}
