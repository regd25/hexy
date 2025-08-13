/**
 * Artifacts Module Public API
 * Centralized exports for the new artifacts management module
 * Following Hexy Framework semantic principles and DDD patterns
 */

// Types
export * from './types'

// Services
export * from './services'

// Components
export { ArtifactsDashboard } from './components/ArtifactsDashboard'
export { ArtifactList } from './components/ArtifactList'
export { SemanticArtifactEditor } from './components/SemanticArtifactEditor'

// Module configuration
export const artifactsModule = {
    name: 'artifacts-module',
    version: '1.0.0',
    description: 'Enhanced Hexy artifacts management module with semantic validation and D3.js visualization',
    features: [
        'Comprehensive type system with D3.js visualization properties',
        'Repository pattern with LocalStorage implementation',
        'Semantic validation following Hexy principles',
        'Event bus integration for cross-module communication',
        'Temporal artifact support for draft management',
        'Enhanced relationship management with visual properties',
    ],
    dependencies: {
        zod: '^3.0.0',
        react: '^19.0.0',
        typescript: '^5.0.0',
    },
}

export default artifactsModule
