import { ArtifactParser } from '../services/ArtifactParser.js';
import { REVERSE_TYPE_MAP } from '../shared/constants.js';

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
    this.setupVisualizeModal();
    this.setupEditModal();
    this.setupEventListeners();
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
    });
    
    // Añadir evento de input para procesar referencias en tiempo real
    this.editor.addEventListener('input', () => {
      // Procesar el texto para detectar referencias con @
      const text = this.editor.value;
      const cursorPosition = this.editor.selectionStart;
      
      // Si estamos escribiendo una referencia, no hacemos nada todavía
      if (this.isWritingReference(text, cursorPosition)) {
        return;
      }
      
      // Si acabamos de completar una referencia, actualizamos la visualización
      if (this.justCompletedReference(text, cursorPosition)) {
        const { nodes, links } = ArtifactParser.parseArtifacts(text);
        const validLinks = ArtifactParser.getValidLinks(links);
        if (this.onContentChange) {
          this.onContentChange(nodes, validLinks);
        }
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
    
    // Si no hay @ o está muy lejos, no estamos escribiendo una referencia
    if (lastAtIndex === -1 || cursorPosition - lastAtIndex > 30) {
      return false;
    }
    
    // Verificar si hay un espacio o un carácter no válido después del @
    const textAfterAt = text.substring(lastAtIndex + 1, cursorPosition);
    const invalidChars = /[^A-Za-zÁÉÍÓÚÑáéíóú0-9-]/;
    
    // Si hay caracteres no válidos, no estamos escribiendo una referencia
    if (invalidChars.test(textAfterAt)) {
      return false;
    }
    
    // Estamos escribiendo una referencia
    return true;
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
}