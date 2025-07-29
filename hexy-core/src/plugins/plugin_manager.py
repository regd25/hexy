"""
Plugin Manager - Manages Hexy plugins with DDD principles
"""

from typing import Dict, List, Type, Optional, Any
import logging

from .base_plugin import BasePlugin, PluginMetadata
from ..events.event_bus import EventBus

logger = logging.getLogger(__name__)


class PluginManager:
    """Plugin manager with DDD principles"""

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.plugins: Dict[str, BasePlugin] = {}
        self.capabilities: Dict[str, List[str]] = {}
        self.plugin_registry: Dict[str, Type[BasePlugin]] = {}

        self._setup_event_handlers()

    def _setup_event_handlers(self):
        """Setup event handlers for plugin management"""
        self.event_bus.subscribe("plugin.registered", self._on_plugin_registered)
        self.event_bus.subscribe("plugin.enabled", self._on_plugin_enabled)
        self.event_bus.subscribe("plugin.disabled", self._on_plugin_disabled)

    def register_plugin(self, plugin: BasePlugin) -> bool:
        """Register a plugin"""
        try:
            if not plugin.validate():
                logger.error(f"Plugin validation failed: {plugin.plugin_id}")
                return False

            self.plugins[plugin.plugin_id] = plugin
            self.capabilities[plugin.plugin_id] = plugin.get_capabilities()

            self.event_bus.publish(
                "plugin.registered",
                {
                    "plugin_id": plugin.plugin_id,
                    "capabilities": plugin.get_capabilities(),
                    "metadata": plugin.metadata.__dict__,
                },
            )

            logger.info(f"Plugin registered successfully: {plugin.plugin_id}")
            return True

        except Exception as e:
            logger.error(f"Error registering plugin {plugin.plugin_id}: {str(e)}")
            return False

    def unregister_plugin(self, plugin_id: str) -> bool:
        """Unregister a plugin"""
        if plugin_id not in self.plugins:
            logger.error(f"Plugin not found: {plugin_id}")
            return False

        try:
            plugin = self.plugins[plugin_id]
            del self.plugins[plugin_id]
            del self.capabilities[plugin_id]

            self.event_bus.publish("plugin.unregistered", {"plugin_id": plugin_id})

            logger.info(f"Plugin unregistered successfully: {plugin_id}")
            return True

        except Exception as e:
            logger.error(f"Error unregistering plugin {plugin_id}: {str(e)}")
            return False

    def get_plugin(self, plugin_id: str) -> Optional[BasePlugin]:
        """Get a plugin by ID"""
        return self.plugins.get(plugin_id)

    def get_plugins_by_capability(self, capability: str) -> List[BasePlugin]:
        """Get plugins by capability"""
        return [
            plugin
            for plugin in self.plugins.values()
            if capability in plugin.get_capabilities()
        ]

    def get_enabled_plugins(self) -> List[BasePlugin]:
        """Get all enabled plugins"""
        return [plugin for plugin in self.plugins.values() if plugin.is_enabled()]

    def execute_plugin(self, plugin_id: str, action: str, data: Dict[str, Any]) -> Any:
        """Execute an action in a specific plugin"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            logger.error(f"Plugin not found: {plugin_id}")
            return None

        if not plugin.is_enabled():
            logger.error(f"Plugin is disabled: {plugin_id}")
            return None

        try:
            result = plugin.execute(action, data)

            self.event_bus.publish(
                "plugin.action_executed",
                {"plugin_id": plugin_id, "action": action, "success": True},
            )

            logger.info(f"Plugin action executed: {plugin_id}.{action}")
            return result

        except Exception as e:
            logger.error(
                f"Error executing plugin action {plugin_id}.{action}: {str(e)}"
            )

            self.event_bus.publish(
                "plugin.action_failed",
                {"plugin_id": plugin_id, "action": action, "error": str(e)},
            )

            return None

    def execute_capability(
        self, capability: str, action: str, data: Dict[str, Any]
    ) -> List[Any]:
        """Execute an action across all plugins with a specific capability"""
        plugins = self.get_plugins_by_capability(capability)
        results = []

        for plugin in plugins:
            if plugin.is_enabled():
                try:
                    result = plugin.execute(action, data)
                    results.append({"plugin_id": plugin.plugin_id, "result": result})
                except Exception as e:
                    logger.error(
                        f"Error executing capability {capability} in {plugin.plugin_id}: {str(e)}"
                    )
                    results.append({"plugin_id": plugin.plugin_id, "error": str(e)})

        return results

    def enable_plugin(self, plugin_id: str) -> bool:
        """Enable a plugin"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            logger.error(f"Plugin not found: {plugin_id}")
            return False

        plugin.enable()

        self.event_bus.publish("plugin.enabled", {"plugin_id": plugin_id})

        return True

    def disable_plugin(self, plugin_id: str) -> bool:
        """Disable a plugin"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            logger.error(f"Plugin not found: {plugin_id}")
            return False

        plugin.disable()

        self.event_bus.publish("plugin.disabled", {"plugin_id": plugin_id})

        return True

    def configure_plugin(self, plugin_id: str, config: Dict[str, Any]) -> bool:
        """Configure a plugin"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            logger.error(f"Plugin not found: {plugin_id}")
            return False

        plugin.configure(config)

        self.event_bus.publish(
            "plugin.configured", {"plugin_id": plugin_id, "config": config}
        )

        return True

    def get_statistics(self) -> Dict[str, Any]:
        """Get plugin manager statistics"""
        capabilities_count = {}
        for plugin_capabilities in self.capabilities.values():
            for capability in plugin_capabilities:
                capabilities_count[capability] = (
                    capabilities_count.get(capability, 0) + 1
                )

        return {
            "total_plugins": len(self.plugins),
            "enabled_plugins": len(self.get_enabled_plugins()),
            "capabilities": capabilities_count,
            "plugins": {
                plugin_id: plugin.get_info()
                for plugin_id, plugin in self.plugins.items()
            },
        }

    def _on_plugin_registered(self, event: Dict[str, Any]):
        """Handle plugin registered event"""
        logger.info(f"Plugin registered event: {event}")

    def _on_plugin_enabled(self, event: Dict[str, Any]):
        """Handle plugin enabled event"""
        logger.info(f"Plugin enabled event: {event}")

    def _on_plugin_disabled(self, event: Dict[str, Any]):
        """Handle plugin disabled event"""
        logger.info(f"Plugin disabled event: {event}")
