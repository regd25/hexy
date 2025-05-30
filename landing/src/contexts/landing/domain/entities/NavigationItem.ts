import { Entity } from '@/src/shared/domain/Entity'
import { NavigationItemId } from '../value-objects/NavigationItemId'
import { NavigationItemName } from '../value-objects/NavigationItemName'
import { NavigationItemUrl } from '../value-objects/NavigationItemUrl'

export interface NavigationItemProps {
  name: NavigationItemName
  url: NavigationItemUrl
  description?: string
  icon?: string
  isActive?: boolean
  order?: number
}

export class NavigationItem extends Entity<NavigationItemId> {
  private readonly _name: NavigationItemName
  private readonly _url: NavigationItemUrl
  private readonly _description?: string
  private readonly _icon?: string
  private _isActive: boolean
  private readonly _order: number

  constructor(id: NavigationItemId, props: NavigationItemProps) {
    super(id)
    this._name = props.name
    this._url = props.url
    this._description = props.description
    this._icon = props.icon
    this._isActive = props.isActive ?? false
    this._order = props.order ?? 0
  }

  static create(
    id: string,
    name: string,
    url: string,
    description?: string,
    icon?: string,
    order?: number
  ): NavigationItem {
    return new NavigationItem(
      NavigationItemId.create(id),
      {
        name: NavigationItemName.create(name),
        url: NavigationItemUrl.create(url),
        description,
        icon,
        order
      }
    )
  }

  get name(): NavigationItemName {
    return this._name
  }

  get url(): NavigationItemUrl {
    return this._url
  }

  get description(): string | undefined {
    return this._description
  }

  get icon(): string | undefined {
    return this._icon
  }

  get isActive(): boolean {
    return this._isActive
  }

  get order(): number {
    return this._order
  }

  activate(): void {
    this._isActive = true
  }

  deactivate(): void {
    this._isActive = false
  }

  isExternal(): boolean {
    return this._url.isExternal()
  }

  // Narrative: NavigationItem preserves the semantic structure of navigation elements
  // ensuring consistency and validation across the landing page interface
  toPlainObject() {
    return {
      id: this.id.value,
      name: this._name.value,
      url: this._url.value,
      description: this._description,
      icon: this._icon,
      isActive: this._isActive,
      order: this._order,
      isExternal: this.isExternal()
    }
  }
} 