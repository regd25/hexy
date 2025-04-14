# Contexto Tooling para Hexy

Este contexto proporciona herramientas de CLI para facilitar el desarrollo con el framework Hexy.

## Comandos disponibles

### create-context

Crea un nuevo contexto acotado (bounded context) con la estructura recomendada para arquitectura hexagonal.

**Uso:**

```bash
hexy create-context <nombre-contexto>
```

**Opciones:**

- `-s, --service`: Genera un template de servicio en la capa de dominio
- `-u, --use-case`: Genera un template de caso de uso en la capa de aplicación
- `-a, --aggregate`: Genera un template de agregado en la capa de dominio
- `-v, --value-object`: Genera un template de objeto de valor en la capa de dominio

**Estructura generada:**

```
src/contexts/<nombre-contexto>/
  ├── domain/
  ├── application/
  ├── infrastructure/
  └── module.ts
```

## Arquitectura

Este contexto sigue la misma arquitectura hexagonal que cualquier otro contexto en Hexy:

- **Domain**: Contiene la lógica de negocio específica para herramientas de desarrollo
- **Application**: Contiene casos de uso que orquestan acciones sobre el dominio
- **Infrastructure**: Adaptadores para interactuar con sistemas externos (CLI, sistema de archivos, etc.)

## Desarrollo

Para añadir nuevos comandos:

1. Crear un nuevo caso de uso en `application/use-case/<nombre-comando>.usecase.ts`
2. Crear el comando CLI en `infrastructure/cli/<nombre-comando>.command.ts`
3. Registrar el comando en `src/cli.ts`
4. Añadir pruebas en `__tests__/` 