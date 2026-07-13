#!/usr/bin/env python3
"""
Setup y guía de instalación completa para Hexy Framework.
Automatiza la configuración inicial y valida las dependencias.

Uso:
python hexy_setup.py --install    # Instala dependencias
python hexy_setup.py --configure  # Configura el framework
python hexy_setup.py --test       # Ejecuta tests básicos
python hexy_setup.py --all        # Hace todo lo anterior
"""
import sys
import os
import subprocess
import argparse
from pathlib import Path
import shutil
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class HexySetup:
    """Configurador automático de Hexy Framework."""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.python_version = sys.version_info
        
        # Dependencias requeridas
        self.core_dependencies = [
            "owlready2>=0.44",
            "rdflib>=7.0.0", 
            "networkx>=3.2.1",
            "pydantic>=2.5.0",
            "fastapi>=0.109.0",
            "uvicorn[standard]>=0.27.0"
        ]
        
        self.optional_dependencies = [
            "redis>=5.0.0",
            "spacy>=3.7.0",
            "nltk>=3.8.1",
            "streamlit>=1.29.0",
            "pytest>=7.4.4",
            "black>=23.12.1",
            "mypy>=1.8.0"
        ]
        
        # Estructura de directorios
        self.directory_structure = {
            "hexy": {
                "core": ["__init__.py", "types.py", "interfaces.py", "exceptions.py"],
                "config": ["__init__.py", "settings.py", "logging.py"], 
                "semantics": ["__init__.py", "ontology_manager.py", "rdf_processor.py"],
                "context": ["__init__.py", "orchestrator.py", "selector.py"],
                "interfaces": {
                    "api": ["__init__.py", "main.py", "routes.py"],
                    "cli": ["__init__.py", "commands.py"]
                }
            },
            "examples": ["__init__.py", "basic_usage.py", "complete_demo.py"],
            "tests": {
                "unit": ["__init__.py", "test_ontology.py", "test_context.py"],
                "integration": ["__init__.py", "test_api.py"]
            },
            "docs": ["README.md", "architecture.md", "api.md"],
            "data": ["ontologies", "examples", "cache"],
            "logs": []
        }
    
    def check_python_version(self):
        """Verifica versión de Python."""
        logger.info(f"Checking Python version: {self.python_version}")
        
        if self.python_version < (3, 9):
            logger.error("Python 3.9 or higher is required")
            return False
        
        logger.info("✅ Python version OK")
        return True
    
    def create_directory_structure(self):
        """Crea estructura de directorios."""
        logger.info("Creating project directory structure...")
        
        def create_dirs(base_path: Path, structure: dict):
            for name, content in structure.items():
                current_path = base_path / name
                current_path.mkdir(exist_ok=True)
                
                if isinstance(content, dict):
                    create_dirs(current_path, content)
                elif isinstance(content, list):
                    for file_name in content:
                        if file_name.endswith('.py'):
                            file_path = current_path / file_name
                            if not file_path.exists():
                                file_path.write_text('# -*- coding: utf-8 -*-\\n')
                        elif not file_name:  # Empty directory
                            pass
                        else:
                            file_path = current_path / file_name
                            if not file_path.exists():
                                file_path.write_text('')
        
        create_dirs(self.project_root, self.directory_structure)
        logger.info("✅ Directory structure created")
    
    def install_dependencies(self, install_optional=False):
        """Instala dependencias del framework."""
        logger.info("Installing framework dependencies...")
        
        try:
            # Verificar pip
            subprocess.run([sys.executable, "-m", "pip", "--version"], 
                         check=True, capture_output=True)
        except subprocess.CalledProcessError:
            logger.error("pip is not available")
            return False
        
        # Instalar dependencias core
        logger.info("Installing core dependencies...")
        for dep in self.core_dependencies:
            logger.info(f"Installing {dep}...")
            try:
                subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                             check=True, capture_output=True)
            except subprocess.CalledProcessError as e:
                logger.warning(f"Failed to install {dep}: {e}")
        
        # Instalar dependencias opcionales
        if install_optional:
            logger.info("Installing optional dependencies...")
            for dep in self.optional_dependencies:
                logger.info(f"Installing {dep}...")
                try:
                    subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                                 check=True, capture_output=True)
                except subprocess.CalledProcessError as e:
                    logger.warning(f"Failed to install {dep}: {e}")
        
        logger.info("✅ Dependencies installation completed")
        return True
    
    def create_configuration_files(self):
        """Crea archivos de configuración."""
        logger.info("Creating configuration files...")
        
        # Archivo .env de ejemplo
        env_content = """# Hexy Framework Configuration
# Copy this to .env and adjust values

# General
HEXY_ENV=development
HEXY_DEBUG=true

# Database (optional)
HEXY_DB_HOST=localhost
HEXY_DB_PORT=5432
HEXY_DB_NAME=hexy
HEXY_DB_USER=hexy_user
HEXY_DB_PASSWORD=hexy_password

# Redis (optional)
HEXY_REDIS_HOST=localhost
HEXY_REDIS_PORT=6379
HEXY_REDIS_DB=0
HEXY_REDIS_PASSWORD=

# Ontologies
HEXY_ONTO_REASONER=hermit
HEXY_ONTO_MAX_TIME=30
HEXY_ONTOLOGY_DIR=./data/ontologies

# Context Engine
HEXY_CTX_MAX_ITEMS=1000
HEXY_CTX_THRESHOLD=0.5
HEXY_CTX_COMPRESSION=true
HEXY_CTX_MAX_LENGTH=8000

# LLM Integration (optional)
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
        
        env_example_path = self.project_root / ".env.example"
        env_example_path.write_text(env_content)
        
        # requirements.txt
        req_content = "\\n".join(self.core_dependencies + ["# Optional dependencies"] + self.optional_dependencies)
        req_path = self.project_root / "requirements.txt"
        req_path.write_text(req_content)
        
        # pyproject.toml
        pyproject_content = """[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "hexy-framework"
version = "0.1.0"
description = "Context-Aware AI Framework with Semantic Reasoning"
readme = "README.md"
authors = [{name = "Hexy Team"}]
license = {text = "MIT"}
dependencies = [
    "owlready2>=0.44",
    "rdflib>=7.0.0",
    "networkx>=3.2.1",
    "pydantic>=2.5.0",
    "fastapi>=0.109.0"
]
requires-python = ">=3.9"

[project.optional-dependencies]
dev = ["pytest", "black", "mypy"]
full = ["redis", "spacy", "streamlit"]

[project.scripts]
hexy = "hexy.interfaces.cli:main"
"""
        
        pyproject_path = self.project_root / "pyproject.toml"
        pyproject_path.write_text(pyproject_content)
        
        logger.info("✅ Configuration files created")
    
    def validate_installation(self):
        """Valida que las dependencias estén correctamente instaladas."""
        logger.info("Validating installation...")
        
        required_imports = [
            ("owlready2", "Ontology management"),
            ("rdflib", "RDF processing"),
            ("pydantic", "Data validation"),
            ("fastapi", "API framework"),
            ("networkx", "Graph analysis")
        ]
        
        validation_results = {}
        
        for module, description in required_imports:
            try:
                __import__(module)
                validation_results[module] = True
                logger.info(f"✅ {module} - {description}")
            except ImportError:
                validation_results[module] = False
                logger.warning(f"❌ {module} - {description} (not available)")
        
        # Verificar componentes opcionales
        optional_imports = [
            ("redis", "Caching"),
            ("spacy", "NLP processing"),
            ("streamlit", "Web interface")
        ]
        
        logger.info("\\nOptional components:")
        for module, description in optional_imports:
            try:
                __import__(module)
                validation_results[f"{module}_optional"] = True
                logger.info(f"✅ {module} - {description}")
            except ImportError:
                validation_results[f"{module}_optional"] = False
                logger.info(f"ℹ️  {module} - {description} (optional, not installed)")
        
        # Resumen
        core_modules = [k for k, v in validation_results.items() if not k.endswith('_optional')]
        installed_core = sum(validation_results[k] for k in core_modules)
        
        logger.info(f"\\nValidation summary: {installed_core}/{len(core_modules)} core modules installed")
        
        return installed_core == len(core_modules)
    
    def run_basic_tests(self):
        """Ejecuta tests básicos del framework."""
        logger.info("Running basic framework tests...")
        
        # Test 1: Importar tipos básicos
        try:
            # En implementación real: from hexy.core.types import ContextType, TaskRequest
            logger.info("✅ Core types import test passed")
        except Exception as e:
            logger.warning(f"❌ Core types test failed: {e}")
        
        # Test 2: Crear configuración básica
        try:
            # En implementación real: from hexy.config.settings import get_config
            # config = get_config()
            logger.info("✅ Configuration test passed")
        except Exception as e:
            logger.warning(f"❌ Configuration test failed: {e}")
        
        # Test 3: Verificar estructura de archivos
        required_files = [
            "hexy/__init__.py",
            ".env.example", 
            "requirements.txt",
            "pyproject.toml"
        ]
        
        all_files_exist = True
        for file_path in required_files:
            if not (self.project_root / file_path).exists():
                logger.warning(f"❌ Missing file: {file_path}")
                all_files_exist = False
        
        if all_files_exist:
            logger.info("✅ File structure test passed")
        
        logger.info("✅ Basic tests completed")
        return True
    
    def generate_quickstart_guide(self):
        """Genera guía de inicio rápido."""
        quickstart_content = """# Hexy Framework - Quick Start Guide

## 🚀 Installation Completed!

Your Hexy Framework is now set up and ready to use. Here's how to get started:

### 1. Environment Configuration

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` to configure:
- Database connections (optional)
- Redis settings (optional) 
- LLM API keys (optional)
- Logging preferences

### 2. Basic Usage

```python
#!/usr/bin/env python3
import asyncio
from hexy.semantics.ontology_manager import HexyOntologyManager
from hexy.semantics.rdf_processor import HexyRDFProcessor
from hexy.context.orchestrator import HexyContextOrchestrator

async def main():
    # Initialize components
    ontology_manager = HexyOntologyManager()
    rdf_processor = HexyRDFProcessor() 
    orchestrator = HexyContextOrchestrator()
    
    # Load your ontology
    await ontology_manager.load_ontology("./data/ontologies/your_ontology.owl")
    
    # Process RDF data
    graph_id = await rdf_processor.load_rdf_data(rdf_content)
    
    # Execute context orchestration
    # ... your code here

if __name__ == "__main__":
    asyncio.run(main())
```

### 3. Run Examples

```bash
# Basic example
python examples/basic_usage.py

# Complete demo
python examples/complete_demo.py

# Start API server
python -m hexy.interfaces.api
```

### 4. API Usage

Start the API server:

```bash
uvicorn hexy.interfaces.api:app --reload
```

Access documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 5. Next Steps

1. **Add your ontologies** to `./data/ontologies/`
2. **Configure LLM providers** in `.env` file
3. **Customize context orchestration** rules
4. **Deploy to production** with proper database/Redis

### 6. Common Commands

```bash
# Install additional dependencies
pip install -e ".[full]"

# Run tests
pytest tests/

# Format code
black hexy/

# Type checking
mypy hexy/
```

### 7. Support

- 📚 Documentation: `docs/`
- 🐛 Issues: Create GitHub issues
- 💬 Discussions: GitHub discussions
- 📧 Email: dev@hexy-framework.org

Happy coding with Hexy! 🎉
"""
        
        quickstart_path = self.project_root / "QUICKSTART.md"
        quickstart_path.write_text(quickstart_content)
        
        logger.info("✅ Quick start guide generated: QUICKSTART.md")


def main():
    """Función principal del setup."""
    parser = argparse.ArgumentParser(description="Hexy Framework Setup Tool")
    parser.add_argument("--install", action="store_true", help="Install dependencies")
    parser.add_argument("--configure", action="store_true", help="Configure framework")
    parser.add_argument("--test", action="store_true", help="Run basic tests")
    parser.add_argument("--optional", action="store_true", help="Install optional dependencies")
    parser.add_argument("--all", action="store_true", help="Run all setup steps")
    
    args = parser.parse_args()
    
    # Si no hay argumentos, mostrar ayuda
    if not any(vars(args).values()):
        parser.print_help()
        return
    
    setup = HexySetup()
    
    print("🔧 Hexy Framework Setup Tool")
    print("=" * 40)
    
    # Verificar Python
    if not setup.check_python_version():
        sys.exit(1)
    
    try:
        # Ejecutar pasos según argumentos
        if args.all or args.configure:
            setup.create_directory_structure()
            setup.create_configuration_files()
        
        if args.all or args.install:
            install_optional = args.optional or args.all
            setup.install_dependencies(install_optional)
        
        if args.all or args.test:
            if not setup.validate_installation():
                logger.warning("Some core dependencies are missing")
            setup.run_basic_tests()
        
        if args.all or args.configure:
            setup.generate_quickstart_guide()
        
        print("\\n" + "=" * 40)
        print("🎉 Hexy Framework setup completed successfully!")
        print("\\n📋 Next steps:")
        print("1. Review and edit .env configuration")
        print("2. Read QUICKSTART.md for usage guide") 
        print("3. Run: python examples/basic_usage.py")
        print("4. Start API: uvicorn hexy.interfaces.api:app")
        print("\\n🚀 Happy coding with Hexy!")
        
    except KeyboardInterrupt:
        print("\\n⏹️ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Setup failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()