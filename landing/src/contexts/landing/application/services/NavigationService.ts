import { NavigationRepository } from '../../domain/repositories/NavigationRepository'
import { NavigateModules, NavigateModulesRequest, NavigateModulesResponse } from '../use-cases/NavigateModules'
import { Navigation } from '../../domain/aggregates/Navigation'

export class NavigationService {
  private navigateModulesUseCase: NavigateModules

  constructor(private navigationRepository: NavigationRepository) {
    this.navigateModulesUseCase = new NavigateModules(navigationRepository)
  }

  async getNavigation(): Promise<Navigation> {
    return await this.navigationRepository.getModuleNavigation()
  }

  async navigateToModule(moduleId: string): Promise<NavigateModulesResponse> {
    const request: NavigateModulesRequest = { moduleId }
    return await this.navigateModulesUseCase.execute(request)
  }

  async getNavigationState() {
    const navigation = await this.getNavigation()
    return navigation.getNavigationState()
  }
}

// Narrative: NavigationService acts as the application layer coordinator,
// orchestrating domain use cases and providing a clean interface for the UI layer 