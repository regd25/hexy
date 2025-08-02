# Reglas de Calidad de Código - Hexy Dashboard

## Resumen

Este documento establece las reglas de calidad de código que deben seguirse en el desarrollo del Hexy Dashboard.

## Reglas Principales

### 1. Límite de Tamaño de Archivo
- **Regla**: Refactorizar cualquier archivo que exceda 200 líneas
- **Acción**: Extraer hooks personalizados y componentes
- **Beneficio**: Mantenibilidad y legibilidad mejoradas

### 2. Variables No Utilizadas
- **Regla**: Eliminar todas las variables e imports no utilizados
- **Herramienta**: ESLint con regla `no-unused-vars`
- **Comando**: `npm run lint:check`

### 3. Cumplimiento de ESLint
- **Regla**: Todo el código debe pasar la validación de ESLint
- **Configuración**: `.eslintrc.js`
- **Comandos**:
  - `npm run lint` - Verificar errores
  - `npm run lint:fix` - Corregir automáticamente
  - `npm run lint:check` - Verificar sin warnings

### 4. Principio de Responsabilidad Única
- **Regla**: Cada archivo debe contener máximo 1 clase/componente
- **Beneficio**: Código más modular y reutilizable

### 5. Tipado Estricto
- **Regla**: Usar TypeScript con tipado estricto en todo el proyecto
- **Configuración**: `tsconfig.json` con `strict: true`

### 6. Convenciones de Nomenclatura
- **Regla**: Nombres semánticos siguiendo patrones establecidos
- **Ejemplos**:
  - Hooks: `use[Feature]`
  - Componentes: `[Feature]Component`
  - Tipos: `[Feature]Type`

### 7. Validación Consistente
- **Regla**: Validación uniforme en todas las operaciones de artefactos
- **Implementación**: Hook `useArtifactValidation`

### 8. Manejo de Errores
- **Regla**: Manejo completo de errores con feedback al usuario
- **Herramienta**: Sistema de notificaciones con `useNotifications`

## Configuración de ESLint

### Reglas de Calidad de Código
```javascript
'no-unused-vars': 'error',
'no-console': 'warn',
'no-debugger': 'error',
'no-alert': 'warn',
```

### Reglas de TypeScript
```javascript
'@typescript-eslint/no-unused-vars': 'error',
'@typescript-eslint/no-explicit-any': 'warn',
'@typescript-eslint/explicit-function-return-type': 'off',
```

### Reglas de React
```javascript
'react-hooks/rules-of-hooks': 'error',
'react-hooks/exhaustive-deps': 'warn',
```

### Reglas de Tamaño de Archivo
```javascript
'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
```

## Comandos de Desarrollo

### Verificación de Calidad
```bash
# Verificar errores de ESLint
npm run lint

# Corregir errores automáticamente
npm run lint:fix

# Verificar sin warnings (para CI/CD)
npm run lint:check

# Formatear código
npm run format
```

### Flujo de Trabajo Recomendado
1. **Desarrollo**: Escribir código siguiendo las reglas
2. **Pre-commit**: Ejecutar `npm run lint:fix`
3. **Pre-push**: Ejecutar `npm run lint:check`
4. **CI/CD**: Verificar que no hay errores de linting

## Ejemplos de Refactorización

### Antes (422 líneas)
```typescript
// GraphContainer.tsx - Archivo muy grande
export const GraphContainer = () => {
  // 422 líneas de código...
}
```

### Después (95 líneas)
```typescript
// GraphContainer.tsx - Orquestador principal
export const GraphContainer = () => {
  const { artifacts } = useArtifactStore()
  const { temporalArtifacts } = useTemporalArtifacts()
  const canvasLogic = useGraphCanvas()
  const editorLogic = useGraphEditors()
  
  return (
    <div>
      <GraphHeader />
      <GraphCanvas />
      <InlineEditor />
    </div>
  )
}
```

## Beneficios de las Reglas

1. **Mantenibilidad**: Código más fácil de mantener y modificar
2. **Legibilidad**: Código más claro y comprensible
3. **Reutilización**: Componentes y hooks reutilizables
4. **Testabilidad**: Funcionalidades aisladas más fáciles de probar
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades
6. **Consistencia**: Estilo de código uniforme en todo el proyecto

## Monitoreo Continuo

- **Herramientas**: ESLint, Prettier, TypeScript
- **Automatización**: Scripts de npm para verificación
- **Documentación**: Este documento actualizado regularmente
- **Revisión**: Revisión de código siguiendo estas reglas 