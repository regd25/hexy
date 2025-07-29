import { COLORS } from '../shared/constants.js';

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
   */
  constructor(
    svgElement,
    tooltipElement,
    menuElement,
    onNodeTypeChange,
    onNodeNameChange,
    onNodeDescriptionChange
  ) {
    this.svg = d3.select(svgElement);
    this.svgEl = svgElement;
    this.tooltip = tooltipElement;
    this.menu = menuElement;
    this.onNodeTypeChange = onNodeTypeChange;
    this.onNodeNameChange = onNodeNameChange || this.onNodeNameChange;
    this.onNodeDescriptionChange =
      onNodeDescriptionChange || this.onNodeDescriptionChange;
    this.width = this.svgEl.clientWidth;
    this.height = this.svgEl.clientHeight;
    this.nodes = [];
    this.links = [];
    this.simulation = null;
    this.g = null;
    this.linkGroup = null;
    this.nodeGroup = null;

    this.setupGraph();
  }

  /**
   * Configura el grafo D3.js
   */
  setupGraph() {

    this.g = this.svg.append('g');
    this.linkGroup = this.g.append('g');
    this.nodeGroup = this.g.append('g');


    this.svg.call(
      d3
        .zoom()
        .scaleExtent([0.2, 5])
        .on('zoom', ({ transform }) => this.g.attr('transform', transform))
    );


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
    this.nodes = nodes;
    this.links = links;


    const lk = this.linkGroup
      .selectAll('line')
      .data(this.links, d => d.getId());
    lk.exit().remove();
    lk.enter()
      .append('line')
      .attr('class', 'link')
      .attr('marker-end', 'url(#arrow)')
      .attr('stroke-width', d => d.weight);


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
    this.menu.innerHTML = '';
    this.menu.style.display = 'block';
    this.menu.style.left = `${event.pageX}px`;
    this.menu.style.top = `${event.pageY}px`;


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

    document.addEventListener(
      'click',
      () => (this.menu.style.display = 'none'),
      {
        once: true,
      }
    );
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
    dialog.className = 'edit-dialog modal';
    dialog.style.display = 'block';
    dialog.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>Editar nombre del nodo</h2>
        <div class="form-group">
          <label for="node-name">Nombre:</label>
          <input type="text" id="node-name" value="${node.name}" class="form-control">
        </div>
        <button id="save-node-name" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
      </div>
    `;
    document.body.appendChild(dialog);


    const closeBtn = dialog.querySelector('.close-button');
    const saveBtn = dialog.querySelector('#save-node-name');
    const input = dialog.querySelector('#node-name');

    closeBtn.onclick = () => {
      document.body.removeChild(dialog);
    };

    saveBtn.onclick = () => {
      const newName = input.value.trim();
      if (newName && newName !== node.name) {
        const oldName = node.name;
        node.name = newName;


        d3.select(nodeElement).select('text').text(newName);


        this.onNodeNameChange(node, oldName, newName);
      }
      document.body.removeChild(dialog);
    };


    window.onclick = event => {
      if (event.target === dialog) {
        document.body.removeChild(dialog);
      }
    };


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
    dialog.className = 'edit-dialog modal';
    dialog.style.display = 'block';
    dialog.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>Editar descripción del nodo</h2>
        <div class="form-group">
          <label for="node-description">Descripción:</label>
          <textarea id="node-description" class="form-control" rows="4">${node.info}</textarea>
        </div>
        <button id="save-node-description" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
      </div>
    `;
    document.body.appendChild(dialog);


    const closeBtn = dialog.querySelector('.close-button');
    const saveBtn = dialog.querySelector('#save-node-description');
    const textarea = dialog.querySelector('#node-description');

    closeBtn.onclick = () => {
      document.body.removeChild(dialog);
    };

    saveBtn.onclick = () => {
      const newDescription = textarea.value.trim();
      if (newDescription !== node.info) {
        const oldDescription = node.info;
        node.info = newDescription;


        this.onNodeDescriptionChange(node, oldDescription, newDescription);
      }
      document.body.removeChild(dialog);
    };


    window.onclick = event => {
      if (event.target === dialog) {
        document.body.removeChild(dialog);
      }
    };


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
}
