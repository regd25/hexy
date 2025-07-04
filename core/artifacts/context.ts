/**
 *  SOL ARTIFACT TEMPLATE v2025.07
 * Type: Context (Foundational Artifact)
 */

import { Metadata } from './metadata';

export type Context = {
  metadata: Metadata,
  scope: string,
  stakeholers: string[],
}