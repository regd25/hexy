import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
// import { typeDefs } from './infrastructure/adapters/graphql/schema';
// import { resolvers, GraphQLContext } from './infrastructure/adapters/graphql/resolvers';
import { createRoutes } from './infrastructure/adapters/rest/routes';
import { ProcessController } from './infrastructure/adapters/rest/controllers/ProcessController';
import { ArtifactController } from './infrastructure/adapters/rest/controllers/ArtifactController';
import { SystemController } from './infrastructure/adapters/rest/controllers/SystemController';
// Use cases will be integrated later
import { HexyEngine } from './index';

export class HexyEngineServer {
  private app: express.Application;
  private apolloServer!: ApolloServer;
  private port: number;

  // Use cases will be added later

  // Controllers
  private processController!: ProcessController;
  private artifactController!: ArtifactController;
  private systemController!: SystemController;

  constructor(port: number = 4000) {
    this.port = port;
    this.app = express();
    this.initializeDependencies();
    this.setupMiddleware();
    // this.setupApolloServer();
    this.setupRoutes();
  }

  private initializeDependencies(): void {
    // Initialize controllers with simplified implementations
    this.processController = new ProcessController();
    this.artifactController = new ArtifactController();
    this.systemController = new SystemController();
  }

  private setupMiddleware(): void {
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      );

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging middleware
    this.app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'hexy-engine',
        version: HexyEngine.getVersion(),
      });
    });
  }

  // private _setupApolloServer(): void {
  //   this.apolloServer = new ApolloServer({
  //     typeDefs,
  //     resolvers,
  //     context: (): GraphQLContext => ({
  //       executeProcess: {} as any, // TODO: Implement
  //       validateArtifact: {} as any, // TODO: Implement
  //       validateArtifactWithLLM: {} as any, // TODO: Implement
  //       hexyEngine: HexyEngine.getInstance(),
  //     }),
  //     introspection: true,
  //   });
  // }

  private setupRoutes(): void {
    // REST API routes
    const apiRoutes = createRoutes({
      processController: this.processController,
      artifactController: this.artifactController,
      systemController: this.systemController,
    });

    this.app.use('/api', apiRoutes);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        message: 'HexyEngine API Server',
        version: HexyEngine.getVersion(),
        endpoints: {
          graphql: '/graphql',
          rest: '/api',
          health: '/health',
          playground: '/graphql (GraphQL Playground)',
        },
        documentation: {
          rest: '/api-docs', // TODO: Add Swagger/OpenAPI documentation
          graphql: '/graphql', // GraphQL introspection available
        },
      });
    });

    // 404 handler
    this.app.all('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          message: 'Endpoint not found',
          code: 'NOT_FOUND',
          path: req.originalUrl,
        },
      });
    });

    // Error handler
    this.app.use(
      (error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('Unhandled error:', error);
        res.status(500).json({
          success: false,
          error: {
            message: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
        });
      }
    );
  }

  public async start(): Promise<void> {
    try {
      // Start Apollo Server
      // await this.apolloServer.start();
      // this.apolloServer.applyMiddleware({
      //   app: this.app as any,
      //   path: '/graphql',
      //   cors: false, // We handle CORS in our middleware
      // });

      // Start HTTP server
      this.app.listen(this.port, () => {
        console.log(`🚀 HexyEngine Server ready at http://localhost:${this.port}`);
        console.log(`📊 GraphQL Playground available at http://localhost:${this.port}/graphql`);
        console.log(`🔗 REST API available at http://localhost:${this.port}/api`);
        console.log(`❤️  Health check available at http://localhost:${this.port}/health`);
        console.log(`📖 Engine info: ${JSON.stringify(HexyEngine.getInfo(), null, 2)}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.apolloServer.stop();
      console.log('HexyEngine Server stopped');
    } catch (error) {
      console.error('Error stopping server:', error);
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  const server = new HexyEngineServer(port);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  server.start().catch((error) => {
    console.error('Failed to start HexyEngine Server:', error);
    process.exit(1);
  });
}
