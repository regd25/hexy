/**
 * SOL Visualizer Tests
 *
 * Tests to validate the visualization functionality and debug rendering issues.
 *
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

import * as assert from "assert"
import * as vscode from "vscode"
import { SolVisualizer, ArtifactNode } from "../../visualizer/SolVisualizer"

describe("SolVisualizer Tests", () => {
  let visualizer: SolVisualizer

  beforeEach(() => {
    visualizer = new SolVisualizer()
  })

  test("Should parse Area artifacts correctly", async () => {
    const mockDocument =
      createMockDocument(`# SOL - Semantic Operations Language
# Version: v2025.07

Area:
  meta:
    id: TechnologyDepartment
    version: "1.0"
    created: "2024-01-01" 
    status: "active"
    author: "Test Author"
  description: "Department responsible for all technology initiatives"
  vision: Vision:DigitalTransformation

Actor:
  meta:
    id: DevTeamLead
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  type: "Technical Leader"
  area: Area:TechnologyDepartment
`)

    const visualization = await visualizer.generateVisualization(mockDocument)

    console.log("Generated Visualization:")
    console.log("=".repeat(50))
    console.log(visualization)
    console.log("=".repeat(50))

    // Validate that Area artifacts are parsed
    assert.ok(
      visualization.includes("TechnologyDepartment"),
      "Should include Area ID"
    )
    assert.ok(visualization.includes("Area"), "Should include Area type")
    assert.ok(
      visualization.length > 100,
      "Visualization should have substantial content"
    )
  })

  test("Should generate organizational chart with Areas", async () => {
    const mockDocument =
      createMockDocument(`# SOL - Semantic Operations Language
# Version: v2025.07

Vision:
  meta:
    id: DigitalTransformation
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  content: "Transform our organization into a digital-first entity"

Area:
  meta:
    id: TechnologyDepartment
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  description: "Department responsible for all technology initiatives"
  vision: Vision:DigitalTransformation

Actor:
  meta:
    id: DevTeamLead
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  type: "Technical Leader"
  capabilities: ["Team Management", "Technical Architecture", "Code Review"]
  area: Area:TechnologyDepartment

Actor:
  meta:
    id: Frontend
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  type: "Development Role"
  capabilities: ["React", "TypeScript", "UI/UX"]
  area: Area:TechnologyDepartment

Process:
  meta:
    id: UserRegistration
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  vision: Vision:DigitalTransformation
  area: Area:TechnologyDepartment
  description: "Complete user registration workflow"
  steps:
    - Actor:Frontend → "Render registration form with validation"
    - Actor:Backend → "Validate user input and check duplicates"
    - Actor:Backend → "Create user account in database"
    - Actor:Frontend → "Display success confirmation"
  endCondition: "User successfully registered and confirmed"
`)

    const visualization = await visualizer.generateVisualization(mockDocument)

    console.log("Organizational Chart Test:")
    console.log("=".repeat(50))
    console.log(visualization)
    console.log("=".repeat(50))

    // Validate content structure
    assert.ok(
      visualization.includes("📊 SOL Document Analysis Report"),
      "Should have report header"
    )
    assert.ok(
      visualization.includes("TechnologyDepartment"),
      "Should include Area"
    )
    assert.ok(visualization.includes("DevTeamLead"), "Should include Actor")
    assert.ok(
      visualization.includes("UserRegistration"),
      "Should include Process"
    )

    // Validate Mermaid diagrams are generated
    assert.ok(
      visualization.includes("```mermaid"),
      "Should contain Mermaid diagrams"
    )
    assert.ok(
      visualization.includes("graph"),
      "Should contain graph definitions"
    )
  })

  test("Should handle empty document gracefully", async () => {
    const mockDocument = createMockDocument("")

    const visualization = await visualizer.generateVisualization(mockDocument)

    console.log("Empty Document Test:")
    console.log("=".repeat(30))
    console.log(visualization)
    console.log("=".repeat(30))

    assert.ok(
      visualization.length > 0,
      "Should generate content even for empty document"
    )
    assert.ok(
      visualization.includes("📊 SOL Document Analysis Report"),
      "Should have report header"
    )
  })

  test("Should generate process flow diagrams", async () => {
    const mockDocument =
      createMockDocument(`# SOL - Semantic Operations Language
# Version: v2025.07

Actor:
  meta:
    id: Frontend
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  type: "Development Role"

Actor:
  meta:
    id: Backend
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  type: "Development Role"

Process:
  meta:
    id: TestProcess
    version: "1.0"
    created: "2024-01-01"
    status: "active"
    author: "Test Author"
  vision: Vision:DigitalTransformation
  description: "Test process for validation"
  steps:
    - Actor:Frontend → "Step 1"
    - Actor:Backend → "Step 2"
  endCondition: "Process completed"
`)

    const visualization = await visualizer.generateVisualization(mockDocument)

    console.log("Process Flow Test:")
    console.log("=".repeat(40))
    console.log(visualization)
    console.log("=".repeat(40))

    assert.ok(
      visualization.includes("Process Flow"),
      "Should include process flow section"
    )
    assert.ok(
      visualization.includes("TestProcess"),
      "Should include process ID"
    )
  })

  test("Should validate webview HTML generation", () => {
    const mockContent = "# Test Content\n\nThis is a test."

    // Simulate the webview content generation
    const webviewContent = generateWebviewContent(mockContent)

    console.log("Webview HTML Test:")
    console.log("=".repeat(40))
    console.log(webviewContent.substring(0, 500) + "...")
    console.log("=".repeat(40))

    assert.ok(
      webviewContent.includes("<!DOCTYPE html>"),
      "Should be valid HTML"
    )
    assert.ok(
      webviewContent.includes("mermaid"),
      "Should include Mermaid library"
    )
    assert.ok(
      webviewContent.includes("Test Content"),
      "Should include the content"
    )
    assert.ok(
      webviewContent.includes("vscode-editor-background"),
      "Should use VSCode theming"
    )
  })
})

// Helper functions
function createMockDocument(content: string): vscode.TextDocument {
  const lines = content.split("\n")

  return {
    uri: vscode.Uri.parse("test://test.sop"),
    fileName: "test.sop",
    languageId: "sol",
    version: 1,
    isDirty: false,
    isClosed: false,
    isUntitled: false,
    encoding: "utf8",
    save: async () => true,
    eol: vscode.EndOfLine.LF,
    lineCount: lines.length,
    lineAt: ((lineOrPosition: number | vscode.Position) => {
      const lineNumber =
        typeof lineOrPosition === "number"
          ? lineOrPosition
          : lineOrPosition.line
      const text = lines[lineNumber] || ""
      return {
        lineNumber,
        text,
        range: new vscode.Range(lineNumber, 0, lineNumber, text.length),
        rangeIncludingLineBreak: new vscode.Range(
          lineNumber,
          0,
          lineNumber + 1,
          0
        ),
        firstNonWhitespaceCharacterIndex: 0,
        isEmptyOrWhitespace: text.trim().length === 0,
      }
    }) as any,
    offsetAt: (position: vscode.Position) => 0,
    positionAt: (offset: number) => new vscode.Position(0, 0),
    getText: (range?: vscode.Range) => content,
    getWordRangeAtPosition: () => undefined,
    validateRange: (range: vscode.Range) => range,
    validatePosition: (position: vscode.Position) => position,
  } as unknown as vscode.TextDocument
}

function generateWebviewContent(markdownContent: string): string {
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
        h1, h2, h3 { color: var(--vscode-textLink-foreground); }
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
    </style>
</head>
<body>
    <div id="content"></div>
    
    <script>
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            themeVariables: {
                fontFamily: 'Segoe UI',
                fontSize: '14px'
            }
        });
        
        const markdownContent = \`${markdownContent.replace(/`/g, "\\`")}\`;
        
        // Simple markdown to HTML converter with Mermaid support
        function convertMarkdownToHTML(markdown) {
            let html = markdown
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^\*\*(.*)\*\*/gm, '<strong>$1</strong>')
                .replace(/^\* (.*$)/gm, '<li>$1</li>')
                .replace(/^- (.*$)/gm, '<li>$1</li>')
                .replace(/\\n\\n/g, '</p><p>')
                .replace(/\\n/g, '<br>');
                
            // Wrap consecutive <li> elements in <ul>
            html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
            
            // Handle tables
            html = html.replace(/\\|(.*)\\|/g, (match, content) => {
                const cells = content.split('|').map(cell => cell.trim());
                return '<tr>' + cells.map(cell => \`<td>\${cell}</td>\`).join('') + '</tr>';
            });
            
            return \`<p>\${html}</p>\`;
        }
        
        document.getElementById('content').innerHTML = convertMarkdownToHTML(markdownContent);
        
        // Re-initialize Mermaid after content is loaded
        setTimeout(() => {
            mermaid.init();
        }, 100);
    </script>
</body>
</html>`
}
