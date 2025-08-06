import { ModuleData, ModuleConfig } from '../types/Module'

/**
 * EventBus interface for simplified architecture
 */
interface EventBus {
    publish(event: string, data: any): void
    subscribe(event: string, handler: (data: unknown) => void): () => void
}

/**
 * Simplified ModuleService with direct EventBus integration
 * Following DRY principles - no duplicate event systems
 */
export class ModuleService {
    private config: ModuleConfig
    private eventBus: EventBus

    constructor(config: ModuleConfig, eventBus: EventBus) {
        this.config = config
        this.eventBus = eventBus
    }

    async load(): Promise<ModuleData | null> {
        try {
            // ✅ Single event emission - no duplication
            this.eventBus.publish('module:load:started', {
                source: this.config.name || 'generic-module',
                timestamp: Date.now(),
            })

            // Simulate API call - replace with actual implementation
            await this.delay(1000)

            // Mock data for demonstration
            const mockData: ModuleData = {
                id: 'module-1',
                name: 'Sample Module',
                description: 'This is a sample module loaded from the service',
                type: 'generic',
                metadata: {
                    tags: ['sample', 'template'],
                    priority: 'medium',
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                version: this.config.version,
            }

            // ✅ Success event
            this.eventBus.publish('module:loaded', {
                source: this.config.name || 'generic-module',
                data: mockData,
                timestamp: Date.now(),
            })

            return mockData
        } catch (error) {
            // ✅ Error event
            this.eventBus.publish('module:load:failed', {
                source: this.config.name || 'generic-module',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
            })
            throw new Error('Failed to load module data')
        }
    }

    async save(data: ModuleData): Promise<void> {
        try {
            // ✅ Single event emission - save started
            this.eventBus.publish('module:save:started', {
                source: this.config.name || 'generic-module',
                moduleId: data.id,
                timestamp: Date.now(),
            })

            await this.delay(800)

            // ✅ Success event
            this.eventBus.publish('module:saved', {
                source: this.config.name || 'generic-module',
                data,
                timestamp: Date.now(),
            })
        } catch (error) {
            // ✅ Error event
            this.eventBus.publish('module:save:failed', {
                source: this.config.name || 'generic-module',
                moduleId: data.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
            })
            throw new Error('Failed to save module data')
        }
    }

    async export(data: ModuleData): Promise<void> {
        try {
            // ✅ Export started event
            this.eventBus.publish('module:export:started', {
                source: this.config.name || 'generic-module',
                moduleId: data.id,
                timestamp: Date.now(),
            })

            const exportData = {
                ...data,
                exportedAt: new Date().toISOString(),
                exportVersion: this.config.version,
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
            })

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${data.name || 'module'}-export.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            // ✅ Export completed event
            this.eventBus.publish('module:exported', {
                source: this.config.name || 'generic-module',
                moduleId: data.id,
                fileName: `${data.name || 'module'}-export.json`,
                size: blob.size,
                timestamp: Date.now(),
            })
        } catch (error) {
            // ✅ Export failed event
            this.eventBus.publish('module:export:failed', {
                source: this.config.name || 'generic-module',
                moduleId: data.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
            })
            throw new Error('Failed to export module data')
        }
    }

    async validate(data: ModuleData): Promise<boolean> {
        try {
            // ✅ Validation started event
            this.eventBus.publish('module:validation:started', {
                source: this.config.name || 'generic-module',
                moduleId: data.id,
                timestamp: Date.now(),
            })

            // Simulate validation - replace with actual implementation
            await this.delay(300)

            const errors: string[] = []

            // Basic validation rules
            if (!data.name || data.name.trim().length === 0) {
                errors.push('Name is required')
            }

            if (data.description && data.description.length > 500) {
                errors.push('Description must be less than 500 characters')
            }

            const isValid = errors.length === 0

            // ✅ Validation completed event
            this.eventBus.publish('module:validated', {
                source: this.config.name || 'generic-module',
                moduleId: data.id,
                isValid,
                errors,
                timestamp: Date.now(),
            })

            return isValid
        } catch (error) {
            // ✅ Validation failed event
            this.eventBus.publish('module:validation:failed', {
                source: this.config.name || 'generic-module',
                moduleId: data.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
            })
            return false
        }
    }

    async search(query: string): Promise<ModuleData[]> {
        try {
            // ✅ Search started event
            this.eventBus.publish('module:search:started', {
                source: this.config.name || 'generic-module',
                query,
                timestamp: Date.now(),
            })

            // Simulate search - replace with actual implementation
            await this.delay(500)

            // Mock search results
            const mockResults: ModuleData[] = [
                {
                    id: 'search-1',
                    name: `Result for "${query}"`,
                    description: 'Search result description',
                    type: 'search-result',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]

            // ✅ Search completed event
            this.eventBus.publish('module:search:completed', {
                source: this.config.name || 'generic-module',
                query,
                results: mockResults,
                resultCount: mockResults.length,
                timestamp: Date.now(),
            })

            return mockResults
        } catch (error) {
            // ✅ Search failed event
            this.eventBus.publish('module:search:failed', {
                source: this.config.name || 'generic-module',
                query,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
            })
            throw new Error('Failed to search modules')
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
