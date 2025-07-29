import { Artifact, Link } from '../models/Artifact.js';
import { TYPE_MAP } from '../shared/constants.js';

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
    const nodeMap = {};
    const referencedNodes = new Set();


    const typeMap = TYPE_MAP;


    lines.forEach(line => {
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
        nodeMap[rawId] = node;


        const refs = [...info.matchAll(/@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g)].map(
          m => m[1]
        );
        refs.forEach(ref => {

          const refId = ref.replace(/\s+/g, '');
          referencedNodes.add(refId);
        });
      }
    });


    referencedNodes.forEach(refId => {
      if (!nodeMap[refId]) {

        const node = Artifact.createReference(refId);
        nodes.push(node);
        nodeMap[refId] = node;
      }
    });


    lines.forEach(line => {
      const itemMatch = line.match(/^\s*-\s*([^:]+):\s*(.*)$/);
      if (itemMatch) {
        const name = itemMatch[1].trim();
        const rawId = name.replace(/\s+/g, '');
        const info = itemMatch[2].trim();
        const refs = [...info.matchAll(/@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g)].map(
          m => m[1]
        );

        refs.forEach(ref => {

          const refId = ref.replace(/\s+/g, '');

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
