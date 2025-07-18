import { Navigation } from '../aggregates/Navigation'
import { NavigationItem } from '../entities/NavigationItem'
import { NavigationItemId } from '../value-objects/NavigationItemId'

export interface NavigationRepository {
  findAll(): Promise<Navigation>
  findById(id: NavigationItemId): Promise<NavigationItem | null>
  save(navigation: Navigation): Promise<void>
  getModuleNavigation(): Promise<Navigation>
}

// Narrative: Repository pattern ensures separation between domain logic
// and data persistence, following hexagonal architecture principles 