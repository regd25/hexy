import { Capability, Capabilitytype, Plugin } from './Plugin'

export class PluginManager {
    private readonly plugins: Map<string, Plugin> = new Map()

    register(plugin: Plugin): void {
        if (this.plugins.has(plugin.id)) {
            throw new Error(`Plugin already registered: ${plugin.id}`)
        }
        this.plugins.set(plugin.id, plugin)
    }

    unregister(pluginId: string): void {
        const plugin = this.plugins.get(pluginId)
        if (!plugin) return
        this.plugins.delete(pluginId)
        plugin.dispose()
    }

    listPlugins(): Plugin[] {
        return Array.from(this.plugins.values())
    }

    listCapabilities<T extends Capabilitytype>(type: T): Array<Extract<Capability, { type: T }>> {
        const caps: Capability[] = []
        for (const plugin of this.plugins.values()) {
            for (const cap of plugin.capabilities) {
                if (cap.type === type) caps.push(cap)
            }
        }
        return caps as Array<Extract<Capability, { type: T }>>
    }
}
