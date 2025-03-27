Semana 1: Auditoría del Código y Alineación con DDD

📅 Días de trabajo: 3 sesiones (2 horas cada una)

📌 Día 1: Revisión de la Arquitectura Actual

Objetivo: Entender la estructura actual de Hexy y su alineación con DDD.
Tareas:
	•	Revisar la organización de carpetas y módulos (application/, domain/, infrastructure/).
	•	Verificar si entidades, agregados y repositorios están correctamente separados.
	•	Identificar posibles violaciones a DDD (modelo anémico, dependencias innecesarias).

Entrega: Documento con hallazgos iniciales y áreas de mejora.

📌 Día 2: Análisis de Entidades, Agregados y Value Objects

Objetivo: Evaluar la correcta implementación de los patrones DDD clave.
Tareas:
	•	Revisar cómo se están modelando las entidades y agregados en Hexy.
	•	Evaluar si los value objects están correctamente definidos y usados.
	•	Identificar dependencias cruzadas que puedan violar el bounded context.

Entrega: Lista de mejoras estructurales en la capa de dominio.

📌 Día 3: Revisión de la Capa de Aplicación y Servicios de Dominio

Objetivo: Evaluar si los casos de uso y servicios de dominio están correctamente desacoplados.
Tareas:
	•	Revisar cómo se implementan los casos de uso en la capa de aplicación.
	•	Validar que los servicios de dominio solo contengan lógica de negocio.
	•	Identificar dependencias incorrectas entre aplicación, dominio e infraestructura.

Entrega: Plan de refactorización para la mejora de la estructura DDD.