import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  DefinitionParams,
  Location,
  InitializeResult,
  DocumentSymbolParams,
  SymbolInformation,
  SymbolKind,
  Hover,
  HoverParams,
  CompletionParams,
} from "vscode-languageserver/node"

import { TextDocument } from "vscode-languageserver-textdocument"

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)

let hasConfigurationCapability: boolean = false
let hasWorkspaceFolderCapability: boolean = false
let hasDiagnosticRelatedInformationCapability: boolean = false

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back to a default client setup
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  )
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  )
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  )

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: {
        openClose: true,
        change: TextDocumentSyncKind.Full,
      },
      // Tell the client that the server supports code completion
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [':']
      },
      // Tell the client that the server supports 'go to definition'
      definitionProvider: true,
      // Tell the client that the server supports document symbols
      documentSymbolProvider: true,
      // Tell the client that the server supports hover
      hoverProvider: true,
    },
  }
  if (hasWorkspaceFolderCapability) {
    ;(result.capabilities as any).workspace = {
      workspaceFolders: {
        supported: true,
      },
    }
  }
  return result
})

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    )
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((event) => {
      console.log("Workspace folder changes received:", event)
    })
  }
})

interface SolArtifact {
  id: string
  type: string
  location: Location
  content?: string
  vision?: string
  description?: string
  actors?: string[]
  steps?: string[]
}

// SOL Artifact types following SOL principles
const SOL_ARTIFACT_TYPES = [
  'Vision', 'Domain', 'Concept', 'Policy', 'Process', 'Actor', 
  'Indicator', 'Result', 'Signal', 'Observation', 'Authority', 'Protocol'
]

const SOL_FIELDS = [
  'id', 'content', 'description', 'steps', 'actors', 'type', 'vision', 
  'premise', 'measurement', 'unit', 'goal', 'issuedBy', 'reason', 
  'timestamp', 'author', 'date', 'language', 'tags', 'capabilities', 
  'domain', 'indicators', 'policies', 'processes'
]

function parseSolDocument(document: TextDocument): SolArtifact[] {
  const artifacts: SolArtifact[] = []
  const lines = document.getText().split("\n")

  let currentArtifactType: string | null = null
  let currentArtifact: Partial<SolArtifact> | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect SOL header
    const headerMatch = line.match(/^#\s*SOL\s*-\s*Semantic\s*Operations\s*Language/)
    if (headerMatch) {
      continue
    }

    // Detect top-level artifact type (e.g., "Vision:", "Policy:", "Actor:")
    const typeMatch = line.match(/^([a-zA-Z_]+):\s*$/)
    if (typeMatch && SOL_ARTIFACT_TYPES.includes(typeMatch[1])) {
      currentArtifactType = typeMatch[1]
      currentArtifact = {
        type: currentArtifactType,
        location: Location.create(document.uri, {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        }),
      }
      continue
    }

    // Detect ID within an artifact block
    // Handles both list items (- id: MyVision) and single items (id: MyDomain)
    const idMatch =
      line.match(/^\s*-\s*id:\s*([a-zA-Z0-9_]+)\s*$/) ||
      line.match(/^\s*id:\s*([a-zA-Z0-9_]+)\s*$/)

    if (idMatch && currentArtifactType) {
      const id = idMatch[1]
      const artifact: SolArtifact = {
        id: id,
        type: currentArtifactType,
        location: Location.create(document.uri, {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        }),
      }

      // Parse additional fields for the artifact
      parseArtifactFields(artifact, lines, i)
      artifacts.push(artifact)
    }

    // Detect content field for current artifact
    const contentMatch = line.match(/^\s*content:\s*(.+)$/)
    if (contentMatch && currentArtifact) {
      currentArtifact.content = contentMatch[1]
    }

    // Detect vision reference
    const visionMatch = line.match(/^\s*vision:\s*([a-zA-Z0-9_]+)\s*$/)
    if (visionMatch && currentArtifact) {
      currentArtifact.vision = visionMatch[1]
    }

    // Detect description
    const descriptionMatch = line.match(/^\s*description:\s*(.+)$/)
    if (descriptionMatch && currentArtifact) {
      currentArtifact.description = descriptionMatch[1]
    }
  }

  return artifacts
}

function parseArtifactFields(artifact: SolArtifact, lines: string[], startLine: number) {
  for (let i = startLine + 1; i < lines.length; i++) {
    const line = lines[i]
    
    // Stop if we hit another artifact or empty line
    if (line.match(/^\s*-\s*id:/) || line.match(/^[a-zA-Z_]+:\s*$/) || line.trim() === '') {
      break
    }

    // Parse vision reference
    const visionMatch = line.match(/^\s*vision:\s*([a-zA-Z0-9_]+)/)
    if (visionMatch) {
      artifact.vision = visionMatch[1]
    }

    // Parse description
    const descriptionMatch = line.match(/^\s*description:\s*(.+)/)
    if (descriptionMatch) {
      artifact.description = descriptionMatch[1]
    }

    // Parse actors array
    const actorsMatch = line.match(/^\s*actors:\s*$/)
    if (actorsMatch) {
      artifact.actors = []
      // Parse subsequent list items
      for (let j = i + 1; j < lines.length; j++) {
        const actorLine = lines[j]
        const actorMatch = actorLine.match(/^\s*-\s*([a-zA-Z0-9_]+)/)
        if (actorMatch) {
          artifact.actors.push(actorMatch[1])
        } else if (actorLine.trim() !== '' && !actorLine.match(/^\s*-/)) {
          break
        }
      }
    }

    // Parse steps array
    const stepsMatch = line.match(/^\s*steps:\s*$/)
    if (stepsMatch) {
      artifact.steps = []
      // Parse subsequent list items
      for (let j = i + 1; j < lines.length; j++) {
        const stepLine = lines[j]
        const stepMatch = stepLine.match(/^\s*-\s*(.+)/)
        if (stepMatch) {
          artifact.steps.push(stepMatch[1])
        } else if (stepLine.trim() !== '' && !stepLine.match(/^\s*-/)) {
          break
        }
      }
    }
  }
}

// Helper function to get the word under the cursor
function getWordAtPosition(line: string, character: number): string | null {
  const left = line.substring(0, character)
  const right = line.substring(character)

  const leftMatch = left.match(/[a-zA-Z0-9_]+$/)
  const rightMatch = right.match(/^[a-zA-Z0-9_]+/)

  if (leftMatch && rightMatch) {
    return leftMatch[0] + rightMatch[0]
  } else if (leftMatch) {
    return leftMatch[0]
  } else if (rightMatch) {
    return rightMatch[0]
  }
  return null
}

// Enhanced completion provider with SOL-specific completions
connection.onCompletion((params: CompletionParams): CompletionItem[] => {
  const document = documents.get(params.textDocument.uri)
  if (!document) {
    return []
  }

  const position = params.position
  const line = document.getText().split("\n")[position.line]
  const completions: CompletionItem[] = []

  // Provide SOL artifact type completions
  if (line.match(/^\s*$/)) {
    SOL_ARTIFACT_TYPES.forEach(type => {
      completions.push({
        label: type,
        kind: CompletionItemKind.Class,
        detail: `SOL ${type} artifact`,
        documentation: `Create a new ${type} artifact following SOL principles`,
        insertText: `${type}:\n  - id: ${type}Example\n    description: ""\n    vision: `
      })
    })
  }

  // Provide field completions
  if (line.match(/^\s*-?\s*$/)) {
    SOL_FIELDS.forEach(field => {
      completions.push({
        label: field,
        kind: CompletionItemKind.Field,
        detail: `SOL ${field} field`,
        insertText: `${field}: `
      })
    })
  }

  // Provide artifact reference completions
  if (line.match(/^\s*(vision|domain|actors|issuedBy):\s*$/)) {
    const artifacts = parseSolDocument(document)
    const fieldName = line.match(/^\s*(\w+):/)?.[1]
    
    artifacts.forEach(artifact => {
      if (shouldSuggestArtifact(fieldName, artifact.type)) {
        completions.push({
          label: artifact.id,
          kind: CompletionItemKind.Reference,
          detail: `${artifact.type}: ${artifact.description || artifact.content || ''}`,
          documentation: `Reference to ${artifact.type} artifact "${artifact.id}"`
        })
      }
    })
  }

  return completions
})

function shouldSuggestArtifact(fieldName: string | undefined, artifactType: string): boolean {
  switch (fieldName) {
    case 'vision':
      return artifactType === 'Vision'
    case 'domain':
      return artifactType === 'Domain'
    case 'actors':
    case 'issuedBy':
      return artifactType === 'Actor'
    default:
      return true
  }
}

// Enhanced hover provider with SOL-specific information
connection.onHover((params: HoverParams): Hover | null => {
  const document = documents.get(params.textDocument.uri)
  if (!document) {
    return null
  }

  const position = params.position
  const line = document.getText().split("\n")[position.line]
  const word = getWordAtPosition(line, position.character)

  if (!word) {
    return null
  }

  const artifacts = parseSolDocument(document)
  const artifact = artifacts.find(art => art.id === word)

  if (artifact) {
    let contents = `**${artifact.type}**: ${artifact.id}\n\n`
    
    if (artifact.description) {
      contents += `**Description**: ${artifact.description}\n\n`
    }
    
    if (artifact.content) {
      contents += `**Content**: ${artifact.content}\n\n`
    }
    
    if (artifact.vision) {
      contents += `**Vision**: ${artifact.vision}\n\n`
    }
    
    if (artifact.actors && artifact.actors.length > 0) {
      contents += `**Actors**: ${artifact.actors.join(', ')}\n\n`
    }
    
    if (artifact.steps && artifact.steps.length > 0) {
      contents += `**Steps**: ${artifact.steps.length} steps\n\n`
    }
    
    contents += `*Following SOL principles: Semantic Coherence, Traceability, Simplicity, Documentation*`

    return {
      contents: {
        kind: 'markdown',
        value: contents
      }
    }
  }

  // Check if word is a SOL artifact type
  if (SOL_ARTIFACT_TYPES.includes(word)) {
    return {
      contents: {
        kind: 'markdown',
        value: `**SOL Artifact Type**: ${word}\n\nA core SOL artifact that maintains semantic coherence and strategic traceability.`
      }
    }
  }

  // Check if word is a SOL field
  if (SOL_FIELDS.includes(word)) {
    return {
      contents: {
        kind: 'markdown',
        value: `**SOL Field**: ${word}\n\nA structured field that contributes to SOL's semantic operations and narrative integrity.`
      }
    }
  }

  return null
})

// Document symbols provider for SOL artifacts
connection.onDocumentSymbol((params: DocumentSymbolParams): SymbolInformation[] => {
  const document = documents.get(params.textDocument.uri)
  if (!document) {
    return []
  }

  const artifacts = parseSolDocument(document)
  return artifacts.map(artifact => ({
    name: `${artifact.id} (${artifact.type})`,
    kind: getSymbolKind(artifact.type),
    location: artifact.location,
    containerName: artifact.vision ? `Vision: ${artifact.vision}` : undefined
  }))
})

function getSymbolKind(artifactType: string): SymbolKind {
  switch (artifactType) {
    case 'Vision':
      return SymbolKind.Namespace
    case 'Domain':
      return SymbolKind.Module
    case 'Process':
      return SymbolKind.Function
    case 'Actor':
      return SymbolKind.Class
    case 'Policy':
      return SymbolKind.Interface
    case 'Indicator':
      return SymbolKind.Variable
    default:
      return SymbolKind.Object
  }
}

// Enhanced definition provider with better SOL support
connection.onDefinition((params: DefinitionParams): Location | null => {
  const document = documents.get(params.textDocument.uri)
  if (!document) {
    return null
  }

  const position = params.position
  const line = document.getText().split("\n")[position.line]
  const word = getWordAtPosition(line, position.character)

  if (!word) {
    return null
  }

  const artifacts = parseSolDocument(document)

  // Enhanced reference detection with SOL semantic awareness
  const referencePatterns = [
    { pattern: /vision:\s*([a-zA-Z0-9_]+)/, type: 'Vision' },
    { pattern: /domain:\s*([a-zA-Z0-9_]+)/, type: 'Domain' },
    { pattern: /actors:\s*-\s*([a-zA-Z0-9_]+)/, type: 'Actor' },
    { pattern: /issuedBy:\s*([a-zA-Z0-9_]+)/, type: 'Actor' },
    { pattern: /\(Policy:\s*([a-zA-Z0-9_]+)\)/, type: 'Policy' },
    { pattern: /\(Process:\s*([a-zA-Z0-9_]+)\)/, type: 'Process' },
    { pattern: /\(Actor:\s*([a-zA-Z0-9_]+)\)/, type: 'Actor' },
    { pattern: /\(Vision:\s*([a-zA-Z0-9_]+)\)/, type: 'Vision' },
    { pattern: /\(Domain:\s*([a-zA-Z0-9_]+)\)/, type: 'Domain' },
  ]

  for (const refPattern of referencePatterns) {
    const refMatch = line.match(refPattern.pattern)
    if (refMatch && refMatch[1] === word) {
      const wordStartInLine = line.indexOf(word, refMatch.index! + refMatch[0].indexOf(word))
      if (position.character >= wordStartInLine && position.character <= wordStartInLine + word.length) {
        const definition = artifacts.find(art => art.id === word && art.type === refPattern.type)
        if (definition) {
          return definition.location
        }
      }
    }
  }

  // Check for actor execution references (e.g., "ActorID ->")
  const actorExecutionRefMatch = line.match(/^\s*([a-zA-Z0-9_]+)(?:\s*\([^)]*\))?\s*[->→]/)
  if (actorExecutionRefMatch && actorExecutionRefMatch[1] === word) {
    const wordStartInLine = line.indexOf(word, actorExecutionRefMatch.index! + actorExecutionRefMatch[0].indexOf(word))
    if (position.character >= wordStartInLine && position.character <= wordStartInLine + word.length) {
      const definition = artifacts.find(art => art.id === word && art.type === 'Actor')
      if (definition) {
        return definition.location
      }
    }
  }

  // Generic artifact reference lookup
  const definition = artifacts.find(art => art.id === word)
  if (definition) {
    return definition.location
  }

  return null
})

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
