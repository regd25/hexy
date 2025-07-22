# Sintaxis y Estructura de Artefactos Semánticos Hexy

## Principios Fundamentales
- Todo artefacto es **semántico**: su representación es puramente narrativa/descriptiva, sin campos extra ni metadatos estructurados.
- Un artefacto solo puede tener su propia representación semántica, nunca una estructura de campos.
- Las referencias a otros artefactos se hacen usando `@NombreDelArtefacto`.
- Las referencias se parsean automaticamente a PascalCase ya sean archivos o nombres de artefactos.

---

## Sintaxis de Artefactos

- **Representación básica:**
  - El artefacto se expresa como un fragmento de texto descriptivo, sin campos ni claves.
  - Ejemplo:
    ```markdown
    Transformar la cultura organizacional hacia la transparencia radical
    ```
- **Referencia a otros artefactos:**
  - Se utiliza `@` seguido del nombre del artefacto referenciado.
  - Ejemplo:
    ```markdown
    El área de @Producto coordina las relaciones entre @Desarrollo y @Mercado.
    ```

---

## Arquitectura de Carpetas

Cada contexto tiene su propia carpeta y subcarpetas para cada tipo de artefacto:

```
[context-name]/
  [context-name].md           # Archivo principal del contexto
  visiones/                   # Visiones
  conceptos/                  # Conceptos
  actores/                    # Actores
  areas/                      # Áreas
  autoridades/                # Autoridades
  politicas/                  # Políticas
  evaluaciones/               # Evaluaciones
  indicadores/                # Indicadores
  procesos/                   # Procesos
  procedimientos/             # Procedimientos
  eventos/                    # Eventos
  resultados/                 # Resultados
  observaciones/              # Observaciones
```

- Cada subcarpeta contiene archivos individuales, uno por artefacto, con el contenido semántico del artefacto.
- El nombre del archivo debe ser el nombre del artefacto, en minúsculas y separado por guiones.

---

## Arquitectura Modo Archivo Único

Un contexto puede representarse en un solo archivo `.md` con la siguiente estructura:

```
#[Nombre del Contexto]
[Descripción del contexto]

## Propositos
[Nombre del propósito]: [Descripción semántica]

## Conceptos
[Nombre del concepto]: [Descripción semántica]

## Actores
[Nombre del actor]: [Descripción semántica]

## Areas
[Nombre del área]: [Descripción semántica]

## Autoridades
[Nombre de la autoridad]: [Descripción semántica]

## Politicas
[Nombre de la política]: [Descripción semántica]

## Evaluaciones
[Nombre de la evaluación]: [Descripción semántica]

## Indicadores
[Nombre del indicador]: [Descripción semántica]

## Procesos
[Nombre del proceso]: [Descripción semántica]

## Procedimientos
[Nombre del procedimiento]: [Descripción semántica]

## Eventos
[Nombre del evento]: [Descripción semántica]

## Resultados
[Nombre del resultado]: [Descripción semántica]

## Observaciones
[Nombre de la observación]: [Descripción semántica]
```

- Cada artefacto se representa como `[nombre]: [descripción semántica]`.
- Las referencias a otros artefactos se hacen con `@nombre`.

---

## Ejemplo de Artefacto Semántico

Archivo: `procesos/onboarding.md`
```markdown
El proceso de onboarding guía desde la selección hasta la integración emocional del nuevo miembro, conectando a @RecursosHumanos y @EquipoDeTrabajo.
```

Archivo: `contexto-latam.md`
```markdown
# Contexto LATAM
Aplica a operaciones en Latinoamérica entre 2024–2028.

## Propositos
- Transparencia Radical: Transformar la cultura organizacional hacia la transparencia radical.

## Procesos
- Onboarding: El proceso de onboarding guía desde la selección hasta la integración emocional del nuevo miembro.
``` 