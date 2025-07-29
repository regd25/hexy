import { NavigationRepository } from '../../domain/repositories/NavigationRepository'
import { NavigationItemId } from '../../domain/value-objects/NavigationItemId'
import { NavigationItem } from '../../domain/entities/NavigationItem'

export interface NavigateModulesRequest {
  moduleId: string
}

export interface NavigateModulesResponse {
  success: boolean
  navigationItem?: NavigationItem
  error?: string
}

export class NavigateModules {
  constructor(private navigationRepository: NavigationRepository) {}

  async execute(request: NavigateModulesRequest): Promise<NavigateModulesResponse> {
    try {

      const navigation = await this.navigationRepository.findAll()
      const moduleId = NavigationItemId.create(request.moduleId)
      
      const navigationItem = navigation.navigateToModule(request.moduleId)
      
      if (!navigationItem) {
        return {
          success: false,
          error: `Module with id ${request.moduleId} not found`
        }
      }


      await this.navigationRepository.save(navigation)

      return {
        success: true,
        navigationItem
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
