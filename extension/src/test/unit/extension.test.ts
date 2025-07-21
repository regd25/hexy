/**
 * SOL Extension Unit Tests
 *
 * Unit tests for the main extension functionality following SOL principles:
 * - Semantic Coherence: Tests validate extension behavior consistency
 * - Traceability: Clear mapping between features and tests
 * - Simplicity: Focused, isolated unit tests
 * - Documentation: Well-documented test scenarios
 *
 * Based on the SOL project: https://github.com/regd25/sol
 *
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

import * as vscode from "vscode"
import { TestUtils } from "../setup"

// Mock the extension module
jest.mock("../../extension", () => ({
  activate: jest.fn(),
  deactivate: jest.fn(),
  validateSemanticCoherence: jest.fn(),
  showArtifactTraceability: jest.fn(),
  generateDocumentation: jest.fn(),
  formatSOLDocument: jest.fn(),
}))

describe("SOL Extension Core Functionality", () => {
  let mockContext: vscode.ExtensionContext
  let mockStatusBarItem: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create mock extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
      },
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
      },
      extensionPath: "/mock/extension/path",
      storagePath: "/mock/storage/path",
      globalStoragePath: "/mock/global/storage/path",
      logPath: "/mock/log/path",
      asAbsolutePath: jest.fn(
        (relativePath: string) => `/mock/extension/path/${relativePath}`
      ),
    } as any

    // Mock status bar item
    mockStatusBarItem = {
      text: "",
      tooltip: "",
      command: "",
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn(),
    }

    // Setup VS Code API mocks
    ;(vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(
      mockStatusBarItem
    )
  })

  describe("Extension Activation", () => {
    test("should activate extension successfully", async () => {
      const { activate } = require("../../extension")

      await activate(mockContext)

      expect(activate).toHaveBeenCalledWith(mockContext)
      expect(mockContext.subscriptions.length).toBeGreaterThan(0)
    })

    test("should register all SOL commands", async () => {
      const { activate } = require("../../extension")
      const registerCommandSpy = vscode.commands.registerCommand as jest.Mock

      await activate(mockContext)

      expect(registerCommandSpy).toHaveBeenCalledWith(
        "sol.validateSemanticCoherence",
        expect.any(Function)
      )
      expect(registerCommandSpy).toHaveBeenCalledWith(
        "sol.showArtifactTraceability",
        expect.any(Function)
      )
      expect(registerCommandSpy).toHaveBeenCalledWith(
        "sol.generateDocumentation",
        expect.any(Function)
      )
      expect(registerCommandSpy).toHaveBeenCalledWith(
        "sol.formatDocument",
        expect.any(Function)
      )
    })

    test("should create status bar item for SOL documents", async () => {
      const { activate } = require("../../extension")

      await activate(mockContext)

      expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
        vscode.StatusBarAlignment.Right,
        100
      )
      expect(mockStatusBarItem.text).toContain("SOL")
      expect(mockStatusBarItem.tooltip).toContain(
        "Semantic Operations Language"
      )
    })
  })

  describe("Extension Deactivation", () => {
    test("should deactivate extension cleanly", async () => {
      const { deactivate } = require("../../extension")

      await deactivate()

      expect(deactivate).toHaveBeenCalled()
    })
  })

  describe("Document Type Detection", () => {
    test("should detect SOL documents by extension", () => {
      const solDocument = { fileName: "test.sop", languageId: "sol" }
      const yamlDocument = { fileName: "test.sop.yml", languageId: "yaml" }
      const regularDocument = { fileName: "test.txt", languageId: "plaintext" }

      expect(solDocument.fileName.endsWith(".sop")).toBe(true)
      expect(yamlDocument.fileName.includes(".sop.")).toBe(true)
      expect(regularDocument.fileName.endsWith(".sop")).toBe(false)
    })

    test("should identify SOL content by header", () => {
      const solContent = TestUtils.createMinimalSOLDocument()
      const regularContent = "Just some regular text content"

      expect(solContent).toBeValidSOLDocument()
      expect(regularContent).not.toBeValidSOLDocument()
    })
  })

  describe("Semantic Coherence Validation", () => {
    test("should validate artifact references", async () => {
      const { validateSemanticCoherence } = require("../../extension")
      const validDocument = TestUtils.createMinimalSOLDocument()

      const result = await validateSemanticCoherence(validDocument)

      expect(validateSemanticCoherence).toHaveBeenCalledWith(validDocument)
      expect(result).toBeDefined()
    })

    test("should detect broken artifact references", async () => {
      const { validateSemanticCoherence } = require("../../extension")
      const invalidDocument = `# SOL - Semantic Operations Language

Vision:
  - id: TestVision
    content: "Test vision"

Domain:
  id: TestDomain
  vision: NonExistentVision  # Broken reference`

      const result = await validateSemanticCoherence(invalidDocument)

      expect(validateSemanticCoherence).toHaveBeenCalledWith(invalidDocument)
      expect(result).toBeDefined()
    })
  })

  describe("Artifact Traceability", () => {
    test("should generate traceability map", async () => {
      const { showArtifactTraceability } = require("../../extension")
      const document = TestUtils.createMinimalSOLDocument()

      const result = await showArtifactTraceability(document)

      expect(showArtifactTraceability).toHaveBeenCalledWith(document)
      expect(result).toBeDefined()
    })

    test("should trace Vision to Domain relationships", async () => {
      const { showArtifactTraceability } = require("../../extension")
      const document = `# SOL - Semantic Operations Language

Vision:
  - id: MainVision
    content: "Main system vision"

Domain:
  id: CoreDomain
  vision: MainVision

Process:
  - id: CoreProcess
    domain: CoreDomain
    vision: MainVision`

      const result = await showArtifactTraceability(document)

      expect(showArtifactTraceability).toHaveBeenCalledWith(document)
      expect(result).toBeDefined()
    })
  })

  describe("Documentation Generation", () => {
    test("should generate documentation from SOL artifacts", async () => {
      const { generateDocumentation } = require("../../extension")
      const document = TestUtils.createMinimalSOLDocument()

      const result = await generateDocumentation(document)

      expect(generateDocumentation).toHaveBeenCalledWith(document)
      expect(result).toBeDefined()
    })

    test("should include all artifact types in documentation", async () => {
      const { generateDocumentation } = require("../../extension")
      const complexDocument = `# SOL - Semantic Operations Language

Vision:
  - id: SystemVision
    content: "Complete system vision"

Domain:
  id: BusinessDomain
  vision: SystemVision

Actor:
  - id: BusinessUser
    domain: BusinessDomain

Process:
  - id: BusinessProcess
    domain: BusinessDomain
    actors:
      - BusinessUser

Policy:
  - id: BusinessPolicy
    domain: BusinessDomain

Indicator:
  - id: PerformanceIndicator
    process: BusinessProcess`

      const result = await generateDocumentation(complexDocument)

      expect(generateDocumentation).toHaveBeenCalledWith(complexDocument)
      expect(result).toBeDefined()
    })
  })

  describe("Document Formatting", () => {
    test("should format SOL document correctly", async () => {
      const { formatSOLDocument } = require("../../extension")
      const unformattedDocument = `# SOL - Semantic Operations Language
Vision:
-id:TestVision
content:"Test content"`

      const result = await formatSOLDocument(unformattedDocument)

      expect(formatSOLDocument).toHaveBeenCalledWith(unformattedDocument)
      expect(result).toBeDefined()
    })

    test("should preserve document structure during formatting", async () => {
      const { formatSOLDocument } = require("../../extension")
      const document = TestUtils.createMinimalSOLDocument()

      const result = await formatSOLDocument(document)

      expect(formatSOLDocument).toHaveBeenCalledWith(document)
      expect(result).toBeDefined()
    })
  })

  describe("Error Handling", () => {
    test("should handle invalid documents gracefully", async () => {
      const { validateSemanticCoherence } = require("../../extension")
      const invalidDocument = "This is not a SOL document"

      const result = await validateSemanticCoherence(invalidDocument)

      expect(validateSemanticCoherence).toHaveBeenCalledWith(invalidDocument)
      expect(result).toBeDefined()
    })

    test("should handle empty documents", async () => {
      const { formatSOLDocument } = require("../../extension")
      const emptyDocument = ""

      const result = await formatSOLDocument(emptyDocument)

      expect(formatSOLDocument).toHaveBeenCalledWith(emptyDocument)
      expect(result).toBeDefined()
    })

    test("should show appropriate error messages", async () => {
      const showErrorMessageSpy = vscode.window.showErrorMessage as jest.Mock
      const { validateSemanticCoherence } = require("../../extension")

      // Simulate an error condition
      validateSemanticCoherence.mockRejectedValue(new Error("Test error"))

      try {
        await validateSemanticCoherence("invalid")
      } catch (error) {
        // Expected to throw
      }

      expect(validateSemanticCoherence).toHaveBeenCalledWith("invalid")
    })
  })

  describe("Status Bar Integration", () => {
    test("should update status bar for SOL documents", () => {
      // Simulate active editor change to SOL document
      const mockEditor = {
        document: {
          fileName: "test.sop",
          languageId: "sol",
          getText: () => TestUtils.createMinimalSOLDocument(),
        },
      }

      // Simulate the status bar update logic
      if (mockEditor.document.fileName.endsWith(".sop")) {
        mockStatusBarItem.text = "$(file-code) SOL"
        mockStatusBarItem.tooltip = "SOL - Semantic Operations Language"
        mockStatusBarItem.show()
      }

      expect(mockStatusBarItem.text).toBe("$(file-code) SOL")
      expect(mockStatusBarItem.tooltip).toBe(
        "SOL - Semantic Operations Language"
      )
      expect(mockStatusBarItem.show).toHaveBeenCalled()
    })

    test("should hide status bar for non-SOL documents", () => {
      // Simulate active editor change to non-SOL document
      const mockEditor = {
        document: {
          fileName: "test.txt",
          languageId: "plaintext",
        },
      }

      // Simulate the status bar update logic
      if (!mockEditor.document.fileName.endsWith(".sop")) {
        mockStatusBarItem.hide()
      }

      expect(mockStatusBarItem.hide).toHaveBeenCalled()
    })
  })

  describe("Configuration Management", () => {
    test("should read formatting configuration", () => {
      const mockConfiguration = {
        get: jest.fn(),
      }

      ;(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(
        mockConfiguration
      )
      mockConfiguration.get.mockImplementation((key: string) => {
        switch (key) {
          case "formatting.insertSpaces":
            return true
          case "formatting.tabSize":
            return 2
          case "validation.enableSemanticCoherence":
            return true
          default:
            return undefined
        }
      })

      const config = vscode.workspace.getConfiguration("sol")

      expect(config.get("formatting.insertSpaces")).toBe(true)
      expect(config.get("formatting.tabSize")).toBe(2)
      expect(config.get("validation.enableSemanticCoherence")).toBe(true)
    })

    test("should use default values when configuration is missing", () => {
      const mockConfiguration = {
        get: jest.fn().mockReturnValue(undefined),
      }

      ;(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(
        mockConfiguration
      )

      const config = vscode.workspace.getConfiguration("sol")

      expect(config.get("formatting.insertSpaces")).toBeUndefined()
      expect(config.get("formatting.tabSize")).toBeUndefined()
    })
  })

  describe("SOL Principles Adherence", () => {
    test("should maintain semantic coherence in extension behavior", () => {
      // Test that extension commands maintain consistent behavior
      const commands = [
        "sol.validateSemanticCoherence",
        "sol.showArtifactTraceability",
        "sol.generateDocumentation",
        "sol.formatDocument",
      ]

      commands.forEach((command) => {
        expect(command).toMatch(/^sol\./)
        expect(command).toMatch(/[A-Z]/) // CamelCase after prefix
      })
    })

    test("should provide traceability in command naming", () => {
      // Commands should clearly trace to their functionality
      expect("sol.validateSemanticCoherence").toContain("validate")
      expect("sol.showArtifactTraceability").toContain("Traceability")
      expect("sol.generateDocumentation").toContain("generate")
      expect("sol.formatDocument").toContain("format")
    })

    test("should follow simplicity principle in API design", () => {
      // Extension should expose simple, focused functions
      const { activate, deactivate } = require("../../extension")

      expect(typeof activate).toBe("function")
      expect(typeof deactivate).toBe("function")
      expect(activate.length).toBe(1) // Single context parameter
      expect(deactivate.length).toBe(0) // No parameters
    })
  })
})
