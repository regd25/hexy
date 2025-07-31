import { COLORS } from '../shared/constants.js';
import { SemanticService } from '../services/SemanticService.js';
import * as d3 from 'd3';

/**
 * Servicio para gestionar el grafo D3.js
 */
export class GraphService {
  /**
   * @param {SVGElement} svgElement - Elemento SVG para el grafo
   * @param {HTMLElement} tooltipElement - Elemento para mostrar tooltips
   * @param {HTMLElement} menuElement - Elemento para mostrar el menú contextual
   * @param {Function} onNodeTypeChange - Función a llamar cuando cambia el tipo de un nodo
   * @param {Function} onNodeNameChange - Función a llamar cuando cambia el nombre de un nodo
   * @param {Function} onNodeDescriptionChange - Función a llamar cuando cambia la descripción de un nodo
   * @param {Function} onLinkCreate - Función a llamar cuando se crea una nueva relación
   */
  constructor(
    svgElement,
    tooltipElement,
    menuElement,
    onNodeTypeChange,
    onNodeNameChange,
    onNodeDescriptionChange,
    onLinkCreate,
    onCreateArtifact
  ) {
    this.svg = d3.select(svgElement);
    this.svgEl = svgElement;
    this.tooltip = tooltipElement;
    this.menu = menuElement;
    this.onNodeTypeChange = onNodeTypeChange;
    this.onNodeNameChange = onNodeNameChange || this.onNodeNameChange;
    this.onNodeDescriptionChange =
      onNodeDescriptionChange || this.onNodeDescriptionChange;
    this.onLinkCreate = onLinkCreate || this.onLinkCreate;
    this.onCreateArtifact = onCreateArtifact;
    console.log('GraphService: onCreateArtifact callback:', this.onCreateArtifact);
    this.width = this.svgEl.clientWidth;
    this.height = this.svgEl.clientHeight;
    this.nodes = [];
    this.links = [];
    this.simulation = null;
    this.g = null;
    this.linkGroup = null;
    this.nodeGroup = null;
    this.isCreatingLink = false;
    this.linkSource = null;
    this.tempLink = null;
    this.semanticService = new SemanticService();

    this.setupGraph();
  }

  /**
   * Configura el grafo D3.js
   */
  setupGraph() {

    this.g = this.svg.append('g');
    this.linkGroup = this.g.append('g');
    this.nodeGroup = this.g.append('g');


    // Configurar zoom normal
    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 5])
      .on('zoom', ({ transform }) => this.g.attr('transform', transform));

    this.svg.call(zoom);


    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#90a4ae')
      .attr('opacity', 0.9);


    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(this.links)
          .id(d => d.id)
          .distance(120)
          .strength(0.7)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));


    this.simulation.on('tick', () => this.onTick());

    // Agregar event listener específico en el contenedor del grafo para Ctrl + clic
    // Esto evita conflictos con el zoom de D3.js
    this.graphContainer = this.svgEl.parentElement;

    this.graphContainerMouseDownHandler = (event) => {
      console.log('Graph container mousedown event:', {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        target: event.target,
        svgEl: this.svgEl,
        isCreatingLink: this.isCreatingLink,
        isNode: event.target.closest('.node')
      });

      // Procesar si Alt, Ctrl, o Cmd (Meta) está presionado y no estamos creando un enlace
      if ((event.altKey || event.ctrlKey || event.metaKey) && !this.isCreatingLink) {
        // Verificar que no sea un nodo
        if (!event.target.closest('.node')) {
          console.log('Creating artifact via modifier+click');
          event.preventDefault();
          event.stopPropagation();
          this.handleCanvasDoubleClick(event);
        }
      }
    };

    this.graphContainer.addEventListener('mousedown', this.graphContainerMouseDownHandler);

    // Implementar clic simple en canvas vacío para crear artefactos
    this.graphContainerClickHandler = (event) => {
      console.log('Graph container click event:', {
        target: event.target,
        isCreatingLink: this.isCreatingLink,
        isNode: event.target.closest('.node'),
        isCanvas: event.target === this.svgEl || event.target.closest('svg')
      });

      // Solo crear artefacto si es clic en el canvas vacío y no estamos creando un enlace
      if (!this.isCreatingLink &&
        !event.target.closest('.node') &&
        (event.target === this.svgEl || event.target.closest('svg'))) {

        console.log('Creating artifact via single click on empty canvas');
        event.preventDefault();
        event.stopPropagation();
        this.handleCanvasDoubleClick(event);
      }
    };

    this.graphContainer.addEventListener('click', this.graphContainerClickHandler);
  }

  /**
   * Actualiza la posición de los elementos en cada tick de la simulación
   */
  onTick() {
    this.linkGroup
      .selectAll('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    this.nodeGroup
      .selectAll('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }

  /**
   * Maneja el doble clic en el canvas para crear un nuevo artefacto
   * @param {Event} event - Evento del doble clic
   */
  handleCanvasDoubleClick(event) {
    console.log('Creación de artefacto detectada');

    // Obtener las coordenadas del clic en el sistema de coordenadas del grafo
    const transform = d3.zoomTransform(this.svgEl);
    const [x, y] = d3.pointer(event, this.svgEl);

    // Convertir coordenadas del mouse a coordenadas del grafo
    const graphX = (x - transform.x) / transform.k;
    const graphY = (y - transform.y) / transform.k;

    console.log('Coordenadas del grafo:', { graphX, graphY });

    // Llamar al callback para crear el artefacto
    if (this.onCreateArtifact) {
      this.onCreateArtifact(graphX, graphY);
    } else {
      console.warn('onCreateArtifact callback no está definido');
    }
  }

  /**
   * Actualiza solo un nodo específico sin recargar todo el grafo
   * @param {Object} node - Nodo a actualizar
   * @param {string} property - Propiedad que cambió ('type', 'name', 'description')
   * @param {string} oldValue - Valor anterior
   * @param {string} newValue - Nuevo valor
   */
  updateNode(node, property, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    const nodeElement = this.nodeGroup.selectAll('g').filter(d => d.id === node.id);

    if (property === 'type') {

      node.type = newValue;

      nodeElement
        .select('circle')
        .transition()
        .duration(300)
        .style('fill', COLORS[newValue]);
    } else if (property === 'name') {

      node.id = newValue.replace(/\s+/g, '');
      node.name = newValue;

      nodeElement
        .select('text')
        .text(newValue);
    } else if (property === 'description') {

      node.info = newValue;
    }
  }

  /**
   * Actualiza el grafo con nuevos nodos y enlaces
   * @param {Array} nodes - Lista de nodos
   * @param {Array} links - Lista de enlaces
   * @param {boolean} restart - Si se debe reiniciar la simulación
   */
  refresh(nodes, links, restart = true) {
    console.log('GraphService: refresh called with', nodes.length, 'nodes and', links.length, 'links');
    this.nodes = nodes;
    this.links = links;


    const lk = this.linkGroup
      .selectAll('line')
      .data(this.links, d => d.getId ? d.getId() : `${d.source.id}->${d.target.id}`);
    lk.exit().remove();
    lk.enter()
      .append('line')
      .attr('class', 'link')
      .attr('marker-end', 'url(#arrow)')
      .attr('stroke-width', d => d.weight || 1)
      .attr('stroke', d => d.semantic ? '#8b5cf6' : '#90a4ae')
      .attr('stroke-dasharray', d => d.semantic ? '5,5' : 'none')
      .attr('opacity', d => d.semantic ? 0.8 : 0.6);


    const nd = this.nodeGroup.selectAll('g').data(this.nodes, d => d.id);
    nd.exit().remove();
    const ne = nd
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(
        d3
          .drag()
          .on('start', (e, d) => this.dragStart(e, d))
          .on('drag', (e, d) => this.dragging(e, d))
          .on('end', (e, d) => this.dragEnd(e, d))
      )
      .on('contextmenu', (e, d) => this.showContextMenu(e, d))
      .on('mouseover', (e, d) => {
        this.tooltip.style.display = 'block';
        this.tooltip.innerHTML = `
          <h3>${d.name}</h3>
          <p><strong>Tipo:</strong> ${d.type.toUpperCase()}</p>
          <p>${d.info}</p>
        `;
        // Posicionar inmediatamente al mostrar
        this.updateTooltipPosition(e);
      })
      .on('mousemove', e => {
        this.updateTooltipPosition(e);
      })
      .on('mouseout', () => {
        this.tooltip.style.display = 'none';
      });

    ne.append('circle')
      .attr('r', d => (d.type === 'reference' ? 20 : 28))
      .attr('fill', d => COLORS[d.type] || '#ccc')
      .attr('stroke', d => (d.type === 'reference' ? '#616161' : 'none'))
      .attr('stroke-width', d => (d.type === 'reference' ? 2 : 0))
      .attr('stroke-dasharray', d => (d.type === 'reference' ? '3,3' : 'none'));
    ne.append('text')
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .text(d => d.id);

    ne.on('click', (e, d) => {
      if (this.isCreatingLink) {
        this.handleLinkTarget(d);
      }
    });

    // Agregar doble clic en nodos para edición directa
    ne.on('dblclick', (e, d) => {
      e.stopPropagation(); // Evitar que se propague al canvas
      this.showEditNameDialog(d, e.currentTarget);
    });

    this.simulation.nodes(this.nodes);
    this.simulation.force('link').links(this.links);

    if (restart) {
      this.simulation.alpha(0.3).restart();
    }
  }

  /**
   * Actualiza la posición del tooltip
   * @param {Event} e - Evento del mouse
   */
  updateTooltipPosition(e) {
    const tooltipWidth = 250;
    const tooltipHeight = 120;
    const offset = 15;

    // Posición inicial junto al mouse
    let x = e.clientX + offset;
    let y = e.clientY + offset;

    // Verificar si se sale por la derecha
    if (x + tooltipWidth > window.innerWidth - 20) {
      x = e.clientX - tooltipWidth - offset;
    }

    // Verificar si se sale por abajo
    if (y + tooltipHeight > window.innerHeight - 20) {
      y = e.clientY - tooltipHeight - offset;
    }

    // Verificar si se sale por la izquierda
    if (x < 20) {
      x = 20;
    }

    // Verificar si se sale por arriba
    if (y < 20) {
      y = 20;
    }

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }

  /**
   * Muestra el menú contextual para un nodo
   * @param {Event} event - Evento del navegador
   * @param {Object} d - Datos del nodo
   */
  showContextMenu(event, d) {
    const nodeElement = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    this.menu.innerHTML = '';
    this.menu.style.display = 'block';

    // Position menu to avoid going off-screen
    const menuWidth = 200;
    const menuHeight = 400;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = event.pageX;
    let top = event.pageY;

    // Adjust horizontal position if menu would go off-screen
    if (left + menuWidth > windowWidth) {
      left = event.pageX - menuWidth;
    }

    // Adjust vertical position if menu would go off-screen
    if (top + menuHeight > windowHeight) {
      top = event.pageY - menuHeight;
    }

    this.menu.style.left = `${left}px`;
    this.menu.style.top = `${top}px`;


    const typeSection = document.createElement('div');
    typeSection.className = 'menu-section';
    typeSection.innerHTML = '<h3>Cambiar tipo</h3>';
    this.menu.appendChild(typeSection);

    Object.keys(COLORS).forEach(type => {
      const item = document.createElement('div');
      item.textContent = type;
      item.className = 'menu-item';
      item.onclick = () => {
        const oldType = d.type;


        if (oldType !== type) {
          this.menu.style.display = 'none';
          this.onNodeTypeChange(d, oldType, type);
        } else {
          this.menu.style.display = 'none';
        }
      };
      typeSection.appendChild(item);
    });


    const editSection = document.createElement('div');
    editSection.className = 'menu-section';
    editSection.innerHTML = '<h3>Editar nodo</h3>';
    this.menu.appendChild(editSection);


    const editNameItem = document.createElement('div');
    editNameItem.textContent = 'Editar nombre';
    editNameItem.className = 'menu-item';
    editNameItem.onclick = () => {
      this.menu.style.display = 'none';
      this.showEditNameDialog(d, nodeElement);
    };
    editSection.appendChild(editNameItem);


    const editDescItem = document.createElement('div');
    editDescItem.textContent = 'Editar descripción';
    editDescItem.className = 'menu-item';
    editDescItem.onclick = () => {
      this.menu.style.display = 'none';
      this.showEditDescriptionDialog(d, nodeElement);
    };
    editSection.appendChild(editDescItem);

    const relationSection = document.createElement('div');
    relationSection.className = 'menu-section';
    relationSection.innerHTML = '<h3>Relaciones Semánticas</h3>';
    this.menu.appendChild(relationSection);

    const createRelationItem = document.createElement('div');
    createRelationItem.textContent = 'Crear relación semántica';
    createRelationItem.className = 'menu-item';
    createRelationItem.onclick = () => {
      this.menu.style.display = 'none';
      this.startLinkCreation(d);
    };
    relationSection.appendChild(createRelationItem);

    // Close menu when clicking outside
    const closeMenu = (e) => {
      if (!this.menu.contains(e.target)) {
        this.menu.style.display = 'none';
        document.removeEventListener('click', closeMenu);
      }
    };

    // Delay adding the event listener to avoid immediate closure
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 100);
  }

  /**
   * Inicia el arrastre de un nodo
   * @param {Event} e - Evento del navegador
   * @param {Object} d - Datos del nodo
   */
  dragStart(e, d) {
    if (!e.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  /**
   * Actualiza la posición durante el arrastre
   * @param {Event} e - Evento del navegador
   * @param {Object} d - Datos del nodo
   */
  dragging(e, d) {
    d.fx = e.x;
    d.fy = e.y;
  }

  /**
   * Finaliza el arrastre de un nodo
   * @param {Event} e - Evento del navegador
   * @param {Object} d - Datos del nodo
   */
  dragEnd(e, d) {
    if (!e.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  /**
   * Ejecuta la simulación por un número de ticks sin actualizar la visualización
   * @param {number} ticks - Número de ticks a ejecutar
   */
  runSimulation(ticks) {
    for (let i = 0; i < ticks; ++i) {
      this.simulation.tick();
    }
  }

  /**
   * Redimensiona el grafo cuando cambia el tamaño de la ventana
   */
  resize() {
    this.width = this.svgEl.clientWidth;
    this.height = this.svgEl.clientHeight;
    console.log('GraphService: resize - width:', this.width, 'height:', this.height);
    this.simulation.force(
      'center',
      d3.forceCenter(this.width / 2, this.height / 2)
    );
    this.simulation.alpha(0.3).restart();
  }

  /**
   * Muestra un diálogo para editar el nombre de un nodo
   * @param {Object} node - Nodo a editar
   * @param {Element} nodeElement - Elemento DOM del nodo
   */
  showEditNameDialog(node, nodeElement) {

    const dialog = document.createElement('div');
    dialog.className = 'edit-dialog';
    dialog.style.display = 'block';
    dialog.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #f8fafc;">Editar nombre del nodo</h2>
        <div style="margin-bottom: 16px;">
          <label for="node-name" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #e2e8f0;">Nombre:</label>
          <input type="text" id="node-name" value="${node.name}" style="width: 100%; padding: 8px 12px; border: 1px solid #475569; border-radius: 6px; background: #1e293b; color: #f8fafc; font-size: 14px;">
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="cancel-node-name" style="background: #64748b; color: white; font-weight: bold; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;">Cancelar</button>
          <button id="save-node-name" style="background: #3b82f6; color: white; font-weight: bold; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;">Guardar</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);


    const closeBtn = dialog.querySelector('.close-button');
    const saveBtn = dialog.querySelector('#save-node-name');
    const cancelBtn = dialog.querySelector('#cancel-node-name');
    const input = dialog.querySelector('#node-name');

    const closeDialog = () => {
      document.body.removeChild(dialog);
    };

    closeBtn.onclick = closeDialog;
    cancelBtn.onclick = closeDialog;

    saveBtn.onclick = () => {
      const newName = input.value.trim();
      if (newName && newName !== node.name) {
        const oldName = node.name;
        node.name = newName;
        node.id = newName.replace(/\s+/g, ''); // Actualizar también el ID

        // Actualizar el texto en el grafo
        d3.select(nodeElement).select('text').text(newName);

        // Notificar el cambio
        this.onNodeNameChange(node, oldName, newName);
      }
      closeDialog();
    };


    const closeOnOutsideClick = (event) => {
      if (event.target === dialog) {
        document.body.removeChild(dialog);
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };

    // Agregar soporte para teclas
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        saveBtn.click();
      } else if (event.key === 'Escape') {
        closeDialog();
      }
    });

    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 100);

    input.focus();
    input.select();
  }

  /**
   * Muestra un diálogo para editar la descripción de un nodo
   * @param {Object} node - Nodo a editar
   * @param {Element} nodeElement - Elemento DOM del nodo
   */
  showEditDescriptionDialog(node, nodeElement) {

    const dialog = document.createElement('div');
    dialog.className = 'edit-dialog';
    dialog.style.display = 'block';
    dialog.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #f8fafc;">Editar descripción del nodo</h2>
        <div style="margin-bottom: 16px;">
          <label for="node-description" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #e2e8f0;">Descripción:</label>
          <textarea id="node-description" style="width: 100%; padding: 8px 12px; border: 1px solid #475569; border-radius: 6px; background: #1e293b; color: #f8fafc; font-size: 14px; resize: vertical;" rows="4">${node.info}</textarea>
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="cancel-node-description" style="background: #64748b; color: white; font-weight: bold; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;">Cancelar</button>
          <button id="save-node-description" style="background: #3b82f6; color: white; font-weight: bold; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;">Guardar</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);


    const closeBtn = dialog.querySelector('.close-button');
    const saveBtn = dialog.querySelector('#save-node-description');
    const cancelBtn = dialog.querySelector('#cancel-node-description');
    const textarea = dialog.querySelector('#node-description');

    const closeDialog = () => {
      document.body.removeChild(dialog);
    };

    closeBtn.onclick = closeDialog;
    cancelBtn.onclick = closeDialog;

    saveBtn.onclick = () => {
      const newDescription = textarea.value.trim();
      if (newDescription !== node.info) {
        const oldDescription = node.info;
        node.info = newDescription;

        // Notificar el cambio
        this.onNodeDescriptionChange(node, oldDescription, newDescription);
      }
      closeDialog();
    };


    const closeOnOutsideClick = (event) => {
      if (event.target === dialog) {
        document.body.removeChild(dialog);
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };

    // Agregar soporte para teclas
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        saveBtn.click();
      } else if (event.key === 'Escape') {
        closeDialog();
      }
    });

    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick);
    }, 100);

    textarea.focus();
  }

  /**
   * Método para notificar cambios en el nombre de un nodo
   * @param {Object} node - Nodo modificado
   * @param {string} oldName - Nombre anterior
   * @param {string} newName - Nuevo nombre
   */
  onNodeNameChange(node, oldName, newName) {

    console.log(`Nombre del nodo cambiado: ${oldName} -> ${newName}`);
  }

  /**
   * Método para notificar cambios en la descripción de un nodo
   * @param {Object} node - Nodo modificado
   * @param {string} oldDescription - Descripción anterior
   * @param {string} newDescription - Nueva descripción
   */
  onNodeDescriptionChange(node, oldDescription, newDescription) {

    console.log(`Descripción del nodo cambiada`);
  }

  /**
   * Inicia la creación de una relación semántica
   * @param {Object} sourceNode - Nodo de origen
   */
  startLinkCreation(sourceNode) {
    this.isCreatingLink = true;
    this.linkSource = sourceNode;

    this.svg.style('cursor', 'crosshair');
    this.nodeGroup.selectAll('g').style('cursor', 'pointer');

    this.showNotification('Haz clic en el nodo destino para crear la relación', 'info');
  }

  /**
   * Cancela la creación de una relación
   */
  cancelLinkCreation() {
    this.isCreatingLink = false;
    this.linkSource = null;
    this.tempLink = null;

    this.svg.style('cursor', 'default');
    this.nodeGroup.selectAll('g').style('cursor', 'default');

    if (this.tempLink) {
      this.tempLink.remove();
      this.tempLink = null;
    }
  }

  /**
   * Maneja el clic en un nodo durante la creación de relaciones
   * @param {Object} targetNode - Nodo de destino
   */
  handleLinkTarget(targetNode) {
    if (!this.isCreatingLink || !this.linkSource) return;

    if (this.linkSource.id === targetNode.id) {
      this.showNotification('No puedes crear una relación consigo mismo', 'error');
      return;
    }

    this.showSemanticRelationDialog(this.linkSource, targetNode);
    this.cancelLinkCreation();
  }

  /**
   * Muestra el diálogo para crear una relación semántica
   * @param {Object} sourceNode - Nodo de origen
   * @param {Object} targetNode - Nodo de destino
   */
  showSemanticRelationDialog(sourceNode, targetNode) {
    const dialog = document.createElement('div');
    dialog.className = 'semantic-relation-dialog modal';
    dialog.style.display = 'block';
    dialog.innerHTML = `
      <div class="modal-content" style="max-width: 600px; width: 90vw;">
        <span class="close-button">&times;</span>
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #f8fafc;">Crear Relación Semántica</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #e2e8f0;">Artefacto Origen:</label>
            <div style="padding: 12px; background: #334155; border-radius: 6px; border: 1px solid #475569;">
              <strong style="color: #f8fafc;">${sourceNode.name}</strong> <span style="color: #94a3b8;">(${sourceNode.type})</span>
            </div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #e2e8f0;">Artefacto Destino:</label>
            <div style="padding: 12px; background: #334155; border-radius: 6px; border: 1px solid #475569;">
              <strong style="color: #f8fafc;">${targetNode.name}</strong> <span style="color: #94a3b8;">(${targetNode.type})</span>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label for="relation-type" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #e2e8f0;">Tipo de Relación:</label>
          <select id="relation-type" style="width: 100%; padding: 8px 12px; border: 1px solid #475569; border-radius: 6px; background: #1e293b; color: #f8fafc; font-size: 14px;">
            <option value="uses">Usa (uses)</option>
            <option value="implements">Implementa (implements)</option>
            <option value="supports">Soporta (supports)</option>
            <option value="defines">Define (defines)</option>
            <option value="triggers">Dispara (triggers)</option>
            <option value="validates">Valida (validates)</option>
            <option value="custom">Personalizada</option>
          </select>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label for="custom-relation" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #e2e8f0;">Relación Personalizada:</label>
          <input type="text" id="custom-relation" style="width: 100%; padding: 8px 12px; border: 1px solid #475569; border-radius: 6px; background: #1e293b; color: #f8fafc; font-size: 14px; display: none;" placeholder="Ej: depends_on, requires, etc.">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label for="semantic-justification" style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #e2e8f0;">Justificación Semántica:</label>
          <textarea id="semantic-justification" style="width: 100%; padding: 8px 12px; border: 1px solid #475569; border-radius: 6px; background: #1e293b; color: #f8fafc; font-size: 14px; resize: vertical;" rows="3" placeholder="Explica por qué existe esta relación y cómo contribuye al contexto organizacional..."></textarea>
        </div>
        
        <div style="margin-bottom: 16px;">
          <button id="generate-suggestion" style="background: #10b981; color: white; font-weight: bold; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; margin-right: 8px;">
            Generar Sugerencia con IA
          </button>
          <button id="save-relation" style="background: #3b82f6; color: white; font-weight: bold; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;">
            Confirmar Relación
          </button>
        </div>
        
        <div id="ai-suggestion" style="padding: 12px; background: #1e3a8a; border: 1px solid #3b82f6; border-radius: 6px; display: none;">
          <h4 style="font-weight: 500; margin-bottom: 8px; color: #f8fafc;">Sugerencia de IA:</h4>
          <div id="suggestion-content" style="color: #e2e8f0;"></div>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.close-button');
    const saveBtn = dialog.querySelector('#save-relation');
    const generateBtn = dialog.querySelector('#generate-suggestion');
    const relationTypeSelect = dialog.querySelector('#relation-type');
    const customRelationInput = dialog.querySelector('#custom-relation');
    const justificationTextarea = dialog.querySelector('#semantic-justification');
    const aiSuggestion = dialog.querySelector('#ai-suggestion');
    const suggestionContent = dialog.querySelector('#suggestion-content');

    relationTypeSelect.addEventListener('change', () => {
      if (relationTypeSelect.value === 'custom') {
        customRelationInput.style.display = 'block';
      } else {
        customRelationInput.style.display = 'none';
      }
    });

    generateBtn.addEventListener('click', () => {
      this.generateAISuggestion(sourceNode, targetNode, relationTypeSelect.value, customRelationInput.value, suggestionContent);
      aiSuggestion.style.display = 'block';
    });

    saveBtn.addEventListener('click', () => {
      const relationType = relationTypeSelect.value === 'custom' ? customRelationInput.value : relationTypeSelect.value;
      const justification = justificationTextarea.value.trim();

      if (!relationType || !justification) {
        this.showNotification('Por favor completa todos los campos', 'error');
        return;
      }

      this.createSemanticRelation(sourceNode, targetNode, relationType, justification);
      document.body.removeChild(dialog);
    });

    closeBtn.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    window.addEventListener('click', (event) => {
      if (event.target === dialog) {
        document.body.removeChild(dialog);
      }
    });
  }

  /**
 * Genera una sugerencia de IA para la relación
 * @param {Object} sourceNode - Nodo de origen
 * @param {Object} targetNode - Nodo de destino
 * @param {string} relationType - Tipo de relación
 * @param {string} customRelation - Relación personalizada
 * @param {HTMLElement} suggestionElement - Elemento donde mostrar la sugerencia
 */
  async generateAISuggestion(sourceNode, targetNode, relationType, customRelation, suggestionElement) {
    try {
      const finalRelationType = relationType === 'custom' ? customRelation : relationType;

      suggestionElement.innerHTML = '<div class="text-gray-600">Generando sugerencia...</div>';

      const suggestion = await this.semanticService.generateSuggestion(
        sourceNode,
        targetNode,
        finalRelationType
      );

      suggestionElement.innerHTML = `<p class="text-gray-800">${suggestion}</p>`;
    } catch (error) {
      suggestionElement.innerHTML = '<div class="text-red-600">Error al generar sugerencia</div>';
    }
  }

  /**
 * Crea una relación semántica
 * @param {Object} sourceNode - Nodo de origen
 * @param {Object} targetNode - Nodo de destino
 * @param {string} relationType - Tipo de relación
 * @param {string} justification - Justificación semántica
 */
  createSemanticRelation(sourceNode, targetNode, relationType, justification) {
    const validation = this.semanticService.validateRelation(sourceNode, targetNode, relationType);

    if (!validation.isValid) {
      this.showNotification(validation.errors.join(', '), 'error');
      return;
    }

    if (validation.warnings.length > 0) {
      this.showNotification(`Advertencia: ${validation.warnings.join(', ')}`, 'info');
    }

    const semanticLink = {
      source: sourceNode,
      target: targetNode,
      type: relationType,
      justification: justification,
      weight: 2,
      semantic: true
    };

    this.links.push(semanticLink);
    this.refresh(this.nodes, this.links, false);

    this.onLinkCreate(semanticLink);
    this.showNotification('Relación semántica creada exitosamente', 'success');
  }

  /**
   * Método para notificar la creación de una relación
   * @param {Object} link - Relación creada
   */
  onLinkCreate(link) {
    console.log('Relación semántica creada:', link);
  }

  /**
   * Muestra una notificación usando el sistema centralizado
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (info, success, error)
   */
  showNotification(message, type = 'info') {
    // Usar el sistema de notificaciones centralizado si está disponible
    if (window.notificationManager) {
      window.notificationManager.show(message, type);
    } else {
      console.warn('NotificationManager no disponible, usando fallback');
      // Fallback simple sin crear elementos DOM
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Limpia los event listeners y recursos
   */
  destroy() {
    if (this.graphContainer) {
      this.graphContainer.removeEventListener('mousedown', this.graphContainerMouseDownHandler);
      this.graphContainer.removeEventListener('click', this.graphContainerClickHandler);
    }
    if (this.simulation) {
      this.simulation.stop();
    }
  }
}
