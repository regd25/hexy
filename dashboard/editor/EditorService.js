import { ArtifactParser } from '../services/ArtifactParser.js';
import { REVERSE_TYPE_MAP, COLORS } from '../shared/constants.js';

/**
 * Servicio para gestionar el editor de texto y la visualización de documentos
 */
export class EditorService {
  /**
   * @param {HTMLTextAreaElement} editorElement - Elemento del editor
   * @param {HTMLButtonElement} visualizeButton - Botón para visualizar el documento
   * @param {Function} onContentChange - Función a llamar cuando cambia el contenido
   */
  constructor(editorElement, onContentChange) {
    this.editor = editorElement;
    this.onContentChange = onContentChange;
    this.modal = null;
    this.editModal = null;
    this.lastText = '';
    this.autocompleteDropdown = null;
    this.editorMode = 'text'; // Modos: 'text', 'relate', 'type'
    this.editorModeIndicator = null; // Elemento DOM para mostrar el modo actual
    this.setupVisualizeModal();
    this.setupEditModal();
    this.setupAutocompleteDropdown();
    this.setupEditorMode();
    this.setupEventListeners();
    console.log('EditorService inicializado');
  }

  /**
   * Configura el modal de visualización
   */
  setupVisualizeModal() {
    // Crear modal
    this.modal = document.createElement('div');
    this.modal.id = 'visualize-modal';
    this.modal.className = 'modal';
    this.modal.innerHTML = `
      <div class="modal-content">
          <span class="close-button">&times;</span>
          <h2>Visualizar Documento</h2>
          <p>¿Estás seguro de que deseas visualizar el documento actual?</p>
          <button id="confirm-visualize" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Visualizar</button>
      </div>
    `;
    document.body.appendChild(this.modal);
  }
  
  /**
   * Configura el modal de edición
   */
  setupEditModal() {
    // Crear modal de edición
    this.editModal = document.createElement('div');
    this.editModal.id = 'edit-modal';
    this.editModal.className = 'modal';
    this.editModal.innerHTML = `
      <div class="modal-content edit-modal-content">
          <span class="close-button">&times;</span>
          <h2>Editar Documento</h2>
          <textarea id="modal-editor" spellcheck="false" class="w-full bg-gray-900 text-gray-200 p-4 font-mono text-sm resize-none outline-none whitespace-pre" rows="20"></textarea>
          <div class="flex justify-between mt-4">
            <button id="visualize-edit" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Visualizar</button>
            <div>
              <button id="cancel-edit" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Cancelar</button>
              <button id="confirm-edit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
            </div>
          </div>
      </div>
    `;
    document.body.appendChild(this.editModal);
  }
  
  /**
   * Configura el dropdown de autocompletado
   */
  setupAutocompleteDropdown() {
    // Crear dropdown de autocompletado
    this.autocompleteDropdown = document.createElement('div');
    this.autocompleteDropdown.className = 'autocomplete-dropdown';
    this.autocompleteDropdown.style.display = 'none';
    this.autocompleteDropdown.style.color = '#e5e7eb'; // Asegurar que el texto sea visible
    this.autocompleteDropdown.style.backgroundColor = 'rgba(31, 41, 55, 0.95)';
    this.autocompleteDropdown.style.border = '1px solid #4b5563';
    this.autocompleteDropdown.style.borderRadius = '4px';
    this.autocompleteDropdown.style.padding = '5px 0';
    this.autocompleteDropdown.style.maxHeight = '200px';
    this.autocompleteDropdown.style.overflowY = 'auto';
    this.autocompleteDropdown.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    this.autocompleteDropdown.style.zIndex = '1000';
    
    // Añadir un título al dropdown
    const dropdownHeader = document.createElement('div');
    dropdownHeader.className = 'autocomplete-header';
    dropdownHeader.style.padding = '8px 12px';
    dropdownHeader.style.borderBottom = '1px solid #4b5563';
    dropdownHeader.style.fontSize = '0.8em';
    dropdownHeader.style.color = '#9ca3af';
    dropdownHeader.style.fontWeight = 'bold';
    dropdownHeader.style.display = 'flex';
    dropdownHeader.style.justifyContent = 'space-between';
    dropdownHeader.style.alignItems = 'center';
    
    const headerTitle = document.createElement('span');
    headerTitle.textContent = 'Referencias de artefactos';
    
    const keyboardHint = document.createElement('span');
    keyboardHint.textContent = '↑↓: navegar, Enter: seleccionar, Esc: cerrar';
    keyboardHint.style.fontSize = '0.75em';
    
    dropdownHeader.appendChild(headerTitle);
    dropdownHeader.appendChild(keyboardHint);
    
    this.autocompleteDropdown.appendChild(dropdownHeader);
    
    // Crear contenedor para los elementos de autocompletado
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'autocomplete-items-container';
    itemsContainer.style.maxHeight = '200px';
    itemsContainer.style.overflowY = 'auto';
    this.autocompleteDropdown.appendChild(itemsContainer);
    
    document.body.appendChild(this.autocompleteDropdown);
    console.log('Dropdown de autocompletado configurado');
    
    // Configurar navegación por teclado
    this.setupKeyboardNavigation();
  }
  
  /**
   * Configura la navegación por teclado para el dropdown de autocompletado
   */
  setupKeyboardNavigation() {
    // Añadir evento de click a los elementos del dropdown
    this.autocompleteDropdown.addEventListener('click', (event) => {
      const item = event.target.closest('.autocomplete-item');
      if (item) {
        this.insertReference(item.dataset.id);
      }
    });
    
    // Posicionar el dropdown debajo del cursor
    document.addEventListener('input', () => {
      if (this.autocompleteDropdown.style.display === 'block') {
        const cursorPosition = this.getCursorPosition();
        if (cursorPosition) {
          this.autocompleteDropdown.style.position = 'absolute';
          this.autocompleteDropdown.style.left = `${cursorPosition.left}px`;
          this.autocompleteDropdown.style.top = `${cursorPosition.top + 20}px`;
        }
      }
    });
    
    // Configurar eventos de teclado para el editor principal y el modal
    const setupKeyboardEvents = (editor) => {
      editor.addEventListener('keydown', (event) => {
        // Solo manejar eventos si el dropdown está visible
        if (this.autocompleteDropdown.style.display === 'block') {
          const itemsContainer = this.autocompleteDropdown.querySelector('.autocomplete-items-container');
          if (!itemsContainer) return;
          
          const items = itemsContainer.querySelectorAll('.autocomplete-item');
          if (items.length === 0) return;
          
          const activeItem = itemsContainer.querySelector('.autocomplete-item.active');
          let activeIndex = Array.from(items).indexOf(activeItem);
          
          // Si no hay elemento activo, activar el primero
          if (activeIndex === -1) {
            items[0].classList.add('active');
            activeIndex = 0;
          }
          
          switch (event.key) {
            case 'ArrowDown':
              event.preventDefault();
              if (activeIndex < items.length - 1) {
                if (activeItem) activeItem.classList.remove('active');
                items[activeIndex + 1].classList.add('active');
                items[activeIndex + 1].scrollIntoView({ block: 'nearest', inline: 'nearest' });
              }
              break;
              
            case 'ArrowUp':
              event.preventDefault();
              if (activeIndex > 0) {
                if (activeItem) activeItem.classList.remove('active');
                items[activeIndex - 1].classList.add('active');
                items[activeIndex - 1].scrollIntoView({ block: 'nearest', inline: 'nearest' });
              }
              break;
              
            case 'Tab':
              event.preventDefault();
              if (event.shiftKey) {
                // Retroceder al elemento anterior
                if (activeIndex > 0) {
                  if (activeItem) activeItem.classList.remove('active');
                  items[activeIndex - 1].classList.add('active');
                  items[activeIndex - 1].scrollIntoView({ block: 'nearest', inline: 'nearest' });
                }
              } else {
                // Avanzar al siguiente elemento
                if (activeIndex < items.length - 1) {
                  if (activeItem) activeItem.classList.remove('active');
                  items[activeIndex + 1].classList.add('active');
                  items[activeIndex + 1].scrollIntoView({ block: 'nearest', inline: 'nearest' });
                }
              }
              break;
              
            case 'Enter':
              event.preventDefault();
              if (activeItem) {
                this.insertReference(activeItem.dataset.id, editor);
              }
              break;
              
            case 'Escape':
              event.preventDefault();
              this.hideAutocompleteDropdown();
              break;
              
            // Permitir selección rápida con números del 1-9
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9':
              if (items.length >= parseInt(event.key)) {
                event.preventDefault();
                const index = parseInt(event.key) - 1;
                this.insertReference(items[index].dataset.id, editor);
              }
              break;
          }
        }
      });
    };
    
    // Configurar eventos para el editor principal
    setupKeyboardEvents(this.editor);
    
    // Configurar eventos para el editor modal
    const modalEditor = document.getElementById('modal-editor');
    if (modalEditor) {
      setupKeyboardEvents(modalEditor);
    }
    
    console.log('Navegación por teclado configurada');
  }
  
  /**
   * Obtiene la posición del cursor en el editor
   * @returns {Object|null} - Objeto con las coordenadas left y top del cursor, o null si no se puede determinar
   */
  getCursorPosition() {
    const activeEditor = document.activeElement;
    if (activeEditor === this.editor || activeEditor.id === 'modal-editor') {
      const cursorPosition = activeEditor.selectionStart;
      const textBeforeCursor = activeEditor.value.substring(0, cursorPosition);
      
      // Crear un elemento temporal para medir la posición
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'pre-wrap';
      tempElement.style.wordWrap = 'break-word';
      tempElement.style.width = `${activeEditor.offsetWidth}px`;
      tempElement.style.font = window.getComputedStyle(activeEditor).font;
      tempElement.style.padding = window.getComputedStyle(activeEditor).padding;
      
      // Añadir el texto antes del cursor y un marcador para la posición del cursor
      tempElement.innerHTML = textBeforeCursor.replace(/\n/g, '<br>') + '<span id="cursor-marker">|</span>';
      document.body.appendChild(tempElement);
      
      // Obtener la posición del marcador
      const marker = document.getElementById('cursor-marker');
      const rect = marker.getBoundingClientRect();
      const editorRect = activeEditor.getBoundingClientRect();
      
      // Limpiar el elemento temporal
      document.body.removeChild(tempElement);
      
      // Devolver la posición relativa al viewport
      return {
        left: rect.left,
        top: rect.top - editorRect.top + activeEditor.scrollTop
      };
    }
    
    return null;
  }
  
  /**
   * Configura el indicador de modo del editor
   */
  setupEditorMode() {
    // Crear indicador de modo
    this.editorModeIndicator = document.createElement('div');
    this.editorModeIndicator.className = 'editor-mode';
    this.editorModeIndicator.textContent = 'Modo: Texto';
    this.editorModeIndicator.style.color = '#e5e7eb'; // Asegurar que el texto sea visible
    this.editorModeIndicator.style.position = 'fixed';
    this.editorModeIndicator.style.bottom = '10px';
    this.editorModeIndicator.style.left = '10px';
    this.editorModeIndicator.style.padding = '5px 10px';
    this.editorModeIndicator.style.backgroundColor = 'rgba(31, 41, 55, 0.9)';
    this.editorModeIndicator.style.borderRadius = '4px';
    this.editorModeIndicator.style.zIndex = '1000';
    document.body.appendChild(this.editorModeIndicator);
    console.log('Indicador de modo configurado');
    
    // Establecer clase inicial en el contenedor
    const container = document.getElementById('container');
    if (container) {
      container.classList.add('mode-text');
      console.log('Modo texto aplicado al contenedor:', container);
    } else {
      console.error('No se encontró el contenedor del editor (#container)');
    }
  }

  /**
   * Configura los event listeners del editor y los botones
   */
  setupEventListeners() {
    // Configurar el botón de edición para abrir el modal de edición
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const modalEditor = document.getElementById('modal-editor');
        modalEditor.value = this.editor.value;
        this.editModal.style.display = 'block';
      });
    }
    
    // Configurar el botón de visualización para abrir el modal de visualización
    const visualizeBtn = document.getElementById('visualize-btn');
    if (visualizeBtn) {
      visualizeBtn.addEventListener('click', () => {
        this.modal.style.display = 'block';
      });
    }

    // Configurar eventos del modal de visualización
    document.querySelector('#visualize-modal .close-button').onclick = () => {
      this.modal.style.display = 'none';
    };

    document.getElementById('confirm-visualize').onclick = () => {
      const { nodes, links } = ArtifactParser.parseArtifacts(this.editor.value);
      const validLinks = ArtifactParser.getValidLinks(links);
      if (this.onContentChange) {
        this.onContentChange(nodes, validLinks);
      }
      this.modal.style.display = 'none';
    };

    // Configurar eventos del modal de edición
    document.querySelector('#edit-modal .close-button').onclick = () => {
      this.editModal.style.display = 'none';
    };

    document.getElementById('cancel-edit').onclick = () => {
      this.editModal.style.display = 'none';
    };

    document.getElementById('visualize-edit').onclick = () => {
      const modalEditor = document.getElementById('modal-editor');
      const { nodes, links } = ArtifactParser.parseArtifacts(modalEditor.value);
      const validLinks = ArtifactParser.getValidLinks(links);
      if (this.onContentChange) {
        this.onContentChange(nodes, validLinks);
      }
    };

    document.getElementById('confirm-edit').onclick = () => {
      const modalEditor = document.getElementById('modal-editor');
      this.editor.value = modalEditor.value;
      this.lastText = this.editor.value;
      const { nodes, links } = ArtifactParser.parseArtifacts(this.editor.value);
      const validLinks = ArtifactParser.getValidLinks(links);
      if (this.onContentChange) {
        this.onContentChange(nodes, validLinks);
      }
      this.editModal.style.display = 'none';
    };

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (event) => {
      if (event.target == this.modal) {
        this.modal.style.display = 'none';
      }
      if (event.target == this.editModal) {
        this.editModal.style.display = 'none';
      }
      // Ocultar el dropdown de autocompletado si se hace clic fuera
      if (!this.autocompleteDropdown.contains(event.target) && event.target !== this.editor) {
        this.autocompleteDropdown.style.display = 'none';
      }
    });
    
    // Añadir evento de input para procesar referencias en tiempo real
    this.editor.addEventListener('input', () => {
      console.log('Evento input detectado');
      // Procesar el texto para detectar referencias con @
      const text = this.editor.value;
      const cursorPosition = this.editor.selectionStart;
      console.log('Posición del cursor:', cursorPosition);
      
      // Si estamos escribiendo una referencia, mostrar el dropdown de autocompletado
      if (this.isWritingReference(text, cursorPosition)) {
        console.log('Escribiendo referencia, mostrando dropdown');
        this.showAutocompleteDropdown(text, cursorPosition);
        return;
      } else {
        console.log('No escribiendo referencia, ocultando dropdown');
        this.autocompleteDropdown.style.display = 'none';
      }
      
      // Si acabamos de completar una referencia, actualizamos la visualización
      if (this.justCompletedReference(text, cursorPosition)) {
        const { nodes, links } = ArtifactParser.parseArtifacts(text);
        const validLinks = ArtifactParser.getValidLinks(links);
        if (this.onContentChange) {
          this.onContentChange(nodes, validLinks);
        }
        
        // Resaltar las referencias en el texto
        this.highlightReferences();
      }
      
      // Notificar el cambio de contenido para actualizar la visualización
      if (this.onContentChange && text !== this.lastText) {
        const { nodes, links } = ArtifactParser.parseArtifacts(text);
        const validLinks = ArtifactParser.getValidLinks(links);
        this.onContentChange(nodes, validLinks);
        this.lastText = text;
      }
    });
    
    // Configurar la navegación por teclado para el editor
    this.setupEditorKeyboardNavigation();
    
    // Atajos de teclado globales cuando el dropdown no está visible
    this.editor.addEventListener('keydown', (event) => {
      if (this.autocompleteDropdown.style.display === 'block') {
        // La navegación del dropdown ya está manejada en setupKeyboardNavigation
        return;
      }
      
      if (event.ctrlKey || event.metaKey) return; // No interferir con atajos del navegador
      
      switch (event.key.toUpperCase()) {
        case 'E':
          // Abrir modal de edición
          if (document.activeElement === this.editor) {
              event.preventDefault();
              const modalEditor = document.getElementById('modal-editor');
              modalEditor.value = this.editor.value;
              this.editModal.style.display = 'block';
              this.showToast('Modo de edición activado');
            }
            break;
          case 'T':
            // Cambiar el tipo del artefacto seleccionado
            if (document.activeElement === this.editor) {
              event.preventDefault();
              this.setEditorMode('type');
              this.showToast('Modo de cambio de tipo activado');
            }
            break;
          case 'R':
            // Entrar en modo de creación de relaciones
            if (document.activeElement === this.editor) {
              event.preventDefault();
              this.setEditorMode('relate');
              this.showToast('Modo de creación de relaciones activado');
            }
            break;
          case 'ESCAPE':
            // Volver al modo de texto
            if (this.editorMode !== 'text') {
              event.preventDefault();
              this.setEditorMode('text');
              this.showToast('Modo de texto activado');
            }
            break;
        }
    });
    
    // Añadir evento de input para el modal editor también
    const modalEditor = document.getElementById('modal-editor');
    modalEditor.addEventListener('input', () => {
      const text = modalEditor.value;
      const cursorPosition = modalEditor.selectionStart;
      
      // Si estamos escribiendo una referencia, mostrar el dropdown de autocompletado
      if (this.isWritingReference(text, cursorPosition)) {
        this.showAutocompleteDropdown(text, cursorPosition, modalEditor);
        return;
      } else {
        this.autocompleteDropdown.style.display = 'none';
      }
    });
  }

  /**
   * Establece el contenido del editor
   * @param {string} text - Texto a establecer
   */
  setContent(text) {
    this.editor.value = text;
    // Actualizar lastText para evitar que se detecte como un cambio
    this.lastText = text;
    
    // Parsear el contenido inicial sin disparar el evento input
    const { nodes, links } = ArtifactParser.parseArtifacts(text);
    const validLinks = ArtifactParser.getValidLinks(links);
    if (this.onContentChange) {
      this.onContentChange(nodes, validLinks);
    }
  }

  /**
   * Obtiene el contenido actual del editor
   * @returns {string} - Contenido del editor
   */
  getContent() {
    return this.editor.value;
  }

  /**
   * Actualiza el texto del editor cuando cambia el tipo de un artefacto
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldType - Tipo anterior
   * @param {string} newType - Nuevo tipo
   */
  updateEditorText(node, oldType, newType) {
    const lines = this.editor.value.split('\n');
    const oldCategory = REVERSE_TYPE_MAP[oldType];
    const newCategory = REVERSE_TYPE_MAP[newType];
    const artifactLineRegex = new RegExp(`^\\s*-\s*${node.name}\\s*:.*$`);

    let lineToRemove = -1;

    for (let i = 0; i < lines.length; i++) {
      if (artifactLineRegex.test(lines[i])) {
        lineToRemove = i;
        break;
      }
    }

    if (lineToRemove !== -1) {
      lines.splice(lineToRemove, 1);
    }

    let newCategoryLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === newCategory) {
        newCategoryLine = i;
        break;
      }
    }

    const artifactLineContent = `  - ${node.name}: ${node.info}`;

    if (newCategoryLine !== -1) {
      lines.splice(newCategoryLine + 1, 0, artifactLineContent);
    } else {
      lines.push('');
      lines.push(newCategory);
      lines.push(artifactLineContent);
    }

    this.editor.value = lines.join('\n');
    this.editor.dispatchEvent(new Event('input'));
  }

  /**
   * Actualiza el texto del editor cuando cambia el nombre de un artefacto
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldName - Nombre anterior
   * @param {string} newName - Nuevo nombre
   */
  updateNodeName(node, oldName, newName) {
    const lines = this.editor.value.split('\n');
    const category = REVERSE_TYPE_MAP[node.type];
    const oldArtifactLineRegex = new RegExp(`^\\s*-\\s*${oldName}\\s*:.*$`);

    let lineToUpdate = -1;

    for (let i = 0; i < lines.length; i++) {
      if (oldArtifactLineRegex.test(lines[i])) {
        lineToUpdate = i;
        break;
      }
    }

    if (lineToUpdate !== -1) {
      // Extraer la descripción actual
      const match = lines[lineToUpdate].match(/^(\s*-\s*)[^:]+:(.*$)/);
      if (match) {
        const indent = match[1];
        const description = match[2];
        lines[lineToUpdate] = `${indent}${newName}:${description}`;
      }
    }

    this.editor.value = lines.join('\n');
    this.editor.dispatchEvent(new Event('input'));
  }

  /**
   * Actualiza el texto del editor cuando cambia la descripción de un artefacto
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldDescription - Descripción anterior
   * @param {string} newDescription - Nueva descripción
   */
  updateNodeDescription(node, oldDescription, newDescription) {
    const lines = this.editor.value.split('\n');
    const artifactLineRegex = new RegExp(`^\\s*-\\s*${node.name}\\s*:.*$`);

    let lineToUpdate = -1;

    for (let i = 0; i < lines.length; i++) {
      if (artifactLineRegex.test(lines[i])) {
        lineToUpdate = i;
        break;
      }
    }

    if (lineToUpdate !== -1) {
      // Extraer el nombre y el indentado actual
      const match = lines[lineToUpdate].match(/^(\s*-\s*[^:]+:).*$/);
      if (match) {
        const prefix = match[1];
        lines[lineToUpdate] = `${prefix} ${newDescription}`;
      }
    }

    this.editor.value = lines.join('\n');
    this.editor.dispatchEvent(new Event('input'));
  }

  /**
   * Verifica si el usuario está actualmente escribiendo una referencia
   * @param {string} text - Texto actual del editor
   * @param {number} cursorPosition - Posición actual del cursor
   * @returns {boolean} - true si el usuario está escribiendo una referencia
   */
  isWritingReference(text, cursorPosition) {
    // Buscar el último @ antes de la posición del cursor
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    console.log('Verificando si está escribiendo referencia:', { lastAtIndex, cursorPosition });
    
    // Si no hay @ o está muy lejos, no estamos escribiendo una referencia
    if (lastAtIndex === -1 || cursorPosition - lastAtIndex > 30) {
      return false;
    }
    
    // Verificar si hay un espacio o un carácter no válido después del @
    const textAfterAt = text.substring(lastAtIndex + 1, cursorPosition);
    const invalidChars = /[^A-Za-zÁÉÍÓÚÑáéíóú0-9-]/;
    
    console.log('Texto después del @:', textAfterAt);
    
    // Si hay caracteres no válidos, no estamos escribiendo una referencia
    if (invalidChars.test(textAfterAt)) {
      console.log('Contiene caracteres inválidos');
      return false;
    }
    
    // Estamos escribiendo una referencia
    console.log('Es una referencia válida');
    return true;
  }
  
  /**
   * Obtiene el texto que se está escribiendo después del @ para filtrar sugerencias
   * @param {string} text - Texto actual del editor
   * @param {number} cursorPosition - Posición actual del cursor
   * @returns {Object} - Objeto con el texto de filtro y la posición del @
   */
  getReferenceFilterText(text, cursorPosition) {
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      return { filterText: '', atPosition: -1 };
    }
    
    const filterText = text.substring(lastAtIndex + 1, cursorPosition);
    return { filterText, atPosition: lastAtIndex };
  }

  /**
   * Verifica si el usuario acaba de completar una referencia
   * @param {string} text - Texto actual del editor
   * @param {number} cursorPosition - Posición actual del cursor
   * @returns {boolean} - true si el usuario acaba de completar una referencia
   */
  justCompletedReference(text, cursorPosition) {
    // Si el texto no ha cambiado, no se ha completado una referencia
    if (text === this.lastText) {
      return false;
    }
    
    // Guardar el texto actual para la próxima comparación
    this.lastText = text;
    
    // Si estamos escribiendo una referencia, no se ha completado todavía
    if (this.isWritingReference(text, cursorPosition)) {
      return false;
    }
    
    // Verificar si hay un @ seguido de un identificador válido y un espacio o puntuación
    const textBeforeCursor = text.substring(0, cursorPosition);
    const referencePattern = /@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)([\s,.;:!?]|$)/;
    const match = textBeforeCursor.match(referencePattern);
    
    // Si encontramos una referencia completa, verificamos si es nueva
    if (match && match.index > 0) {
      const lastChar = textBeforeCursor.charAt(cursorPosition - 1);
      // Si el último carácter es un espacio o puntuación, probablemente acabamos de completar la referencia
      return /[\s,.;:!?]/.test(lastChar);
    }
    
    return false;
  }
  
  /**
   * Muestra el dropdown de autocompletado con las sugerencias filtradas
   * @param {string} text - Texto actual del editor
   * @param {number} cursorPosition - Posición actual del cursor
   * @param {HTMLTextAreaElement} targetEditor - Editor objetivo (principal o modal)
   */
  showAutocompleteDropdown(text, cursorPosition, targetEditor = this.editor) {
    console.log('Mostrando dropdown de autocompletado');
    const { filterText, atPosition } = this.getReferenceFilterText(text, cursorPosition);
    console.log('Texto de filtro:', filterText);
    
    // Obtener todos los artefactos existentes
    const { nodes } = ArtifactParser.parseArtifacts(this.editor.value);
    
    // Filtrar los artefactos según el texto escrito
    const filteredNodes = nodes.filter(node => 
      node.id.toLowerCase().includes(filterText.toLowerCase()) || 
      node.name.toLowerCase().includes(filterText.toLowerCase())
    );
    
    // Ordenar los nodos: primero los que comienzan con el texto de filtro, luego el resto
    filteredNodes.sort((a, b) => {
      const aStartsWithFilter = a.id.toLowerCase().startsWith(filterText.toLowerCase()) || 
                              a.name.toLowerCase().startsWith(filterText.toLowerCase());
      const bStartsWithFilter = b.id.toLowerCase().startsWith(filterText.toLowerCase()) || 
                              b.name.toLowerCase().startsWith(filterText.toLowerCase());
      
      if (aStartsWithFilter && !bStartsWithFilter) return -1;
      if (!aStartsWithFilter && bStartsWithFilter) return 1;
      return a.name.localeCompare(b.name); // Ordenar alfabéticamente si ambos coinciden igual
    });
    
    // Actualizar el título del dropdown con el número de resultados
    const headerTitle = this.autocompleteDropdown.querySelector('.autocomplete-header span:first-child');
    if (headerTitle) {
      if (filteredNodes.length > 0) {
        headerTitle.textContent = `Referencias (${filteredNodes.length} resultados)`;
      } else if (filterText.trim() !== '') {
        headerTitle.textContent = 'Crear nuevo artefacto';
      } else {
        headerTitle.textContent = 'Referencias de artefactos';
      }
    }
    
    // Obtener el contenedor de elementos
    const itemsContainer = this.autocompleteDropdown.querySelector('.autocomplete-items-container');
    if (!itemsContainer) {
      console.error('No se encontró el contenedor de elementos de autocompletado');
      return;
    }
    
    // Limpiar el contenedor de elementos
    itemsContainer.innerHTML = '';
    
    // Si no hay resultados y el texto de filtro no está vacío, crear un nuevo artefacto
    if (filteredNodes.length === 0 && filterText.trim() !== '') {
      const newItem = document.createElement('div');
      newItem.className = 'autocomplete-item';
      newItem.dataset.id = filterText;
      newItem.dataset.new = 'true';
      newItem.innerHTML = `
        <div class="autocomplete-item-type" style="background-color: #9e9e9e; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px;"></div>
        <div class="autocomplete-item-name">Crear "${filterText}" (nuevo)</div>
        <div class="autocomplete-item-badge" style="margin-left: auto; font-size: 0.7em; background-color: #3B82F6; color: white; padding: 2px 6px; border-radius: 4px;">Nuevo</div>
      `;
      itemsContainer.appendChild(newItem);
    } else {
      // Agrupar nodos por tipo
      const nodesByType = {};
      filteredNodes.forEach(node => {
        if (!nodesByType[node.type]) {
          nodesByType[node.type] = [];
        }
        nodesByType[node.type].push(node);
      });
      
      // Crear elementos para cada tipo
      Object.keys(nodesByType).forEach(type => {
        // Añadir un separador de tipo si hay múltiples tipos
        if (Object.keys(nodesByType).length > 1) {
          const typeSeparator = document.createElement('div');
          typeSeparator.className = 'autocomplete-type-separator';
          typeSeparator.style.padding = '4px 12px';
          typeSeparator.style.fontSize = '0.75em';
          typeSeparator.style.fontWeight = 'bold';
          typeSeparator.style.color = '#6b7280';
          typeSeparator.style.backgroundColor = '#f3f4f6';
          typeSeparator.textContent = type;
          itemsContainer.appendChild(typeSeparator);
        }
        
        // Añadir los elementos de este tipo
        nodesByType[type].forEach(node => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          item.dataset.id = node.id;
          
          // Destacar la parte coincidente del texto
          let displayName = node.name;
          let displayId = node.id;
          if (filterText.trim() !== '') {
            const regex = new RegExp(`(${filterText})`, 'gi');
            displayName = node.name.replace(regex, '<strong>$1</strong>');
            displayId = node.id.replace(regex, '<strong>$1</strong>');
          }
          
          item.innerHTML = `
            <div class="autocomplete-item-type" style="background-color: ${this.getNodeColor(node.type)}; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px;"></div>
            <div class="autocomplete-item-content">
              <div class="autocomplete-item-name">${displayName}</div>
              <div class="autocomplete-item-id" style="font-size: 0.75em; color: #6b7280;">${displayId}</div>
            </div>
            <div class="autocomplete-item-type-label" style="margin-left: auto; font-size: 0.7em; color: white; background-color: ${this.getNodeColor(node.type)}; padding: 2px 6px; border-radius: 4px;">${node.type}</div>
          `;
          
          itemsContainer.appendChild(item);
        });
      });
    }
    
    // Aplicar estilos a los elementos del dropdown si no se han aplicado ya
    if (!document.getElementById('autocomplete-styles')) {
      const style = document.createElement('style');
      style.id = 'autocomplete-styles';
      style.textContent = `
        .autocomplete-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .autocomplete-item:hover, .autocomplete-item.active {
          background-color: rgba(59, 130, 246, 0.2);
        }
        .autocomplete-item.active {
          border-left: 3px solid #3B82F6;
        }
        .autocomplete-item strong {
          font-weight: bold;
          color: #3B82F6;
        }
        .autocomplete-item-content {
          flex: 1;
          overflow: hidden;
        }
        .autocomplete-items-container {
          max-height: 200px;
          overflow-y: auto;
        }
        .autocomplete-dropdown {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .autocomplete-dropdown-hiding {
          opacity: 0;
          transform: translateY(10px);
        }
      `;
      document.head.appendChild(style);
    }
    
    // Si hay elementos, mostrar el dropdown
    if (itemsContainer.children.length > 0) {
      // Posicionar el dropdown cerca del cursor
      const rect = targetEditor.getBoundingClientRect();
      const lineHeight = parseInt(window.getComputedStyle(targetEditor).lineHeight) || 20;
      const textBeforeCursor = text.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      const currentLineText = lines[currentLine - 1];
      const charWidth = 8; // Aproximación del ancho de un carácter en píxeles
      
      const top = rect.top + (currentLine * lineHeight) - targetEditor.scrollTop + 5;
      const left = rect.left + (currentLineText.length * charWidth);
      
      this.autocompleteDropdown.style.top = `${top}px`;
      this.autocompleteDropdown.style.left = `${left}px`;
      this.autocompleteDropdown.style.minWidth = '300px';
      this.autocompleteDropdown.style.maxWidth = '500px';
      this.autocompleteDropdown.style.display = 'block';
      
      // Añadir eventos de clic a los elementos
      const items = itemsContainer.querySelectorAll('.autocomplete-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          this.insertReference(item.dataset.id, targetEditor);
        });
      });
      
      // Activar el primer elemento
      if (items.length > 0) {
        items[0].classList.add('active');
      }
    } else {
      this.hideAutocompleteDropdown();
    }
  }
  
  /**
   * Oculta el dropdown de autocompletado con una animación suave
   */
  hideAutocompleteDropdown() {
    if (this.autocompleteDropdown) {
      // Añadir clase para animación de salida
      this.autocompleteDropdown.classList.add('autocomplete-dropdown-hiding');
      
      // Después de la animación, ocultar completamente
      setTimeout(() => {
        this.autocompleteDropdown.style.display = 'none';
        this.autocompleteDropdown.classList.remove('autocomplete-dropdown-hiding');
      }, 150);
    }
  }
  
  /**
   * Configura la navegación por teclado global para el editor
   */
  setupEditorKeyboardNavigation() {
    // Manejar atajos de teclado globales para el editor
    this.editor.addEventListener('keydown', (event) => {
      // Solo manejar atajos cuando el dropdown no está visible
      if (this.autocompleteDropdown.style.display !== 'block') {
        // Atajos de teclado cuando el dropdown no está visible
        if (event.key === 'Escape') {
          // Cambiar al modo texto con Escape
          this.setEditorMode('text');
        } else if (event.key === 'r' && event.ctrlKey) {
          // Activar modo de creación de relaciones con Ctrl+R
          event.preventDefault(); // Prevenir comportamiento por defecto
          this.setEditorMode('relate');
        } else if (event.key === 't' && event.ctrlKey) {
          // Activar modo de cambio de tipo con Ctrl+T
          event.preventDefault(); // Prevenir comportamiento por defecto
          this.setEditorMode('type');
        }
      }
    });
    
    // Mostrar ayuda de atajos de teclado al presionar F1
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F1') {
        event.preventDefault();
        this.showKeyboardShortcutsHelp();
      }
    });
  }
  
  /**
   * Muestra una ventana de ayuda con los atajos de teclado disponibles
   */
  showKeyboardShortcutsHelp() {
    // Crear modal de ayuda si no existe
    let helpModal = document.getElementById('keyboard-shortcuts-help');
    
    if (!helpModal) {
      helpModal = document.createElement('div');
      helpModal.id = 'keyboard-shortcuts-help';
      helpModal.style.position = 'fixed';
      helpModal.style.top = '50%';
      helpModal.style.left = '50%';
      helpModal.style.transform = 'translate(-50%, -50%)';
      helpModal.style.backgroundColor = 'white';
      helpModal.style.padding = '20px';
      helpModal.style.borderRadius = '8px';
      helpModal.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
      helpModal.style.zIndex = '2000';
      helpModal.style.maxWidth = '500px';
      helpModal.style.width = '90%';
      
      // Contenido de la ayuda
      helpModal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h2 style="margin: 0; font-size: 1.5em; color: #3B82F6;">Atajos de teclado</h2>
          <button id="close-help-modal" style="background: none; border: none; cursor: pointer; font-size: 1.5em; color: #6b7280;">&times;</button>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 1.2em; color: #4b5563;">Modos de edición</h3>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
            <div style="font-weight: bold; color: #6b7280;">Esc</div>
            <div>Cambiar a modo texto</div>
            <div style="font-weight: bold; color: #6b7280;">Ctrl+R</div>
            <div>Cambiar a modo de creación de relaciones</div>
            <div style="font-weight: bold; color: #6b7280;">Ctrl+T</div>
            <div>Cambiar a modo de cambio de tipo</div>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 1.2em; color: #4b5563;">Autocompletado de referencias</h3>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
            <div style="font-weight: bold; color: #6b7280;">@</div>
            <div>Iniciar referencia a un artefacto</div>
            <div style="font-weight: bold; color: #6b7280;">↑/↓</div>
            <div>Navegar entre sugerencias</div>
            <div style="font-weight: bold; color: #6b7280;">Tab/Shift+Tab</div>
            <div>Navegar entre sugerencias</div>
            <div style="font-weight: bold; color: #6b7280;">Enter</div>
            <div>Seleccionar sugerencia</div>
            <div style="font-weight: bold; color: #6b7280;">1-9</div>
            <div>Seleccionar sugerencia por número</div>
            <div style="font-weight: bold; color: #6b7280;">Esc</div>
            <div>Cerrar menú de sugerencias</div>
          </div>
        </div>
        <div>
          <h3 style="margin: 0 0 10px 0; font-size: 1.2em; color: #4b5563;">General</h3>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
            <div style="font-weight: bold; color: #6b7280;">F1</div>
            <div>Mostrar esta ayuda</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(helpModal);
      
      // Evento para cerrar el modal
      document.getElementById('close-help-modal').addEventListener('click', () => {
        helpModal.style.display = 'none';
      });
      
      // Cerrar al hacer clic fuera del modal
      document.addEventListener('click', (event) => {
        if (event.target !== helpModal && !helpModal.contains(event.target)) {
          helpModal.style.display = 'none';
        }
      });
    } else {
      helpModal.style.display = 'block';
    }
  }
  
  /**
   * Inserta una referencia en el editor
   * @param {string} id - ID del artefacto a referenciar
   * @param {HTMLTextAreaElement} targetEditor - Editor objetivo (principal o modal)
   */
  insertReference(id, targetEditor = this.editor) {
    console.log('Insertando referencia:', id);
    const text = targetEditor.value;
    const cursorPosition = targetEditor.selectionStart;
    const { atPosition } = this.getReferenceFilterText(text, cursorPosition);
    
    console.log('Posición del @:', atPosition);
    if (atPosition === -1) {
      console.error('No se encontró la posición del @');
      return;
    }
    
    // Verificar si es un nuevo artefacto
    const item = this.autocompleteDropdown.querySelector(`.autocomplete-item[data-id="${id}"]`);
    const isNewArtifact = item && item.dataset.new === 'true';
    
    // Reemplazar el texto desde @ hasta la posición actual con la referencia completa
    const textBefore = text.substring(0, atPosition);
    const textAfter = text.substring(cursorPosition);
    const newText = `${textBefore}@${id} ${textAfter}`;
    
    targetEditor.value = newText;
    targetEditor.selectionStart = targetEditor.selectionEnd = atPosition + id.length + 2; // +2 por @ y espacio
    console.log('Texto actualizado con la referencia');
    
    // Ocultar el dropdown
    this.autocompleteDropdown.style.display = 'none';
    console.log('Dropdown ocultado');
    
    // Disparar evento de input para actualizar
    targetEditor.dispatchEvent(new Event('input'));
    console.log('Evento input disparado');
    
    // Si es un nuevo artefacto, crearlo después de actualizar la referencia
    if (isNewArtifact) {
      console.log('Creando nuevo artefacto pendiente');
      this.createPendingArtifact(id);
      this.showToast(`Artefacto "${id}" creado y referenciado`, 'success');
    } else {
      this.showToast(`Referencia a "${id}" insertada`, 'info');
    }
    
    // Enfocar el editor
    targetEditor.focus();
  }
  
  /**
   * Crea un nuevo artefacto pendiente
   * @param {string} id - ID del nuevo artefacto
   */
  createPendingArtifact(id) {
    console.log('Creando artefacto pendiente:', id);
    // Obtener el texto actual
    const text = this.editor.value;
    const lines = text.split('\n');
    
    // Determinar el tipo de artefacto basado en el nombre
    // Por defecto será un concepto, pero podemos intentar inferir el tipo
    let artifactType = 'Conceptos';
    const lowerCaseId = id.toLowerCase();
    
    if (lowerCaseId.includes('proceso') || lowerCaseId.includes('flujo') || 
        lowerCaseId.endsWith('ar') || lowerCaseId.endsWith('er') || lowerCaseId.endsWith('ir')) {
      artifactType = 'Procesos';
    } else if (lowerCaseId.includes('actor') || lowerCaseId.includes('usuario') || 
               lowerCaseId.includes('sistema') || lowerCaseId.includes('persona')) {
      artifactType = 'Actores';
    } else if (lowerCaseId.includes('contexto') || lowerCaseId.includes('entorno') || 
               lowerCaseId.includes('ambiente')) {
      artifactType = 'Contextos';
    }
    
    // Buscar la sección correspondiente
    let sectionLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === artifactType) {
        sectionLine = i;
        break;
      }
    }
    
    console.log(`Línea de ${artifactType} encontrada:`, sectionLine);
    
    if (sectionLine === -1) {
      // Si no existe la sección, añadirla al final
      lines.push('');
      lines.push(artifactType);
      sectionLine = lines.length - 1;
      console.log(`Sección de ${artifactType} creada`);
    }
    
    // Añadir el nuevo artefacto después de la línea de la sección
    lines.splice(sectionLine + 1, 0, `  - ${id}: Pendiente de completar`);
    console.log('Artefacto añadido a la línea:', sectionLine + 1);
    
    // Actualizar el editor
    this.editor.value = lines.join('\n');
    console.log('Editor actualizado');
    
    // Actualizar la visualización
    try {
      const { nodes, links } = ArtifactParser.parseArtifacts(this.editor.value);
      const validLinks = ArtifactParser.getValidLinks(links);
      if (this.onContentChange) {
        this.onContentChange(nodes, validLinks);
        console.log('Visualización actualizada');
      }
    } catch (error) {
      console.error('Error al actualizar la visualización:', error);
    }
    
    // Mostrar notificación con el tipo inferido
    this.showToast(`Artefacto "${id}" creado como ${artifactType.toLowerCase().slice(0, -1)}`, 'success');
    console.log('Notificación mostrada');
    
    // Posicionar el cursor al final de la descripción para facilitar la edición
    const newLines = this.editor.value.split('\n');
    let lineIndex = -1;
    const artifactRegex = new RegExp(`  - ${id}: Pendiente de completar`);
    
    for (let i = 0; i < newLines.length; i++) {
      if (artifactRegex.test(newLines[i])) {
        lineIndex = i;
        break;
      }
    }
    
    if (lineIndex !== -1) {
      // Calcular la posición del cursor al final de "Pendiente de completar"
      let cursorPosition = 0;
      for (let i = 0; i < lineIndex; i++) {
        cursorPosition += newLines[i].length + 1; // +1 por el salto de línea
      }
      cursorPosition += newLines[lineIndex].length;
      
      // Posicionar el cursor
      this.editor.selectionStart = this.editor.selectionEnd = cursorPosition;
      this.editor.focus();
    }
  }
  
  /**
   * Resalta las referencias en el texto del editor
   */
  highlightReferences() {
    // Esta función se implementará cuando tengamos un editor más avanzado
    // Por ahora, solo actualizamos la visualización
  }
  
  /**
   * Muestra una notificación toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación ('success', 'info', 'warning', 'error')
   * @param {number} duration - Duración en milisegundos
   */
  showToast(message, type = 'info', duration = 3000) {
    console.log('Mostrando toast:', message, type);
    
    // Definir colores según el tipo
    const colors = {
      success: { bg: 'rgba(16, 185, 129, 0.9)', icon: '✓' },
      info: { bg: 'rgba(59, 130, 246, 0.9)', icon: 'ℹ' },
      warning: { bg: 'rgba(245, 158, 11, 0.9)', icon: '⚠' },
      error: { bg: 'rgba(239, 68, 68, 0.9)', icon: '✕' }
    };
    
    const color = colors[type] || colors.info;
    
    // Crear elemento toast si no existe
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      console.log('Creando elemento toast');
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '6px';
      toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      toast.style.zIndex = '2000';
      toast.style.transition = 'all 0.3s ease';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.minWidth = '250px';
      document.body.appendChild(toast);
      console.log('Elemento toast añadido al DOM');
    }
    
    // Actualizar estilos según el tipo
    toast.style.backgroundColor = color.bg;
    toast.style.color = 'white';
    
    // Crear contenido del toast con icono
    toast.innerHTML = `
      <div style="margin-right: 10px; font-weight: bold;">${color.icon}</div>
      <div>${message}</div>
    `;
    
    // Mostrar mensaje con animación
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    console.log('Toast visible');
    
    // Ocultar después del tiempo especificado
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      console.log('Toast ocultado');
    }, duration);
  }
  
  /**
   * Cambia el modo del editor
   * @param {string} mode - Nuevo modo ('text', 'relate', 'type')
   */
  setEditorMode(mode) {
    console.log('Cambiando modo del editor a:', mode);
    // Actualizar el modo actual
    this.editorMode = mode;
    
    // Definir colores según el modo
    const modeColors = {
      text: '#3B82F6',    // Azul
      relate: '#10B981', // Verde
      type: '#F59E0B'     // Naranja
    };
    
    const color = modeColors[mode] || modeColors.text;
    
    // Actualizar el indicador de modo
    const modeText = {
      'text': 'Texto',
      'relate': 'Crear Relaciones',
      'type': 'Cambiar Tipo'
    };
    
    if (!this.editorModeIndicator) {
      console.error('El indicador de modo no está inicializado');
      return;
    }
    
    this.editorModeIndicator.textContent = `Modo: ${modeText[mode]}`;
    this.editorModeIndicator.style.backgroundColor = color;
    this.editorModeIndicator.style.borderColor = color;
    console.log('Texto del indicador actualizado');
    
    // Actualizar la clase del contenedor
    const container = document.querySelector('.editor-container');
    if (!container) {
      console.error('No se encontró el contenedor del editor (.editor-container)');
      // Intentar con otros selectores comunes
      const alternativeContainer = document.getElementById('container') || document.querySelector('.container');
      if (!alternativeContainer) {
        console.error('No se pudo encontrar ningún contenedor válido');
        return;
      }
      
      alternativeContainer.classList.remove('mode-text', 'mode-relate', 'mode-type');
      alternativeContainer.classList.add(`mode-${mode}`);
      alternativeContainer.style.borderColor = color;
      alternativeContainer.style.boxShadow = `0 0 5px ${color}40`; // 40 es para la opacidad (25%)
      console.log('Clases del contenedor alternativo actualizadas');
      return;
    }
    
    container.classList.remove('mode-text', 'mode-relate', 'mode-type');
    container.classList.add(`mode-${mode}`);
    container.style.borderColor = color;
    container.style.boxShadow = `0 0 5px ${color}40`;
    console.log('Clases del contenedor actualizadas');
    
    // Mostrar un toast informativo sobre el cambio de modo
    const modeDescriptions = {
      text: 'Edición de texto normal',
      relate: 'Creación de relaciones entre artefactos',
      type: 'Cambio de tipo de artefactos'
    };
    
    this.showToast(`Modo ${modeText[mode]}: ${modeDescriptions[mode] || ''}`, 'info');
  }
  
  /**
   * Obtiene el color correspondiente a un tipo de nodo
   * @param {string} type - Tipo de nodo
   * @returns {string} - Color en formato hexadecimal
   */
  getNodeColor(type) {
    return COLORS[type] || COLORS.reference;
  }
}