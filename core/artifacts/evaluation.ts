import { Metadata } from './metadata';
/**
 * SOL ARTIFACT TEMPLATE v2025.07
 * Evaluation (Foundational Artifact)
 * @description
 * Represents the result of an evaluation of a target artifact
 */

export type Evaluation = {
  metadata: Metadata,
  expected: string,
  method: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | string,
  criteria: EvaluationCriteria,
}

export type EvaluationCriteria = {
  qualitative?: EvaluationQualitativeCriteria[],
  quantitative?: EvaluationQuantitativeCriteria[],
}

export type EvaluationQualitativeCriteria = {
  metric: string,
  assessment: string,
  threshold: string,
  evaluatedBy: Actor
  weight: number,
}

export type EvaluationQuantitativeCriteria = {
  metric: string,
  threshold: number,
  measurement: Indicator,
  weight: number,
  target: string,
  baseline: number,
}