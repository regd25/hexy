"""
Sistema de configuración centralizado para Hexy Framework.
Basado en variables de entorno con valores por defecto sensatos.
"""
import os
from typing import Dict, Any, Optional, List
from pathlib import Path
import logging


class HexyConfig:
    """
    Configuración centralizada de Hexy Framework.
    
    Usa variables de entorno con valores por defecto.
    Permite override programático para testing.
    """
    
    def __init__(self, config_override: Optional[Dict[str, Any]] = None):
        """
        Inicializa configuración.
        
        Args:
            config_override: Diccionario para override de valores (útil para tests)
        """
        self._override = config_override or {}
        self._load_config()
    
    def _load_config(self):
        """Carga configuración desde variables de entorno."""
        
        # Configuración general
        self.environment = self._get_env("HEXY_ENV", "development")
        self.debug = self._get_env("HEXY_DEBUG", "false").lower() == "true"
        self.version = "0.1.0"
        
        # Directorios
        self.data_dir = Path(self._get_env("HEXY_DATA_DIR", "./data"))
        self.temp_dir = Path(self._get_env("HEXY_TEMP_DIR", "./tmp"))
        self.ontology_dir = Path(self._get_env("HEXY_ONTOLOGY_DIR", "./ontologies"))
        
        # Configuración de base de datos
        self.database = {
            "host": self._get_env("HEXY_DB_HOST", "localhost"),
            "port": int(self._get_env("HEXY_DB_PORT", "5432")),
            "name": self._get_env("HEXY_DB_NAME", "hexy"),
            "user": self._get_env("HEXY_DB_USER", "hexy"),
            "password": self._get_env("HEXY_DB_PASSWORD", ""),
            "min_connections": int(self._get_env("HEXY_DB_MIN_CONN", "1")),
            "max_connections": int(self._get_env("HEXY_DB_MAX_CONN", "10"))
        }
        
        # Configuración de Redis
        self.redis = {
            "host": self._get_env("HEXY_REDIS_HOST", "localhost"),
            "port": int(self._get_env("HEXY_REDIS_PORT", "6379")),
            "database": int(self._get_env("HEXY_REDIS_DB", "0")),
            "password": self._get_env("HEXY_REDIS_PASSWORD", None),
            "default_ttl": int(self._get_env("HEXY_REDIS_TTL", "3600")),
            "max_connections": int(self._get_env("HEXY_REDIS_MAX_CONN", "20"))
        }
        
        # Configuración de ontologías
        self.ontology = {
            "base_uri": self._get_env("HEXY_ONTO_BASE_URI", "http://hexy.framework/ontology/"),
            "reasoner": self._get_env("HEXY_ONTO_REASONER", "hermit"),
            "cache_inferences": self._get_env("HEXY_ONTO_CACHE", "true").lower() == "true",
            "max_reasoning_time": int(self._get_env("HEXY_ONTO_MAX_TIME", "30"))
        }
        
        # Configuración del motor de contexto
        self.context = {
            "max_memory_items": int(self._get_env("HEXY_CTX_MAX_ITEMS", "1000")),
            "default_relevance_threshold": float(self._get_env("HEXY_CTX_THRESHOLD", "0.5")),
            "compression_enabled": self._get_env("HEXY_CTX_COMPRESSION", "true").lower() == "true",
            "explanation_detail_level": self._get_env("HEXY_CTX_EXPLAIN_LEVEL", "medium"),
            "max_context_length": int(self._get_env("HEXY_CTX_MAX_LENGTH", "8000")),
            "cache_ttl": int(self._get_env("HEXY_CTX_CACHE_TTL", "3600")),
            
            # Pesos para cálculo de relevancia
            "semantic_similarity_weight": float(self._get_env("HEXY_CTX_SIM_WEIGHT", "0.6")),
            "temporal_relevance_weight": float(self._get_env("HEXY_CTX_TEMP_WEIGHT", "0.3")),
            "domain_relevance_weight": float(self._get_env("HEXY_CTX_DOMAIN_WEIGHT", "0.1"))
        }
        
        # Configuración de LLMs
        self.llm = {
            # OpenAI
            "openai_api_key": self._get_env("OPENAI_API_KEY", None),
            "openai_model": self._get_env("HEXY_OPENAI_MODEL", "gpt-4"),
            "openai_max_tokens": int(self._get_env("HEXY_OPENAI_MAX_TOKENS", "4000")),
            "openai_temperature": float(self._get_env("HEXY_OPENAI_TEMP", "0.7")),
            
            # Anthropic
            "anthropic_api_key": self._get_env("ANTHROPIC_API_KEY", None),
            "anthropic_model": self._get_env("HEXY_ANTHROPIC_MODEL", "claude-3-sonnet-20240229"),
            
            # General
            "default_provider": self._get_env("HEXY_LLM_PROVIDER", "openai"),
            "timeout": int(self._get_env("HEXY_LLM_TIMEOUT", "30")),
            "retry_attempts": int(self._get_env("HEXY_LLM_RETRIES", "3"))
        }
        
        # Configuración de API
        self.api = {
            "host": self._get_env("HEXY_API_HOST", "0.0.0.0"),
            "port": int(self._get_env("HEXY_API_PORT", "8000")),
            "workers": int(self._get_env("HEXY_API_WORKERS", "1")),
            "secret_key": self._get_env("HEXY_SECRET_KEY", "dev-secret-key"),
            "allowed_hosts": self._get_env("HEXY_ALLOWED_HOSTS", "*").split(","),
            "cors_enabled": self._get_env("HEXY_CORS_ENABLED", "true").lower() == "true",
            "max_request_size": int(self._get_env("HEXY_MAX_REQUEST_SIZE", str(16 * 1024 * 1024))),
            "rate_limit": self._get_env("HEXY_RATE_LIMIT", "100/minute")
        }
        
        # Configuración de logging
        self.logging = {
            "level": self._get_env("HEXY_LOG_LEVEL", "INFO"),
            "format": self._get_env(
                "HEXY_LOG_FORMAT", 
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            ),
            "log_to_file": self._get_env("HEXY_LOG_TO_FILE", "false").lower() == "true",
            "log_file": Path(self._get_env("HEXY_LOG_FILE", "./logs/hexy.log")),
            "max_file_size": int(self._get_env("HEXY_LOG_MAX_SIZE", str(10 * 1024 * 1024))),
            "backup_count": int(self._get_env("HEXY_LOG_BACKUP_COUNT", "5")),
            "json_logging": self._get_env("HEXY_LOG_JSON", "false").lower() == "true"
        }
        
        # Feature flags
        self.features = {
            "enable_reasoner": self._get_env("HEXY_ENABLE_REASONER", "true").lower() == "true",
            "enable_compression": self._get_env("HEXY_ENABLE_COMPRESSION", "true").lower() == "true",
            "enable_explanation": self._get_env("HEXY_ENABLE_EXPLANATION", "true").lower() == "true",
            "enable_metrics": self._get_env("HEXY_ENABLE_METRICS", "true").lower() == "true",
            "enable_web_ui": self._get_env("HEXY_ENABLE_WEB_UI", "false").lower() == "true"
        }
        
        # Crear directorios necesarios
        self._ensure_directories()
        
        # Validar configuración
        self._validate_config()
    
    def _get_env(self, key: str, default: Any) -> Any:
        """Obtiene variable de entorno con soporte para override."""
        # Prioridad: override > env var > default
        if key in self._override:
            return self._override[key]
        
        return os.getenv(key, default)
    
    def _ensure_directories(self):
        """Crea directorios necesarios si no existen."""
        directories = [
            self.data_dir,
            self.temp_dir,
            self.ontology_dir
        ]
        
        if self.logging["log_to_file"]:
            directories.append(self.logging["log_file"].parent)
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def _validate_config(self):
        """Valida la configuración cargada."""
        errors = []
        
        # Validar environment
        valid_environments = ["development", "testing", "staging", "production"]
        if self.environment not in valid_environments:
            errors.append(f"Invalid environment: {self.environment}. Must be one of: {valid_environments}")
        
        # Validar reasoner
        valid_reasoners = ["hermit", "pellet", "fact++", "jfact"]
        if self.ontology["reasoner"] not in valid_reasoners:
            errors.append(f"Invalid reasoner: {self.ontology['reasoner']}. Must be one of: {valid_reasoners}")
        
        # Validar threshold
        threshold = self.context["default_relevance_threshold"]
        if not 0.0 <= threshold <= 1.0:
            errors.append(f"Relevance threshold must be between 0.0 and 1.0, got: {threshold}")
        
        # Validar explanation level
        valid_levels = ["low", "medium", "high"]
        if self.context["explanation_detail_level"] not in valid_levels:
            errors.append(f"Invalid explanation level: {self.context['explanation_detail_level']}. Must be one of: {valid_levels}")
        
        # Validar LLM provider
        valid_providers = ["openai", "anthropic", "local"]
        if self.llm["default_provider"] not in valid_providers:
            errors.append(f"Invalid LLM provider: {self.llm['default_provider']}. Must be one of: {valid_providers}")
        
        # Validar log level
        valid_log_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if self.logging["level"].upper() not in valid_log_levels:
            errors.append(f"Invalid log level: {self.logging['level']}. Must be one of: {valid_log_levels}")
        
        if errors:
            raise ValueError(f"Configuration validation failed: {'; '.join(errors)}")
    
    @property
    def is_production(self) -> bool:
        """Verifica si estamos en producción."""
        return self.environment == "production"
    
    @property
    def is_development(self) -> bool:
        """Verifica si estamos en desarrollo."""
        return self.environment == "development"
    
    @property
    def database_url(self) -> str:
        """URL de conexión a la base de datos."""
        db = self.database
        return f"postgresql://{db['user']}:{db['password']}@{db['host']}:{db['port']}/{db['name']}"
    
    @property
    def redis_url(self) -> str:
        """URL de conexión a Redis."""
        redis = self.redis
        auth_part = f":{redis['password']}@" if redis['password'] else ""
        return f"redis://{auth_part}{redis['host']}:{redis['port']}/{redis['database']}"
    
    def get_component_config(self, component: str) -> Dict[str, Any]:
        """Obtiene configuración de un componente específico."""
        return getattr(self, component, {})
    
    def update_config(self, updates: Dict[str, Any]):
        """Actualiza configuración en runtime (útil para tests)."""
        for key, value in updates.items():
            if hasattr(self, key):
                if isinstance(getattr(self, key), dict):
                    getattr(self, key).update(value)
                else:
                    setattr(self, key, value)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte configuración a diccionario."""
        return {
            "environment": self.environment,
            "debug": self.debug,
            "version": self.version,
            "database": self.database,
            "redis": self.redis,
            "ontology": self.ontology,
            "context": self.context,
            "llm": self.llm,
            "api": self.api,
            "logging": self.logging,
            "features": self.features
        }
    
    def __repr__(self) -> str:
        return f"HexyConfig(environment={self.environment}, version={self.version})"


# Instancia global de configuración
_config_instance = None


def get_config(config_override: Optional[Dict[str, Any]] = None) -> HexyConfig:
    """
    Obtiene instancia global de configuración.
    
    Args:
        config_override: Override para testing
        
    Returns:
        HexyConfig: Instancia de configuración
    """
    global _config_instance
    
    if _config_instance is None or config_override:
        _config_instance = HexyConfig(config_override)
    
    return _config_instance


def reload_config() -> HexyConfig:
    """Recarga la configuración desde archivos/variables de entorno."""
    global _config_instance
    _config_instance = None
    return get_config()


def setup_logging():
    """Configura el sistema de logging basado en la configuración."""
    config = get_config()
    
    # Configurar nivel de logging
    log_level = getattr(logging, config.logging["level"].upper(), logging.INFO)
    
    # Configurar formato
    formatter = logging.Formatter(config.logging["format"])
    
    # Logger raíz
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Limpiar handlers existentes
    root_logger.handlers.clear()
    
    # Handler para consola
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    root_logger.addHandler(console_handler)
    
    # Handler para archivo si está habilitado
    if config.logging["log_to_file"]:
        from logging.handlers import RotatingFileHandler
        
        file_handler = RotatingFileHandler(
            filename=config.logging["log_file"],
            maxBytes=config.logging["max_file_size"],
            backupCount=config.logging["backup_count"],
            encoding='utf-8'
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
        root_logger.addHandler(file_handler)
    
    # Configurar loggers de librerías externas
    external_loggers = {
        "urllib3.connectionpool": logging.WARNING,
        "requests.packages.urllib3": logging.WARNING,
        "httpx": logging.WARNING,
        "owlready2": logging.WARNING,
        "rdflib": logging.INFO,
        "uvicorn": logging.INFO,
        "fastapi": logging.INFO
    }
    
    for logger_name, level in external_loggers.items():
        logger = logging.getLogger(logger_name)
        logger.setLevel(level)
    
    # Logger inicial
    logger = logging.getLogger("hexy.config")
    logger.info(f"Logging configured - Level: {config.logging['level']}, File: {config.logging['log_to_file']}")


# Ejemplo de archivo .env para el framework
ENV_EXAMPLE = """
# Hexy Framework Configuration
# Copy this to .env and adjust values

# General
HEXY_ENV=development
HEXY_DEBUG=true

# Database
HEXY_DB_HOST=localhost
HEXY_DB_PORT=5432
HEXY_DB_NAME=hexy
HEXY_DB_USER=hexy_user
HEXY_DB_PASSWORD=hexy_password

# Redis
HEXY_REDIS_HOST=localhost
HEXY_REDIS_PORT=6379
HEXY_REDIS_DB=0
HEXY_REDIS_PASSWORD=

# Ontologies
HEXY_ONTO_REASONER=hermit
HEXY_ONTO_MAX_TIME=30
HEXY_ONTOLOGY_DIR=./ontologies

# Context Engine
HEXY_CTX_MAX_ITEMS=1000
HEXY_CTX_THRESHOLD=0.5
HEXY_CTX_COMPRESSION=true
HEXY_CTX_MAX_LENGTH=8000

# LLM Integration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
HEXY_LLM_PROVIDER=openai

# API
HEXY_API_HOST=0.0.0.0
HEXY_API_PORT=8000
HEXY_SECRET_KEY=your-secret-key-here

# Logging
HEXY_LOG_LEVEL=INFO
HEXY_LOG_TO_FILE=true
HEXY_LOG_FILE=./logs/hexy.log

# Features
HEXY_ENABLE_REASONER=true
HEXY_ENABLE_COMPRESSION=true
HEXY_ENABLE_EXPLANATION=true
HEXY_ENABLE_WEB_UI=false
"""


def create_env_file(path: str = ".env"):
    """Crea archivo de configuración de ejemplo."""
    with open(path, "w") as f:
        f.write(ENV_EXAMPLE)
    print(f"Environment file created at: {path}")


if __name__ == "__main__":
    # Demo de configuración
    print("🔧 Hexy Framework Configuration Demo")
    print("=" * 40)
    
    # Crear configuración
    config = get_config()
    print(f"Environment: {config.environment}")
    print(f"Debug mode: {config.debug}")
    print(f"Database URL: {config.database_url}")
    print(f"Context threshold: {config.context['default_relevance_threshold']}")
    
    # Mostrar configuración de componente
    context_config = config.get_component_config("context")
    print(f"\\nContext configuration:")
    for key, value in context_config.items():
        print(f"  {key}: {value}")
    
    # Setup logging
    setup_logging()
    
    logger = logging.getLogger("hexy.demo")
    logger.info("Configuration demo completed successfully")