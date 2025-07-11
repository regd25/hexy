/**
 * Core Abstraction: ArtifactInterpreter<T>
 * Generic interface for interpreting any SOL artifact type
 * This interface remains stable regardless of how many artifact types are added
 */

import { SOLArtifact } from "../artifacts"
import { ExecutionContext } from "../context/ExecutionContext"
import { SemanticDecision } from "../types/SemanticDecision"
import { PluginCapability } from "./PluginCapability"

/**
 * Generic artifact interpreter interface
 * @template T - The specific SOL artifact type this interpreter handles
 */
export interface ArtifactInterpreter<T extends SOLArtifact> {
  /**
   * Type guard to check if this interpreter can handle the given artifact
   * @param artifact - The artifact to check
   * @returns True if this interpreter can handle the artifact
   */
  canInterpret(artifact: SOLArtifact): artifact is T

  /**
   * Interpret the artifact and produce a semantic decision
   * @param artifact - The artifact to interpret
   * @param context - The execution context
   * @returns A semantic decision for orchestration
   */
  interpret(artifact: T, context: ExecutionContext): Promise<SemanticDecision>

  /**
   * Get the plugin capabilities required for this interpretation
   * @returns Array of required plugin capabilities
   */
  getRequiredCapabilities(): PluginCapability[]

  /**
   * Get the supported artifact type identifier
   * @returns The artifact type this interpreter supports
   */
  getSupportedType(): string

  /**
   * Validate the artifact before interpretation
   * @param artifact - The artifact to validate
   * @returns True if the artifact is valid for interpretation
   */
  validateArtifact(artifact: T): boolean
}

/**
 * Registry for artifact interpreters
 * Manages all registered interpreters and provides discovery
 */
export interface ArtifactInterpreterRegistry {
  /**
   * Register an interpreter for a specific artifact type
   * @param type - The artifact type identifier
   * @param interpreter - The interpreter implementation
   */
  register<T extends SOLArtifact>(
    type: string,
    interpreter: ArtifactInterpreter<T>
  ): void

  /**
   * Get an interpreter for a specific artifact type
   * @param type - The artifact type identifier
   * @returns The interpreter or undefined if not found
   */
  get<T extends SOLArtifact>(type: string): ArtifactInterpreter<T> | undefined

  /**
   * Find an interpreter that can handle the given artifact
   * @param artifact - The artifact to find an interpreter for
   * @returns The interpreter or undefined if not found
   */
  findForArtifact(artifact: SOLArtifact): ArtifactInterpreter<any> | undefined

  /**
   * Get all registered artifact types
   * @returns Array of registered artifact type identifiers
   */
  getAllTypes(): string[]

  /**
   * Check if an interpreter exists for the given type
   * @param type - The artifact type identifier
   * @returns True if an interpreter exists
   */
  hasInterpreter(type: string): boolean
}
