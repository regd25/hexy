// SCL Artifact Types - Semantic Context Language Type Definitions

export interface SCLOrganization {
  id: string
  name: string
  mission: string
  vision: string
  values: string[]
  purpose: string
  narrative?: SCLNarrative
}

export interface SCLConcept {
  id: string
  name: string
  description: string
  properties: Record<string, any>
  relationships: string[]
  narrative?: SCLNarrative
}

export interface SCLUseCase {
  id: string
  name: string
  description: string
  actors: string[]
  preconditions: string[]
  postconditions: string[]
  mainFlow: SCLPath
  alternateFlows?: SCLPath[]
  errorFlows?: SCLPath[]
  rules: string[]
  kpis: string[]
  narrative?: SCLNarrative
}

export interface SCLRule {
  id: string
  name: string
  description: string
  type: 'business' | 'technical' | 'compliance' | 'security'
  condition: string
  action: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  scope: string[]
  narrative?: SCLNarrative
}

export interface SCLAgent {
  id: string
  name: string
  type: 'human' | 'automated' | 'hybrid'
  role: string
  capabilities: string[]
  responsibilities: string[]
  interactions: string[]
  narrative?: SCLNarrative
}

export interface SCLPath {
  id: string
  name: string
  type: 'happy' | 'alternate' | 'error'
  steps: SCLStep[]
  conditions?: string[]
  narrative?: SCLNarrative
}

export interface SCLStep {
  id: string
  order: number
  description: string
  actor: string
  action: string
  expectedResult: string
}

export interface SCLKPI {
  id: string
  name: string
  description: string
  type: 'performance' | 'quality' | 'business' | 'technical'
  metric: string
  target: number | string
  unit: string
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly'
  source: string
  narrative?: SCLNarrative
}

export interface SCLNarrative {
  id: string
  title: string
  content: string
  context: 'historical' | 'cultural' | 'strategic' | 'technical'
  author: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface SCLModule {
  id: string
  name: string
  description: string
  version: string
  organization: SCLOrganization
  concepts: SCLConcept[]
  useCases: SCLUseCase[]
  rules: SCLRule[]
  agents: SCLAgent[]
  kpis: SCLKPI[]
  narratives: SCLNarrative[]
  metadata: SCLMetadata
}

export interface SCLMetadata {
  createdAt: string
  updatedAt: string
  version: string
  author: string
  contributors: string[]
  tags: string[]
  license: string
  repository?: string
  documentation?: string
}

// Search and Library Types
export interface SearchResult {
  id: string
  title: string
  description: string
  category: 'Concepto' | 'Artefacto' | 'Agente' | 'Módulo'
  module: string
  keywords: string[]
  score?: number
}

export interface ArtifactLibraryItem {
  id: string
  name: string
  description: string
  author: string
  category: string
  tags: string[]
  useCases: string[]
  downloadCount: number
  rating: number
  lastUpdated: string
  module?: SCLModule
}

// UI Component Types
export interface NavigationItem {
  id: string
  name: string
  description: string
  icon: string
  href?: string
}

export interface ModuleContent {
  title: string
  content: string
  icon: string
  narrative?: string
} 