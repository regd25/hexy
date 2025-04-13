### 🧱 Plan de Implementación: Caso de Uso Create Context

**🎯 Objetivo:** Permitir a través de CLI crear la estructura base de un nuevo contexto siguiendo la arquitectura de Hexy (DDD + Hexagonal).

**📥 Input esperado:**
- Nombre del contexto (e.g. `billing`)
- Opcional: parámetros para configuración inicial

**🛠 Tareas por fase:**

#### Fase 1 – Modelado
1. Definir el comando: `hexy create context <nombre>`
2. Establecer los paths que deben crearse:
   - `/src/context/<context>/domain/`
   - `/src/context/<context>/application/`
   - `/src/context/<context>/infrastructure/`
   - `/src/context/<context>/module.ts`

#### Fase 2 – Implementación
3. Implementar generador CLI con Node.js + filesystem
4. Verificar colisión de nombres
5. Generar estructura mínima con placeholders y `README.md` opcional
6. Crear `module.ts` con boilerplate básico de registro de dependencias

#### Fase 3 – Testing
7. Testear en entorno de desarrollo:
   - Contextos válidos
   - Nombres reservados o inválidos
   - Sobreescritura accidental

#### Fase 4 – Documentación
8. Registrar en documentación de comandos CLI
9. Agregar entrada en help global de `hexy`

**📦 Artefactos generados:**
- Carpeta completa del contexto
- `module.ts` inicial con `registerModule()`
- Logs de ejecución en consola

**🧩 CLI Final:**
```bash
hexy create context billing
```

**✅ Validaciones:**
- [ ] Estructura mínima creada correctamente
- [ ] `module.ts` contiene plantilla válida
- [ ] No sobreescribe si ya existe
- [ ] Aparece en documentación
