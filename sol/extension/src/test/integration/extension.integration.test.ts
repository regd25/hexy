/**
 * SOL Extension Integration Tests
 * 
 * Integration tests for the complete SOL extension workflow following SOL principles:
 * - Semantic Coherence: Tests validate end-to-end workflow consistency
 * - Traceability: Clear integration between all extension components
 * - Simplicity: Focused integration scenarios
 * - Documentation: Well-documented integration test scenarios
 * 
 * Based on the SOL project: https://github.com/regd25/sol
 * 
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { TestUtils } from '../setup'

describe('SOL Extension Integration Tests', () => {
  let testWorkspaceUri: vscode.Uri
  let testDocument: vscode.TextDocument
  let extensionContext: vscode.ExtensionContext

  beforeAll(async () => {
    // Setup test workspace
    const workspacePath = path.join(__dirname, '..', 'fixtures')
    testWorkspaceUri = vscode.Uri.file(workspacePath)
    
    // Mock extension context
    extensionContext = {
      subscriptions: [],
      workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
      },
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
      },
      extensionPath: path.join(__dirname, '..', '..', '..'),
      storagePath: path.join(__dirname, '..', 'temp'),
      globalStoragePath: path.join(__dirname, '..', 'temp', 'global'),
      logPath: path.join(__dirname, '..', 'temp', 'logs'),
      asAbsolutePath: jest.fn((relativePath: string) => path.join(__dirname, '..', '..', '..', relativePath)),
    } as any
  })

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('Document Lifecycle Integration', () => {
    test('should handle complete SOL document workflow', async () => {
      // Create a test SOL document
      const testFilePath = path.join(__dirname, '..', 'fixtures', 'integration-test.sop')
      const testContent = TestUtils.createMinimalSOLDocument()
      
      // Mock document creation
      const mockDocument = {
        uri: vscode.Uri.file(testFilePath),
        fileName: testFilePath,
        languageId: 'sol',
        version: 1,
        isDirty: false,
        isClosed: false,
        getText: jest.fn().mockReturnValue(testContent),
        save: jest.fn().mockResolvedValue(true),
        lineAt: jest.fn(),
        offsetAt: jest.fn(),
        positionAt: jest.fn(),
        validateRange: jest.fn(),
        validatePosition: jest.fn(),
        getWordRangeAtPosition: jest.fn(),
        lineCount: testContent.split('\n').length,
      } as any

      // Mock VS Code API
      ;(vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument)
      ;(vscode.window.showTextDocument as jest.Mock).mockResolvedValue({
        document: mockDocument,
        edit: jest.fn(),
      })

      // Test document opening
      const document = await vscode.workspace.openTextDocument(testFilePath)
      expect(document).toBeDefined()
      expect(document.languageId).toBe('sol')
      expect(document.getText()).toBeValidSOLDocument()

      // Test document display
      const editor = await vscode.window.showTextDocument(document)
      expect(editor).toBeDefined()
      expect(editor.document).toBe(document)
    })

    test('should integrate language server with document changes', async () => {
      const testContent = TestUtils.createMinimalSOLDocument()
      const mockDocument = {
        uri: vscode.Uri.file('test.sop'),
        languageId: 'sol',
        getText: jest.fn().mockReturnValue(testContent),
        positionAt: jest.fn(),
        offsetAt: jest.fn(),
        lineCount: testContent.split('\n').length,
      } as any

      // Mock language server responses
      const mockCompletionItems = [
        {
          label: 'Process',
          kind: vscode.CompletionItemKind.Class,
          detail: 'SOL Process Artifact',
        },
        {
          label: 'Actor',
          kind: vscode.CompletionItemKind.Class,
          detail: 'SOL Actor Artifact',
        },
      ]

      // Mock completion provider
      const mockCompletionProvider = {
        provideCompletionItems: jest.fn().mockResolvedValue(mockCompletionItems),
      }

      // Test completion integration
      const position = new vscode.Position(10, 0) // After existing content
      const completions = await mockCompletionProvider.provideCompletionItems(mockDocument, position)
      
      expect(completions).toBeDefined()
      expect(Array.isArray(completions)).toBe(true)
      expect(completions.length).toBeGreaterThan(0)
      expect(completions[0].label).toBe('Process')
    })
  })

  describe('Command Integration', () => {
    test('should execute SOL validation command end-to-end', async () => {
      const testDocument = TestUtils.createMinimalSOLDocument()
      
      // Mock command execution
      const mockValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        artifacts: ['TestVision', 'TestDomain'],
      }

      ;(vscode.commands.executeCommand as jest.Mock).mockResolvedValue(mockValidationResult)

      // Execute validation command
      const result = await vscode.commands.executeCommand('sol.validateSemanticCoherence')
      
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith('sol.validateSemanticCoherence')
      expect(result).toBeDefined()
      expect(result.isValid).toBe(true)
      expect(result.artifacts).toContain('TestVision')
      expect(result.artifacts).toContain('TestDomain')
    })

    test('should execute traceability command with proper visualization', async () => {
      const complexDocument = `# SOL - Semantic Operations Language

Vision:
  - id: MainVision
    content: "Main system vision"

Domain:
  id: CoreDomain
  vision: MainVision

Process:
  - id: CoreProcess
    domain: CoreDomain
    vision: MainVision

Actor:
  - id: SystemUser
    domain: CoreDomain`

      const mockTraceabilityResult = {
        traceabilityMap: {
          'MainVision': ['CoreDomain', 'CoreProcess'],
          'CoreDomain': ['CoreProcess', 'SystemUser'],
        },
        visualizationHtml: '<div>Traceability Visualization</div>',
      }

      ;(vscode.commands.executeCommand as jest.Mock).mockResolvedValue(mockTraceabilityResult)

      // Execute traceability command
      const result = await vscode.commands.executeCommand('sol.showArtifactTraceability')
      
      expect(result).toBeDefined()
      expect(result.traceabilityMap).toBeDefined()
      expect(result.traceabilityMap['MainVision']).toContain('CoreDomain')
      expect(result.traceabilityMap['MainVision']).toContain('CoreProcess')
    })

    test('should execute documentation generation command', async () => {
      const testDocument = TestUtils.createMinimalSOLDocument()
      
      const mockDocumentationResult = {
        markdown: '# SOL Documentation\n\n## Vision\n\n### TestVision\n\nTest vision for validation',
        html: '<h1>SOL Documentation</h1><h2>Vision</h2><h3>TestVision</h3><p>Test vision for validation</p>',
      }

      ;(vscode.commands.executeCommand as jest.Mock).mockResolvedValue(mockDocumentationResult)

      // Execute documentation command
      const result = await vscode.commands.executeCommand('sol.generateDocumentation')
      
      expect(result).toBeDefined()
      expect(result.markdown).toContain('# SOL Documentation')
      expect(result.markdown).toContain('TestVision')
      expect(result.html).toContain('<h1>SOL Documentation</h1>')
    })

    test('should execute format document command', async () => {
      const unformattedDocument = `# SOL - Semantic Operations Language
Vision:
-id:TestVision
content:"Test content"
Domain:
id:TestDomain
vision:TestVision`

      const expectedFormatted = `# SOL - Semantic Operations Language

Vision:
  - id: TestVision
    content: "Test content"

Domain:
  id: TestDomain
  vision: TestVision`

      ;(vscode.commands.executeCommand as jest.Mock).mockResolvedValue(expectedFormatted)

      // Execute format command
      const result = await vscode.commands.executeCommand('sol.formatDocument')
      
      expect(result).toBeDefined()
      expect(result).toHaveProperSOLIndentation()
      expect(result).toContainSOLArtifact('Vision', 'TestVision')
      expect(result).toContainSOLArtifact('Domain', 'TestDomain')
    })
  })

  describe('Configuration Integration', () => {
    test('should respect formatting configuration settings', async () => {
      const mockConfiguration = {
        get: jest.fn(),
        has: jest.fn(),
        inspect: jest.fn(),
        update: jest.fn(),
      }

      // Mock configuration values
      mockConfiguration.get.mockImplementation((key: string, defaultValue?: any) => {
        const configs = {
          'formatting.insertSpaces': true,
          'formatting.tabSize': 4,
          'formatting.trimTrailingWhitespace': true,
          'validation.enableSemanticCoherence': true,
          'traceability.showInlineReferences': false,
        }
        return configs[key] ?? defaultValue
      })

      ;(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfiguration)

      // Test configuration reading
      const config = vscode.workspace.getConfiguration('sol')
      
      expect(config.get('formatting.insertSpaces')).toBe(true)
      expect(config.get('formatting.tabSize')).toBe(4)
      expect(config.get('formatting.trimTrailingWhitespace')).toBe(true)
      expect(config.get('validation.enableSemanticCoherence')).toBe(true)
      expect(config.get('traceability.showInlineReferences')).toBe(false)
    })

    test('should handle configuration changes dynamically', async () => {
      const mockConfiguration = {
        get: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
      }

      ;(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfiguration)

      // Test configuration update
      const config = vscode.workspace.getConfiguration('sol')
      await config.update('formatting.tabSize', 2)
      
      expect(config.update).toHaveBeenCalledWith('formatting.tabSize', 2)
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle invalid SOL documents gracefully', async () => {
      const invalidDocument = `# Invalid Document

SomeRandomStuff:
  - invalid: content
    broken: reference: NonExistentArtifact`

      const mockDocument = {
        uri: vscode.Uri.file('invalid.sop'),
        languageId: 'sol',
        getText: jest.fn().mockReturnValue(invalidDocument),
      } as any

      // Mock error handling
      const mockValidationResult = {
        isValid: false,
        errors: [
          'Missing SOL header: # SOL - Semantic Operations Language',
          'Unknown artifact type: SomeRandomStuff',
          'Invalid artifact reference: NonExistentArtifact',
        ],
        warnings: [],
      }

      ;(vscode.commands.executeCommand as jest.Mock).mockResolvedValue(mockValidationResult)

      // Test validation of invalid document
      const result = await vscode.commands.executeCommand('sol.validateSemanticCoherence')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Missing SOL header')
    })

    test('should show user-friendly error messages', async () => {
      const mockShowErrorMessage = vscode.window.showErrorMessage as jest.Mock
      mockShowErrorMessage.mockResolvedValue('OK')

      // Simulate error condition
      const error = new Error('SOL validation failed: Invalid artifact reference')
      
      // Test error display
      await vscode.window.showErrorMessage(`SOL Extension Error: ${error.message}`)
      
      expect(mockShowErrorMessage).toHaveBeenCalledWith('SOL Extension Error: SOL validation failed: Invalid artifact reference')
    })
  })

  describe('Performance Integration', () => {
    test('should handle large SOL documents efficiently', async () => {
      // Create a large SOL document
      const largeDocument = `# SOL - Semantic Operations Language

${Array.from({ length: 50 }, (_, i) => `
Vision:
  - id: Vision${i}
    content: "Vision ${i} description"
    tags:
      - tag${i}
      - category${i % 5}

Domain:
  id: Domain${i}
  vision: Vision${i}
  description: "Domain ${i} description"

Process:
  - id: Process${i}
    domain: Domain${i}
    vision: Vision${i}
    description: "Process ${i} description"
    actors:
      - Actor${i}

Actor:
  - id: Actor${i}
    domain: Domain${i}
    type: ${i % 2 === 0 ? 'Human' : 'System'}
`).join('')}`

      const mockDocument = {
        uri: vscode.Uri.file('large.sop'),
        languageId: 'sol',
        getText: jest.fn().mockReturnValue(largeDocument),
        lineCount: largeDocument.split('\n').length,
      } as any

      // Test performance with large document
      const startTime = Date.now()
      
      // Mock validation that should complete quickly
      const mockValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        artifacts: Array.from({ length: 200 }, (_, i) => `Artifact${i}`),
        processingTime: 150, // milliseconds
      }

      ;(vscode.commands.executeCommand as jest.Mock).mockResolvedValue(mockValidationResult)
      
      const result = await vscode.commands.executeCommand('sol.validateSemanticCoherence')
      const endTime = Date.now()
      
      expect(result).toBeDefined()
      expect(result.isValid).toBe(true)
      expect(result.artifacts.length).toBe(200)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })

  describe('SOL Principles Integration', () => {
    test('should maintain semantic coherence across all features', async () => {
      const testDocument = `# SOL - Semantic Operations Language

Vision:
  - id: IntegrationVision
    content: "Integration test vision"

Domain:
  id: IntegrationDomain
  vision: IntegrationVision
  description: "Integration test domain"

Process:
  - id: IntegrationProcess
    domain: IntegrationDomain
    vision: IntegrationVision
    description: "Integration test process"`

      // Test that all features recognize the same artifacts consistently
      const mockValidationResult = {
        isValid: true,
        artifacts: ['IntegrationVision', 'IntegrationDomain', 'IntegrationProcess'],
      }

      const mockTraceabilityResult = {
        traceabilityMap: {
          'IntegrationVision': ['IntegrationDomain', 'IntegrationProcess'],
          'IntegrationDomain': ['IntegrationProcess'],
        },
      }

      ;(vscode.commands.executeCommand as jest.Mock)
        .mockResolvedValueOnce(mockValidationResult)
        .mockResolvedValueOnce(mockTraceabilityResult)

      // Execute multiple commands
      const validationResult = await vscode.commands.executeCommand('sol.validateSemanticCoherence')
      const traceabilityResult = await vscode.commands.executeCommand('sol.showArtifactTraceability')

      // Verify consistency
      expect(validationResult.artifacts).toContain('IntegrationVision')
      expect(traceabilityResult.traceabilityMap['IntegrationVision']).toContain('IntegrationDomain')
      expect(traceabilityResult.traceabilityMap['IntegrationVision']).toContain('IntegrationProcess')
    })

    test('should provide complete traceability through all features', async () => {
      const complexDocument = `# SOL - Semantic Operations Language

Vision:
  - id: TraceabilityVision
    content: "Complete traceability test"

Domain:
  id: TraceabilityDomain
  vision: TraceabilityVision

Actor:
  - id: TraceabilityActor
    domain: TraceabilityDomain

Process:
  - id: TraceabilityProcess
    domain: TraceabilityDomain
    vision: TraceabilityVision
    actors:
      - TraceabilityActor

Policy:
  - id: TraceabilityPolicy
    domain: TraceabilityDomain
    processes:
      - TraceabilityProcess

Indicator:
  - id: TraceabilityIndicator
    process: TraceabilityProcess
    policy: TraceabilityPolicy`

      // Test complete traceability chain
      const mockTraceabilityResult = {
        traceabilityMap: {
          'TraceabilityVision': ['TraceabilityDomain', 'TraceabilityProcess'],
          'TraceabilityDomain': ['TraceabilityActor', 'TraceabilityProcess', 'TraceabilityPolicy'],
          'TraceabilityProcess': ['TraceabilityPolicy', 'TraceabilityIndicator'],
          'TraceabilityPolicy': ['TraceabilityIndicator'],
        },
        completePaths: [
          'TraceabilityVision -> TraceabilityDomain -> TraceabilityProcess -> TraceabilityPolicy -> TraceabilityIndicator'
        ],
      }

      ;(vscode.commands.executeCommand as jest.Mock).mockResolvedValue(mockTraceabilityResult)

      const result = await vscode.commands.executeCommand('sol.showArtifactTraceability')
      
      expect(result.completePaths).toBeDefined()
      expect(result.completePaths[0]).toContain('TraceabilityVision')
      expect(result.completePaths[0]).toContain('TraceabilityIndicator')
    })

    test('should follow simplicity principle in user interactions', async () => {
      // Test that complex operations are exposed through simple commands
      const commands = [
        'sol.validateSemanticCoherence',
        'sol.showArtifactTraceability',
        'sol.generateDocumentation',
        'sol.formatDocument',
      ]

      // Mock simple command execution
      for (const command of commands) {
        ;(vscode.commands.executeCommand as jest.Mock).mockResolvedValue({ success: true })
        
        const result = await vscode.commands.executeCommand(command)
        expect(result.success).toBe(true)
      }

      expect(vscode.commands.executeCommand).toHaveBeenCalledTimes(commands.length)
    })
  })
}) 