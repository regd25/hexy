"""
Unit tests for plugins
"""
import pytest
from unittest.mock import Mock

from src.plugins.base_plugin import BasePlugin, PluginMetadata
from src.plugins.plugin_manager import PluginManager
from src.events.event_bus import EventBus


class TestPlugin(BasePlugin):
    """Test plugin for testing purposes"""
    
    def __init__(self):
        metadata = PluginMetadata(
            name="Test Plugin",
            version="1.0.0",
            description="A test plugin",
            author="Test Author",
            capabilities=["test_action"],
            dependencies=[]
        )
        super().__init__("test-plugin", metadata)
    
    def get_capabilities(self):
        return self.metadata.capabilities
    
    def execute(self, action, data):
        if action == "test_action":
            return {"result": "success", "data": data}
        else:
            raise ValueError(f"Unknown action: {action}")


class TestPluginMetadata:
    """Test PluginMetadata class"""
    
    def test_plugin_metadata_creation(self):
        """Test creating plugin metadata"""
        metadata = PluginMetadata(
            name="Test Plugin",
            version="1.0.0",
            description="A test plugin",
            author="Test Author",
            capabilities=["action1", "action2"],
            dependencies=["dependency1"]
        )
        
        assert metadata.name == "Test Plugin"
        assert metadata.version == "1.0.0"
        assert metadata.description == "A test plugin"
        assert metadata.author == "Test Author"
        assert metadata.capabilities == ["action1", "action2"]
        assert metadata.dependencies == ["dependency1"]


class TestBasePlugin:
    """Test BasePlugin class"""
    
    def test_plugin_creation(self):
        """Test creating a plugin"""
        plugin = TestPlugin()
        
        assert plugin.plugin_id == "test-plugin"
        assert plugin.metadata.name == "Test Plugin"
        assert plugin.enabled is True
        assert plugin.config == {}
    
    def test_plugin_validation(self):
        """Test plugin validation"""
        plugin = TestPlugin()
        
        assert plugin.validate() is True
    
    def test_plugin_enable_disable(self):
        """Test enabling and disabling plugins"""
        plugin = TestPlugin()
        
        assert plugin.is_enabled() is True
        
        plugin.disable()
        assert plugin.is_enabled() is False
        
        plugin.enable()
        assert plugin.is_enabled() is True
    
    def test_plugin_configuration(self):
        """Test plugin configuration"""
        plugin = TestPlugin()
        
        config = {"setting1": "value1", "setting2": "value2"}
        plugin.configure(config)
        
        assert plugin.get_config() == config
        assert plugin.get_config("setting1") == "value1"
        assert plugin.get_config("non_existent") is None
    
    def test_plugin_execution(self):
        """Test plugin execution"""
        plugin = TestPlugin()
        
        result = plugin.execute("test_action", {"test": "data"})
        
        assert result["result"] == "success"
        assert result["data"] == {"test": "data"}
    
    def test_plugin_execution_unknown_action(self):
        """Test plugin execution with unknown action"""
        plugin = TestPlugin()
        
        with pytest.raises(ValueError):
            plugin.execute("unknown_action", {})
    
    def test_plugin_info(self):
        """Test getting plugin information"""
        plugin = TestPlugin()
        
        info = plugin.get_info()
        
        assert info["plugin_id"] == "test-plugin"
        assert info["metadata"]["name"] == "Test Plugin"
        assert info["enabled"] is True
        assert info["config"] == {}


class TestPluginManager:
    """Test PluginManager class"""
    
    def setup_method(self):
        """Setup method for each test"""
        self.event_bus = Mock(spec=EventBus)
        self.plugin_manager = PluginManager(self.event_bus)
    
    def test_plugin_manager_initialization(self):
        """Test plugin manager initialization"""
        assert self.plugin_manager.plugins == {}
        assert self.plugin_manager.capabilities == {}
        assert self.plugin_manager.event_bus == self.event_bus
    
    def test_register_plugin(self):
        """Test registering a plugin"""
        plugin = TestPlugin()
        
        result = self.plugin_manager.register_plugin(plugin)
        
        assert result is True
        assert "test-plugin" in self.plugin_manager.plugins
        assert self.plugin_manager.plugins["test-plugin"] == plugin
        assert "test_action" in self.plugin_manager.capabilities["test-plugin"]
        self.event_bus.publish.assert_called()
    
    def test_unregister_plugin(self):
        """Test unregistering a plugin"""
        plugin = TestPlugin()
        self.plugin_manager.plugins["test-plugin"] = plugin
        self.plugin_manager.capabilities["test-plugin"] = ["test_action"]
        
        result = self.plugin_manager.unregister_plugin("test-plugin")
        
        assert result is True
        assert "test-plugin" not in self.plugin_manager.plugins
        assert "test-plugin" not in self.plugin_manager.capabilities
        self.event_bus.publish.assert_called()
    
    def test_get_plugin(self):
        """Test getting a plugin by ID"""
        plugin = TestPlugin()
        self.plugin_manager.plugins["test-plugin"] = plugin
        
        retrieved = self.plugin_manager.get_plugin("test-plugin")
        assert retrieved == plugin
        
        not_found = self.plugin_manager.get_plugin("non-existent")
        assert not_found is None
    
    def test_get_plugins_by_capability(self):
        """Test getting plugins by capability"""
        plugin1 = TestPlugin()
        plugin1.metadata.capabilities = ["action1", "action2"]
        
        plugin2 = TestPlugin()
        plugin2.plugin_id = "test-plugin-2"
        plugin2.metadata.capabilities = ["action2", "action3"]
        
        self.plugin_manager.plugins = {
            "test-plugin": plugin1,
            "test-plugin-2": plugin2
        }
        
        action1_plugins = self.plugin_manager.get_plugins_by_capability("action1")
        assert len(action1_plugins) == 1
        assert action1_plugins[0] == plugin1
        
        action2_plugins = self.plugin_manager.get_plugins_by_capability("action2")
        assert len(action2_plugins) == 2
        
        action3_plugins = self.plugin_manager.get_plugins_by_capability("action3")
        assert len(action3_plugins) == 1
        assert action3_plugins[0] == plugin2
    
    def test_get_enabled_plugins(self):
        """Test getting enabled plugins"""
        plugin1 = TestPlugin()
        plugin2 = TestPlugin()
        plugin2.plugin_id = "test-plugin-2"
        plugin2.disable()
        
        self.plugin_manager.plugins = {
            "test-plugin": plugin1,
            "test-plugin-2": plugin2
        }
        
        enabled_plugins = self.plugin_manager.get_enabled_plugins()
        
        assert len(enabled_plugins) == 1
        assert enabled_plugins[0] == plugin1
    
    def test_execute_plugin(self):
        """Test executing a plugin action"""
        plugin = TestPlugin()
        self.plugin_manager.plugins["test-plugin"] = plugin
        
        result = self.plugin_manager.execute_plugin("test-plugin", "test_action", {"test": "data"})
        
        assert result["result"] == "success"
        assert result["data"] == {"test": "data"}
        self.event_bus.publish.assert_called()
    
    def test_execute_nonexistent_plugin(self):
        """Test executing a non-existent plugin"""
        result = self.plugin_manager.execute_plugin("non-existent", "test_action", {})
        
        assert result is None
    
    def test_execute_disabled_plugin(self):
        """Test executing a disabled plugin"""
        plugin = TestPlugin()
        plugin.disable()
        self.plugin_manager.plugins["test-plugin"] = plugin
        
        result = self.plugin_manager.execute_plugin("test-plugin", "test_action", {})
        
        assert result is None
    
    def test_execute_capability(self):
        """Test executing an action across plugins with a capability"""
        plugin1 = TestPlugin()
        plugin2 = TestPlugin()
        plugin2.plugin_id = "test-plugin-2"
        
        self.plugin_manager.plugins = {
            "test-plugin": plugin1,
            "test-plugin-2": plugin2
        }
        
        results = self.plugin_manager.execute_capability("test_action", "test_action", {"test": "data"})
        
        assert len(results) == 2
        assert all("result" in result for result in results)
    
    def test_enable_disable_plugin(self):
        """Test enabling and disabling plugins through manager"""
        plugin = TestPlugin()
        self.plugin_manager.plugins["test-plugin"] = plugin
        
        result = self.plugin_manager.enable_plugin("test-plugin")
        assert result is True
        assert plugin.is_enabled() is True
        
        result = self.plugin_manager.disable_plugin("test-plugin")
        assert result is True
        assert plugin.is_enabled() is False
    
    def test_configure_plugin(self):
        """Test configuring a plugin through manager"""
        plugin = TestPlugin()
        self.plugin_manager.plugins["test-plugin"] = plugin
        
        config = {"setting1": "value1"}
        result = self.plugin_manager.configure_plugin("test-plugin", config)
        
        assert result is True
        assert plugin.get_config() == config
    
    def test_get_statistics(self):
        """Test getting plugin manager statistics"""
        plugin = TestPlugin()
        self.plugin_manager.plugins["test-plugin"] = plugin
        self.plugin_manager.capabilities["test-plugin"] = ["test_action"]
        
        stats = self.plugin_manager.get_statistics()
        
        assert stats["total_plugins"] == 1
        assert stats["enabled_plugins"] == 1
        assert "test_action" in stats["capabilities"]
        assert stats["capabilities"]["test_action"] == 1
