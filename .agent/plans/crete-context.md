### 🧱 Subplan: Implementación de Lógica CLI para Create Context (Contexto: tooling)

**📁 Ubicación esperada:** `src/context/tooling/application/use-case/create-context.usecase.ts`
> 🔍 Este comando vive en el contexto `tooling`, el cual encapsula las herramientas internas del framework Hexy. Este contexto sigue la misma estructura y principios de cualquier otro bounded context.

**🛠️ Tareas a ejecutar:**

#### Fase 1 — Setup de Comando CLI
1. Crear archivo `create-context.ts` en `context/tooling/application/`
2. Registrar el comando en el entrypoint del CLI principal (`index.ts` o `main.ts`)
   - Registrar el módulo `tooling/module.ts` en el bootstrap principal del CLI si aplica
3. Definir argumentos esperados:
   - `--context` o `<context>` como argumento requerido
   - Opcionales: `--service`, `--use-case`, `--aggregate`, `--value-object`

#### Fase 2 — Generación de Archivos y Carpetas
4. Usar `fs/promises` o una librería como `fs-extra` para generar:
   - `domain/`, `application/`, `infrastructure/` y `module.ts`
5. Verificar si el contexto ya existe para evitar sobrescritura accidental
6. Incluir placeholders como `.gitkeep` o `README.md`

#### Fase 3 — Plantilla de module.ts
7. Generar `module.ts` con función `registerModule()` vacía o con wiring mínimo
8. Incluir comentarios guía para desarrolladores

#### Fase 4 — Logging y Feedback CLI
9. Mostrar logs informativos del progreso (`chalk`, `ora`, etc.)
10. Confirmar al usuario que el contexto fue creado exitosamente

#### Fase 5 — Testing de CLI
11. Crear pruebas en `src/context/tooling/__tests__/create-context.usecase.spec.ts`
12. Simular ejecución del comando en diferentes escenarios:
    - Contexto nuevo
    - Contexto existente
    - Contexto con nombre inválido

**📌 Librerías sugeridas:**
- `commander`, `yargs` o similar
- `fs-extra` para manejo de archivos
- `chalk`, `ora`, `log-symbols` para logs coloridos

**✅ Validaciones en tests:**
- [ ] El comando se registra y aparece en la ayuda del CLI
- [ ] Se genera la estructura correcta al ejecutar
- [ ] Se evita sobrescritura
- [ ] Tests del CLI cubren escenarios base
- [ ] El contexto tooling se registra correctamente como cualquier otro contexto
