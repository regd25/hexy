import { COLORS } from '../shared/constants.js';

/**
 * Servicio para gestionar la configuración del grafo
 */
export class ConfigService {
  /**
   * @param {HTMLElement} graphContainer - Contenedor del grafo
   * @param {Function} onColorsChange - Función a llamar cuando cambian los colores
   */
  constructor(graphContainer, onColorsChange) {
    this.graphContainer = graphContainer;
    this.onColorsChange = onColorsChange;
    this.modal = null;
    this.setupConfigModal();
  }

  /**
   * Configura el modal de configuración
   */
  setupConfigModal() {
    this.modal = document.createElement('div');
    this.modal.id = 'config-modal';
    this.modal.className = 'modal-overlay hidden';
    this.modal.innerHTML = `
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Configuración de Colores</h3>
            <span class="modal-close">&times;</span>
          </div>
          <div class="modal-body">
            <div id="color-config-inputs" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;"></div>
          </div>
          <div class="modal-footer">
            <button id="save-colors" class="btn-primary">Guardar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);

    this.setupColorInputs();
    this.setupEventListeners();
  }

  /**
   * Configura los inputs de colores
   */
  setupColorInputs() {
    const colorConfigInputs = document.getElementById('color-config-inputs');
    if (!colorConfigInputs) return;

    Object.keys(COLORS).forEach(type => {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '0.5rem';
      container.style.padding = '0.5rem';
      container.style.border = '1px solid #4b5563';
      container.style.borderRadius = '0.25rem';
      container.style.backgroundColor = '#374151';

      const label = document.createElement('label');
      label.textContent = type;
      label.style.color = '#f9fafb';
      label.style.fontSize = '0.875rem';
      label.style.fontWeight = '500';
      label.style.minWidth = '80px';

      const input = document.createElement('input');
      input.type = 'color';
      input.id = `color-${type}`;
      input.value = COLORS[type];
      input.style.width = '40px';
      input.style.height = '40px';
      input.style.border = 'none';
      input.style.borderRadius = '0.25rem';
      input.style.cursor = 'pointer';

      container.appendChild(label);
      container.appendChild(input);
      colorConfigInputs.appendChild(container);
    });
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    const closeBtn = this.modal.querySelector('.modal-close');
    const saveBtn = this.modal.querySelector('#save-colors');

    closeBtn.onclick = () => this.hideConfigModal();
    saveBtn.onclick = () => this.saveColors();

    // Cerrar modal al hacer clic fuera
    this.modal.onclick = (event) => {
      if (event.target === this.modal) {
        this.hideConfigModal();
      }
    };
  }

  /**
   * Muestra el modal de configuración
   */
  showConfigModal() {
    this.modal.classList.remove('hidden');
  }

  /**
   * Oculta el modal de configuración
   */
  hideConfigModal() {
    this.modal.classList.add('hidden');
  }

  /**
   * Guarda los colores seleccionados
   */
  saveColors() {
    const newColors = {};
    Object.keys(COLORS).forEach(type => {
      const input = document.getElementById(`color-${type}`);
      if (input) {
        newColors[type] = input.value;
      }
    });
    
    this.onColorsChange(newColors);
    this.hideConfigModal();
  }
}
