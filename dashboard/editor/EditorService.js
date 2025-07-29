import { ArtifactParser } from '../services/ArtifactParser.js';
import { REVERSE_TYPE_MAP, COLORS } from '../shared/constants.js';

/**
 * Servicio para gestionar el editor de texto y la visualización de documentos
 */
export class EditorService {
  /**
   * @param {HTMLTextAreaElement} editorElement - Elemento del editor
   * @param {Function} onContentChange - Función a llamar cuando cambia el contenido
   */
  constructor(editorElement, onContentChange) {
    this.editor = editorElement;
    this.onContentChange = onContentChange;
    this.modal = null;
    this.editModal = null;
    this.lastText = '';
    this.autocompleteDropdown = null;
    this.editorMode = 'text';
    this.editorModeIndicator = null;
    this.setupAutocompleteDropdown();
    this.setupEditorMode();
    this.setupEventListeners();
    console.log('EditorService inicializado');
  }

  /**
   * Configura el modal de visualización solo cuando es necesario
   */
  setupVisualizeModal() {
    if (this.modal) return;

    this.modal = document.createElement('div');
    this.modal.id = 'visualize-modal';
    this.modal.className = 'modal-overlay hidden';
    this.modal.innerHTML = `
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Visualizar Documento</h3>
            <span class="modal-close">&times;</span>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas visualizar el documento actual?</p>
          </div>
          <div class="modal-footer">
            <button id="confirm-visualize" class="btn-primary">Visualizar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);
  }

  /**
   * Configura el modal de edición solo cuando es necesario
   */
  setupEditModal() {
    if (this.editModal) return;

    this.editModal = document.createElement('div');
    this.editModal.id = 'edit-modal';
    this.editModal.className = 'modal-overlay hidden';
    this.editModal.innerHTML = `
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Editar Documento</h3>
            <span class="modal-close">&times;</span>
          </div>
          <div class="modal-body">
            <textarea id="modal-editor" spellcheck="false" class="editor-textarea" rows="20"></textarea>
          </div>
          <div class="modal-footer">
            <button id="visualize-edit" class="btn-secondary">Visualizar</button>
            <button id="cancel-edit" class="btn-secondary">Cancelar</button>
            <button id="confirm-edit" class="btn-primary">Guardar</button>
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
    this.autocompleteDropdown = document.createElement('div');
    this.autocompleteDropdown.className = 'autocomplete-dropdown';
    this.autocompleteDropdown.style.display = 'none';
    this.autocompleteDropdown.style.position = 'absolute';
    this.autocompleteDropdown.style.color = '#e5e7eb';
    this.autocompleteDropdown.style.backgroundColor = 'rgba(31, 41, 55, 0.95)';
    this.autocompleteDropdown.style.border = '1px solid #4b5563';
    this.autocompleteDropdown.style.borderRadius = '4px';
    this.autocompleteDropdown.style.padding = '5px 0';
    this.autocompleteDropdown.style.maxHeight = '200px';
    this.autocompleteDropdown.style.overflowY = 'auto';
    this.autocompleteDropdown.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    this.autocompleteDropdown.style.zIndex = '1000';

    const dropdownHeader = document.createElement('div');
    dropdownHeader.className = 'autocomplete-header';
    dropdownHeader.style.padding = '8px 12px';
    dropdownHeader.style.borderBottom = '1px solid #4b5563';
    dropdownHeader.style.fontSize = '0.8em';
    dropdownHeader.style.color = '#9ca3af';
    dropdownHeader.style.fontWeight = 'bold';
    dropdownHeader.textContent = 'Referencias disponibles:';

    this.autocompleteDropdown.appendChild(dropdownHeader);
    document.body.appendChild(this.autocompleteDropdown);
  }

  /**
   * Configura la navegación por teclado para el dropdown de autocompletado
   */
  setupKeyboardNavigation() {

    this.autocompleteDropdown.addEventListener('click', event => {
      const item = event.target.closest('.autocomplete-item');
      if (item) {
        this.insertReference(item.dataset.id);
      }
    });


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


    const setupKeyboardEvents = editor => {
      editor.addEventListener('keydown', event => {

        if (this.autocompleteDropdown.style.display === 'block') {
          const itemsContainer = this.autocompleteDropdown.querySelector(
            '.autocomplete-items-container'
          );
          if (!itemsContainer) return;

          const items = itemsContainer.querySelectorAll('.autocomplete-item');
          if (items.length === 0) return;

          const activeItem = itemsContainer.querySelector(
            '.autocomplete-item.active'
          );
          let activeIndex = Array.from(items).indexOf(activeItem);


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
                items[activeIndex + 1].scrollIntoView({
                  block: 'nearest',
                  inline: 'nearest',
                });
              }
              break;

            case 'ArrowUp':
              event.preventDefault();
              if (activeIndex > 0) {
                if (activeItem) activeItem.classList.remove('active');
                items[activeIndex - 1].classList.add('active');
                items[activeIndex - 1].scrollIntoView({
                  block: 'nearest',
                  inline: 'nearest',
                });
              }
              break;

            case 'Tab':
              event.preventDefault();
              if (event.shiftKey) {

                if (activeIndex > 0) {
                  if (activeItem) activeItem.classList.remove('active');
                  items[activeIndex - 1].classList.add('active');
                  items[activeIndex - 1].scrollIntoView({
                    block: 'nearest',
                    inline: 'nearest',
                  });
                }
              } else {

                if (activeIndex < items.length - 1) {
                  if (activeItem) activeItem.classList.remove('active');
                  items[activeIndex + 1].classList.add('active');
                  items[activeIndex + 1].scrollIntoView({
                    block: 'nearest',
                    inline: 'nearest',
                  });
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


            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
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


    setupKeyboardEvents(this.editor);


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


      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'pre-wrap';
      tempElement.style.wordWrap = 'break-word';
      tempElement.style.width = `${activeEditor.offsetWidth}px`;
      tempElement.style.font = window.getComputedStyle(activeEditor).font;
      tempElement.style.padding = window.getComputedStyle(activeEditor).padding;


      tempElement.innerHTML =
        textBeforeCursor.replace(/\n/g, '<br>') +
        '<span id="cursor-marker">|</span>';
      document.body.appendChild(tempElement);


      const marker = document.getElementById('cursor-marker');
      const rect = marker.getBoundingClientRect();
      const editorRect = activeEditor.getBoundingClientRect();


      document.body.removeChild(tempElement);


      return {
        left: rect.left,
        top: rect.top - editorRect.top + activeEditor.scrollTop,
      };
    }

    return null;
  }

  /**
   * Configura el indicador de modo del editor
   */
  setupEditorMode() {
    this.editorModeIndicator = document.createElement('div');
    this.editorModeIndicator.className = 'editor-mode-indicator';
    this.editorModeIndicator.style.position = 'absolute';
    this.editorModeIndicator.style.bottom = '10px';
    this.editorModeIndicator.style.left = '10px';
    this.editorModeIndicator.style.fontSize = '0.75rem';
    this.editorModeIndicator.style.color = '#9ca3af';
    this.editorModeIndicator.style.pointerEvents = 'none';
    this.editorModeIndicator.textContent = 'Modo: Texto';
    
    if (this.editor.parentElement) {
      this.editor.parentElement.style.position = 'relative';
      this.editor.parentElement.appendChild(this.editorModeIndicator);
    }
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    if (!this.editor) return;

    this.editor.addEventListener('input', () => {
      const content = this.editor.value;
      if (content !== this.lastText) {
        this.lastText = content;
        this.onContentChange(content);
      }
    });

    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        this.editor.value = this.editor.value.substring(0, start) + '  ' + this.editor.value.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + 2;
      }
    });
  }

  /**
   * Muestra el modal de visualización
   */
  showVisualizeModal() {
    this.setupVisualizeModal();
    this.modal.classList.remove('hidden');
    
    const closeBtn = this.modal.querySelector('.modal-close');
    const confirmBtn = this.modal.querySelector('#confirm-visualize');
    
    closeBtn.onclick = () => this.hideVisualizeModal();
    confirmBtn.onclick = () => {
      this.hideVisualizeModal();
      this.visualizeDocument();
    };
  }

  /**
   * Oculta el modal de visualización
   */
  hideVisualizeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  /**
   * Muestra el modal de edición
   */
  showEditModal() {
    this.setupEditModal();
    this.editModal.classList.remove('hidden');
    
    const modalEditor = this.editModal.querySelector('#modal-editor');
    modalEditor.value = this.editor.value;
    
    const closeBtn = this.editModal.querySelector('.modal-close');
    const cancelBtn = this.editModal.querySelector('#cancel-edit');
    const confirmBtn = this.editModal.querySelector('#confirm-edit');
    const visualizeBtn = this.editModal.querySelector('#visualize-edit');
    
    closeBtn.onclick = () => this.hideEditModal();
    cancelBtn.onclick = () => this.hideEditModal();
    confirmBtn.onclick = () => {
      this.editor.value = modalEditor.value;
      this.hideEditModal();
      this.onContentChange(modalEditor.value);
    };
    visualizeBtn.onclick = () => {
      this.hideEditModal();
      this.visualizeDocument();
    };
  }

  /**
   * Oculta el modal de edición
   */
  hideEditModal() {
    if (this.editModal) {
      this.editModal.classList.add('hidden');
    }
  }

  /**
   * Visualiza el documento actual
   */
  visualizeDocument() {
    const content = this.editor.value;
    console.log('Visualizando documento:', content);
    // Aquí puedes implementar la lógica de visualización
  }

  /**
   * Establece el contenido del editor
   */
  setContent(text) {
    if (this.editor) {
      this.editor.value = text;
      this.lastText = text;
    }
  }

  /**
   * Obtiene el contenido del editor
   */
  getContent() {
    return this.editor ? this.editor.value : '';
  }

  /**
   * Actualiza el texto del editor cuando cambia el tipo de un artefacto
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldType - Tipo anterior
   * @param {string} newType - Nuevo tipo
   */
  updateEditorText(node, oldType, newType) {

    if (oldType === newType) {
      return;
    }

    const lines = this.editor.value.split('\n');
    const oldCategory = REVERSE_TYPE_MAP[oldType];
    const newCategory = REVERSE_TYPE_MAP[newType];
    const artifactLineRegex = new RegExp(`^\\s*-\\s*${node.name}\\s*:.*$`);


    let artifactLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (artifactLineRegex.test(lines[i])) {
        artifactLineIndex = i;
        break;
      }
    }

    if (artifactLineIndex === -1) {
      return;
    }

    const artifactLine = lines[artifactLineIndex];
    const match = artifactLine.match(/^(\s*-\s*[^:]+:)(.*)$/);
    if (!match) {
      return;
    }

    const description = match[2];


    let newCategoryIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === newCategory) {
        newCategoryIndex = i;
        break;
      }
    }


    if (newCategoryIndex === -1) {

      let oldCategoryIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === oldCategory) {
          oldCategoryIndex = i;
          break;
        }
      }

      if (oldCategoryIndex !== -1) {

        lines.splice(oldCategoryIndex + 1, 0, newCategory);
        newCategoryIndex = oldCategoryIndex + 1;
      } else {

        lines.push('');
        lines.push(newCategory);
        newCategoryIndex = lines.length - 1;
      }
    }



    lines.splice(artifactLineIndex, 1);


    const newArtifactLine = `  - ${node.name}:${description}`;


    let insertIndex = newCategoryIndex + 1;
    while (insertIndex < lines.length &&
      lines[insertIndex].trim() !== '' &&
      !lines[insertIndex].trim().startsWith('##') &&
      lines[insertIndex].trim() !== newCategory) {
      insertIndex++;
    }

    lines.splice(insertIndex, 0, newArtifactLine);


    this.editor.value = lines.join('\n');
  }

  /**
   * Actualiza el texto del editor cuando cambia el nombre de un artefacto
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldName - Nombre anterior
   * @param {string} newName - Nuevo nombre
   */
    updateNodeName(node, oldName, newName) {

    if (oldName === newName) {
      return;
    }

    const lines = this.editor.value.split('\n');
    const oldArtifactLineRegex = new RegExp(`^\\s*-\\s*${oldName}\\s*:.*$`);

    let lineToUpdate = -1;

    for (let i = 0; i < lines.length; i++) {
      if (oldArtifactLineRegex.test(lines[i])) {
        lineToUpdate = i;
        break;
      }
    }

    if (lineToUpdate !== -1) {

      const match = lines[lineToUpdate].match(/^(\s*-\s*)[^:]+:(.*$)/);
      if (match) {
        const indent = match[1];
        const description = match[2];
        const newLine = `${indent}${newName}:${description}`;
        

        if (lines[lineToUpdate] !== newLine) {
          lines[lineToUpdate] = newLine;
          this.editor.value = lines.join('\n');
        }
      }
    }
  }

  /**
   * Actualiza el texto del editor cuando cambia la descripción de un artefacto
   * @param {Object} node - Nodo que ha cambiado
   * @param {string} oldDescription - Descripción anterior
   * @param {string} newDescription - Nueva descripción
   */
    updateNodeDescription(node, oldDescription, newDescription) {

    if (oldDescription === newDescription) {
      return;
    }

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

      const match = lines[lineToUpdate].match(/^(\s*-\s*[^:]+:).*$/);
      if (match) {
        const prefix = match[1];
        const newLine = `${prefix} ${newDescription}`;
        

        if (lines[lineToUpdate] !== newLine) {
          lines[lineToUpdate] = newLine;
          this.editor.value = lines.join('\n');
        }
      }
    }
  }

  /**
   * Verifica si el usuario está actualmente escribiendo una referencia
   * @param {string} text - Texto actual del editor
   * @param {number} cursorPosition - Posición actual del cursor
   * @returns {boolean} - true si el usuario está escribiendo una referencia
   */
  isWritingReference(text, cursorPosition) {

    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    console.log('Verificando si está escribiendo referencia:', {
      lastAtIndex,
      cursorPosition,
    });


    if (lastAtIndex === -1 || cursorPosition - lastAtIndex > 30) {
      return false;
    }


    const textAfterAt = text.substring(lastAtIndex + 1, cursorPosition);
    const invalidChars = /[^A-Za-zÁÉÍÓÚÑáéíóú0-9-]/;

    console.log('Texto después del @:', textAfterAt);


    if (invalidChars.test(textAfterAt)) {
      console.log('Contiene caracteres inválidos');
      return false;
    }


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

    if (text === this.lastText) {
      return false;
    }


    this.lastText = text;


    if (this.isWritingReference(text, cursorPosition)) {
      return false;
    }


    const textBeforeCursor = text.substring(0, cursorPosition);
    const referencePattern = /@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)([\s,.;:!?]|$)/;
    const match = textBeforeCursor.match(referencePattern);


    if (match && match.index > 0) {
      const lastChar = textBeforeCursor.charAt(cursorPosition - 1);

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
    const { filterText, atPosition } = this.getReferenceFilterText(
      text,
      cursorPosition
    );
    console.log('Texto de filtro:', filterText);


    const { nodes } = ArtifactParser.parseArtifacts(this.editor.value);


    const filteredNodes = nodes.filter(
      node =>
        node.id.toLowerCase().includes(filterText.toLowerCase()) ||
        node.name.toLowerCase().includes(filterText.toLowerCase())
    );


    filteredNodes.sort((a, b) => {
      const aStartsWithFilter =
        a.id.toLowerCase().startsWith(filterText.toLowerCase()) ||
        a.name.toLowerCase().startsWith(filterText.toLowerCase());
      const bStartsWithFilter =
        b.id.toLowerCase().startsWith(filterText.toLowerCase()) ||
        b.name.toLowerCase().startsWith(filterText.toLowerCase());

      if (aStartsWithFilter && !bStartsWithFilter) return -1;
      if (!aStartsWithFilter && bStartsWithFilter) return 1;
      return a.name.localeCompare(b.name);
    });


    const headerTitle = this.autocompleteDropdown.querySelector(
      '.autocomplete-header span:first-child'
    );
    if (headerTitle) {
      if (filteredNodes.length > 0) {
        headerTitle.textContent = `Referencias (${filteredNodes.length} resultados)`;
      } else if (filterText.trim() !== '') {
        headerTitle.textContent = 'Crear nuevo artefacto';
      } else {
        headerTitle.textContent = 'Referencias de artefactos';
      }
    }


    const itemsContainer = this.autocompleteDropdown.querySelector(
      '.autocomplete-items-container'
    );
    if (!itemsContainer) {
      console.error(
        'No se encontró el contenedor de elementos de autocompletado'
      );
      return;
    }


    itemsContainer.innerHTML = '';


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

      const nodesByType = {};
      filteredNodes.forEach(node => {
        if (!nodesByType[node.type]) {
          nodesByType[node.type] = [];
        }
        nodesByType[node.type].push(node);
      });


      Object.keys(nodesByType).forEach(type => {

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


        nodesByType[type].forEach(node => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          item.dataset.id = node.id;


          let displayName = node.name;
          let displayId = node.id;
          if (filterText.trim() !== '') {
            const regex = new RegExp(`(${filterText})`, 'gi');
            displayName = node.name.replace(regex, '<strong>$1</strong>');
            displayId = node.id.replace(regex, '<strong>$1</strong>');
          }

          item.innerHTML = `
            <div class="autocomplete-item-type" style="background-color: ${this.getNodeColor(
            node.type
          )}; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px;"></div>
            <div class="autocomplete-item-content">
              <div class="autocomplete-item-name">${displayName}</div>
              <div class="autocomplete-item-id" style="font-size: 0.75em; color: #6b7280;">${displayId}</div>
            </div>
            <div class="autocomplete-item-type-label" style="margin-left: auto; font-size: 0.7em; color: white; background-color: ${this.getNodeColor(
            node.type
          )}; padding: 2px 6px; border-radius: 4px;">${node.type}</div>
          `;

          itemsContainer.appendChild(item);
        });
      });
    }


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


    if (itemsContainer.children.length > 0) {

      const rect = targetEditor.getBoundingClientRect();
      const lineHeight =
        parseInt(window.getComputedStyle(targetEditor).lineHeight) || 20;
      const textBeforeCursor = text.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      const currentLineText = lines[currentLine - 1];
      const charWidth = 8;

      const top =
        rect.top + currentLine * lineHeight - targetEditor.scrollTop + 5;
      const left = rect.left + currentLineText.length * charWidth;

      this.autocompleteDropdown.style.top = `${top}px`;
      this.autocompleteDropdown.style.left = `${left}px`;
      this.autocompleteDropdown.style.minWidth = '300px';
      this.autocompleteDropdown.style.maxWidth = '500px';
      this.autocompleteDropdown.style.display = 'block';


      const items = itemsContainer.querySelectorAll('.autocomplete-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          this.insertReference(item.dataset.id, targetEditor);
        });
      });


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

      this.autocompleteDropdown.classList.add('autocomplete-dropdown-hiding');


      setTimeout(() => {
        this.autocompleteDropdown.style.display = 'none';
        this.autocompleteDropdown.classList.remove(
          'autocomplete-dropdown-hiding'
        );
      }, 150);
    }
  }

  /**
   * Configura la navegación por teclado global para el editor
   */
  setupEditorKeyboardNavigation() {

    this.editor.addEventListener('keydown', event => {

      if (this.autocompleteDropdown.style.display !== 'block') {

        if (event.key === 'Escape') {

          this.setEditorMode('text');
        } else if (event.key === 'r' && event.ctrlKey) {

          event.preventDefault();
          this.setEditorMode('relate');
        } else if (event.key === 't' && event.ctrlKey) {

          event.preventDefault();
          this.setEditorMode('type');
        }
      }
    });


    document.addEventListener('keydown', event => {
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
      helpModal.style.boxShadow =
        '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
      helpModal.style.zIndex = '2000';
      helpModal.style.maxWidth = '500px';
      helpModal.style.width = '90%';


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


      document
        .getElementById('close-help-modal')
        .addEventListener('click', () => {
          helpModal.style.display = 'none';
        });


      document.addEventListener('click', event => {
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


    const item = this.autocompleteDropdown.querySelector(
      `.autocomplete-item[data-id="${id}"]`
    );
    const isNewArtifact = item && item.dataset.new === 'true';


    const textBefore = text.substring(0, atPosition);
    const textAfter = text.substring(cursorPosition);
    const newText = `${textBefore}@${id} ${textAfter}`;

    targetEditor.value = newText;
    targetEditor.selectionStart = targetEditor.selectionEnd =
      atPosition + id.length + 2;
    console.log('Texto actualizado con la referencia');


    this.autocompleteDropdown.style.display = 'none';
    console.log('Dropdown ocultado');


    targetEditor.dispatchEvent(new Event('input'));
    console.log('Evento input disparado');


    if (isNewArtifact) {
      console.log('Creando nuevo artefacto pendiente');
      this.createPendingArtifact(id);
      this.showToast(`Artefacto "${id}" creado y referenciado`, 'success');
    } else {
      this.showToast(`Referencia a "${id}" insertada`, 'info');
    }


    targetEditor.focus();
  }

  /**
   * Crea un nuevo artefacto pendiente
   * @param {string} id - ID del nuevo artefacto
   */
  createPendingArtifact(id) {
    console.log('Creando artefacto pendiente:', id);

    const text = this.editor.value;
    const lines = text.split('\n');



    let artifactType = 'Conceptos';
    const lowerCaseId = id.toLowerCase();

    if (
      lowerCaseId.includes('proceso') ||
      lowerCaseId.includes('flujo') ||
      lowerCaseId.endsWith('ar') ||
      lowerCaseId.endsWith('er') ||
      lowerCaseId.endsWith('ir')
    ) {
      artifactType = 'Procesos';
    } else if (
      lowerCaseId.includes('actor') ||
      lowerCaseId.includes('usuario') ||
      lowerCaseId.includes('sistema') ||
      lowerCaseId.includes('persona')
    ) {
      artifactType = 'Actores';
    } else if (
      lowerCaseId.includes('contexto') ||
      lowerCaseId.includes('entorno') ||
      lowerCaseId.includes('ambiente')
    ) {
      artifactType = 'Contextos';
    }


    let sectionLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === artifactType) {
        sectionLine = i;
        break;
      }
    }

    console.log(`Línea de ${artifactType} encontrada:`, sectionLine);

    if (sectionLine === -1) {

      lines.push('');
      lines.push(artifactType);
      sectionLine = lines.length - 1;
      console.log(`Sección de ${artifactType} creada`);
    }


    lines.splice(sectionLine + 1, 0, `  - ${id}: Pendiente de completar`);
    console.log('Artefacto añadido a la línea:', sectionLine + 1);


    this.editor.value = lines.join('\n');
    console.log('Editor actualizado');


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


    this.showToast(
      `Artefacto "${id}" creado como ${artifactType
        .toLowerCase()
        .slice(0, -1)}`,
      'success'
    );
    console.log('Notificación mostrada');


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

      let cursorPosition = 0;
      for (let i = 0; i < lineIndex; i++) {
        cursorPosition += newLines[i].length + 1;
      }
      cursorPosition += newLines[lineIndex].length;


      this.editor.selectionStart = this.editor.selectionEnd = cursorPosition;
      this.editor.focus();
    }
  }

  /**
   * Resalta las referencias en el texto del editor
   */
  highlightReferences() {


  }

  /**
   * Muestra una notificación toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación ('success', 'info', 'warning', 'error')
   * @param {number} duration - Duración en milisegundos
   */
  showToast(message, type = 'info', duration = 3000) {
    console.log('Mostrando toast:', message, type);


    const colors = {
      success: { bg: 'rgba(16, 185, 129, 0.9)', icon: '✓' },
      info: { bg: 'rgba(59, 130, 246, 0.9)', icon: 'ℹ' },
      warning: { bg: 'rgba(245, 158, 11, 0.9)', icon: '⚠' },
      error: { bg: 'rgba(239, 68, 68, 0.9)', icon: '✕' },
    };

    const color = colors[type] || colors.info;


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


    toast.style.backgroundColor = color.bg;
    toast.style.color = 'white';


    toast.innerHTML = `
      <div style="margin-right: 10px; font-weight: bold;">${color.icon}</div>
      <div>${message}</div>
    `;


    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    console.log('Toast visible');


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

    this.editorMode = mode;


    const modeColors = {
      text: '#3B82F6',
      relate: '#10B981',
      type: '#F59E0B',
    };

    const color = modeColors[mode] || modeColors.text;


    const modeText = {
      text: 'Texto',
      relate: 'Crear Relaciones',
      type: 'Cambiar Tipo',
    };

    if (!this.editorModeIndicator) {
      console.error('El indicador de modo no está inicializado');
      return;
    }

    this.editorModeIndicator.textContent = `Modo: ${modeText[mode]}`;
    this.editorModeIndicator.style.backgroundColor = color;
    this.editorModeIndicator.style.borderColor = color;
    console.log('Texto del indicador actualizado');


    const container = document.querySelector('.editor-container');
    if (!container) {
      console.error(
        'No se encontró el contenedor del editor (.editor-container)'
      );

      const alternativeContainer =
        document.getElementById('container') ||
        document.querySelector('.container');
      if (!alternativeContainer) {
        console.error('No se pudo encontrar ningún contenedor válido');
        return;
      }

      alternativeContainer.classList.remove(
        'mode-text',
        'mode-relate',
        'mode-type'
      );
      alternativeContainer.classList.add(`mode-${mode}`);
      alternativeContainer.style.borderColor = color;
      alternativeContainer.style.boxShadow = `0 0 5px ${color}40`;
      console.log('Clases del contenedor alternativo actualizadas');
      return;
    }

    container.classList.remove('mode-text', 'mode-relate', 'mode-type');
    container.classList.add(`mode-${mode}`);
    container.style.borderColor = color;
    container.style.boxShadow = `0 0 5px ${color}40`;
    console.log('Clases del contenedor actualizadas');


    const modeDescriptions = {
      text: 'Edición de texto normal',
      relate: 'Creación de relaciones entre artefactos',
      type: 'Cambio de tipo de artefactos',
    };

    this.showToast(
      `Modo ${modeText[mode]}: ${modeDescriptions[mode] || ''}`,
      'info'
    );
  }

  /**
   * Obtiene el color correspondiente a un tipo de nodo
   * @param {string} type - Tipo de nodo
   * @returns {string} - Color en formato hexadecimal
   */
  getNodeColor(type) {
    return COLORS[type] || '#6b7280';
  }
}
