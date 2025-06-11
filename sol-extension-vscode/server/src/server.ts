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
      // Tell the client that the server supports 'go to definition'
      definitionProvider: true,
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
}

function parseSolDocument(document: TextDocument): SolArtifact[] {
  const artifacts: SolArtifact[] = []
  const lines = document.getText().split("\n")

  let currentArtifactType: string | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect top-level artifact type (e.g., "Vision:", "Policy:", "Actor:")
    const typeMatch = line.match(/^([a-zA-Z_]+):\s*$/)
    if (typeMatch) {
      currentArtifactType = typeMatch[1]
      continue
    }

    // Detect ID within an artifact block
    // Handles both list items (- id: MyVision) and single items (id: MyDomain)
    const idMatch =
      line.match(/^\s*-\s*id:\s*([a-zA-Z0-9_]+)\s*$/) ||
      line.match(/^\s*id:\s*([a-zA-Z0-9_]+)\s*$/)

    if (idMatch && currentArtifactType) {
      const id = idMatch[1]
      artifacts.push({
        id: id,
        type: currentArtifactType,
        location: Location.create(document.uri, {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        }),
      })
    }
  }
  return artifacts
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

// This handler provides the go to definition feature.
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

  // Check for references like "vision: <ID>"
  const visionRefMatch = line.match(/vision:\s*([a-zA-Z0-9_]+)/)
  if (visionRefMatch && visionRefMatch[1] === word) {
    const wordStartInLine = line.indexOf(
      word,
      visionRefMatch.index! + visionRefMatch[0].indexOf(word)
    )
    if (
      position.character >= wordStartInLine &&
      position.character <= wordStartInLine + word.length
    ) {
      const definition = artifacts.find(
        (art) => art.id === word && art.type === "Vision"
      )
      if (definition) {
        return definition.location
      }
    }
  }

  // Check for references like "domain: <ID>"
  const domainRefMatch = line.match(/domain:\s*([a-zA-Z0-9_]+)/)
  if (domainRefMatch && domainRefMatch[1] === word) {
    const wordStartInLine = line.indexOf(
      word,
      domainRefMatch.index! + domainRefMatch[0].indexOf(word)
    )
    if (
      position.character >= wordStartInLine &&
      position.character <= wordStartInLine + word.length
    ) {
      const definition = artifacts.find(
        (art) => art.id === word && art.type === "Domain"
      )
      if (definition) {
        return definition.location
      }
    }
  }

  // Check for references like "actors: - <ID>" (in lists)
  const actorRefMatch = line.match(/actors:\s*-\s*([a-zA-Z0-9_]+)/)
  if (actorRefMatch && actorRefMatch[1] === word) {
    const wordStartInLine = line.indexOf(
      word,
      actorRefMatch.index! + actorRefMatch[0].indexOf(word)
    )
    if (
      position.character >= wordStartInLine &&
      position.character <= wordStartInLine + word.length
    ) {
      const definition = artifacts.find(
        (art) => art.id === word && art.type === "Actor"
      )
      if (definition) {
        return definition.location
      }
    }
  }

  // Check for references like "(Policy: <ID>)" in steps
  const policyRefMatch = line.match(/\(Policy:\s*([a-zA-Z0-9_]+)\)/)
  if (policyRefMatch && policyRefMatch[1] === word) {
    const wordStartInLine = line.indexOf(
      word,
      policyRefMatch.index! + policyRefMatch[0].indexOf(word)
    )
    if (
      position.character >= wordStartInLine &&
      position.character <= wordStartInLine + word.length
    ) {
      const definition = artifacts.find(
        (art) => art.id === word && art.type === "Policy"
      )
      if (definition) {
        return definition.location
      }
    }
  }

  // Check for references like "issuedBy: <ID>"
  const issuedByRefMatch = line.match(/issuedBy:\s*([a-zA-Z0-9_]+)/)
  if (issuedByRefMatch && issuedByRefMatch[1] === word) {
    const wordStartInLine = line.indexOf(
      word,
      issuedByRefMatch.index! + issuedByRefMatch[0].indexOf(word)
    )
    if (
      position.character >= wordStartInLine &&
      position.character <= wordStartInLine + word.length
    ) {
      const definition = artifacts.find(
        (art) => art.id === word && art.type === "Actor"
      )
      if (definition) {
        return definition.location
      }
    }
  }

  // Check for references like "ActorID ->" or "ActorID (OptionalInfo) ->"
  const actorExecutionRefMatch = line.match(/^\s*([a-zA-Z0-9_]+)(?:\s*\([^)]*\))?\s*[->→]/);
  if (actorExecutionRefMatch && actorExecutionRefMatch[1] === word) {
    const wordStartInLine = line.indexOf(word, actorExecutionRefMatch.index! + actorExecutionRefMatch[0].indexOf(word));
    if (position.character >= wordStartInLine && position.character <= wordStartInLine + word.length) {
      const definition = artifacts.find(art => art.id === word && art.type === 'Actor');
      if (definition) {
        return definition.location;
      }
    }
  }

  // Check for references like "ArtifactType: <ID>" (e.g., "Concept: ArtefactoSOL", "Process: EjecutarProcesoSemantico" if referenced this way)
  // This applies when the KEY is itself an artifact type.
  const artifactTypeKeywords = ["Vision", "Domain", "Concept", "Policy", "Process", "Actor", "Indicator", "Result", "Signal", "Observation", "Authority", "Protocol"];
  const artifactTypeRefRegex = new RegExp(`^\\s*(${artifactTypeKeywords.join("|")}):\\s*([a-zA-Z0-9_]+)\\s*$`);

  const directArtifactTypeRefMatch = line.match(artifactTypeRefRegex);
  if (directArtifactTypeRefMatch && directArtifactTypeRefMatch[2] === word) {
    const referredType = directArtifactTypeRefMatch[1];
    const wordStartInLine = line.indexOf(word, directArtifactTypeRefMatch.index! + directArtifactTypeRefMatch[0].indexOf(word));
    if (position.character >= wordStartInLine && position.character <= wordStartInLine + word.length) {
      const definition = artifacts.find(art => art.id === word && art.type === referredType);
      if (definition) {
        return definition.location;
      }
    }
  }

  // Generic ID definition lookup: if the word is an artifact's ID, go to its definition
  const definition = artifacts.find(art => art.id === word);
  if (definition) {
    // Ensure the click was actually on the ID part of the definition line
    const definitionLine = document.getText().split('\n')[definition.location.range.start.line];
    const idMatchInDefinition = definitionLine.match(/id:\s*([a-zA-Z0-9_]+)/);
    if (idMatchInDefinition && idMatchInDefinition[1] === word) {
      const idStartInDefinitionLine = definitionLine.indexOf(word, idMatchInDefinition.index! + idMatchInDefinition[0].indexOf(word));
      if (position.character >= idStartInDefinitionLine && position.character <= idStartInDefinitionLine + word.length) {
        return definition.location;
      }
    }
  }

  return null;
})

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
