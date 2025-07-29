import { GraphService } from '../graph/GraphService.js';
import { ConfigService } from '../graph/ConfigService.js';
import { EditorService } from '../editor/EditorService.js';
import { ArtifactParser } from '../services/ArtifactParser.js';
import { COLORS, DEFAULT_TEXT } from '../shared/constants.js';

/**
 * Clase principal que integra todos los componentes del dashboard
 */
export class Dashboard {
  /**
   * Inicializa el dashboard
   */
  constructor() {

    this.svgElement = document.getElementById('graph');
    this.tooltipElement = document.getElementById('tooltip');
    this.menuElement = document.getElementById('menu');
    this.editorElement = document.getElementById('editor');
    this.graphContainer = document.getElementById('graph-container');


    this.graphService = new GraphService(
      this.svgElement,
      this.tooltipElement,
      this.menuElement,
      this.handleNodeTypeChange.bind(this),
      this.handleNodeNameChange.bind(this),
      this.handleNodeDescriptionChange.bind(this)
    );

    this.editorService = new EditorService(
      this.editorElement,
      this.handleContentChange.bind(this)
    );

    this.configService = new ConfigService(
      this.graphContainer,
      this.handleColorsChange.bind(this)
    );


    this.editorService.setContent(DEFAULT_TEXT);


    window.addEventListener('resize', () => {
      this.graphService.resize();
    });
  }

  /**
   * Maneja el cambio de contenido en el editor
   * @param {Array} nodes - Lista de nodos
   * @param {Array} links - Lista de enlaces
   */
  handleContentChange(nodes, links) {
    this.graphService.refresh(nodes, links);
  }

  /**
   * Maneja el cambio de tipo de un nodo
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldType - Tipo anterior
   * @param {string} newType - Nuevo tipo
   */
  handleNodeTypeChange(node, oldType, newType) {

    this.graphService.updateNode(node, 'type', oldType, newType);

    this.editorService.updateEditorText(node, oldType, newType);
  }

  /**
   * Maneja el cambio de nombre de un nodo
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldName - Nombre anterior
   * @param {string} newName - Nuevo nombre
   */
  handleNodeNameChange(node, oldName, newName) {

    this.graphService.updateNode(node, 'name', oldName, newName);

    this.editorService.updateNodeName(node, oldName, newName);
  }

  /**
   * Maneja el cambio de descripción de un nodo
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldDescription - Descripción anterior
   * @param {string} newDescription - Nueva descripción
   */
  handleNodeDescriptionChange(node, oldDescription, newDescription) {

    this.graphService.updateNode(node, 'description', oldDescription, newDescription);

    this.editorService.updateNodeDescription(
      node,
      oldDescription,
      newDescription
    );
  }

  /**
   * Maneja el cambio de colores en la configuración
   * @param {Object} newColors - Nuevos colores
   */
  handleColorsChange(newColors) {

    Object.keys(newColors).forEach(type => {
      COLORS[type] = newColors[type];
    });


    const { nodes, links } = ArtifactParser.parseArtifacts(
      this.editorService.getContent()
    );
    const validLinks = ArtifactParser.getValidLinks(links);
    this.graphService.refresh(nodes, validLinks);
  }

  /**
   * Inicializa la aplicación
   */
  static init() {

    document.addEventListener('DOMContentLoaded', () => {
      const dashboard = new Dashboard();


      const { nodes, links } = ArtifactParser.parseArtifacts(DEFAULT_TEXT);
      const validLinks = ArtifactParser.getValidLinks(links);

      dashboard.graphService.refresh(nodes, validLinks, false);
      dashboard.graphService.runSimulation(300);
    });
  }
}
