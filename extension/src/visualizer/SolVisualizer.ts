/**
 * SOL Visualizer
 *
 * Converts SOL artifacts into visual diagrams using Mermaid and Markdown
 * following SOL semantic principles:
 * - Actor relationships and hierarchies
 * - Process flows with semantic notation
 * - Artifact dependencies and traceability
 * - Organizational structure visualization
 *
 * Based on the SOL project: https://github.com/regd25/sol
 *
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

import * as vscode from "vscode"

export interface ArtifactNode {
  type: string
  id: string
  title?: string
  description?: string
  line: number
  references: string[]
  referencedBy: string[]
}

export interface ProcessFlow {
  id: string
  steps: ProcessStep[]
  actors: string[]
}

export interface ProcessStep {
  step: number
  actor: string
  action: string
  inputs: string[]
  outputs: string[]
}

export class SolVisualizer {
  private artifacts: Map<string, ArtifactNode> = new Map()
  private processes: Map<string, ProcessFlow> = new Map()

  /**
   * Creates a visual representation of SOL document
   */
  public async generateVisualization(
    document: vscode.TextDocument
  ): Promise<string> {
    // Parse document and extract artifacts
    this.parseDocument(document)

    // Generate different visualization types
    const markdown = this.generateMarkdownReport()
    const orgChart = this.generateOrganizationalChart()
    const processFlows = this.generateProcessFlowDiagrams()
    const dependencyGraph = this.generateDependencyGraph()
    const artifactMatrix = this.generateArtifactMatrix()

    // Combine all visualizations
    return this.combineVisualizations(
      markdown,
      orgChart,
      processFlows,
      dependencyGraph,
      artifactMatrix
    )
  }

  private parseDocument(document: vscode.TextDocument): void {
    const text = document.getText()
    const lines = text.split("\n")

    let currentArtifact: ArtifactNode | null = null
    let currentProcess: ProcessFlow | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Detect artifact definitions
      const artifactMatch = line.match(/^([A-Z][a-zA-Z0-9]*):$/)
      if (artifactMatch) {
        const artifactType = artifactMatch[1]

        // Look for ID in meta block or direct id field
        const artifactId = this.findIdInNextLines(lines, i)
        if (artifactId) {
          currentArtifact = {
            type: artifactType,
            id: artifactId,
            line: i,
            references: [],
            referencedBy: [],
          }
          // Use colon notation for SOL (correct format)
          this.artifacts.set(`${artifactType}:${artifactId}`, currentArtifact)
        }
        continue
      }

      // Extract description/content for current artifact
      if (currentArtifact) {
        const descMatch = line.match(
          /^(?:description|content|statement):\s*(.+)$/
        )
        if (descMatch) {
          currentArtifact.description = descMatch[1].replace(/^"(.*)"$/, "$1")
        }

        // Extract references using colon notation (SOL format)
        const refMatch = line.match(/([A-Z][a-zA-Z0-9]*):([A-Z][a-zA-Z0-9]*)/g)
        if (refMatch) {
          refMatch.forEach((ref) => {
            if (!currentArtifact!.references.includes(ref)) {
              currentArtifact!.references.push(ref)
            }
          })
        }
      }

      // Parse process flows with colon notation
      if (currentArtifact?.type === "Process" && line.includes("Actor:")) {
        if (!currentProcess) {
          currentProcess = {
            id: currentArtifact.id,
            steps: [],
            actors: [],
          }
        }

        // Match flow notation: Actor:ActorId → "action"
        const actorFlowMatch = line.match(
          /Actor:([A-Za-z0-9]*)\s*→\s*"([^"]+)"/
        )
        if (actorFlowMatch) {
          const actor = actorFlowMatch[1]
          const action = actorFlowMatch[2]

          if (!currentProcess.actors.includes(actor)) {
            currentProcess.actors.push(actor)
          }

          currentProcess.steps.push({
            step: currentProcess.steps.length + 1,
            actor,
            action,
            inputs: [],
            outputs: [],
          })
        }
      }

      // Save completed process
      if (
        currentProcess &&
        (line.startsWith("endCondition:") || artifactMatch)
      ) {
        this.processes.set(currentProcess.id, currentProcess)
        currentProcess = null
      }
    }

    // Build reverse references
    this.buildReverseReferences()
  }

  private findIdInNextLines(lines: string[], startLine: number): string | null {
    for (
      let i = startLine + 1;
      i < Math.min(startLine + 10, lines.length);
      i++
    ) {
      // Look for id in meta block or direct id field
      const metaIdMatch = lines[i].match(/^\s*id:\s*([A-Za-z0-9_]+)/)
      if (metaIdMatch) {
        return metaIdMatch[1]
      }

      // Also handle old format for backward compatibility
      const directIdMatch = lines[i].match(/^\s*(?:-\s*)?id:\s*([A-Za-z0-9_]+)/)
      if (directIdMatch) {
        return directIdMatch[1]
      }
    }
    return null
  }

  private buildReverseReferences(): void {
    for (const [key, artifact] of this.artifacts) {
      for (const ref of artifact.references) {
        const referencedArtifact = this.artifacts.get(ref)
        if (
          referencedArtifact &&
          !referencedArtifact.referencedBy.includes(key)
        ) {
          referencedArtifact.referencedBy.push(key)
        }
      }
    }
  }

  private generateMarkdownReport(): string {
    return `# 📊 SOL Document Analysis Report

## 📈 Summary Statistics

- **Total Artifacts:** ${this.artifacts.size}
- **Processes:** ${
      Array.from(this.artifacts.values()).filter((a) => a.type === "Process")
        .length
    }
- **Actors:** ${
      Array.from(this.artifacts.values()).filter((a) => a.type === "Actor")
        .length
    }
- **Visions:** ${
      Array.from(this.artifacts.values()).filter((a) => a.type === "Vision")
        .length
    }
- **Policies:** ${
      Array.from(this.artifacts.values()).filter((a) => a.type === "Policy")
        .length
    }

## 🎯 Artifacts by Type

${this.generateArtifactsByType()}

## 🔗 Reference Analysis

${this.generateReferenceAnalysis()}
`
  }

  private generateArtifactsByType(): string {
    const artifactsByType = new Map<string, ArtifactNode[]>()

    for (const artifact of this.artifacts.values()) {
      if (!artifactsByType.has(artifact.type)) {
        artifactsByType.set(artifact.type, [])
      }
      artifactsByType.get(artifact.type)!.push(artifact)
    }

    let result = ""
    for (const [type, artifacts] of artifactsByType) {
      result += `### ${type} (${artifacts.length})\n\n`
      for (const artifact of artifacts) {
        result += `- **${artifact.id}**`
        if (artifact.description) {
          result += `: ${artifact.description.substring(0, 100)}${
            artifact.description.length > 100 ? "..." : ""
          }`
        }
        result += ` *(Line ${artifact.line + 1})*\n`
      }
      result += "\n"
    }

    return result
  }

  private generateReferenceAnalysis(): string {
    let result = ""

    // Most referenced artifacts
    const mostReferenced = Array.from(this.artifacts.values())
      .filter((a) => a.referencedBy.length > 0)
      .sort((a, b) => b.referencedBy.length - a.referencedBy.length)
      .slice(0, 5)

    if (mostReferenced.length > 0) {
      result += "### 🔥 Most Referenced Artifacts\n\n"
      for (const artifact of mostReferenced) {
        result += `- **${artifact.type}:${artifact.id}** (${artifact.referencedBy.length} references)\n`
      }
      result += "\n"
    }

    // Orphaned artifacts (no references)
    const orphaned = Array.from(this.artifacts.values()).filter(
      (a) => a.referencedBy.length === 0 && a.references.length === 0
    )

    if (orphaned.length > 0) {
      result += "### 🔍 Orphaned Artifacts (No References)\n\n"
      for (const artifact of orphaned) {
        result += `- **${artifact.type}:${artifact.id}** - Consider adding references or removing if unused\n`
      }
      result += "\n"
    }

    return result
  }

  private generateOrganizationalChart(): string {
    const actors = Array.from(this.artifacts.values()).filter(
      (a) => a.type === "Actor"
    )
    const areas = Array.from(this.artifacts.values()).filter(
      (a) => a.type === "Area"
    )

    return `
## 🏢 Organizational Structure

\`\`\`mermaid
graph TD
    subgraph "Organizational Hierarchy"
${this.generateActorHierarchy(actors, areas)}
    end
\`\`\`
`
  }

  private generateActorHierarchy(
    actors: ArtifactNode[],
    areas: ArtifactNode[]
  ): string {
    let result = ""

    // Add areas
    for (const area of areas) {
      result += `        ${area.id}[${area.id}]\n`
      result += `        ${area.id} --> ${area.id}_Team[Team]\n`
    }

    // Add actors with connections to areas
    for (const actor of actors) {
      result += `        ${actor.id}[${actor.id}]\n`

      // Try to connect actor to area based on references
      for (const ref of actor.references) {
        if (ref.startsWith("Area:")) {
          const areaId = ref.split(":")[1]
          result += `        ${areaId}_Team --> ${actor.id}\n`
          break
        }
      }
    }

    return result
  }

  private generateProcessFlowDiagrams(): string {
    if (this.processes.size === 0) {
      return ""
    }

    let result = "\n## 🔄 Process Flows\n\n"

    for (const [processId, process] of this.processes) {
      result += `### Process: ${processId}\n\n`
      result += `**Actors Involved:** ${process.actors.join(", ")}\n\n`

      result += `\`\`\`mermaid
flowchart TD
    Start([Start]) --> Step1
${this.generateProcessSteps(process)}
    Step${process.steps.length} --> End([End])
\`\`\`

`
    }

    return result
  }

  private generateProcessSteps(process: ProcessFlow): string {
    let result = ""

    for (let i = 0; i < process.steps.length; i++) {
      const step = process.steps[i]
      const stepNode = `Step${step.step}`
      const nextStep =
        i < process.steps.length - 1 ? `Step${step.step + 1}` : "End"

      result += `    ${stepNode}["${step.actor}<br/>${step.action}"]\n`
      if (nextStep !== "End") {
        result += `    ${stepNode} --> ${nextStep}\n`
      }
    }

    return result
  }

  private generateDependencyGraph(): string {
    const dependencies = this.extractDependencies()

    if (dependencies.length === 0) {
      return ""
    }

    return `
## 🕸️ Artifact Dependencies

\`\`\`mermaid
graph LR
${dependencies.map((dep) => `    ${dep.from} --> ${dep.to}`).join("\n")}
\`\`\`
`
  }

  private extractDependencies(): Array<{ from: string; to: string }> {
    const deps: Array<{ from: string; to: string }> = []

    for (const [key, artifact] of this.artifacts) {
      for (const ref of artifact.references) {
        if (this.artifacts.has(ref)) {
          deps.push({
            from: `${artifact.type}_${artifact.id}`,
            to: ref.replace(":", "_"),
          })
        }
      }
    }

    return deps
  }

  private generateArtifactMatrix(): string {
    const types = ["Vision", "Policy", "Process", "Actor", "Area"]
    let result = "\n## 📋 Artifact Relationship Matrix\n\n"

    result += "| From \\ To | " + types.join(" | ") + " |\n"
    result +=
      "|" +
      Array(types.length + 1)
        .fill("---")
        .join("|") +
      "|\n"

    for (const fromType of types) {
      const fromArtifacts = Array.from(this.artifacts.values()).filter(
        (a) => a.type === fromType
      )
      const row = [fromType]

      for (const toType of types) {
        const connections = fromArtifacts.reduce((count, artifact) => {
          return (
            count +
            artifact.references.filter((ref) => ref.startsWith(toType + ":"))
              .length
          )
        }, 0)
        row.push(connections.toString())
      }

      result += "| " + row.join(" | ") + " |\n"
    }

    return result
  }

  private combineVisualizations(
    markdown: string,
    orgChart: string,
    processFlows: string,
    dependencyGraph: string,
    artifactMatrix: string
  ): string {
    return `${markdown}${orgChart}${processFlows}${dependencyGraph}${artifactMatrix}

---

*Generated by SOL Visualizer - Semantic Operations Language Extension*
*Based on semantic analysis of SOL artifacts and their relationships*
`
  }
}

/**
 * SOL Visualizer Panel Manager
 */
export class VisualizerPanel {
  public static currentPanel: VisualizerPanel | undefined

  private readonly panel: vscode.WebviewPanel
  private readonly extensionUri: vscode.Uri
  private visualizer: SolVisualizer

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel
    this.extensionUri = extensionUri
    this.visualizer = new SolVisualizer()

    this.update()
    this.panel.onDidDispose(() => this.dispose(), null)
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    if (VisualizerPanel.currentPanel) {
      VisualizerPanel.currentPanel.panel.reveal(column)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      "solVisualizer",
      "SOL Visual Diagram",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
      }
    )

    VisualizerPanel.currentPanel = new VisualizerPanel(panel, extensionUri)
  }

  public async updateVisualization(document: vscode.TextDocument) {
    const visualization = await this.visualizer.generateVisualization(document)
    this.panel.webview.html = this.getWebviewContent(visualization)
  }

  private async update() {
    const activeEditor = vscode.window.activeTextEditor
    if (
      activeEditor &&
      (activeEditor.document.languageId === "sol" ||
        activeEditor.document.languageId === "sol-yaml")
    ) {
      await this.updateVisualization(activeEditor.document)
    } else {
      this.panel.webview.html = this.getWebviewContent(
        "# No SOL document active\n\nOpen a .sop file to see visualization."
      )
    }
  }

  private getWebviewContent(markdownContent: string): string {
    // Escape backticks properly for JavaScript template literal
    const escapedContent = markdownContent
      .replace(/`/g, "\\`")
      .replace(/\$/g, "\\$")

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOL Visual Diagram</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        h1, h2, h3 { 
            color: var(--vscode-textLink-foreground); 
            margin-top: 2em;
            margin-bottom: 1em;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.2em; }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid var(--vscode-panel-border);
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: var(--vscode-editor-lineHighlightBackground);
            font-weight: bold;
        }
        .mermaid {
            background-color: white;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .stats {
            background-color: var(--vscode-editor-lineHighlightBackground);
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .artifact-list {
            background-color: var(--vscode-editor-selectionBackground);
            padding: 10px;
            border-radius: 3px;
            margin: 10px 0;
        }
        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        li {
            margin: 0.5em 0;
        }
        p {
            margin: 1em 0;
        }
        strong {
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        hr {
            border: none;
            border-top: 1px solid var(--vscode-panel-border);
            margin: 2em 0;
        }
        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1em 0;
        }
    </style>
</head>
<body>
    <div id="content">Loading SOL visualization...</div>
    
    <script>
        try {
            mermaid.initialize({ 
                startOnLoad: true,
                theme: 'default',
                themeVariables: {
                    fontFamily: 'Segoe UI',
                    fontSize: '14px'
                },
                securityLevel: 'loose'
            });
            
            const markdownContent = \`${escapedContent}\`;
            console.log('Markdown content loaded:', markdownContent.substring(0, 100) + '...');
            
            // Simple but effective markdown to HTML converter
            function convertMarkdownToHTML(markdown) {
                let html = markdown;
                
                // Headers
                html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
                html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
                html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
                
                // Bold text
                html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                
                // List items
                html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
                html = html.replace(/^\\* (.*$)/gm, '<li>$1</li>');
                
                // Wrap consecutive list items in ul tags
                html = html.replace(/((<li>.*?<\\/li>\\s*)+)/gs, '<ul>$1</ul>');
                
                // Horizontal rules
                html = html.replace(/^---\\s*$/gm, '<hr>');
                
                // Paragraphs (convert double newlines to paragraph breaks)
                html = html.replace(/\\n\\n/g, '</p><p>');
                html = '<p>' + html + '</p>';
                
                // Clean up empty paragraphs
                html = html.replace(/<p>\\s*<\\/p>/g, '');
                html = html.replace(/<p>\\s*(<h[1-6]>)/g, '$1');
                html = html.replace(/(<\\/h[1-6]>)\\s*<\\/p>/g, '$1');
                html = html.replace(/<p>\\s*(<ul>)/g, '$1');
                html = html.replace(/(<\\/ul>)\\s*<\\/p>/g, '$1');
                html = html.replace(/<p>\\s*(<hr>)/g, '$1');
                html = html.replace(/(<hr>)\\s*<\\/p>/g, '$1');
                
                // Single newlines to br tags within paragraphs
                html = html.replace(/\\n/g, '<br>');
                
                return html;
            }
            
            const htmlContent = convertMarkdownToHTML(markdownContent);
            console.log('HTML content generated:', htmlContent.substring(0, 200) + '...');
            
            document.getElementById('content').innerHTML = htmlContent;
            
            // Re-initialize Mermaid after content is loaded
            setTimeout(() => {
                try {
                    mermaid.init();
                    console.log('Mermaid initialized successfully');
                } catch (mermaidError) {
                    console.error('Mermaid initialization error:', mermaidError);
                }
            }, 500);
            
        } catch (error) {
            console.error('Error in webview script:', error);
            document.getElementById('content').innerHTML = \`
                <h1>Error Loading SOL Visualization</h1>
                <p>An error occurred while loading the visualization: \${error.message}</p>
                <pre>\${error.stack}</pre>
                <hr>
                <h2>Raw Content</h2>
                <pre>\${markdownContent}</pre>
            \`;
        }
    </script>
</body>
</html>`
  }

  private dispose() {
    VisualizerPanel.currentPanel = undefined
    this.panel.dispose()
  }
}
