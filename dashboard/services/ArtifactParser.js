import { Artifact, Link } from '../models/Artifact.js';

/**
 * Servicio para analizar y procesar artefactos desde texto
 */
export class ArtifactParser {
  /**
   * Analiza el texto y extrae los artefactos y sus relaciones
   * @param {string} text - Texto a analizar
   * @returns {Object} - Objeto con nodos y enlaces
   */
  static parseArtifacts(text) {
    const lines = text.split('\n');
    const nodes = [];
    const links = [];
    let currentType = null;
    const nodeMap = {}; // Para mapear IDs a objetos de nodo
    const referencedNodes = new Set(); // Para rastrear nodos referenciados pero no definidos

    // Importar constantes
    const typeMap = {
      Contextos: 'context',
      Actores: 'actor',
      Conceptos: 'concept',
      Procesos: 'process',
    };

    // Primera pasada: crear todos los nodos explícitamente definidos
    lines.forEach((line) => {
      const catMatch = line.trim().match(/^([A-Za-zÁÉÍÓÚÑáéíóú]+)$/);
      if (catMatch && typeMap[catMatch[1]]) {
        currentType = typeMap[catMatch[1]];
        return;
      }
      const itemMatch = line.match(/^\s*-\s*([^:]+):\s*(.*)$/);
      if (itemMatch && currentType) {
        const name = itemMatch[1].trim();
        const rawId = name.replace(/\s+/g, '');
        const info = itemMatch[2].trim();
        const node = new Artifact(rawId, name, currentType, info);
        nodes.push(node);
        nodeMap[rawId] = node; // Guardar referencia al objeto nodo
        
        // Buscar todas las referencias en la descripción
        const refs = [...info.matchAll(/@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g)].map((m) => m[1]);
        refs.forEach((ref) => {
          // Normalizar el ID de referencia (eliminar espacios)
          const refId = ref.replace(/\s+/g, '');
          referencedNodes.add(refId); // Añadir a la lista de nodos referenciados
        });
      }
    });

    // Crear nodos para referencias que no existen explícitamente
    referencedNodes.forEach((refId) => {
      if (!nodeMap[refId]) {
        // Si el nodo no existe, crearlo como un nodo de tipo "referencia"
        const node = Artifact.createReference(refId);
        nodes.push(node);
        nodeMap[refId] = node;
      }
    });

    // Segunda pasada: crear enlaces entre todos los nodos
    lines.forEach((line) => {
      const itemMatch = line.match(/^\s*-\s*([^:]+):\s*(.*)$/);
      if (itemMatch) {
        const name = itemMatch[1].trim();
        const rawId = name.replace(/\s+/g, '');
        const info = itemMatch[2].trim();
        const refs = [...info.matchAll(/@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g)].map((m) => m[1]);
        
        refs.forEach((ref) => {
          // Normalizar el ID de referencia
          const refId = ref.replace(/\s+/g, '');
          // Crear enlace (ahora todos los nodos deberían existir)
          if (nodeMap[rawId] && nodeMap[refId]) {
            links.push(new Link(nodeMap[rawId], nodeMap[refId]));
          }
        });
      }
    });

    return { nodes, links };
  }

  /**
   * Filtra los enlaces para asegurarse de que todos son válidos
   * @param {Array} links - Lista de enlaces
   * @returns {Array} - Lista de enlaces válidos
   */
  static getValidLinks(links) {
    return links.filter(link => link.isValid());
  }
}