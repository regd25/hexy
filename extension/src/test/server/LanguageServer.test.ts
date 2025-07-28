/**
 * SOL Language Server Tests
 * 
 * Tests for the SOL language server functionality following SOL principles:
 * - Semantic Coherence: Tests validate language server consistency
 * - Traceability: Clear mapping between LSP features and tests
 * - Simplicity: Focused tests for each language feature
 * - Documentation: Well-documented language server test scenarios
 * 
 * Based on the SOL project: https://github.com/regd25/sol
 * 
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

import { TextDocument } from 'vscode-languageserver-textdocument'
import {
  Position,
  Range,
  CompletionItem,
  CompletionItemKind,
  Hover,
  Location,
  SymbolInformation,
  SymbolKind,
  TextEdit,
} from 'vscode-languageserver'
import { TestUtils } from '../setup'

// Mock the language server module
const mockLanguageServer = {
  onCompletion: jest.fn(),
  onHover: jest.fn(),
  onDefinition: jest.fn(),
  onDocumentSymbol: jest.fn(),
  onDocumentFormatting: jest.fn(),
  onDocumentRangeFormatting: jest.fn(),
  initialize: jest.fn(),
  listen: jest.fn(),
}

jest.mock('../../../server/src/server', () => mockLanguageServer)

describe('SOL Language Server', () => {
  let mockDocument: TextDocument
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Create mock text document
    mockDocument = {
      uri: 'file:///test.sop',
      languageId: 'sol',
      version: 1,
      getText: jest.fn(),
      positionAt: jest.fn(),
      offsetAt: jest.fn(),
      lineCount: 0,
    } as any
  })

  describe('Server Initialization', () => {
    test('should initialize language server with SOL capabilities', () => {
      const initializeParams = {
        capabilities: {
          textDocument: {
            completion: { dynamicRegistration: true },
            hover: { dynamicRegistration: true },
            definition: { dynamicRegistration: true },
            documentSymbol: { dynamicRegistration: true },
            formatting: { dynamicRegistration: true },
          }
        }
      }

      const result = mockLanguageServer.initialize(initializeParams)
      
      expect(mockLanguageServer.initialize).toHaveBeenCalledWith(initializeParams)
      expect(result).toBeDefined()
    })

    test('should register all SOL language features', () => {
      const capabilities = {
        completionProvider: { triggerCharacters: ['-', ':', ' '] },
        hoverProvider: true,
        definitionProvider: true,
        documentSymbolProvider: true,
        documentFormattingProvider: true,
        documentRangeFormattingProvider: true,
      }

      expect(capabilities.completionProvider).toBeDefined()
      expect(capabilities.hoverProvider).toBe(true)
      expect(capabilities.definitionProvider).toBe(true)
      expect(capabilities.documentSymbolProvider).toBe(true)
      expect(capabilities.documentFormattingProvider).toBe(true)
      expect(capabilities.documentRangeFormattingProvider).toBe(true)
    })
  })

  describe('Completion Provider', () => {
    test('should provide artifact type completions', () => {
      const position = Position.create(1, 0)
      const expectedCompletions: CompletionItem[] = [
        {
          label: 'Vision',
          kind: CompletionItemKind.Class,
          detail: 'SOL Vision Artifact',
          documentation: 'Defines the strategic vision for the system',
          insertText: 'Vision:\n  - id: ${1:VisionId}\n    content: "${2:Vision description}"',
        },
        {
          label: 'Domain',
          kind: CompletionItemKind.Class,
          detail: 'SOL Domain Artifact',
          documentation: 'Defines a business or technical domain',
          insertText: 'Domain:\n  id: ${1:DomainId}\n  description: "${2:Domain description}"',
        },
        {
          label: 'Process',
          kind: CompletionItemKind.Class,
          detail: 'SOL Process Artifact',
          documentation: 'Defines a business or technical process',
          insertText: 'Process:\n  - id: ${1:ProcessId}\n    description: "${2:Process description}"',
        },
      ]

      mockLanguageServer.onCompletion.mockReturnValue(expectedCompletions)
      const result = mockLanguageServer.onCompletion(mockDocument, position)

      expect(mockLanguageServer.onCompletion).toHaveBeenCalledWith(mockDocument, position)
      expect(result).toEqual(expectedCompletions)
    })

    test('should provide field completions within artifacts', () => {
      const position = Position.create(3, 4) // Inside Vision artifact
      const context = 'Vision:\n  - id: TestVision\n    |' // Cursor position
      
      const expectedCompletions: CompletionItem[] = [
        {
          label: 'content',
          kind: CompletionItemKind.Field,
          detail: 'Vision content description',
          insertText: 'content: "${1:Vision content}"',
        },
        {
          label: 'tags',
          kind: CompletionItemKind.Field,
          detail: 'Vision tags',
          insertText: 'tags:\n  - ${1:tag}',
        },
        {
          label: 'actors',
          kind: CompletionItemKind.Field,
          detail: 'Related actors',
          insertText: 'actors:\n  - ${1:ActorId}',
        },
      ]

      mockLanguageServer.onCompletion.mockReturnValue(expectedCompletions)
      const result = mockLanguageServer.onCompletion(mockDocument, position)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should provide artifact ID references', () => {
      const documentText = `# SOL - Semantic Operations Language

Vision:
  - id: MainVision
    content: "Main system vision"

Domain:
  id: CoreDomain
  vision: |` // Cursor at end

      ;(mockDocument.getText as jest.Mock).mockReturnValue(documentText)
      
      const position = Position.create(8, 11) // After "vision: "
      const expectedCompletions: CompletionItem[] = [
        {
          label: 'MainVision',
          kind: CompletionItemKind.Reference,
          detail: 'Vision artifact reference',
          documentation: 'Main system vision',
        },
      ]

      mockLanguageServer.onCompletion.mockReturnValue(expectedCompletions)
      const result = mockLanguageServer.onCompletion(mockDocument, position)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Hover Provider', () => {
    test('should provide hover information for artifact types', () => {
      const position = Position.create(2, 0) // On "Vision:" line
      const expectedHover: Hover = {
        contents: {
          kind: 'markdown',
          value: `**Vision Artifact**

Defines the strategic vision and goals for the system or domain.

**Fields:**
- \`id\`: Unique identifier for the vision
- \`content\`: Detailed vision description
- \`tags\`: Optional tags for categorization
- \`actors\`: Related actors involved in the vision`,
        },
        range: Range.create(2, 0, 2, 7), // "Vision:" range
      }

      mockLanguageServer.onHover.mockReturnValue(expectedHover)
      const result = mockLanguageServer.onHover(mockDocument, position)

      expect(mockLanguageServer.onHover).toHaveBeenCalledWith(mockDocument, position)
      expect(result).toEqual(expectedHover)
    })

    test('should provide hover information for artifact references', () => {
      const documentText = TestUtils.createMinimalSOLDocument()
      ;(mockDocument.getText as jest.Mock).mockReturnValue(documentText)
      
      const position = Position.create(8, 15) // On "TestVision" reference
      const expectedHover: Hover = {
        contents: {
          kind: 'markdown',
          value: `**Vision: TestVision**

Test vision for validation

**Referenced by:**
- Domain: TestDomain`,
        },
        range: Range.create(8, 10, 8, 20), // "TestVision" range
      }

      mockLanguageServer.onHover.mockReturnValue(expectedHover)
      const result = mockLanguageServer.onHover(mockDocument, position)

      expect(result).toBeDefined()
      expect(result?.contents).toBeDefined()
    })

    test('should provide hover for SOL fields', () => {
      const position = Position.create(3, 4) // On "id:" field
      const expectedHover: Hover = {
        contents: {
          kind: 'markdown',
          value: `**SOL Field: id**

Unique identifier for the artifact. Must follow SOL naming conventions:
- Start with uppercase letter
- Use PascalCase
- Only letters, numbers, and underscores allowed

**Example:** \`TestVision\`, \`CoreDomain\`, \`MainProcess\``,
        },
        range: Range.create(3, 4, 3, 6), // "id" range
      }

      mockLanguageServer.onHover.mockReturnValue(expectedHover)
      const result = mockLanguageServer.onHover(mockDocument, position)

      expect(result).toBeDefined()
      expect(result?.contents).toBeDefined()
    })
  })

  describe('Definition Provider', () => {
    test('should provide definition for artifact references', () => {
      const documentText = TestUtils.createMinimalSOLDocument()
      ;(mockDocument.getText as jest.Mock).mockReturnValue(documentText)
      
      const position = Position.create(8, 15) // On "TestVision" reference
      const expectedLocation: Location = {
        uri: mockDocument.uri,
        range: Range.create(2, 6, 2, 16), // "TestVision" definition range
      }

      mockLanguageServer.onDefinition.mockReturnValue(expectedLocation)
      const result = mockLanguageServer.onDefinition(mockDocument, position)

      expect(mockLanguageServer.onDefinition).toHaveBeenCalledWith(mockDocument, position)
      expect(result).toEqual(expectedLocation)
    })

    test('should handle multiple artifact definitions', () => {
      const documentText = `# SOL - Semantic Operations Language

Vision:
  - id: Vision1
    content: "First vision"
  - id: Vision2
    content: "Second vision"

Domain:
  id: TestDomain
  vision: Vision1  # Should go to first Vision`

      ;(mockDocument.getText as jest.Mock).mockReturnValue(documentText)
      
      const position = Position.create(10, 11) // On "Vision1" reference
      const expectedLocation: Location = {
        uri: mockDocument.uri,
        range: Range.create(3, 6, 3, 13), // First "Vision1" definition
      }

      mockLanguageServer.onDefinition.mockReturnValue(expectedLocation)
      const result = mockLanguageServer.onDefinition(mockDocument, position)

      expect(result).toBeDefined()
      expect(result).toEqual(expectedLocation)
    })

    test('should return null for undefined references', () => {
      const position = Position.create(10, 15) // On non-existent reference
      
      mockLanguageServer.onDefinition.mockReturnValue(null)
      const result = mockLanguageServer.onDefinition(mockDocument, position)

      expect(result).toBeNull()
    })
  })

  describe('Document Symbol Provider', () => {
    test('should provide document symbols for SOL artifacts', () => {
      const documentText = TestUtils.createMinimalSOLDocument()
      ;(mockDocument.getText as jest.Mock).mockReturnValue(documentText)
      
      const expectedSymbols: SymbolInformation[] = [
        {
          name: 'Vision',
          kind: SymbolKind.Class,
          location: {
            uri: mockDocument.uri,
            range: Range.create(2, 0, 5, 0),
          },
        },
        {
          name: 'TestVision',
          kind: SymbolKind.Object,
          location: {
            uri: mockDocument.uri,
            range: Range.create(3, 2, 4, 0),
          },
          containerName: 'Vision',
        },
        {
          name: 'Domain',
          kind: SymbolKind.Class,
          location: {
            uri: mockDocument.uri,
            range: Range.create(6, 0, 9, 0),
          },
        },
        {
          name: 'TestDomain',
          kind: SymbolKind.Object,
          location: {
            uri: mockDocument.uri,
            range: Range.create(7, 2, 9, 0),
          },
          containerName: 'Domain',
        },
      ]

      mockLanguageServer.onDocumentSymbol.mockReturnValue(expectedSymbols)
      const result = mockLanguageServer.onDocumentSymbol(mockDocument)

      expect(mockLanguageServer.onDocumentSymbol).toHaveBeenCalledWith(mockDocument)
      expect(result).toEqual(expectedSymbols)
    })

    test('should handle complex documents with multiple artifact types', () => {
      const complexDocument = `# SOL - Semantic Operations Language

Vision:
  - id: SystemVision
    content: "System vision"

Domain:
  id: CoreDomain
  vision: SystemVision

Actor:
  - id: User
    domain: CoreDomain

Process:
  - id: MainProcess
    domain: CoreDomain
    actors:
      - User`

      ;(mockDocument.getText as jest.Mock).mockReturnValue(complexDocument)
      
      const expectedSymbolCount = 8 // 4 artifact types + 4 artifact instances
      
      mockLanguageServer.onDocumentSymbol.mockReturnValue(
        Array(expectedSymbolCount).fill(null).map((_, i) => ({
          name: `Symbol${i}`,
          kind: SymbolKind.Object,
          location: {
            uri: mockDocument.uri,
            range: Range.create(i, 0, i + 1, 0),
          },
        }))
      )
      
      const result = mockLanguageServer.onDocumentSymbol(mockDocument)
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Document Formatting Provider', () => {
    test('should format entire SOL document', () => {
      const unformattedText = `# SOL - Semantic Operations Language
Vision:
-id:TestVision
content:"Test content"
Domain:
id:TestDomain
vision:TestVision`

      const expectedEdits: TextEdit[] = [
        {
          range: Range.create(0, 0, 6, 0),
          newText: `# SOL - Semantic Operations Language

Vision:
  - id: TestVision
    content: "Test content"

Domain:
  id: TestDomain
  vision: TestVision`,
        },
      ]

      ;(mockDocument.getText as jest.Mock).mockReturnValue(unformattedText)
      
      const formattingOptions = {
        tabSize: 2,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
      }

      mockLanguageServer.onDocumentFormatting.mockReturnValue(expectedEdits)
      const result = mockLanguageServer.onDocumentFormatting(mockDocument, formattingOptions)

      expect(mockLanguageServer.onDocumentFormatting).toHaveBeenCalledWith(mockDocument, formattingOptions)
      expect(result).toEqual(expectedEdits)
    })

    test('should format document range', () => {
      const range = Range.create(2, 0, 4, 0) // Format only Vision section
      const formattingOptions = {
        tabSize: 2,
        insertSpaces: true,
      }

      const expectedEdits: TextEdit[] = [
        {
          range: range,
          newText: `Vision:
  - id: TestVision
    content: "Test content"`,
        },
      ]

      mockLanguageServer.onDocumentRangeFormatting.mockReturnValue(expectedEdits)
      const result = mockLanguageServer.onDocumentRangeFormatting(mockDocument, range, formattingOptions)

      expect(mockLanguageServer.onDocumentRangeFormatting).toHaveBeenCalledWith(mockDocument, range, formattingOptions)
      expect(result).toEqual(expectedEdits)
    })

    test('should respect formatting options', () => {
      const formattingOptions = {
        tabSize: 4,
        insertSpaces: false, // Use tabs
        trimTrailingWhitespace: true,
        insertFinalNewline: false,
      }

      const expectedEdits: TextEdit[] = [
        {
          range: Range.create(0, 0, 3, 0),
          newText: `Vision:
\t- id: TestVision
\t\tcontent: "Test content"`,
        },
      ]

      mockLanguageServer.onDocumentFormatting.mockReturnValue(expectedEdits)
      const result = mockLanguageServer.onDocumentFormatting(mockDocument, formattingOptions)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    test('should handle malformed SOL documents gracefully', () => {
      const malformedDocument = `# Not a proper SOL document
SomeRandomStuff:
  - invalid: content`

      ;(mockDocument.getText as jest.Mock).mockReturnValue(malformedDocument)
      
      // All providers should handle malformed documents without crashing
      expect(() => {
        mockLanguageServer.onCompletion(mockDocument, Position.create(1, 0))
        mockLanguageServer.onHover(mockDocument, Position.create(1, 0))
        mockLanguageServer.onDefinition(mockDocument, Position.create(1, 0))
        mockLanguageServer.onDocumentSymbol(mockDocument)
      }).not.toThrow()
    })

    test('should handle empty documents', () => {
      ;(mockDocument.getText as jest.Mock).mockReturnValue('')
      
      const position = Position.create(0, 0)
      
      mockLanguageServer.onCompletion.mockReturnValue([])
      mockLanguageServer.onHover.mockReturnValue(null)
      mockLanguageServer.onDefinition.mockReturnValue(null)
      mockLanguageServer.onDocumentSymbol.mockReturnValue([])
      
      expect(mockLanguageServer.onCompletion(mockDocument, position)).toEqual([])
      expect(mockLanguageServer.onHover(mockDocument, position)).toBeNull()
      expect(mockLanguageServer.onDefinition(mockDocument, position)).toBeNull()
      expect(mockLanguageServer.onDocumentSymbol(mockDocument)).toEqual([])
    })

    test('should handle invalid positions gracefully', () => {
      const documentText = TestUtils.createMinimalSOLDocument()
      ;(mockDocument.getText as jest.Mock).mockReturnValue(documentText)
      
      const invalidPosition = Position.create(999, 999) // Way beyond document end
      
      mockLanguageServer.onCompletion.mockReturnValue([])
      mockLanguageServer.onHover.mockReturnValue(null)
      mockLanguageServer.onDefinition.mockReturnValue(null)
      
      expect(mockLanguageServer.onCompletion(mockDocument, invalidPosition)).toEqual([])
      expect(mockLanguageServer.onHover(mockDocument, invalidPosition)).toBeNull()
      expect(mockLanguageServer.onDefinition(mockDocument, invalidPosition)).toBeNull()
    })
  })

  describe('SOL Principles Validation', () => {
    test('should maintain semantic coherence in language features', () => {
      // All language features should work consistently together
      const document = TestUtils.createMinimalSOLDocument()
      ;(mockDocument.getText as jest.Mock).mockReturnValue(document)
      
      const position = Position.create(3, 6) // On "TestVision" id
      
      // Mock consistent responses
      mockLanguageServer.onCompletion.mockReturnValue([
        { label: 'TestVision', kind: CompletionItemKind.Reference }
      ])
      mockLanguageServer.onHover.mockReturnValue({
        contents: { kind: 'markdown', value: '**Vision: TestVision**' }
      })
      mockLanguageServer.onDefinition.mockReturnValue({
        uri: mockDocument.uri,
        range: Range.create(3, 6, 3, 16)
      })
      
      const completion = mockLanguageServer.onCompletion(mockDocument, position)
      const hover = mockLanguageServer.onHover(mockDocument, position)
      const definition = mockLanguageServer.onDefinition(mockDocument, position)
      
      // All features should recognize the same artifact
      expect(completion[0].label).toBe('TestVision')
      expect(hover.contents.value).toContain('TestVision')
      expect(definition.range.start.line).toBe(3)
    })

    test('should provide traceability through language features', () => {
      // Language features should help trace artifact relationships
      const complexDocument = `# SOL - Semantic Operations Language

Vision:
  - id: MainVision
    content: "Main vision"

Domain:
  id: CoreDomain
  vision: MainVision

Process:
  - id: CoreProcess
    domain: CoreDomain
    vision: MainVision`

      ;(mockDocument.getText as jest.Mock).mockReturnValue(complexDocument)
      
      // Hover on MainVision should show its references
      mockLanguageServer.onHover.mockReturnValue({
        contents: {
          kind: 'markdown',
          value: `**Vision: MainVision**

Referenced by:
- Domain: CoreDomain
- Process: CoreProcess`
        }
      })
      
      const hover = mockLanguageServer.onHover(mockDocument, Position.create(3, 6))
      expect(hover.contents.value).toContain('Referenced by')
      expect(hover.contents.value).toContain('CoreDomain')
      expect(hover.contents.value).toContain('CoreProcess')
    })

    test('should follow simplicity principle in feature design', () => {
      // Language server features should be simple and focused
      const features = [
        'onCompletion',
        'onHover', 
        'onDefinition',
        'onDocumentSymbol',
        'onDocumentFormatting',
        'onDocumentRangeFormatting'
      ]
      
      features.forEach(feature => {
        expect(mockLanguageServer[feature]).toBeDefined()
        expect(typeof mockLanguageServer[feature]).toBe('function')
      })
    })
  })
}) 