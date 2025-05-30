import { NavigationItem } from '../entities/NavigationItem'
import { NavigationItemId } from '../value-objects/NavigationItemId'

export class Navigation {
  private _items: Map<string, NavigationItem> = new Map()

  constructor(items: NavigationItem[] = []) {
    items.forEach(item => this.addItem(item))
  }

  static create(items: NavigationItem[] = []): Navigation {
    return new Navigation(items)
  }

  addItem(item: NavigationItem): void {
    // Rule: AllModulesMustBeAccessible - Ensure all navigation items are accessible
    this._items.set(item.id.value, item)
  }

  removeItem(id: NavigationItemId): void {
    this._items.delete(id.value)
  }

  getItem(id: NavigationItemId): NavigationItem | undefined {
    return this._items.get(id.value)
  }

  getAllItems(): NavigationItem[] {
    return Array.from(this._items.values()).sort((a, b) => a.order - b.order)
  }

  getActiveItem(): NavigationItem | undefined {
    return Array.from(this._items.values()).find(item => item.isActive)
  }

  activateItem(id: NavigationItemId): void {
    // Deactivate all items first
    this._items.forEach(item => item.deactivate())
    
    // Activate the selected item
    const item = this.getItem(id)
    if (item) {
      item.activate()
    }
  }

  getItemsByOrder(): NavigationItem[] {
    return this.getAllItems()
  }

  // UseCase: NavigateModules implementation
  navigateToModule(moduleId: string): NavigationItem | undefined {
    const item = this._items.get(moduleId)
    if (item) {
      this.activateItem(item.id)
      return item
    }
    return undefined
  }

  // Narrative: Navigation aggregate ensures consistency in navigation state
  // and enforces business rules across all navigation items
  getNavigationState() {
    return {
      totalItems: this._items.size,
      activeItem: this.getActiveItem()?.id.value,
      items: this.getAllItems().map(item => item.toPlainObject())
    }
  }
} 