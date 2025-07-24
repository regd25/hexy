/**
 * Clase que representa un artefacto en el sistema Hexy
 */
export class Artifact {
  /**
   * @param {string} id - Identificador único del artefacto
   * @param {string} name - Nombre del artefacto
   * @param {string} type - Tipo del artefacto (context, actor, concept, process, reference)
   * @param {string} info - Descripción del artefacto
   */
  constructor(id, name, type, info) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.info = info;
    // Propiedades para D3.js
    this.x = undefined;
    this.y = undefined;
    this.vx = undefined;
    this.vy = undefined;
    this.fx = null;
    this.fy = null;
  }

  /**
   * Crea un artefacto de tipo referencia
   * @param {string} id - Identificador único del artefacto
   * @returns {Artifact} - Nuevo artefacto de tipo referencia
   */
  static createReference(id) {
    return new Artifact(
      id,
      id,
      'reference',
      `Artefacto referenciado pero no definido explícitamente. Para definirlo, añádelo en la sección correspondiente con el formato: "- ${id}: Descripción del artefacto"`
    );
  }
}

/**
 * Clase que representa un enlace entre artefactos
 */
export class Link {
  /**
   * @param {Artifact} source - Artefacto de origen
   * @param {Artifact} target - Artefacto de destino
   * @param {number} weight - Peso del enlace
   */
  constructor(source, target, weight = 1) {
    this.source = source;
    this.target = target;
    this.weight = weight;
  }

  /**
   * Genera un ID único para el enlace
   * @returns {string} - ID único del enlace
   */
  getId() {
    return `${this.source.id}->${this.target.id}`;
  }

  /**
   * Verifica si el enlace es válido (tiene source y target como objetos)
   * @returns {boolean} - true si el enlace es válido
   */
  isValid() {
    return (
      typeof this.source === 'object' &&
      this.source !== null &&
      typeof this.target === 'object' &&
      this.target !== null
    );
  }
}