import { NavigationService } from '../../application/services/NavigationService'
import { InMemoryNavigationRepository } from '../repositories/InMemoryNavigationRepository'

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

export const navigationAdapter = new NavigationAdapter()
