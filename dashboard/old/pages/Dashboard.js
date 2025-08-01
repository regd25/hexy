import { GraphService } from '../graph/GraphService.js';
import { ConfigService } from '../graph/ConfigService.js';
import { EditorService } from '../editor/EditorService.js';
import { ArtifactParser } from '../services/ArtifactParser.js';
import { SemanticService } from '../services/SemanticService.js';
import { Artifact, Link } from '../models/Artifact.js';
import { COLORS, TYPE_MAP, DEFAULT_TEXT } from '../shared/constants.js';
import { EventBus } from '../../components/utils/events/EventBus.js';
import { EVENT_TYPES } from '../../components/utils/events/EventTypes.js';
import { NotificationManager } from '../../components/utils/notifications/NotificationManager.js';
import { ArtifactService } from '../services/ArtifactService.js';

/**
 * Clase principal del Dashboard
 */
export class Dashboard {
  constructor() {
    this.artifacts = [];
    this.selectedArtifact = null;
    this.searchQuery = '';
    this.isSearchVisible = false;

    console.log('Dashboard: Inicializando...');

    this.eventBus = new EventBus();
    this.notificationManager = new NotificationManager(this.eventBus);

    // Exponer NotificationManager globalmente para otros servicios
    window.notificationManager = this.notificationManager;

    // Initialize ArtifactService (temporalmente comentado)
    // this.artifactService = new ArtifactService(this.eventBus);

    this.initializeServices();
    this.initializeElements();
    this.setupEventListeners();
    this.loadDefaultData();
    this.updateArtifactCount();
    console.log('Dashboard: Inicialización completada');
  }

  /**
   * Inicializa los servicios
   */
  initializeServices() {
    const svgElement = document.getElementById('graph');
    const tooltipElement = document.getElementById('tooltip');
    const menuElement = document.getElementById('menu');
    const editor = document.getElementById('editor');
    const graphContainer = document.getElementById('graph-container');

    this.graphService = new GraphService(
      svgElement,
      tooltipElement,
      menuElement,
      this.onNodeTypeChange.bind(this),
      this.onNodeNameChange.bind(this),
      this.onNodeDescriptionChange.bind(this),
      this.onLinkCreate.bind(this),
      this.onCreateArtifact.bind(this)
    );
    this.configService = new ConfigService(graphContainer, this.onColorsChange.bind(this));
    this.editorService = new EditorService(editor, this.onEditorContentChange.bind(this));
  }

  /**
   * Inicializa los elementos del DOM
   */
  initializeElements() {
    this.addArtifactBtn = document.getElementById('add-artifact-btn');
    this.artifactForm = document.getElementById('artifact-form');
    this.artifactsContainer = document.getElementById('artifacts-container');
    this.searchBtn = document.getElementById('search-btn');
    this.searchContainer = document.getElementById('search-container');
    this.searchInput = document.getElementById('search-input');
    this.exportBtn = document.getElementById('export-btn');
    this.importBtn = document.getElementById('import-btn');
    this.exportSemanticBtn = document.getElementById('export-semantic-btn');
    this.configBtn = document.getElementById('config-btn');
    this.editBtn = document.getElementById('edit-btn');
    this.visualizeBtn = document.getElementById('visualize-btn');
    this.testCreateBtn = document.getElementById('test-create-btn');
    this.createArtifactBtn = document.getElementById('create-artifact-btn');
    this.artifactCount = document.getElementById('artifact-count');
    this.createBtn = document.getElementById('create-btn');
    this.cancelBtn = document.getElementById('cancel-btn');
    this.artifactNameInput = document.getElementById('artifact-name');
    this.artifactTypeSelect = document.getElementById('artifact-type');
    this.artifactDescriptionInput = document.getElementById('artifact-description');
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    this.addArtifactBtn.addEventListener('click', () => this.toggleArtifactForm());
    this.searchBtn.addEventListener('click', () => this.toggleSearch());
    this.exportBtn.addEventListener('click', () => this.exportData());
    this.importBtn.addEventListener('click', () => this.importData());
    this.exportSemanticBtn.addEventListener('click', () => this.exportSemanticRelations());
    this.editBtn.addEventListener('click', () => this.editorService.showEditModal());
    this.visualizeBtn.addEventListener('click', () => this.editorService.showVisualizeModal());
    this.configBtn.addEventListener('click', () => this.showConfig());
    this.testCreateBtn.addEventListener('click', () => this.onCreateArtifact(400, 300));
    this.createArtifactBtn.addEventListener('click', () => this.onCreateArtifact(400, 300)); // Prueba con coordenadas fijas
    this.createBtn.addEventListener('click', () => this.createArtifact());
    this.cancelBtn.addEventListener('click', () => this.toggleArtifactForm());

    // Test notification on load
    setTimeout(() => {
      this.showNotification('Dashboard cargado correctamente', 'success');
    }, 1000);

    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.filterArtifacts();
    });

    this.artifactNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.createArtifact();
    });

    // Event listener para resize de ventana
    window.addEventListener('resize', () => {
      if (this.graphService) {
        this.graphService.resize();
      }
    });
  }

  /**
   * Carga datos por defecto
   */
  loadDefaultData() {
    console.log('Dashboard: Loading default data...');
    
    // Cargar el texto por defecto en el editor
    this.editorService.setContent(DEFAULT_TEXT);

    // Por ahora, usar directamente los artefactos por defecto
    const defaultArtifacts = [
      new Artifact('hexy-framework', 'Hexy Framework', 'purpose', 'Hexy es un framework de contexto organizacional, ayuda a los LLMs a apegarse fuertemente a la lógica de operación del negocio de manera optimizado, escalable y ejecutable'),
      new Artifact('development-environment', 'Development Environment', 'context', 'Entorno de desarrollo para crear y gestionar artefactos semánticos'),
      new Artifact('organizational-context', 'Organizational Context', 'context', 'Contexto organizacional donde se aplican los artefactos'),
      new Artifact('developer', 'Developer', 'actor', 'Desarrollador que utiliza el framework Hexy'),
      new Artifact('operator', 'Operator', 'actor', 'Operador que interactúa con las interfaces de Hexy'),
      new Artifact('agent', 'Agent', 'actor', 'Agente de onboarding encargado de realizar el onboarding a la ontología organizacional'),
      new Artifact('artifact', 'Artifact', 'concept', 'Objetos semánticos en la ontología organizacional'),
      new Artifact('semantic-model', 'Semantic Model', 'concept', 'Modelo semántico que representa la lógica de negocio'),
      new Artifact('organizational-logic', 'Organizational Logic', 'concept', 'Lógica operativa del negocio')
    ];

    console.log('Dashboard: Default artifacts created:', defaultArtifacts.length);
    this.artifacts = defaultArtifacts;
    this.renderArtifacts();
    this.updateArtifactCount();

    // Delay para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
      console.log('Dashboard: Updating graph...');
      this.updateGraph();
    }, 200);
  }

  /**
   * Alterna la visibilidad del formulario de artefactos
   */
  toggleArtifactForm() {
    const isVisible = !this.artifactForm.classList.contains('hidden');

    if (isVisible) {
      this.artifactForm.classList.add('hidden');
      this.addArtifactBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Nuevo Artefacto
      `;
    } else {
      this.artifactForm.classList.remove('hidden');
      this.addArtifactBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Cancelar
      `;
      this.artifactNameInput.focus();
    }
  }

  /**
   * Alterna la visibilidad de la búsqueda
   */
  toggleSearch() {
    const isVisible = !this.searchContainer.classList.contains('hidden');

    if (isVisible) {
      this.searchContainer.classList.add('hidden');
      this.searchQuery = '';
      this.searchInput.value = '';
      this.filterArtifacts();
    } else {
      this.searchContainer.classList.remove('hidden');
      this.searchInput.focus();
    }
  }

  /**
 * Crea un nuevo artefacto
 */
  createArtifact() {
    const name = this.artifactNameInput.value.trim();
    const type = this.artifactTypeSelect.value;
    const description = this.artifactDescriptionInput.value.trim();

    if (!name) {
      this.showNotification('El nombre es requerido', 'error');
      return;
    }

    // Crear artefacto directamente
    const artifact = new Artifact(
      this.generateId(),
      name,
      type,
      description
    );

    this.artifacts.push(artifact);
    this.renderArtifacts();
    this.updateGraph();
    this.updateArtifactCount();

    this.artifactNameInput.value = '';
    this.artifactDescriptionInput.value = '';
    this.toggleArtifactForm();

    this.showNotification('Artefacto creado exitosamente', 'success');
  }

  /**
   * Agrega un artefacto a la lista
   */
  addArtifact(artifact) {
    // Agregar el artefacto directamente a la lista local
    this.artifacts.push(artifact);
    this.renderArtifacts();
    this.updateGraph();
    this.updateArtifactCount();
  }

  /**
   * Renderiza la lista de artefactos
   */
  renderArtifacts(artifactsToRender = null) {
    this.artifactsContainer.innerHTML = '';

    const artifactsToShow = artifactsToRender || this.artifacts;

    artifactsToShow.forEach(artifact => {
      const artifactElement = this.createArtifactElement(artifact);
      this.artifactsContainer.appendChild(artifactElement);
    });
  }

  /**
   * Crea un elemento de artefacto
   */
  createArtifactElement(artifact) {
    const div = document.createElement('div');
    div.className = 'artifact-item';
    div.innerHTML = `
      <h4>${artifact.name}</h4>
      <p>${artifact.description}</p>
      <span class="artifact-type ${artifact.type}">${artifact.type}</span>
    `;

    div.addEventListener('click', () => this.selectArtifact(artifact));
    div.addEventListener('contextmenu', (e) => this.showContextMenu(e, artifact));

    return div;
  }

  /**
   * Selecciona un artefacto
   */
  selectArtifact(artifact) {
    this.selectedArtifact = artifact;

    document.querySelectorAll('.artifact-item').forEach(item => {
      item.classList.remove('selected');
    });

    event.target.closest('.artifact-item').classList.add('selected');
  }

  /**
   * Muestra el menú contextual
   */
  showContextMenu(event, artifact) {
    event.preventDefault();

    const menu = document.getElementById('menu');
    menu.innerHTML = `
      <div class="menu-item" onclick="window.dashboard.changeArtifactType('${artifact.id}')">Change Type</div>
      <div class="menu-item" onclick="window.dashboard.editArtifact('${artifact.id}')">Edit</div>
      <div class="menu-item danger" onclick="window.dashboard.deleteArtifact('${artifact.id}')">Delete</div>
    `;

    menu.style.display = 'block';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';

    setTimeout(() => {
      document.addEventListener('click', () => {
        menu.style.display = 'none';
      }, { once: true });
    }, 0);
  }

  /**
   * Cambia el tipo de un artefacto
   */
  changeArtifactType(artifactId) {
    const artifact = this.artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    const currentIndex = Object.values(TYPE_MAP).indexOf(artifact.type);
    const nextIndex = (currentIndex + 1) % Object.values(TYPE_MAP).length;
    artifact.type = Object.values(TYPE_MAP)[nextIndex];

    this.renderArtifacts();
    this.updateGraph();
    this.showNotification('Tipo de artefacto cambiado', 'success');
  }

  /**
   * Edita un artefacto
   */
  editArtifact(artifactId) {
    const artifact = this.artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    this.showModal(`
      <div class="modal-header">
        <h3 class="modal-title">Editar Artefacto</h3>
        <span class="modal-close" onclick="this.closest('.modal-overlay').classList.add('hidden')">&times;</span>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="edit-name" class="form-input" value="${artifact.name}">
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <select id="edit-type" class="form-input">
            ${Object.entries(TYPE_MAP).map(([key, value]) =>
      `<option value="${value}" ${artifact.type === value ? 'selected' : ''}>${key}</option>`
    ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea id="edit-description" class="form-input" rows="3">${artifact.description}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="primary-btn" onclick="window.dashboard.saveArtifactEdit('${artifactId}')">Guardar</button>
        <button class="secondary-btn" onclick="this.closest('.modal-overlay').classList.add('hidden')">Cancelar</button>
      </div>
    `);
  }

  /**
   * Guarda la edición de un artefacto
   */
  saveArtifactEdit(artifactId) {
    const artifact = this.artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    const name = document.getElementById('edit-name').value.trim();
    const type = document.getElementById('edit-type').value;
    const description = document.getElementById('edit-description').value.trim();

    if (!name) {
      this.showNotification('El nombre es requerido', 'error');
      return;
    }

    artifact.name = name;
    artifact.type = type;
    artifact.description = description;

    this.renderArtifacts();
    this.updateGraph();
    this.hideModal();
    this.showNotification('Artefacto actualizado', 'success');
  }

  /**
   * Elimina un artefacto
   */
  deleteArtifact(artifactId) {
    const artifact = this.artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    this.showModal(`
      <div class="modal-header">
        <h3 class="modal-title">Eliminar Artefacto</h3>
        <span class="modal-close" onclick="this.closest('.modal-overlay').classList.add('hidden')">&times;</span>
      </div>
      <div class="modal-body">
        <p>¿Estás seguro de que deseas eliminar "${artifact.name}"?</p>
      </div>
      <div class="modal-footer">
        <button class="primary-btn" onclick="window.dashboard.confirmDeleteArtifact('${artifactId}')">Confirm</button>
        <button class="secondary-btn" onclick="this.closest('.modal-overlay').classList.add('hidden')">Cancelar</button>
      </div>
    `);
  }

  /**
   * Confirma la eliminación de un artefacto
   */
  confirmDeleteArtifact(artifactId) {
    this.artifacts = this.artifacts.filter(a => a.id !== artifactId);
    this.renderArtifacts();
    this.updateGraph();
    this.updateArtifactCount();
    this.hideModal();
    this.showNotification('Artefacto eliminado', 'success');
  }

  /**
   * Filtra los artefactos según la búsqueda
   */
  filterArtifacts() {
    const filteredArtifacts = this.artifacts.filter(artifact =>
      artifact.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      artifact.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      artifact.type.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.renderArtifacts(filteredArtifacts);
  }

  /**
   * Actualiza el contador de artefactos
   */
  updateArtifactCount() {
    this.artifactCount.textContent = this.artifacts.length;
  }

  /**
   * Actualiza el grafo
   */
  updateGraph() {
    console.log('Dashboard: updateGraph called with', this.artifacts.length, 'artifacts');
    
    const nodes = this.artifacts.map(artifact => ({
      id: artifact.id,
      name: artifact.name,
      type: artifact.type,
      description: artifact.description,
      info: artifact.description
    }));

    const links = this.generateLinks(nodes);

    if (this.semanticRelations && this.semanticRelations.length > 0) {
      links.push(...this.semanticRelations);
    }

    console.log('Dashboard: Generated', nodes.length, 'nodes and', links.length, 'links');

    // Forzar el resize del grafo para asegurar dimensiones
    setTimeout(() => {
      console.log('Dashboard: Calling graphService.refresh...');
      this.graphService.resize();
      this.graphService.refresh(nodes, links, true);
    }, 100);
  }

  /**
   * Genera enlaces entre artefactos
   */
  generateLinks(nodes) {
    const links = [];
    const processed = new Set();

    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i !== j && !processed.has(`${i}-${j}`)) {
          const link = this.createLink(node, otherNode);
          if (link) {
            links.push(link);
            processed.add(`${i}-${j}`);
            processed.add(`${j}-${i}`);
          }
        }
      });
    });

    return links;
  }

  /**
   * Crea un enlace entre dos nodos
   */
  createLink(node1, node2) {
    const relationships = {
      purpose: ['context', 'actor'],
      context: ['actor', 'process'],
      actor: ['process', 'area'],
      process: ['procedure', 'event'],
      procedure: ['event', 'result'],
      event: ['result', 'observation'],
      result: ['evaluation'],
      evaluation: ['policy', 'principle'],
      policy: ['guideline'],
      principle: ['guideline'],
      guideline: ['concept'],
      concept: ['indicator'],
      indicator: ['vision'],
      vision: ['purpose']
    };

    if (relationships[node1.type] && relationships[node1.type].includes(node2.type)) {
      return new Link(node1, node2);
    }

    return null;
  }

  /**
   * Callback cuando se actualiza el grafo
   */
  onGraphUpdate() {

  }

  /**
   * Callback cuando cambia el tipo de un nodo
   */
  onNodeTypeChange(node, oldType, newType) {
    const artifact = this.artifacts.find(a => a.id === node.id);
    if (artifact) {
      artifact.type = newType;
      this.renderArtifacts();

      // Publish event
      this.eventBus.publish(EVENT_TYPES.NODE_UPDATED, {
        node,
        oldType,
        newType,
        artifact
      });
    }
  }

  /**
   * Callback cuando cambia el nombre de un nodo
   */
  onNodeNameChange(node, oldName, newName) {
    const artifact = this.artifacts.find(a => a.id === node.id);
    if (artifact) {
      artifact.name = newName;
      this.renderArtifacts();

      // Publish event
      this.eventBus.publish(EVENT_TYPES.NODE_UPDATED, {
        node,
        oldName,
        newName,
        artifact
      });
    }
  }

  /**
   * Callback cuando cambia la descripción de un nodo
   */
  onNodeDescriptionChange(node, oldDescription, newDescription) {
    const artifact = this.artifacts.find(a => a.id === node.id);
    if (artifact) {
      artifact.description = newDescription;
      this.renderArtifacts();

      // Publish event
      this.eventBus.publish(EVENT_TYPES.NODE_UPDATED, {
        node,
        oldDescription,
        newDescription,
        artifact
      });
    }
  }

  /**
   * Callback cuando se crea una relación semántica
   */
  onLinkCreate(semanticLink) {
    this.semanticRelations = this.semanticRelations || [];
    this.semanticRelations.push(semanticLink);

    this.updateGraph();
    this.showNotification('Relación semántica agregada al contexto organizacional', 'success');

    // Publish event
    this.eventBus.publish(EVENT_TYPES.LINK_CREATED, {
      semanticLink
    });
  }

  /**
   * Exporta las relaciones semánticas en formato SOL
   */
  exportSemanticRelations() {
    if (!this.semanticRelations || this.semanticRelations.length === 0) {
      this.showNotification('No hay relaciones semánticas para exportar', 'info');
      return;
    }

    const semanticService = new SemanticService();
    const solCode = semanticService.exportToSOL(this.semanticRelations);

    const blob = new Blob([solCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'semantic-relations.sol';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification('Relaciones semánticas exportadas exitosamente', 'success');
  }

  /**
   * Callback cuando cambian los colores
   */
  onColorsChange(newColors) {
    // Actualizar los colores globales
    Object.keys(newColors).forEach(type => {
      if (COLORS[type]) {
        COLORS[type] = newColors[type];
      }
    });

    // Refrescar el grafo con los nuevos colores
    this.updateGraph();
    this.showNotification('Colores actualizados', 'success');
  }

  /**
 * Callback cuando cambia el contenido del editor
 */
  onEditorContentChange(content) {
    const { nodes, links } = ArtifactParser.parseArtifacts(content);

    if (nodes.length > 0) {
      this.artifacts = nodes;
      this.renderArtifacts();
      this.updateGraph();
      this.updateArtifactCount();
    }
  }

  /**
   * Maneja la creación de un nuevo artefacto desde el canvas
   * @param {number} x - Coordenada X en el grafo
   * @param {number} y - Coordenada Y en el grafo
   */
  onCreateArtifact(x, y) {
    console.log('Dashboard: onCreateArtifact llamado con coordenadas:', { x, y });

    // Crear un artefacto temporal con nombre por defecto
    const tempId = `new-artifact-${Date.now()}`;
    const tempName = 'Nuevo Artefacto';
    const tempType = 'concept'; // Tipo por defecto
    const tempInfo = 'Descripción del nuevo artefacto';

    const newArtifact = new Artifact(tempId, tempName, tempType, tempInfo);

    // Establecer la posición del artefacto
    newArtifact.x = x;
    newArtifact.y = y;
    newArtifact.fx = x; // Posición fija inicial
    newArtifact.fy = y;

    console.log('Artefacto creado:', newArtifact);

    // Agregar el artefacto a la lista
    this.addArtifact(newArtifact);

    // Actualizar el grafo
    this.updateGraph();

    // Mostrar notificación
    this.showNotification('Artefacto creado. Haz doble clic para editar. Usa clic en el canvas vacío, Alt, Ctrl, o Cmd + clic para crear más artefactos.', 'success');

    // Permitir edición inmediata del nombre
    setTimeout(() => {
      this.enableInlineEditing(newArtifact);
    }, 100);
  }

  /**
   * Habilita la edición inline del nombre de un artefacto
   * @param {Artifact} artifact - Artefacto a editar
   */
  enableInlineEditing(artifact) {
    // Buscar el nodo en el grafo y habilitar edición
    if (this.graphService) {
      const nodeElement = this.graphService.nodeGroup
        .selectAll('g')
        .filter(d => d.id === artifact.id);

      if (!nodeElement.empty()) {
        this.graphService.showEditNameDialog(artifact, nodeElement.node());
      }
    }
  }

  /**
   * Muestra la configuración
   */
  showConfig() {
    this.configService.showConfigModal();
  }

  /**
   * Exporta los datos
   */
  exportData() {
    const data = {
      artifacts: this.artifacts,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hexy-artifacts-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification('Datos exportados exitosamente', 'success');
  }

  /**
   * Importa los datos
   */
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.artifacts && Array.isArray(data.artifacts)) {
              this.artifacts = data.artifacts.map(a => new Artifact(a.id || a.name.toLowerCase().replace(/\s+/g, '-'), a.name, a.type, a.description || a.info));
              this.renderArtifacts();
              this.updateGraph();
              this.updateArtifactCount();
              this.showNotification('Datos importados exitosamente', 'success');
            }
          } catch (error) {
            this.showNotification('Error al importar datos', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  /**
   * Muestra un modal
   */
  showModal(content) {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  /**
   * Oculta el modal
   */
  hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  /**
   * Muestra una notificación usando NotificationManager
   */
  showNotification(message, type = 'info') {
    this.notificationManager.show(message, type);
  }

  /**
   * Genera un ID único para los artefactos
   */
  generateId() {
    return 'artifact-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
