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
    this.configBtn = null;
    this.modal = null;
    this.setupConfigModal();
  }

  /**
   * Configura el modal de configuración
   */
  setupConfigModal() {

    this.configBtn = document.createElement('button');
    this.configBtn.id = 'config-btn';
    this.configBtn.textContent = '⚙️';
    this.graphContainer.appendChild(this.configBtn);


    this.modal = document.createElement('div');
    this.modal.id = 'config-modal';
    this.modal.className = 'modal';
    this.modal.innerHTML = `
      <div class="modal-content">
          <span class="close-button">&times;</span>
          <h2>Configuración de Colores</h2>
          <div id="color-config-inputs"></div>
          <button id="save-colors">Guardar</button>
      </div>
    `;
    document.body.appendChild(this.modal);


    const colorConfigInputs = document.getElementById('color-config-inputs');
    Object.keys(COLORS).forEach(type => {
      const label = document.createElement('label');
      label.textContent = type;
      const input = document.createElement('input');
      input.type = 'color';
      input.id = `color-${type}`;
      input.value = COLORS[type];
      label.appendChild(input);
      colorConfigInputs.appendChild(label);
    });


    this.configBtn.onclick = () => (this.modal.style.display = 'block');
    document.querySelector('.close-button').onclick = () =>
      (this.modal.style.display = 'none');
    document.getElementById('save-colors').onclick = () => {
      const newColors = {};
      Object.keys(COLORS).forEach(type => {
        newColors[type] = document.getElementById(`color-${type}`).value;
      });
      this.onColorsChange(newColors);
      this.modal.style.display = 'none';
    };

    window.onclick = event => {
      if (event.target == this.modal) {
        this.modal.style.display = 'none';
      }
    };
  }
}
