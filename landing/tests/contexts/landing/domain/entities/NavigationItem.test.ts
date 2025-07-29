import { NavigationItem } from '@/src/contexts/landing/domain/entities/NavigationItem'
import { NavigationItemId } from '@/src/contexts/landing/domain/value-objects/NavigationItemId'
import { NavigationItemName } from '@/src/contexts/landing/domain/value-objects/NavigationItemName'
import { NavigationItemUrl } from '@/src/contexts/landing/domain/value-objects/NavigationItemUrl'

describe('NavigationItem Entity', () => {
  describe('creation', () => {
    it('should create a navigation item with valid properties', () => {
      const item = NavigationItem.create(
        'test-module',
        'Test Module',
        '/test',
        'A test module',
        '🧪',
        1
      )

      expect(item.id.value).toBe('test-module')
      expect(item.name.value).toBe('Test Module')
      expect(item.url.value).toBe('/test')
      expect(item.description).toBe('A test module')
      expect(item.icon).toBe('🧪')
      expect(item.order).toBe(1)
      expect(item.isActive).toBe(false)
    })

    it('should create a navigation item with minimal properties', () => {
      const item = NavigationItem.create('minimal', 'Minimal', '/')

      expect(item.id.value).toBe('minimal')
      expect(item.name.value).toBe('Minimal')
      expect(item.url.value).toBe('/')
      expect(item.description).toBeUndefined()
      expect(item.icon).toBeUndefined()
      expect(item.order).toBe(0)
    })
  })

  describe('activation', () => {
    it('should activate and deactivate navigation item', () => {
      const item = NavigationItem.create('test', 'Test', '/')

      expect(item.isActive).toBe(false)

      item.activate()
      expect(item.isActive).toBe(true)

      item.deactivate()
      expect(item.isActive).toBe(false)
    })
  })

  describe('external URL detection', () => {
    it('should detect external URLs', () => {
      const externalItem = NavigationItem.create('external', 'External', 'https:
      const internalItem = NavigationItem.create('internal', 'Internal', '/internal')
      const hashItem = NavigationItem.create('hash', 'Hash', '#section')

      expect(externalItem.isExternal()).toBe(true)
      expect(internalItem.isExternal()).toBe(false)
      expect(hashItem.isExternal()).toBe(false)
    })
  })

  describe('equality', () => {
    it('should be equal when IDs are the same', () => {
      const item1 = NavigationItem.create('same-id', 'Item 1', '/item1')
      const item2 = NavigationItem.create('same-id', 'Item 2', '/item2')

      expect(item1.equals(item2)).toBe(true)
    })

    it('should not be equal when IDs are different', () => {
      const item1 = NavigationItem.create('id1', 'Item 1', '/item1')
      const item2 = NavigationItem.create('id2', 'Item 2', '/item2')

      expect(item1.equals(item2)).toBe(false)
    })
  })

  describe('toPlainObject', () => {
    it('should convert to plain object with all properties', () => {
      const item = NavigationItem.create(
        'test',
        'Test Item',
        'https:
        'Test description',
        '🧪',
        5
      )
      item.activate()

      const plainObject = item.toPlainObject()

      expect(plainObject).toEqual({
        id: 'test',
        name: 'Test Item',
        url: 'https:
        description: 'Test description',
        icon: '🧪',
        isActive: true,
        order: 5,
        isExternal: true
      })
    })
  })
})
