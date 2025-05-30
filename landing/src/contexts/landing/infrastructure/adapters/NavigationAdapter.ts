import { NavigationService } from '../../application/services/NavigationService'
import { InMemoryNavigationRepository } from '../repositories/InMemoryNavigationRepository'

// Adapter pattern to connect domain layer with React UI
export class NavigationAdapter {
  private navigationService: NavigationService

  constructor() {
    const repository = new InMemoryNavigationRepository()
    this.navigationService = new NavigationService(repository)
  }

  async getNavigationItems() {
    const navigation = await this.navigationService.getNavigation()
    return navigation.getAllItems().map(item => item.toPlainObject())
  }

  async navigateToModule(moduleId: string) {
    const result = await this.navigationService.navigateToModule(moduleId)
    return {
      success: result.success,
      error: result.error,
      item: result.navigationItem?.toPlainObject()
    }
  }

  async getNavigationState() {
    return await this.navigationService.getNavigationState()
  }
}

// Singleton instance for React components
export const navigationAdapter = new NavigationAdapter()

// Narrative: NavigationAdapter bridges the gap between domain logic and React UI,
// following hexagonal architecture principles by keeping UI concerns separate from business logic 