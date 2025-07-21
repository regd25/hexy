/**
 * SOL Formatter Tests
 *
 * Comprehensive test suite for the SOL document formatter following SOL principles:
 * - Semantic Coherence: Tests maintain narrative integrity validation
 * - Traceability: Clear test organization and artifact relationship validation
 * - Simplicity: Progressive test complexity from basic to advanced scenarios
 * - Documentation: Well-documented test cases with clear expectations
 *
 * Based on the SOL project: https://github.com/regd25/sol
 *
 * @author Randy Gala <randy@hexy.dev>
 * @license MIT
 */

import * as fs from "fs"
import * as path from "path"
import {
  SolFormatter,
  SolFormattingOptions,
} from "../../formatter/SolFormatter"
import { TestUtils } from "../setup"

describe("SOL Formatter Tests", () => {
  let formatter: SolFormatter
  let fixturesPath: string

  beforeAll(() => {
    formatter = new SolFormatter()
    fixturesPath = path.join(__dirname, "../fixtures")
  })

  describe("Document Structure Formatting", () => {
    test("should format SOL header correctly", () => {
      const input = "   # SOL - Semantic Operations Language   "
      const expected = "# SOL - Semantic Operations Language"
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(expected)
    })

    test("should format top-level artifact types with no indentation", () => {
      const input = "  Vision:  \n   Domain:   \n  Process:  "
      const expected = "Vision:\nDomain:\nProcess:"
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(expected)
    })

    test("should format artifact list items with proper indentation", () => {
      const input = 'Vision:\n-   id:   TestVision\n  content:   "Test content"'
      const expected =
        'Vision:\n  - id: TestVision\n    content: "Test content"'
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(expected)
    })

    test("should format single artifacts with proper indentation", () => {
      const input =
        'Domain:\nid:   TestDomain\ndescription:   "Test description"'
      const expected =
        'Domain:\n  id: TestDomain\n  description: "Test description"'
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(expected)
    })
  })

  describe("Field Formatting", () => {
    test("should normalize field spacing", () => {
      const input =
        'id:TestId\ncontent:   "Test content"  \ndescription:"Test desc"'
      const expected =
        'id: TestId\ncontent: "Test content"\ndescription: "Test desc"'
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(expected)
    })

    test("should handle empty field values", () => {
      const input = "id: TestId\ncontent:  \ndescription: "
      const expected = "id: TestId\ncontent:\ndescription:"
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(expected)
    })

    test("should format array fields correctly", () => {
      const input = "actors:\n-   Actor1\n  -Actor2\n   - Actor3"
      const expected = "actors:\n  - Actor1\n  - Actor2\n  - Actor3"
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(expected)
    })
  })

  describe("Indentation Logic", () => {
    test("should use correct indentation for nested artifacts", () => {
      const input = `Vision:
- id: TestVision
content: "Test"
actors:
- Actor1
- Actor2`

      const expected = `Vision:
  - id: TestVision
    content: "Test"
    actors:
      - Actor1
      - Actor2`

      const result = formatter.formatDocument(input)
      expect(result.trim()).toBe(expected)
    })

    test("should handle mixed single and list artifacts", () => {
      const input = `Vision:
- id: Vision1
content: "Test vision"

Domain:
id: Domain1
description: "Single domain"
vision: Vision1`

      const expected = `Vision:
  - id: Vision1
    content: "Test vision"

Domain:
  id: Domain1
  description: "Single domain"
  vision: Vision1`

      const result = formatter.formatDocument(input)
      expect(result.trim()).toBe(expected)
    })
  })

  describe("Comment Handling", () => {
    test("should preserve comment indentation context", () => {
      const input = `Vision:
  # This is a comment
  - id: TestVision
    # Another comment
    content: "Test"`

      const expected = `Vision:
  # This is a comment
  - id: TestVision
    # Another comment
    content: "Test"`

      const result = formatter.formatDocument(input)
      expect(result.trim()).toBe(expected)
    })

    test("should handle SOL header comments", () => {
      const input = "# SOL - Semantic Operations Language\n# Additional comment"
      const expected =
        "# SOL - Semantic Operations Language\n# Additional comment"
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(expected)
    })
  })

  describe("Whitespace Management", () => {
    test("should trim trailing whitespace", () => {
      const input = 'Vision:   \n  - id: Test   \n    content: "Test"  '
      const result = formatter.formatDocument(input)

      // Check that no lines end with whitespace
      const lines = result.split("\n")
      lines.forEach((line) => {
        expect(line).not.toMatch(/\s+$/)
      })
    })

    test("should preserve empty lines", () => {
      const input = "Vision:\n\n  - id: Test\n\nDomain:\n  id: TestDomain"
      const result = formatter.formatDocument(input)

      expect(result).toContain("\n\n")
    })

    test("should insert final newline when configured", () => {
      const input = "Vision:\n  - id: Test"
      const options: Partial<SolFormattingOptions> = {
        insertFinalNewline: true,
      }
      const result = formatter.formatDocument(input, options)

      expect(result).toMatch(/\n$/)
    })

    test("should not insert final newline when configured", () => {
      const input = "Vision:\n  - id: Test"
      const options: Partial<SolFormattingOptions> = {
        insertFinalNewline: false,
      }
      const result = formatter.formatDocument(input, options)

      expect(result).not.toMatch(/\n$/)
    })
  })

  describe("Configuration Options", () => {
    test("should use tabs when insertSpaces is false", () => {
      const input = 'Vision:\n- id: Test\ncontent: "Test"'
      const options: Partial<SolFormattingOptions> = {
        insertSpaces: false,
        tabSize: 1,
      }
      const result = formatter.formatDocument(input, options)

      expect(result).toContain("\t- id: Test")
      expect(result).toContain('\t\tcontent: "Test"')
    })

    test("should respect custom tab size", () => {
      const input = 'Vision:\n- id: Test\ncontent: "Test"'
      const options: Partial<SolFormattingOptions> = {
        insertSpaces: true,
        tabSize: 4,
      }
      const result = formatter.formatDocument(input, options)

      expect(result).toContain("    - id: Test")
      expect(result).toContain('        content: "Test"')
    })

    test("should trim final newlines when configured", () => {
      const input = "Vision:\n  - id: Test\n\n\n"
      const options: Partial<SolFormattingOptions> = {
        trimFinalNewlines: true,
        insertFinalNewline: true,
      }
      const result = formatter.formatDocument(input, options)

      expect(result).toMatch(/Test\n$/)
      expect(result).not.toMatch(/Test\n\n/)
    })
  })

  describe("Structure Validation", () => {
    test("should validate complete SOL document structure", () => {
      const validDocument = fs.readFileSync(
        path.join(fixturesPath, "sample.sop"),
        "utf8"
      )

      const validation = formatter.validateStructure(validDocument)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test("should detect missing SOL header", () => {
      const invalidDocument = "Vision:\n  - id: Test"

      const validation = formatter.validateStructure(invalidDocument)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain(
        "Missing SOL header: # SOL - Semantic Operations Language"
      )
    })

    test("should detect missing artifacts", () => {
      const invalidDocument =
        "# SOL - Semantic Operations Language\n# Just comments"

      const validation = formatter.validateStructure(invalidDocument)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain("No SOL artifacts found in document")
    })
  })

  describe("Real Document Formatting", () => {
    test("should format unformatted document correctly", () => {
      const unformattedDocument = fs.readFileSync(
        path.join(fixturesPath, "unformatted.sop"),
        "utf8"
      )

      const result = formatter.formatDocument(unformattedDocument)

      // Verify basic structure
      expect(result).toContain("# SOL - Semantic Operations Language")
      expect(result).toContain("Vision:")
      expect(result).toContain("  - id: UnformattedVision")
      expect(result).toContain('    content: "This needs formatting"')
      expect(result).toContain("Domain:")
      expect(result).toContain("  id: UnformattedDomain")
      expect(result).toContain("  vision: UnformattedVision")

      // Verify proper indentation
      const lines = result.split("\n")
      lines.forEach((line) => {
        if (line.trim().startsWith("- id:")) {
          expect(line).toMatch(/^  - id:/)
        }
        if (line.trim().startsWith("content:") && line.includes("formatting")) {
          expect(line).toMatch(/^    content:/)
        }
      })
    })

    test("should maintain semantic coherence in complex documents", () => {
      const complexDocument = `# SOL - Semantic Operations Language

Vision:
-id: ComplexVision
content: "Complex system vision"

Domain:
id: ComplexDomain
vision: ComplexVision
processes:
- ProcessA
- ProcessB

Process:
-id: ProcessA
domain: ComplexDomain
actors:
- ActorA
- ActorB
steps:
-"Step 1"
  -"ActorA->Step 2"
-"ActorB -> Step 3"`

      const result = formatter.formatDocument(complexDocument)

      // Verify proper structure and references are maintained
      expect(result).toContain("vision: ComplexVision")
      expect(result).toContain("- ProcessA")
      expect(result).toContain("- ProcessB")
      expect(result).toContain("- ActorA")
      expect(result).toContain("- ActorB")
      expect(result).toContain('"ActorA -> Step 2"')
      expect(result).toContain('"ActorB -> Step 3"')
    })
  })

  describe("Edge Cases", () => {
    test("should handle empty document", () => {
      const result = formatter.formatDocument("")
      expect(result).toBe("")
    })

    test("should handle document with only whitespace", () => {
      const result = formatter.formatDocument("   \n  \n   ")
      expect(result.trim()).toBe("")
    })

    test("should handle document with only comments", () => {
      const input =
        "# SOL - Semantic Operations Language\n# Just a comment\n# Another comment"
      const result = formatter.formatDocument(input)

      expect(result.trim()).toBe(input)
    })

    test("should handle malformed artifact references", () => {
      const input = `Vision:
  - id: TestVision
    content: "Test vision"

Process:
  - id: TestProcess
    vision: TestVision
    actors:
      - NonExistentActor  # This actor doesn't exist
    steps:
      - "Step with (Policy: NonExistentPolicy)"`

      const result = formatter.formatDocument(input)

      // Should still format correctly even with broken references
      expect(result).toContain("- NonExistentActor")
      expect(result).toContain("(Policy: NonExistentPolicy)")
    })
  })

  describe("Custom Jest Matchers Integration", () => {
    test("should use custom SOL validation matchers", () => {
      const validDocument = TestUtils.createMinimalSOLDocument()
      const invalidDocument = TestUtils.createInvalidSOLDocument()

      expect(validDocument).toBeValidSOLDocument()
      expect(invalidDocument).not.toBeValidSOLDocument()
    })

    test("should validate SOL indentation with custom matcher", () => {
      const wellIndentedDocument = `# SOL - Semantic Operations Language

Vision:
  - id: TestVision
    content: "Properly indented"

Domain:
  id: TestDomain
  vision: TestVision`

      const poorlyIndentedDocument = `# SOL - Semantic Operations Language

Vision:
- id: TestVision
  content: "Poorly indented"`

      expect(wellIndentedDocument).toHaveProperSOLIndentation()
      expect(poorlyIndentedDocument).not.toHaveProperSOLIndentation()
    })

    test("should find specific artifacts with custom matcher", () => {
      const document = TestUtils.createMinimalSOLDocument()

      expect(document).toContainSOLArtifact("Vision", "TestVision")
      expect(document).toContainSOLArtifact("Domain", "TestDomain")
      expect(document).not.toContainSOLArtifact("Process", "NonExistentProcess")
    })
  })

  describe("SOL Principles Validation", () => {
    test("should maintain semantic coherence after formatting", () => {
      const document = `# SOL - Semantic Operations Language

Vision:
  - id: MainVision
    content: "Main system vision"

Domain:
  id: CoreDomain
  vision: MainVision
  description: "Core business domain"

Process:
  - id: MainProcess
    domain: CoreDomain
    vision: MainVision
    description: "Main business process"`

      const result = formatter.formatDocument(document)
      const artifactIds = TestUtils.extractArtifactIds(result)

      expect(artifactIds).toContain("MainVision")
      expect(artifactIds).toContain("CoreDomain")
      expect(artifactIds).toContain("MainProcess")
      expect(result).toContain("vision: MainVision")
      expect(result).toContain("domain: CoreDomain")
    })

    test("should preserve traceability links", () => {
      const document = `# SOL - Semantic Operations Language

Vision:
  - id: BusinessVision
    content: "Transform business operations"

Domain:
  id: OperationsDomain
  vision: BusinessVision

Actor:
  - id: BusinessUser
    domain: OperationsDomain

Process:
  - id: TransformationProcess
    domain: OperationsDomain
    actors:
      - BusinessUser`

      const result = formatter.formatDocument(document)

      // Verify all traceability links are preserved
      expect(result).toContain("vision: BusinessVision")
      expect(result).toContain("domain: OperationsDomain")
      expect(result).toContain("- BusinessUser")
    })

    test("should validate SOL naming conventions", () => {
      const document = TestUtils.createMinimalSOLDocument()
      const result = formatter.formatDocument(document)

      expect(TestUtils.hasValidSOLNaming(result)).toBe(true)
    })
  })
})
