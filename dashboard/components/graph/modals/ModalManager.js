import { EVENT_TYPES } from '../../utils/events/EventTypes.js';
import { DOMHelper } from '../../utils/helpers/DOMHelper.js';

/**
 * Modal manager that handles dialogs and popup windows
 * Follows Single Responsibility Principle for modal management
 */
export class ModalManager {
    constructor(eventBus, notificationManager) {
        this.eventBus = eventBus;
        this.notificationManager = notificationManager;
        this.isInitialized = false;
        this.activeModals = new Map();
        this.modalTemplates = new Map();
        this.modalCounter = 0;
    }

    /**
     * Initialize the modal manager
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.setupEventListeners();
        this.setupModalTemplates();
        this.setupGlobalEventListeners();
        this.isInitialized = true;

        this.eventBus.publish(EVENT_TYPES.COMPONENT_INITIALIZED, {
            component: 'ModalManager',
            timestamp: Date.now()
        });
    }

    /**
     * Setup event listeners for modal interactions
     */
    setupEventListeners() {
        this.eventBus.subscribe(EVENT_TYPES.MODAL_OPENED, this.handleModalOpened.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.MODAL_CLOSED, this.handleModalClosed.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.NODE_EDIT_REQUESTED, this.handleNodeEditRequested.bind(this));
        this.eventBus.subscribe(EVENT_TYPES.LINK_EDIT_REQUESTED, this.handleLinkEditRequested.bind(this));
    }

    /**
     * Setup modal templates for different types
     */
    setupModalTemplates() {
        this.modalTemplates.set('node-edit', this.createNodeEditTemplate());
        this.modalTemplates.set('link-edit', this.createLinkEditTemplate());
        this.modalTemplates.set('confirm', this.createConfirmTemplate());
        this.modalTemplates.set('info', this.createInfoTemplate());
    }

    /**
     * Setup global event listeners for modal behavior
     */
    setupGlobalEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeTopModal();
            }
        });
    }

    /**
     * Handle modal opened event
     */
    handleModalOpened(data) {
        this.showModal(data.type, data.config);
    }

    /**
     * Handle modal closed event
     */
    handleModalClosed(data) {
        this.closeModal(data.modalId);
    }

    /**
     * Handle node edit requested event
     */
    handleNodeEditRequested(data) {
        this.showNodeEditModal(data.node);
    }

    /**
     * Handle link edit requested event
     */
    handleLinkEditRequested(data) {
        this.showLinkEditModal(data.link);
    }

    /**
     * Show modal with type and configuration
     */
    showModal(type, config = {}) {
        const template = this.modalTemplates.get(type);
        if (!template) {
            console.warn(`No modal template found for type: ${type}`);
            return;
        }

        const modalId = `modal-${++this.modalCounter}`;
        const modal = this.createModalElement(modalId, template, config);
        
        document.body.appendChild(modal);
        this.activeModals.set(modalId, { type, config, element: modal });

        this.setupModalEventListeners(modal, modalId, config);
        this.focusFirstInput(modal);

        this.eventBus.publish(EVENT_TYPES.MODAL_OPENED, {
            modalId,
            type,
            config,
            timestamp: Date.now()
        });

        return modalId;
    }

    /**
     * Close modal by ID
     */
    closeModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (!modalData) return;

        DOMHelper.removeElement(modalData.element);
        this.activeModals.delete(modalId);

        this.eventBus.publish(EVENT_TYPES.MODAL_CLOSED, {
            modalId,
            type: modalData.type,
            timestamp: Date.now()
        });
    }

    /**
     * Close top modal
     */
    closeTopModal() {
        if (this.activeModals.size > 0) {
            const lastModalId = Array.from(this.activeModals.keys()).pop();
            this.closeModal(lastModalId);
        }
    }

    /**
     * Create modal element
     */
    createModalElement(modalId, template, config) {
        const modal = DOMHelper.createElement('div', {
            id: modalId,
            class: 'modal-overlay',
            style: `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `
        });

        const content = DOMHelper.createElement('div', {
            class: 'modal-content',
            style: `
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            `
        });

        content.innerHTML = template(config);
        modal.appendChild(content);

        setTimeout(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);

        return modal;
    }

    /**
     * Setup event listeners for modal
     */
    setupModalEventListeners(modal, modalId, config) {
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const confirmBtn = modal.querySelector('.btn-confirm');
        const saveBtn = modal.querySelector('.btn-save');

        if (closeBtn) {
            DOMHelper.addEventListener(closeBtn, 'click', () => this.closeModal(modalId));
        }

        if (cancelBtn) {
            DOMHelper.addEventListener(cancelBtn, 'click', () => this.closeModal(modalId));
        }

        if (confirmBtn) {
            DOMHelper.addEventListener(confirmBtn, 'click', () => {
                this.handleConfirmAction(modalId, config);
            });
        }

        if (saveBtn) {
            DOMHelper.addEventListener(saveBtn, 'click', () => {
                this.handleSaveAction(modalId, config);
            });
        }

        DOMHelper.addEventListener(modal, 'click', (event) => {
            if (event.target === modal) {
                this.closeModal(modalId);
            }
        });
    }

    /**
     * Focus first input in modal
     */
    focusFirstInput(modal) {
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            firstInput.focus();
        }
    }

    /**
     * Handle confirm action
     */
    handleConfirmAction(modalId, config) {
        if (config.onConfirm) {
            config.onConfirm();
        }
        this.closeModal(modalId);
    }

    /**
     * Handle save action
     */
    handleSaveAction(modalId, config) {
        const formData = this.getFormData(modalId);
        if (config.onSave) {
            config.onSave(formData);
        }
        this.closeModal(modalId);
    }

    /**
     * Get form data from modal
     */
    getFormData(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return {};

        const form = modal.querySelector('form');
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * Create node edit template
     */
    createNodeEditTemplate() {
        return (config) => `
            <div class="modal-header">
                <h3>Edit Node</h3>
                <button class="modal-close">&times;</button>
            </div>
            <form class="modal-body">
                <div class="form-group">
                    <label for="node-name">Name:</label>
                    <input type="text" id="node-name" name="name" value="${config.node?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="node-type">Type:</label>
                    <select id="node-type" name="type" required>
                        <option value="purpose" ${config.node?.type === 'purpose' ? 'selected' : ''}>Purpose</option>
                        <option value="context" ${config.node?.type === 'context' ? 'selected' : ''}>Context</option>
                        <option value="authority" ${config.node?.type === 'authority' ? 'selected' : ''}>Authority</option>
                        <option value="evaluation" ${config.node?.type === 'evaluation' ? 'selected' : ''}>Evaluation</option>
                        <option value="vision" ${config.node?.type === 'vision' ? 'selected' : ''}>Vision</option>
                        <option value="policy" ${config.node?.type === 'policy' ? 'selected' : ''}>Policy</option>
                        <option value="principle" ${config.node?.type === 'principle' ? 'selected' : ''}>Principle</option>
                        <option value="guideline" ${config.node?.type === 'guideline' ? 'selected' : ''}>Guideline</option>
                        <option value="concept" ${config.node?.type === 'concept' ? 'selected' : ''}>Concept</option>
                        <option value="indicator" ${config.node?.type === 'indicator' ? 'selected' : ''}>Indicator</option>
                        <option value="process" ${config.node?.type === 'process' ? 'selected' : ''}>Process</option>
                        <option value="procedure" ${config.node?.type === 'procedure' ? 'selected' : ''}>Procedure</option>
                        <option value="event" ${config.node?.type === 'event' ? 'selected' : ''}>Event</option>
                        <option value="result" ${config.node?.type === 'result' ? 'selected' : ''}>Result</option>
                        <option value="observation" ${config.node?.type === 'observation' ? 'selected' : ''}>Observation</option>
                        <option value="actor" ${config.node?.type === 'actor' ? 'selected' : ''}>Actor</option>
                        <option value="area" ${config.node?.type === 'area' ? 'selected' : ''}>Area</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="node-description">Description:</label>
                    <textarea id="node-description" name="description" rows="3">${config.node?.description || ''}</textarea>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn-secondary btn-cancel">Cancel</button>
                <button class="btn-primary btn-save">Save</button>
            </div>
        `;
    }

    /**
     * Create link edit template
     */
    createLinkEditTemplate() {
        return (config) => `
            <div class="modal-header">
                <h3>Edit Link</h3>
                <button class="modal-close">&times;</button>
            </div>
            <form class="modal-body">
                <div class="form-group">
                    <label>Connection:</label>
                    <div class="connection-info">
                        <strong>${config.link?.source?.name || 'Source'}</strong> → <strong>${config.link?.target?.name || 'Target'}</strong>
                    </div>
                </div>
                <div class="form-group">
                    <label for="link-weight">Weight (1-10):</label>
                    <input type="number" id="link-weight" name="weight" min="1" max="10" value="${config.link?.weight || 1}">
                </div>
                <div class="form-group">
                    <label for="link-type">Type:</label>
                    <select id="link-type" name="type">
                        <option value="solid" ${config.link?.type === 'solid' ? 'selected' : ''}>Solid</option>
                        <option value="dashed" ${config.link?.type === 'dashed' ? 'selected' : ''}>Dashed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="link-label">Label:</label>
                    <input type="text" id="link-label" name="label" value="${config.link?.label || ''}">
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn-secondary btn-cancel">Cancel</button>
                <button class="btn-primary btn-save">Save</button>
            </div>
        `;
    }

    /**
     * Create confirm template
     */
    createConfirmTemplate() {
        return (config) => `
            <div class="modal-header">
                <h3>${config.title || 'Confirm Action'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${config.message || 'Are you sure you want to proceed?'}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary btn-cancel">Cancel</button>
                <button class="btn-primary btn-confirm">${config.confirmText || 'Confirm'}</button>
            </div>
        `;
    }

    /**
     * Create info template
     */
    createInfoTemplate() {
        return (config) => `
            <div class="modal-header">
                <h3>${config.title || 'Information'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${config.message || 'No information provided.'}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-primary btn-confirm">OK</button>
            </div>
        `;
    }

    /**
     * Show node edit modal
     */
    showNodeEditModal(node) {
        return this.showModal('node-edit', {
            node,
            onSave: (formData) => {
                this.eventBus.publish(EVENT_TYPES.NODE_UPDATED, {
                    node: { ...node, ...formData }
                });
                this.notificationManager.showSuccess('Node updated successfully');
            }
        });
    }

    /**
     * Show link edit modal
     */
    showLinkEditModal(link) {
        return this.showModal('link-edit', {
            link,
            onSave: (formData) => {
                this.eventBus.publish(EVENT_TYPES.LINK_WEIGHT_CHANGED, {
                    link,
                    weight: parseInt(formData.weight)
                });
                this.notificationManager.showSuccess('Link updated successfully');
            }
        });
    }

    /**
     * Show confirm modal
     */
    showConfirmModal(title, message, onConfirm, confirmText = 'Confirm') {
        return this.showModal('confirm', {
            title,
            message,
            confirmText,
            onConfirm
        });
    }

    /**
     * Show info modal
     */
    showInfoModal(title, message) {
        return this.showModal('info', {
            title,
            message
        });
    }

    /**
     * Get active modals count
     */
    getActiveModalsCount() {
        return this.activeModals.size;
    }

    /**
     * Check if any modal is active
     */
    isAnyModalActive() {
        return this.activeModals.size > 0;
    }

    /**
     * Get active modal data
     */
    getActiveModalData(modalId) {
        return this.activeModals.get(modalId);
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        const modalIds = Array.from(this.activeModals.keys());
        modalIds.forEach(modalId => this.closeModal(modalId));
    }

    /**
     * Destroy the modal manager
     */
    destroy() {
        this.eventBus.unsubscribe(EVENT_TYPES.MODAL_OPENED, this.handleModalOpened.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.MODAL_CLOSED, this.handleModalClosed.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.NODE_EDIT_REQUESTED, this.handleNodeEditRequested.bind(this));
        this.eventBus.unsubscribe(EVENT_TYPES.LINK_EDIT_REQUESTED, this.handleLinkEditRequested.bind(this));

        this.closeAllModals();
        this.modalTemplates.clear();
        this.isInitialized = false;
    }
} 