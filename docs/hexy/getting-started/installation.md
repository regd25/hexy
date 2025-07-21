# Instalación

Esta guía te ayudará a instalar Hexy Framework en tu entorno de desarrollo.

## Prerrequisitos

### Node.js (Recomendado)
- Node.js >= 18.x
- npm >= 9.x o yarn >= 1.22.x

### Python (Alternativo)
- Python >= 3.10
- pip >= 21.x

### Herramientas adicionales (Opcionales)
- Docker >= 20.x (para contenedores)
- AWS CLI >= 2.x (para integración AWS)
- Git >= 2.x

## Instalación con Node.js

### 1. Clonar el repositorio

```bash
git clone https://github.com/regd25/hexy.git
cd hexy
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Verificar instalación

```bash
npm run test
```

## Instalación con Python

### 1. Crear entorno virtual

```bash
python -m venv hexy-env
source hexy-env/bin/activate  # En Windows: hexy-env\Scripts\activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Verificar instalación

```bash
python -m pytest tests/
```

## Instalación con Docker

### 1. Construir imagen

```bash
docker build -t hexy-framework .
```

### 2. Ejecutar contenedor

```bash
docker run -it hexy-framework
```

## Verificación de la instalación

### Comando de verificación

```bash
# Node.js
npm run verify

# Python
python -c "import hexy; print('Hexy instalado correctamente')"
```

### Verificar componentes principales

- ✅ Core Engine
- ✅ Plugin System
- ✅ Event System
- ✅ Validation Engine

## Solución de problemas comunes

### Error: "Module not found"
```bash
npm install
# o
pip install -r requirements.txt
```

### Error: "Permission denied"
```bash
sudo npm install -g hexy
# o usar nvm para gestión de versiones
```

### Error: "Python version incompatible"
```bash
# Actualizar Python a versión 3.10+
python --version
```

## Próximos pasos

Una vez completada la instalación, continúa con:
- [Configuración inicial](./setup.md)
- [Tu primer artefacto](./first-artifact.md) 