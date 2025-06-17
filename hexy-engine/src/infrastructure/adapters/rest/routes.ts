import { Router } from 'express';
import { ProcessController } from './controllers/ProcessController';
import { ArtifactController } from './controllers/ArtifactController';
import { SystemController } from './controllers/SystemController';

export interface RoutesDependencies {
  processController: ProcessController;
  artifactController: ArtifactController;
  systemController: SystemController;
}

export function createRoutes(dependencies: RoutesDependencies): Router {
  const router = Router();
  const { processController, artifactController, systemController } = dependencies;

  // System routes
  router.get('/system/info', systemController.getEngineInfo.bind(systemController));
  router.get('/system/health', systemController.getEngineHealth.bind(systemController));
  router.get('/system/version', systemController.getEngineVersion.bind(systemController));
  router.post('/system/shutdown', systemController.shutdown.bind(systemController));

  // Process routes
  router.get('/processes', processController.listProcesses.bind(processController));
  router.get('/processes/:id', processController.getProcess.bind(processController));
  router.post('/processes/:id/execute', processController.executeProcessEndpoint.bind(processController));
  router.post('/processes/:id/validate', processController.validateProcess.bind(processController));
  router.get('/processes/:id/executions', processController.listProcessExecutions.bind(processController));

  // Execution routes
  router.get('/executions/:executionId', processController.getExecution.bind(processController));
  router.post('/executions/:executionId/cancel', processController.cancelExecution.bind(processController));

  // Artifact routes
  router.get('/artifacts', artifactController.listArtifacts.bind(artifactController));
  router.get('/artifacts/:type/:id', artifactController.getArtifact.bind(artifactController));
  router.post('/artifacts', artifactController.createArtifact.bind(artifactController));
  router.put('/artifacts/:type/:id', artifactController.updateArtifact.bind(artifactController));
  router.delete('/artifacts/:type/:id', artifactController.deleteArtifact.bind(artifactController));
  router.post('/artifacts/:type/:id/validate', artifactController.validateArtifact.bind(artifactController));
  router.post('/artifacts/:type/:id/validate-llm', artifactController.validateArtifactWithLLM.bind(artifactController));

  return router;
} 