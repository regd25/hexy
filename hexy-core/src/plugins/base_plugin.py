"""
Base Plugin - Base class for all Hexy plugins
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class PluginMetadata:
    """Metadata for a plugin"""

    name: str
    version: str
    description: str
    author: str
    capabilities: List[str]
    dependencies: List[str] = None


class BasePlugin(ABC):
    """Base class for all Hexy plugins"""

    def __init__(self, plugin_id: str, metadata: PluginMetadata):
        self.plugin_id = plugin_id
        self.metadata = metadata
        self.enabled = True
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.config: Dict[str, Any] = {}

        # Validate plugin on initialization
        if not self.validate():
            raise ValueError(f"Plugin validation failed: {plugin_id}")

    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Return plugin capabilities"""
        return self.metadata.capabilities

    @abstractmethod
    def execute(self, action: str, data: Dict[str, Any]) -> Any:
        """Execute a plugin action"""
        pass

    def validate(self) -> bool:
        """Validate plugin configuration"""
        try:
            # Check required capabilities
            if not self.metadata.capabilities:
                logger.error(f"Plugin {self.plugin_id} has no capabilities")
                return False

            # Check dependencies if any
            if self.metadata.dependencies:
                for dependency in self.metadata.dependencies:
                    if not self._check_dependency(dependency):
                        logger.error(
                            f"Plugin {self.plugin_id} missing dependency: {dependency}"
                        )
                        return False

            return True
        except Exception as e:
            logger.error(f"Plugin validation error for {self.plugin_id}: {str(e)}")
            return False

    def _check_dependency(self, dependency: str) -> bool:
        """Check if a dependency is available"""
        try:
            __import__(dependency)
            return True
        except ImportError:
            return False

    def enable(self):
        """Enable the plugin"""
        self.enabled = True
        self.updated_at = datetime.now()
        logger.info(f"Plugin enabled: {self.plugin_id}")

    def disable(self):
        """Disable the plugin"""
        self.enabled = False
        self.updated_at = datetime.now()
        logger.info(f"Plugin disabled: {self.plugin_id}")

    def is_enabled(self) -> bool:
        """Check if plugin is enabled"""
        return self.enabled

    def configure(self, config: Dict[str, Any]):
        """Configure the plugin"""
        self.config.update(config)
        self.updated_at = datetime.now()
        logger.info(f"Plugin configured: {self.plugin_id}")

    def get_config(self, key: str = None) -> Any:
        """Get plugin configuration"""
        if key is None:
            return self.config
        return self.config.get(key)

    def get_info(self) -> Dict[str, Any]:
        """Get plugin information"""
        return {
            "plugin_id": self.plugin_id,
            "metadata": {
                "name": self.metadata.name,
                "version": self.metadata.version,
                "description": self.metadata.description,
                "author": self.metadata.author,
                "capabilities": self.metadata.capabilities,
                "dependencies": self.metadata.dependencies or [],
            },
            "enabled": self.enabled,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "config": self.config,
        }

    def __str__(self) -> str:
        return f"Plugin({self.plugin_id}, {self.metadata.name})"

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id='{self.plugin_id}' name='{self.metadata.name}'>"
