/**
 * Artifact Module Public API
 * Centralized exports for the artifact management module
 */

// Types
export * from './types/artifact.types';

// Services
export { ArtifactService } from './services/ArtifactService';
export { ValidationService } from './services/ValidationService';

// Hooks
export { useArtifacts } from './hooks/useArtifacts';

// Components
export { ArtifactEditor } from './components/ArtifactEditor';
export { ArtifactGraph } from './components/ArtifactGraph';
export { ArtifactList } from './components/ArtifactList';

// Pages
export { ArtifactDashboard } from './pages/ArtifactDashboard';

// Routes
export { artifactRoutes, artifactNavigation } from './routes';

// Module configuration
export const artifactModule = {
  name: 'artifact-module',
  version: '1.0.0',
  description: 'Hexy artifact management module',
  routes: artifactRoutes,
  navigation: artifactNavigation
};

export default artifactModule;