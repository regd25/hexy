import { Module } from '../dependency-injection/module-decorator'
import { container } from '../dependency-injection'
import { CommandBus, CommandHandlerRegistry } from './command-bus'
import { QueryBus, QueryHandlerRegistry } from './query-bus'
import { UseCaseOrchestrator } from './use-case-orchestrator'
import { ContextModule } from '../contexts/context.module'

/**
 * @description Module for use case handling and CQRS
 * Provides dependencies for command and query handling
 */
@Module({
  imports: [
    ContextModule
  ],
  providers: [
    // Core orchestration
    UseCaseOrchestrator,
    
    // Command handling
    CommandHandlerRegistry,
    CommandBus,
    
    // Query handling
    QueryHandlerRegistry,
    QueryBus,
    
    // Dependency injection container
    {
      provide: 'Container',
      useValue: container
    }
  ],
  exports: [
    UseCaseOrchestrator,
    CommandBus,
    QueryBus
  ]
})
export class UseCaseModule {} 