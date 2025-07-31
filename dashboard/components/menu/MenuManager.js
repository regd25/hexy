import { EVENT_TYPES } from '../utils/events/EventTypes.js';

/**
 * Menu manager that handles contextual menus and modals
 * Follows Single Responsibility Principle for menu management
 */
export class MenuManager {
    constructor(eventBus, notificationManager) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.isInitialized = false;
        this.activeMenu = null;
        this.menuTemplates = new Map();
    }

    /**
     * Initialize the menu manager
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.setupMenuTemplates();
        this.setupGlobalEventListeners();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.MENU_MANAGER_INITIALIZED, {
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for menu interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.NODE_RIGHT_CLICKED, this.handleNodeRightClick.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_RIGHT_CLICKED, this.handleLinkRightClick.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.CANVAS_RIGHT_CLICKED, this.handleCanvasRightClick.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.MENU_ACTION_TRIGGERED, this.handleMenuAction.bind(this));
    }

    /**
     * Setup menu templates for different contexts
     */
    setupMenuTemplates() {
        this.menuTemplates.set('node', this.createNodeMenuTemplate());
        this.menuTemplates.set('link', this.createLinkMenuTemplate());
        this.menuTemplates.set('canvas', this.createCanvasMenuTemplate());
    }

    /**
     * Setup global event listeners for menu behavior
     */
    setupGlobalEventListeners() {
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.context-menu')) {
                this.hideActiveMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideActiveMenu();
            }
        });
    }

    /**
     * Create node context menu template
     */
    createNodeMenuTemplate() {
        return `
            <div class="context-menu node-menu">
                <div class="menu-item" data-action="edit">
                    <span class="menu-icon">✏️</span>
                    <span class="menu-label">Edit Node</span>
                </div>
                <div class="menu-item" data-action="duplicate">
                    <span class="menu-icon">📋</span>
                    <span class="menu-label">Duplicate</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item" data-action="connect">
                    <span class="menu-icon">🔗</span>
                    <span class="menu-label">Connect to...</span>
                </div>
                <div class="menu-item" data-action="highlight">
                    <span class="menu-icon">✨</span>
                    <span class="menu-label">Highlight</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item" data-action="export">
                    <span class="menu-icon">📤</span>
                    <span class="menu-label">Export Node</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item menu-item-danger" data-action="delete">
                    <span class="menu-icon">🗑️</span>
                    <span class="menu-label">Delete</span>
                </div>
            </div>
        `;
    }

    /**
     * Create link context menu template
     */
    createLinkMenuTemplate() {
        return `
            <div class="context-menu link-menu">
                <div class="menu-item" data-action="edit-link">
                    <span class="menu-icon">✏️</span>
                    <span class="menu-label">Edit Link</span>
                </div>
                <div class="menu-item" data-action="change-weight">
                    <span class="menu-icon">⚖️</span>
                    <span class="menu-label">Change Weight</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item" data-action="highlight-link">
                    <span class="menu-icon">✨</span>
                    <span class="menu-label">Highlight</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item menu-item-danger" data-action="delete-link">
                    <span class="menu-icon">🗑️</span>
                    <span class="menu-label">Delete Link</span>
                </div>
            </div>
        `;
    }

    /**
     * Create canvas context menu template
     */
    createCanvasMenuTemplate() {
        return `
            <div class="context-menu canvas-menu">
                <div class="menu-item" data-action="create-node">
                    <span class="menu-icon">➕</span>
                    <span class="menu-label">Create Node</span>
                </div>
                <div class="menu-item" data-action="paste">
                    <span class="menu-icon">📋</span>
                    <span class="menu-label">Paste</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item" data-action="select-all">
                    <span class="menu-icon">☑️</span>
                    <span class="menu-label">Select All</span>
                </div>
                <div class="menu-item" data-action="deselect-all">
                    <span class="menu-icon">☐</span>
                    <span class="menu-label">Deselect All</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item" data-action="zoom-fit">
                    <span class="menu-icon">🔍</span>
                    <span class="menu-label">Fit to View</span>
                </div>
                <div class="menu-item" data-action="reset-view">
                    <span class="menu-icon">🏠</span>
                    <span class="menu-label">Reset View</span>
                </div>
            </div>
        `;
    }

    /**
     * Handle node right click event
     */
    handleNodeRightClick(data) {
        this.showContextMenu('node', data.event, data.node);
    }

    /**
     * Handle link right click event
     */
    handleLinkRightClick(data) {
        this.showContextMenu('link', data.event, data.link);
    }

    /**
     * Handle canvas right click event
     */
    handleCanvasRightClick(data) {
        this.showContextMenu('canvas', data.event, data.position);
    }

    /**
     * Show context menu at specified position
     */
    showContextMenu(type, event, context) {
        event.preventDefault();
        this.hideActiveMenu();

        const template = this.menuTemplates.get(type);
        if (!template) {
            console.warn(`No menu template found for type: ${type}`);
            return;
        }

        const menuElement = document.createElement('div');
        menuElement.innerHTML = template;
        const menu = menuElement.firstElementChild;

        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.zIndex = '1000';

        document.body.appendChild(menu);
        this.activeMenu = { element: menu, type, context };

        this.setupMenuEventListeners(menu, type, context);
    }

    /**
     * Setup event listeners for menu items
     */
    setupMenuEventListeners(menu, type, context) {
        const menuItems = menu.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                const action = item.dataset.action;
                this.handleMenuAction(action, type, context);
                this.hideActiveMenu();
            });

            item.addEventListener('mouseenter', () => {
                item.classList.add('menu-item-hover');
            });

            item.addEventListener('mouseleave', () => {
                item.classList.remove('menu-item-hover');
            });
        });
    }

    /**
     * Handle menu action
     */
    handleMenuAction(action, type, context) {
        const eventData = {
            action,
            type,
            context,
            timestamp: Date.now()
        };

        switch (type) {
            case 'node':
                this.handleNodeMenuAction(action, context);
                break;
            case 'link':
                this.handleLinkMenuAction(action, context);
                break;
            case 'canvas':
                this.handleCanvasMenuAction(action, context);
                break;
        }

        this.eventBus.publish(EVENT_TYPES.MENU_ACTION_EXECUTED, eventData);
    }

    /**
     * Handle node menu actions
     */
    handleNodeMenuAction(action, node) {
        switch (action) {
            case 'edit':
                this.eventBus.publish(EVENT_TYPES.NODE_EDIT_REQUESTED, { node });
                break;
            case 'duplicate':
                this.eventBus.publish(EVENT_TYPES.NODE_DUPLICATE_REQUESTED, { node });
                break;
            case 'connect':
                this.eventBus.publish(EVENT_TYPES.NODE_CONNECT_REQUESTED, { node });
                break;
            case 'highlight':
                this.eventBus.publish(EVENT_TYPES.NODE_HIGHLIGHT_REQUESTED, { node });
                break;
            case 'export':
                this.eventBus.publish(EVENT_TYPES.NODE_EXPORT_REQUESTED, { node });
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this node?')) {
                    this.eventBus.publish(EVENT_TYPES.NODE_DELETE_REQUESTED, { node });
                }
                break;
        }
    }

    /**
     * Handle link menu actions
     */
    handleLinkMenuAction(action, link) {
        switch (action) {
            case 'edit-link':
                this.eventBus.publish(EVENT_TYPES.LINK_EDIT_REQUESTED, { link });
                break;
            case 'change-weight':
                this.showWeightDialog(link);
                break;
            case 'highlight-link':
                this.eventBus.publish(EVENT_TYPES.LINK_HIGHLIGHT_REQUESTED, { link });
                break;
            case 'delete-link':
                if (confirm('Are you sure you want to delete this link?')) {
                    this.eventBus.publish(EVENT_TYPES.LINK_DELETE_REQUESTED, { link });
                }
                break;
        }
    }

    /**
     * Handle canvas menu actions
     */
    handleCanvasMenuAction(action, position) {
        switch (action) {
            case 'create-node':
                this.eventBus.publish(EVENT_TYPES.NODE_CREATE_REQUESTED, { position });
                break;
            case 'paste':
                this.eventBus.publish(EVENT_TYPES.PASTE_REQUESTED, { position });
                break;
            case 'select-all':
                this.eventBus.publish(EVENT_TYPES.SELECT_ALL_REQUESTED);
                break;
            case 'deselect-all':
                this.eventBus.publish(EVENT_TYPES.DESELECT_ALL_REQUESTED);
                break;
            case 'zoom-fit':
                this.eventBus.publish(EVENT_TYPES.ZOOM_FIT_REQUESTED);
                break;
            case 'reset-view':
                this.eventBus.publish(EVENT_TYPES.RESET_VIEW_REQUESTED);
                break;
        }
    }

    /**
     * Show weight dialog for link
     */
    showWeightDialog(link) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Change Link Weight</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="weight-input">Weight (1-10):</label>
                        <input type="number" id="weight-input" min="1" max="10" value="${link.weight || 1}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancel-weight">Cancel</button>
                    <button class="btn-primary" id="save-weight">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancel-weight');
        const saveBtn = modal.querySelector('#save-weight');
        const weightInput = modal.querySelector('#weight-input');

        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        saveBtn.addEventListener('click', () => {
            const weight = parseInt(weightInput.value);
            if (weight >= 1 && weight <= 10) {
                this.eventBus.publish(EVENT_TYPES.LINK_WEIGHT_CHANGED, { link, weight });
                this.notificationManager.showSuccess('Link weight updated');
            } else {
                this.notificationManager.showError('Weight must be between 1 and 10');
            }
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    /**
     * Hide active menu
     */
    hideActiveMenu() {
        if (this.activeMenu && this.activeMenu.element) {
            document.body.removeChild(this.activeMenu.element);
            this.activeMenu = null;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        this.notificationManager.show(message, type);
    }

    /**
     * Get active menu
     */
    getActiveMenu() {
        return this.activeMenu;
    }

    /**
     * Check if menu is active
     */
    isMenuActive() {
        return this.activeMenu !== null;
    }

    /**
     * Destroy the menu manager
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_RIGHT_CLICKED, this.handleNodeRightClick.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_RIGHT_CLICKED, this.handleLinkRightClick.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.CANVAS_RIGHT_CLICKED, this.handleCanvasRightClick.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.MENU_ACTION_TRIGGERED, this.handleMenuAction.bind(this));

        this.hideActiveMenu();
        this.menuTemplates.clear();
        this.isInitialized = false;
    }
} 