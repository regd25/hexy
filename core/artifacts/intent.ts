import { Metadata } from './metadata';

/**
 * Represents an intention to be enacted by the system
 * Encapsulates the semantic meaning and scope of a desired action or outcome
 */
export type Intent = {
  metadata: Metadata,
  statement: string,
  mode: 'declare' | 'require' | 'propose' | 'prohibit',
  priority: 'low' | 'medium' | 'high' | 'critical',
}