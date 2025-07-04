/**
 * SOL ARTIFACT TEMPLATE v2025.07
 * Actor (Foundational Artifact)
 * @description
 * Represents an actor in the system
 */

import { Authority } from './authority';
import { Context } from './context';
import { Evaluation } from './evaluation';
import { Intent } from './intent';
import { Metadata } from './metadata';

export type Actor = {
  metadata: Metadata
  name: string
  description: string
  area: Area
  level: 'strategic' | 'tactical' | 'operational' | string
  type: 'internal' | 'external' | 'system' | string
  intent: Intent
  context: Context
  authority: Authority
  evaluation: Evaluation
  responsibilities: Responsibility[]
  capabilities: Capability[]
}

export type Responsibility = {
  name: string
  scope: string
  authority: Authority
}

export type Capability = {
  name: string
  scope: string
}