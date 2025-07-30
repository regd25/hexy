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
    this.storageKey = 'hexy-dashboard-config';
    this.loadConfiguration();
    this.setupConfigModal();
  }

  /**
   * Carga la configuración desde localStorage
   */
  loadConfiguration() {
    try {
      const savedConfig = localStorage.getItem(this.storageKey);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.colors) {
          this.onColorsChange(config.colors);
        }
      }
    } catch (error) {
      console.warn('Error loading configuration from localStorage:', error);
    }
  }

  /**
   * Guarda la configuración en localStorage
   * @param {Object} config - Configuración a guardar
   */
  saveConfiguration(config) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving configuration to localStorage:', error);
    }
  }

  /**
   * Exporta la configuración actual
   * @returns {Object} - Configuración actual
   */
  exportConfiguration() {
    try {
      const savedConfig = localStorage.getItem(this.storageKey);
      return savedConfig ? JSON.parse(savedConfig) : { colors: COLORS };
    } catch (error) {
      console.warn('Error exporting configuration:', error);
      return { colors: COLORS };
    }
  }

  /**
   * Importa una configuración
   * @param {Object} config - Configuración a importar
   */
  importConfiguration(config) {
    try {
      if (config && typeof config === 'object') {
        this.saveConfiguration(config);
        if (config.colors) {
          this.onColorsChange(config.colors);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing configuration:', error);
      return false;
    }
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
            <h3 class="modal-title">Configuración del Dashboard</h3>
            <span class="modal-close">&times;</span>
          </div>
          <div class="modal-body">
            <div class="config-section">
              <h4>Colores de Artefactos</h4>
              <div id="color-config-inputs" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;"></div>
            </div>
            <div class="config-section" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #4b5563;">
              <h4>Gestión de Configuración</h4>
              <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button id="export-config" class="btn-secondary">Exportar Config</button>
                <button id="import-config" class="btn-secondary">Importar Config</button>
                <input type="file" id="config-file-input" accept=".json" style="display: none;">
              </div>
            </div>
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

    const config = this.exportConfiguration();
    const currentColors = config.colors || COLORS;

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
      input.value = currentColors[type] || COLORS[type];
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
    const exportBtn = this.modal.querySelector('#export-config');
    const importBtn = this.modal.querySelector('#import-config');
    const fileInput = this.modal.querySelector('#config-file-input');

    closeBtn.onclick = () => this.hideConfigModal();
    saveBtn.onclick = () => this.saveColors();
    exportBtn.onclick = () => this.exportConfigToFile();
    importBtn.onclick = () => fileInput.click();

    fileInput.onchange = (event) => this.importConfigFromFile(event);

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
    
    const config = {
      colors: newColors,
      lastUpdated: new Date().toISOString()
    };
    
    this.saveConfiguration(config);
    this.onColorsChange(newColors);
    this.hideConfigModal();
  }

  /**
   * Exporta la configuración a un archivo
   */
  exportConfigToFile() {
    const config = this.exportConfiguration();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hexy-dashboard-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Importa la configuración desde un archivo
   * @param {Event} event - Evento del input file
   */
  importConfigFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        if (this.importConfiguration(config)) {
          this.showNotification('Configuración importada exitosamente', 'success');
          this.updateColorInputs();
        } else {
          this.showNotification('Error al importar la configuración', 'error');
        }
      } catch (error) {
        console.error('Error parsing config file:', error);
        this.showNotification('Archivo de configuración inválido', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }

  /**
   * Actualiza los inputs de color con la configuración actual
   */
  updateColorInputs() {
    const config = this.exportConfiguration();
    if (config.colors) {
      Object.keys(config.colors).forEach(type => {
        const input = document.getElementById(`color-${type}`);
        if (input) {
          input.value = config.colors[type];
        }
      });
    }
  }

  /**
   * Muestra una notificación
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (success, error, info)
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
    `;

    if (type === 'success') {
      notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
      notification.style.backgroundColor = '#ef4444';
    } else {
      notification.style.backgroundColor = '#3b82f6';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}
