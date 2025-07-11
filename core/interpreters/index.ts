/**
 * Interpreters Index
 * Centralized exports for all SOL artifact interpreters
 */

// ============================================================================
// CORE INTERPRETERS
// ============================================================================

export { IntentionInterpreter } from "./IntentionInterpreter"
export { ConditionInterpreter } from "./ConditionInterpreter"
export { ProcessInterpreter } from "./ProcessInterpreter"

// ============================================================================
// INTERPRETER REGISTRY
// ============================================================================

import { IntentionInterpreter } from "./IntentionInterpreter"
import { ConditionInterpreter } from "./ConditionInterpreter"
import { ProcessInterpreter } from "./ProcessInterpreter"
import { ArtifactInterpreter } from "../types/ArtifactInterpreter"
import { SOLArtifact } from "../artifacts"

/**
 * Registry of all available interpreters
 */
export const INTERPRETER_REGISTRY: Record<string, ArtifactInterpreter<any>> = {
  Intent: new IntentionInterpreter(),
  Evaluation: new ConditionInterpreter(),
  Process: new ProcessInterpreter(),
}

/**
 * Get interpreter for a specific artifact type
 */
export function getInterpreter(
  artifactType: string
): ArtifactInterpreter<any> | undefined {
  return INTERPRETER_REGISTRY[artifactType]
}

/**
 * Get interpreter for a specific artifact
 */
export function getInterpreterForArtifact(
  artifact: SOLArtifact
): ArtifactInterpreter<any> | undefined {
  return INTERPRETER_REGISTRY[artifact.type]
}

/**
 * Get all available interpreter types
 */
export function getSupportedArtifactTypes(): string[] {
  return Object.keys(INTERPRETER_REGISTRY)
}

/**
 * Check if an artifact type is supported
 */
export function isArtifactTypeSupported(artifactType: string): boolean {
  return artifactType in INTERPRETER_REGISTRY
}

// ============================================================================
// INTERPRETER STATISTICS
// ============================================================================

export const INTERPRETER_STATS = {
  foundational: 2, // Intent, Evaluation
  operational: 1, // Process
  organizational: 0,
  strategic: 0,
  total: 3,
} as const

/**
 * SOL Interpreters Architecture Summary
 *
 * This module provides interpreter implementations for SOL artifacts:
 *
 * 🔧 IntentionInterpreter - Interprets Intent artifacts
 * 🔧 ConditionInterpreter - Interprets Evaluation artifacts
 * 🔧 ProcessInterpreter - Interprets Process artifacts
 *
 * Total: 3 interpreters covering foundational and operational artifacts
 *
 * Each interpreter follows the ArtifactInterpreter interface:
 * - canInterpret() - Type guard for artifact compatibility
 * - interpret() - Main interpretation logic
 * - getRequiredCapabilities() - Plugin capabilities needed
 * - getSupportedType() - Artifact type supported
 * - validateArtifact() - Artifact validation logic
 */
